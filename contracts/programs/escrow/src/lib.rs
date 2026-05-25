// CONTRACT-002: Escrow program.
//
// State machine: see docs/architecture/escrow-state-machine.md.
// Closes ADV-F-003 (optimistic-release state machine).
//
// NOTE: declare_id! uses the System Program ID as a literal placeholder.
// This MUST be replaced with a real keypair-derived program ID via
// `anchor keys list` before any devnet/mainnet deployment. Tracked under
// ADV-F-014 and CONTRACT-001 follow-up.

use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{self, Mint, Token, TokenAccount, Transfer},
};

declare_id!("11111111111111111111111111111111");

pub const WORK_TIMEOUT_SECS: i64 = 7 * 24 * 60 * 60;
pub const CHALLENGE_WINDOW_SECS: i64 = 72 * 60 * 60;
pub const DISPUTE_RESPONSE_WINDOW_SECS: i64 = 14 * 24 * 60 * 60;
// Placeholder. ADV-D-002 — confirm with Tokenomics + Security.
// Above this, finalize_optimistic is disabled and explicit accept is required.
pub const AFFIRMATIVE_ACCEPT_THRESHOLD_USDC_BASE: u64 = 50_000_000; // $50 at 6 decimals

#[program]
pub mod escrow {
    use super::*;

    pub fn init_escrow(
        ctx: Context<InitEscrow>,
        order_id: [u8; 32],
        order_hash: [u8; 32],
        terms_hash: [u8; 32],
        amount: u64,
    ) -> Result<()> {
        require!(amount > 0, EscrowError::AmountMismatch);

        let escrow = &mut ctx.accounts.escrow;
        escrow.customer = ctx.accounts.customer.key();
        escrow.assistant = Pubkey::default();
        escrow.order_id = order_id;
        escrow.order_hash = order_hash;
        escrow.terms_hash = terms_hash;
        escrow.usdc_mint = ctx.accounts.usdc_mint.key();
        escrow.amount = amount;
        escrow.state = EscrowState::Initialized;
        escrow.created_at = Clock::get()?.unix_timestamp;
        escrow.funded_at = 0;
        escrow.accepted_at = 0;
        escrow.delivered_at = 0;
        escrow.resolved_at = 0;
        escrow.frozen = false;
        escrow.bump = ctx.bumps.escrow;

        emit!(EscrowEvent {
            order_id,
            from: EscrowState::Initialized,
            to: EscrowState::Initialized,
            actor: ctx.accounts.customer.key(),
            slot: Clock::get()?.slot,
        });
        Ok(())
    }

    pub fn fund_escrow(ctx: Context<FundEscrow>) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow;
        require!(!escrow.frozen, EscrowError::EscrowFrozen);
        require!(escrow.state == EscrowState::Initialized, EscrowError::InvalidStateTransition);
        require_keys_eq!(escrow.customer, ctx.accounts.customer.key(), EscrowError::Unauthorized);
        require!(ctx.accounts.customer_usdc.amount >= escrow.amount, EscrowError::AmountMismatch);

        let cpi_accounts = Transfer {
            from: ctx.accounts.customer_usdc.to_account_info(),
            to: ctx.accounts.vault_usdc.to_account_info(),
            authority: ctx.accounts.customer.to_account_info(),
        };
        let cpi_ctx = CpiContext::new(ctx.accounts.token_program.to_account_info(), cpi_accounts);
        token::transfer(cpi_ctx, escrow.amount)?;

        let prev = escrow.state;
        escrow.state = EscrowState::Funded;
        escrow.funded_at = Clock::get()?.unix_timestamp;

