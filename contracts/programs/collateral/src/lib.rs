// CONTRACT-003: Collateral program.
//
// SCOPE: This PR implements ONLY deposit and withdraw. The `slash`
// instruction returns Unauthorized unconditionally because:
//
//   - ADV-F-005 explicitly halts slashing logic until the slashing spec
//     is written *and* Legal-reviewed.
//   - LEGAL-001 is currently deferred (DEFER-LEGAL-001), so the
//     Legal-review prerequisite cannot be cleared in this session.
//
// Draft spec: docs/architecture/slashing-spec.md.
//
// When the halt lifts, the slash implementation lands as a follow-up PR
// (CONTRACT-004) and replaces the stub with the spec'd state machine.
//
// declare_id placeholder — see ADV-F-014.

use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{self, Mint, Token, TokenAccount, Transfer},
};

declare_id!("11111111111111111111111111111111");

#[program]
pub mod collateral {
    use super::*;

    pub fn init_collateral(ctx: Context<InitCollateral>) -> Result<()> {
        let collateral = &mut ctx.accounts.collateral;
        collateral.assistant = ctx.accounts.assistant.key();
        collateral.usdc_mint = ctx.accounts.usdc_mint.key();
        collateral.total_deposited = 0;
        collateral.total_slashed = 0;
        collateral.pending_slash_amount = 0;
        collateral.pending_slash_started_at = 0;
        collateral.pending_slash_dispute_id = [0u8; 32];
        collateral.bump = ctx.bumps.collateral;
        Ok(())
    }

    pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
        require!(amount > 0, CollateralError::AmountMismatch);
        require!(
            ctx.accounts.collateral.pending_slash_amount == 0,
            CollateralError::SlashPending
        );

        let cpi_accounts = Transfer {
            from: ctx.accounts.assistant_usdc.to_account_info(),
            to: ctx.accounts.vault_usdc.to_account_info(),
            authority: ctx.accounts.assistant.to_account_info(),
        };
        let cpi_ctx = CpiContext::new(ctx.accounts.token_program.to_account_info(), cpi_accounts);
        token::transfer(cpi_ctx, amount)?;

        let collateral = &mut ctx.accounts.collateral;
        collateral.total_deposited = collateral
            .total_deposited
            .checked_add(amount)
            .ok_or(CollateralError::MathOverflow)?;

        emit!(CollateralDeposited {
            assistant: collateral.assistant,
            amount,
            new_total: collateral.total_deposited,
        });
        Ok(())
    }

    pub fn withdraw(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
        require!(amount > 0, CollateralError::AmountMismatch);
        let collateral = &mut ctx.accounts.collateral;
        require_keys_eq!(
            collateral.assistant,
            ctx.accounts.assistant.key(),
            CollateralError::Unauthorized
        );
        require!(
            collateral.pending_slash_amount == 0,
            CollateralError::SlashPending
        );
        require!(
            ctx.accounts.vault_usdc.amount >= amount,
            CollateralError::InsufficientBalance
        );

        // Snapshot for signer seeds before mutation.
        let assistant = collateral.assistant;
        let bump = collateral.bump;

        // Per-active-order minimum balance check is NOT implemented in this
        // PR. The escrow program references collateral by assistant Pubkey;
        // when active escrows exist, withdrawing below the per-tier minimum
        // should be blocked. Tracked as a CONTRACT-003 follow-up; for now
        // unbounded withdraw (subject to vault balance) is the conservative
        // pre-slash posture: assistants can always exit. Insurance pool only
        // becomes relevant once slashing lands.

        let seeds: &[&[u8]] = &[b"collateral", assistant.as_ref(), &[bump]];
        let signer = &[seeds];
        let cpi_accounts = Transfer {
            from: ctx.accounts.vault_usdc.to_account_info(),
            to: ctx.accounts.assistant_usdc.to_account_info(),
            authority: collateral.to_account_info(),
        };
        let cpi_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            cpi_accounts,
            signer,
        );
        token::transfer(cpi_ctx, amount)?;

        emit!(CollateralWithdrawn {
            assistant,
            amount,
            new_total: collateral
                .total_deposited
                .saturating_sub(collateral.total_slashed)
                .saturating_sub(amount),
        });
        Ok(())
    }

    // ------------------------------------------------------------------
    // SLASH — halted under ADV-F-005. Returns Unauthorized unconditionally
    // until the slashing spec is finalized and Legal-reviewed. The signature
    // is kept so dispute program developers can see the intended interface.
    // ------------------------------------------------------------------
    pub fn slash(_ctx: Context<Slash>, _amount: u64, _dispute_id: [u8; 32]) -> Result<()> {
        Err(CollateralError::SlashHalted.into())
    }
}