        emit!(EscrowEvent {
            order_id: escrow.order_id,
            from: prev,
            to: escrow.state,
            actor: ctx.accounts.customer.key(),
            slot: Clock::get()?.slot,
        });
        emit!(EscrowFunded { amount: escrow.amount });
        Ok(())
    }

    pub fn accept_listing(ctx: Context<AcceptListing>) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow;
        require!(!escrow.frozen, EscrowError::EscrowFrozen);
        require!(escrow.state == EscrowState::Funded, EscrowError::InvalidStateTransition);
        require_keys_eq!(escrow.assistant, Pubkey::default(), EscrowError::Unauthorized);

        let prev = escrow.state;
        escrow.assistant = ctx.accounts.assistant.key();
        escrow.state = EscrowState::InProgress;
        escrow.accepted_at = Clock::get()?.unix_timestamp;

        emit!(EscrowEvent {
            order_id: escrow.order_id,
            from: prev,
            to: escrow.state,
            actor: ctx.accounts.assistant.key(),
            slot: Clock::get()?.slot,
        });
        Ok(())
    }

    pub fn mark_delivered(ctx: Context<MarkDelivered>) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow;
        require!(!escrow.frozen, EscrowError::EscrowFrozen);
        require!(escrow.state == EscrowState::InProgress, EscrowError::InvalidStateTransition);
        require_keys_eq!(escrow.assistant, ctx.accounts.assistant.key(), EscrowError::Unauthorized);

        let prev = escrow.state;
        escrow.state = EscrowState::AwaitingAcceptance;
        escrow.delivered_at = Clock::get()?.unix_timestamp;

        emit!(EscrowEvent {
            order_id: escrow.order_id,
            from: prev,
            to: escrow.state,
            actor: ctx.accounts.assistant.key(),
            slot: Clock::get()?.slot,
        });
        emit!(EscrowDelivered {
            delivered_at: escrow.delivered_at,
            finalize_eligible_at: escrow
                .delivered_at
                .checked_add(CHALLENGE_WINDOW_SECS)
                .ok_or(EscrowError::MathOverflow)?,
        });
        Ok(())
    }

    pub fn accept_delivery(ctx: Context<AcceptDelivery>) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow;
        require!(!escrow.frozen, EscrowError::EscrowFrozen);
        require!(
            escrow.state == EscrowState::AwaitingAcceptance,
            EscrowError::InvalidStateTransition
        );
        require_keys_eq!(escrow.customer, ctx.accounts.customer.key(), EscrowError::Unauthorized);

        release_to_assistant(
            escrow,
            &ctx.accounts.vault_usdc,
            &ctx.accounts.assistant_usdc,
            &ctx.accounts.token_program,
            FinalizeMode::Manual,
        )?;
        Ok(())
    }

    pub fn finalize_optimistic(ctx: Context<FinalizeOptimistic>) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow;
        require!(!escrow.frozen, EscrowError::EscrowFrozen);
        require!(
            escrow.state == EscrowState::AwaitingAcceptance,
            EscrowError::InvalidStateTransition
        );
        require!(
            escrow.amount < AFFIRMATIVE_ACCEPT_THRESHOLD_USDC_BASE,
            EscrowError::OverThreshold
        );

        let now = Clock::get()?.unix_timestamp;
        let eligible_at = escrow
            .delivered_at
            .checked_add(CHALLENGE_WINDOW_SECS)
            .ok_or(EscrowError::MathOverflow)?;
        require!(now >= eligible_at, EscrowError::WindowNotElapsed);

        release_to_assistant(
            escrow,
            &ctx.accounts.vault_usdc,
            &ctx.accounts.assistant_usdc,
            &ctx.accounts.token_program,
            FinalizeMode::Optimistic,
        )?;
        Ok(())
    }

    pub fn dispute_delivery(ctx: Context<DisputeDelivery>) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow;
        require!(!escrow.frozen, EscrowError::EscrowFrozen);
        require!(
            escrow.state == EscrowState::AwaitingAcceptance || escrow.state == EscrowState::InProgress,
            EscrowError::InvalidStateTransition
        );
        let disputer = ctx.accounts.disputer.key();
        require!(
            disputer == escrow.customer || disputer == escrow.assistant,
            EscrowError::Unauthorized
        );

        let prev = escrow.state;
        escrow.state = EscrowState::Disputed;

        emit!(EscrowEvent {
            order_id: escrow.order_id,
            from: prev,
            to: escrow.state,
            actor: disputer,
            slot: Clock::get()?.slot,
        });
        emit!(EscrowDisputed { disputer });
        Ok(())
    }

    pub fn cancel_pre_fund(ctx: Context<CancelPreFund>) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow;
        require!(escrow.state == EscrowState::Initialized, EscrowError::InvalidStateTransition);
        require_keys_eq!(escrow.customer, ctx.accounts.customer.key(), EscrowError::Unauthorized);

        let prev = escrow.state;
        escrow.state = EscrowState::Cancelled;
        escrow.resolved_at = Clock::get()?.unix_timestamp;

        emit!(EscrowEvent {
            order_id: escrow.order_id,
            from: prev,
            to: escrow.state,
            actor: ctx.accounts.customer.key(),
            slot: Clock::get()?.slot,
        });
        Ok(())
    }

    // mark_frozen: deferred to a follow-up PR. The proper on-chain detection
    // of a USDC freeze requires comparing the vault ATA's state field against
    // the spl_token AccountState::Frozen variant. Implementing without
    // verification risks a compile or behavior break; defer until tested with
    // the actual anchor-spl 0.30.1 version in CI. Off-chain monitors can flag
    // this until the on-chain version lands.
}

fn release_to_assistant<'info>(
    escrow: &mut Account<'info, Escrow>,
    vault_usdc: &Account<'info, TokenAccount>,
    assistant_usdc: &Account<'info, TokenAccount>,
    token_program: &Program<'info, Token>,
    mode: FinalizeMode,
) -> Result<()> {
    let prev = escrow.state;
    let order_id = escrow.order_id;
    let customer = escrow.customer;
    let amount = escrow.amount;
    let bump = escrow.bump;

    let seeds: &[&[u8]] = &[b"escrow", order_id.as_ref(), customer.as_ref(), &[bump]];
    let signer = &[seeds];

    let cpi_accounts = Transfer {
        from: vault_usdc.to_account_info(),
        to: assistant_usdc.to_account_info(),
        authority: escrow.to_account_info(),
    };
    let cpi_ctx = CpiContext::new_with_signer(
        token_program.to_account_info(),
        cpi_accounts,
        signer,
    );
    token::transfer(cpi_ctx, amount)?;

    escrow.state = EscrowState::Completed;
    escrow.resolved_at = Clock::get()?.unix_timestamp;

    emit!(EscrowEvent {
        order_id,
        from: prev,
        to: escrow.state,
        actor: customer,
        slot: Clock::get()?.slot,
    });
    emit!(EscrowFinalized { amount, mode });
    Ok(())
}

#[derive(Accounts)]
#[instruction(order_id: [u8; 32])]
pub struct InitEscrow<'info> {
    #[account(mut)]
    pub customer: Signer<'info>,
    #[account(
        init,
        payer = customer,
        space = 8 + Escrow::INIT_SPACE,
        seeds = [b"escrow", order_id.as_ref(), customer.key().as_ref()],
        bump
    )]
    pub escrow: Account<'info, Escrow>,
    pub usdc_mint: Account<'info, Mint>,
    #[account(
        init,
        payer = customer,
        associated_token::mint = usdc_mint,
        associated_token::authority = escrow
    )]
    pub vault_usdc: Account<'info, TokenAccount>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct FundEscrow<'info> {
    #[account(mut)]
    pub customer: Signer<'info>,
    #[account(
        mut,
        seeds = [b"escrow", escrow.order_id.as_ref(), customer.key().as_ref()],
        bump = escrow.bump,
        has_one = customer @ EscrowError::Unauthorized,
    )]
    pub escrow: Account<'info, Escrow>,
    #[account(mut, token::mint = escrow.usdc_mint, token::authority = customer)]
    pub customer_usdc: Account<'info, TokenAccount>,
    #[account(mut, token::mint = escrow.usdc_mint, token::authority = escrow)]
    pub vault_usdc: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct AcceptListing<'info> {
    pub assistant: Signer<'info>,
    #[account(
        mut,
        seeds = [b"escrow", escrow.order_id.as_ref(), escrow.customer.as_ref()],
        bump = escrow.bump,
    )]
    pub escrow: Account<'info, Escrow>,
}

#[derive(Accounts)]
pub struct MarkDelivered<'info> {
    pub assistant: Signer<'info>,
    #[account(
        mut,
        seeds = [b"escrow", escrow.order_id.as_ref(), escrow.customer.as_ref()],
        bump = escrow.bump,
        has_one = assistant @ EscrowError::Unauthorized,
    )]
    pub escrow: Account<'info, Escrow>,
}