#[derive(Accounts)]
pub struct InitCollateral<'info> {
    #[account(mut)]
    pub assistant: Signer<'info>,
    #[account(
        init,
        payer = assistant,
        space = 8 + Collateral::INIT_SPACE,
        seeds = [b"collateral", assistant.key().as_ref()],
        bump
    )]
    pub collateral: Account<'info, Collateral>,
    pub usdc_mint: Account<'info, Mint>,
    #[account(
        init,
        payer = assistant,
        associated_token::mint = usdc_mint,
        associated_token::authority = collateral
    )]
    pub vault_usdc: Account<'info, TokenAccount>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct Deposit<'info> {
    pub assistant: Signer<'info>,
    #[account(
        mut,
        seeds = [b"collateral", assistant.key().as_ref()],
        bump = collateral.bump,
        has_one = assistant @ CollateralError::Unauthorized,
    )]
    pub collateral: Account<'info, Collateral>,
    #[account(mut, token::mint = collateral.usdc_mint, token::authority = assistant)]
    pub assistant_usdc: Account<'info, TokenAccount>,
    #[account(mut, token::mint = collateral.usdc_mint, token::authority = collateral)]
    pub vault_usdc: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct Withdraw<'info> {
    pub assistant: Signer<'info>,
    #[account(
        mut,
        seeds = [b"collateral", assistant.key().as_ref()],
        bump = collateral.bump,
        has_one = assistant @ CollateralError::Unauthorized,
    )]
    pub collateral: Account<'info, Collateral>,
    #[account(mut, token::mint = collateral.usdc_mint, token::authority = collateral)]
    pub vault_usdc: Account<'info, TokenAccount>,
    #[account(mut, token::mint = collateral.usdc_mint, token::authority = assistant)]
    pub assistant_usdc: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct Slash<'info> {
    /// Must be the dispute program in production. Identity check is
    /// implemented when the halt lifts; until then, every call fails.
    pub caller: Signer<'info>,
    #[account(
        mut,
        seeds = [b"collateral", collateral.assistant.as_ref()],
        bump = collateral.bump,
    )]
    pub collateral: Account<'info, Collateral>,
}

#[account]
#[derive(InitSpace)]
pub struct Collateral {
    pub assistant: Pubkey,
    pub usdc_mint: Pubkey,
    pub total_deposited: u64,
    pub total_slashed: u64,
    pub pending_slash_amount: u64,
    pub pending_slash_started_at: i64,
    pub pending_slash_dispute_id: [u8; 32],
    pub bump: u8,
}

#[event]
pub struct CollateralDeposited {
    pub assistant: Pubkey,
    pub amount: u64,
    pub new_total: u64,
}

#[event]
pub struct CollateralWithdrawn {
    pub assistant: Pubkey,
    pub amount: u64,
    pub new_total: u64,
}

#[error_code]
pub enum CollateralError {
    #[msg("Amount mismatch or zero")]
    AmountMismatch,
    #[msg("Signer not authorized for this action")]
    Unauthorized,
    #[msg("A slash is currently pending; deposits and withdrawals are locked")]
    SlashPending,
    #[msg("Insufficient collateral balance")]
    InsufficientBalance,
    #[msg(
        "Slashing is halted under ADV-F-005 until the slashing spec is finalized and Legal-reviewed. \
         See docs/architecture/slashing-spec.md."
    )]
    SlashHalted,
    #[msg("Math overflow")]
    MathOverflow,
}