#[derive(Accounts)]
pub struct AcceptDelivery<'info> {
    #[account(mut)]
    pub customer: Signer<'info>,
    #[account(
        mut,
        seeds = [b"escrow", escrow.order_id.as_ref(), escrow.customer.as_ref()],
        bump = escrow.bump,
        has_one = customer @ EscrowError::Unauthorized,
    )]
    pub escrow: Account<'info, Escrow>,
    #[account(mut, token::mint = escrow.usdc_mint, token::authority = escrow)]
    pub vault_usdc: Account<'info, TokenAccount>,
    #[account(mut, token::mint = escrow.usdc_mint)]
    pub assistant_usdc: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct FinalizeOptimistic<'info> {
    /// Cranker — any signer. No identity check beyond paying fees.
    pub cranker: Signer<'info>,
    #[account(
        mut,
        seeds = [b"escrow", escrow.order_id.as_ref(), escrow.customer.as_ref()],
        bump = escrow.bump,
    )]
    pub escrow: Account<'info, Escrow>,
    #[account(mut, token::mint = escrow.usdc_mint, token::authority = escrow)]
    pub vault_usdc: Account<'info, TokenAccount>,
    #[account(mut, token::mint = escrow.usdc_mint)]
    pub assistant_usdc: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct DisputeDelivery<'info> {
    pub disputer: Signer<'info>,
    #[account(
        mut,
        seeds = [b"escrow", escrow.order_id.as_ref(), escrow.customer.as_ref()],
        bump = escrow.bump,
    )]
    pub escrow: Account<'info, Escrow>,
}

#[derive(Accounts)]
pub struct CancelPreFund<'info> {
    #[account(mut)]
    pub customer: Signer<'info>,
    #[account(
        mut,
        close = customer,
        seeds = [b"escrow", escrow.order_id.as_ref(), customer.key().as_ref()],
        bump = escrow.bump,
        has_one = customer @ EscrowError::Unauthorized,
    )]
    pub escrow: Account<'info, Escrow>,
}

#[account]
#[derive(InitSpace)]
pub struct Escrow {
    pub customer: Pubkey,
    pub assistant: Pubkey,
    pub order_id: [u8; 32],
    pub order_hash: [u8; 32],
    pub terms_hash: [u8; 32],
    pub usdc_mint: Pubkey,
    pub amount: u64,
    pub state: EscrowState,
    pub created_at: i64,
    pub funded_at: i64,
    pub accepted_at: i64,
    pub delivered_at: i64,
    pub resolved_at: i64,
    pub frozen: bool,
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, InitSpace, Debug)]
pub enum EscrowState {
    Initialized,
    Funded,
    InProgress,
    AwaitingAcceptance,
    Completed,
    Disputed,
    Refunded,
    Cancelled,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, Debug)]
pub enum FinalizeMode {
    Manual,
    Optimistic,
}

#[event]
pub struct EscrowEvent {
    pub order_id: [u8; 32],
    pub from: EscrowState,
    pub to: EscrowState,
    pub actor: Pubkey,
    pub slot: u64,
}

#[event]
pub struct EscrowFunded {
    pub amount: u64,
}

#[event]
pub struct EscrowDelivered {
    pub delivered_at: i64,
    pub finalize_eligible_at: i64,
}

#[event]
pub struct EscrowFinalized {
    pub amount: u64,
    pub mode: FinalizeMode,
}

#[event]
pub struct EscrowDisputed {
    pub disputer: Pubkey,
}

#[event]
pub struct EscrowFrozen {
    pub reason: u8,
}

#[error_code]
pub enum EscrowError {
    #[msg("State transition not allowed for the current escrow state")]
    InvalidStateTransition,
    #[msg("Signer not authorized for this action")]
    Unauthorized,
    #[msg("Amount mismatch or zero")]
    AmountMismatch,
    #[msg("Challenge window has not elapsed yet")]
    WindowNotElapsed,
    #[msg("Escrow is frozen (e.g. USDC freeze authority); operation refused")]
    EscrowFrozen,
    #[msg("Operation requires both customer and assistant signatures")]
    MissingMutualSignature,
    #[msg("Order amount is at or above the affirmative-acceptance threshold; explicit accept required")]
    OverThreshold,
    #[msg("Order hash mismatch")]
    BadOrderHash,
    #[msg("Math overflow")]
    MathOverflow,
}
