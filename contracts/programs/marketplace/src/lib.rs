// CONTRACT-003: Marketplace program.
//
// Listing lifecycle (off-chain UI; on-chain commit):
//   Open ── accept ──► Accepted (links to an escrow PDA)
//        ── cancel ──► Cancelled
//        ── expire ──► Expired (anyone can crank after expires_at)
//
// Listing fee is a small refundable lockup that funds anti-spam (closes
// ADV-F-013 ADV-D-007). Refund on Accept/Cancel-by-creator; forfeit on
// Expire.
//
// declare_id placeholder — see ADV-F-014.

use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{self, Mint, Token, TokenAccount, Transfer},
};

declare_id!("11111111111111111111111111111111");

pub const LISTING_FEE_USDC_BASE: u64 = 50_000; // $0.05 placeholder. ADV-D-007.
pub const DEFAULT_LISTING_DURATION_SECS: i64 = 7 * 24 * 60 * 60;
pub const MAX_LISTING_DURATION_SECS: i64 = 30 * 24 * 60 * 60;
pub const MAX_TITLE_LEN: usize = 80;

#[program]
pub mod marketplace {
    use super::*;

    pub fn create_listing(
        ctx: Context<CreateListing>,
        listing_id: [u8; 32],
        title: String,
        terms_hash: [u8; 32],
        price_usdc_base: u64,
        duration_secs: i64,
    ) -> Result<()> {
        require!(price_usdc_base > 0, MarketplaceError::AmountMismatch);
        require!(title.as_bytes().len() <= MAX_TITLE_LEN, MarketplaceError::TitleTooLong);
        require!(
            duration_secs > 0 && duration_secs <= MAX_LISTING_DURATION_SECS,
            MarketplaceError::InvalidDuration
        );

        let now = Clock::get()?.unix_timestamp;
        let listing = &mut ctx.accounts.listing;
        listing.lister = ctx.accounts.lister.key();
        listing.taker = Pubkey::default();
        listing.listing_id = listing_id;
        listing.terms_hash = terms_hash;
        listing.usdc_mint = ctx.accounts.usdc_mint.key();
        listing.price_usdc_base = price_usdc_base;
        listing.title = title;
        listing.state = ListingState::Open;
        listing.created_at = now;
        listing.expires_at = now.checked_add(duration_secs).ok_or(MarketplaceError::MathOverflow)?;
        listing.accepted_at = 0;
        listing.fee_amount = LISTING_FEE_USDC_BASE;
        listing.bump = ctx.bumps.listing;

        // Pay listing fee into the listing-fee vault.
        let cpi_accounts = Transfer {
            from: ctx.accounts.lister_usdc.to_account_info(),
            to: ctx.accounts.fee_vault_usdc.to_account_info(),
            authority: ctx.accounts.lister.to_account_info(),
        };
        let cpi_ctx = CpiContext::new(ctx.accounts.token_program.to_account_info(), cpi_accounts);
        token::transfer(cpi_ctx, LISTING_FEE_USDC_BASE)?;

        emit!(ListingEvent {
            listing_id,
            from: ListingState::Open,
            to: ListingState::Open,
            actor: ctx.accounts.lister.key(),
            slot: Clock::get()?.slot,
        });
        Ok(())
    }

    pub fn accept_listing(ctx: Context<AcceptListing>) -> Result<()> {
        let listing = &mut ctx.accounts.listing;
        require!(listing.state == ListingState::Open, MarketplaceError::InvalidStateTransition);
        require_keys_eq!(listing.taker, Pubkey::default(), MarketplaceError::AlreadyTaken);

        let now = Clock::get()?.unix_timestamp;
        require!(now < listing.expires_at, MarketplaceError::Expired);

        // Snapshot for the signer seeds before mutation.
        let listing_id = listing.listing_id;
        let lister = listing.lister;
        let bump = listing.bump;
        let fee = listing.fee_amount;

        let prev = listing.state;
        listing.taker = ctx.accounts.taker.key();
        listing.state = ListingState::Accepted;
        listing.accepted_at = now;

        if fee > 0 {
            let seeds: &[&[u8]] = &[b"listing", listing_id.as_ref(), lister.as_ref(), &[bump]];
            let signer = &[seeds];
            let cpi_accounts = Transfer {
                from: ctx.accounts.fee_vault_usdc.to_account_info(),
                to: ctx.accounts.lister_usdc.to_account_info(),
                authority: listing.to_account_info(),
            };
            let cpi_ctx = CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                cpi_accounts,
                signer,
            );
            token::transfer(cpi_ctx, fee)?;
        }

        emit!(ListingEvent {
            listing_id,
            from: prev,
            to: ListingState::Accepted,
            actor: ctx.accounts.taker.key(),
            slot: Clock::get()?.slot,
        });
        emit!(ListingAccepted { taker: ctx.accounts.taker.key(), price_usdc_base: listing.price_usdc_base });
        Ok(())
    }

    pub fn cancel_listing(ctx: Context<CancelListing>) -> Result<()> {
        let listing = &mut ctx.accounts.listing;
        require!(listing.state == ListingState::Open, MarketplaceError::InvalidStateTransition);
        require_keys_eq!(listing.lister, ctx.accounts.lister.key(), MarketplaceError::Unauthorized);

        let listing_id = listing.listing_id;
        let lister = listing.lister;
        let bump = listing.bump;
        let fee = listing.fee_amount;

        let prev = listing.state;
        listing.state = ListingState::Cancelled;

        if fee > 0 {
            let seeds: &[&[u8]] = &[b"listing", listing_id.as_ref(), lister.as_ref(), &[bump]];
            let signer = &[seeds];
            let cpi_accounts = Transfer {
                from: ctx.accounts.fee_vault_usdc.to_account_info(),
                to: ctx.accounts.lister_usdc.to_account_info(),
                authority: listing.to_account_info(),
            };
            let cpi_ctx = CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                cpi_accounts,
                signer,
            );
            token::transfer(cpi_ctx, fee)?;
        }

        emit!(ListingEvent {
            listing_id,
            from: prev,
            to: ListingState::Cancelled,
            actor: ctx.accounts.lister.key(),
            slot: Clock::get()?.slot,
        });
        Ok(())
    }

    pub fn expire_listing(ctx: Context<ExpireListing>) -> Result<()> {
        let listing = &mut ctx.accounts.listing;
        require!(listing.state == ListingState::Open, MarketplaceError::InvalidStateTransition);
        let now = Clock::get()?.unix_timestamp;
        require!(now >= listing.expires_at, MarketplaceError::NotYetExpired);

        let prev = listing.state;
        listing.state = ListingState::Expired;
        // Fee is forfeited (stays in fee_vault) — anti-spam intent. The fee
        // vault is owned by the listing PDA, so until a sweep instruction is
        // added the funds are stranded but accounted for. Sweep deferred to a
        // follow-up PR (would route to ops/insurance per tokenomics).

        emit!(ListingEvent {
            listing_id: listing.listing_id,
            from: prev,
            to: listing.state,
            actor: ctx.accounts.cranker.key(),
            slot: Clock::get()?.slot,
        });
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(listing_id: [u8; 32])]
pub struct CreateListing<'info> {
    #[account(mut)]
    pub lister: Signer<'info>,
    #[account(
        init,
        payer = lister,
        space = 8 + Listing::INIT_SPACE,
        seeds = [b"listing", listing_id.as_ref(), lister.key().as_ref()],
        bump
    )]
    pub listing: Account<'info, Listing>,
    pub usdc_mint: Account<'info, Mint>,
    #[account(mut, token::mint = usdc_mint, token::authority = lister)]
    pub lister_usdc: Account<'info, TokenAccount>,
    #[account(
        init,
        payer = lister,
        associated_token::mint = usdc_mint,
        associated_token::authority = listing
    )]
    pub fee_vault_usdc: Account<'info, TokenAccount>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct AcceptListing<'info> {
    pub taker: Signer<'info>,
    #[account(
        mut,
        seeds = [b"listing", listing.listing_id.as_ref(), listing.lister.as_ref()],
        bump = listing.bump,
    )]
    pub listing: Account<'info, Listing>,
    #[account(mut, token::mint = listing.usdc_mint, token::authority = listing)]
    pub fee_vault_usdc: Account<'info, TokenAccount>,
    #[account(mut, token::mint = listing.usdc_mint)]
    pub lister_usdc: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct CancelListing<'info> {
    #[account(mut)]
    pub lister: Signer<'info>,
    #[account(
        mut,
        seeds = [b"listing", listing.listing_id.as_ref(), lister.key().as_ref()],
        bump = listing.bump,
        has_one = lister @ MarketplaceError::Unauthorized,
    )]
    pub listing: Account<'info, Listing>,
    #[account(mut, token::mint = listing.usdc_mint, token::authority = listing)]
    pub fee_vault_usdc: Account<'info, TokenAccount>,
    #[account(mut, token::mint = listing.usdc_mint, token::authority = lister)]
    pub lister_usdc: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct ExpireListing<'info> {
    pub cranker: Signer<'info>,
    #[account(
        mut,
        seeds = [b"listing", listing.listing_id.as_ref(), listing.lister.as_ref()],
        bump = listing.bump,
    )]
    pub listing: Account<'info, Listing>,
}

#[account]
#[derive(InitSpace)]
pub struct Listing {
    pub lister: Pubkey,
    pub taker: Pubkey,
    pub listing_id: [u8; 32],
    pub terms_hash: [u8; 32],
    pub usdc_mint: Pubkey,
    pub price_usdc_base: u64,
    #[max_len(MAX_TITLE_LEN)]
    pub title: String,
    pub state: ListingState,
    pub created_at: i64,
    pub expires_at: i64,
    pub accepted_at: i64,
    pub fee_amount: u64,
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, InitSpace, Debug)]
pub enum ListingState {
    Open,
    Accepted,
    Cancelled,
    Expired,
}

#[event]
pub struct ListingEvent {
    pub listing_id: [u8; 32],
    pub from: ListingState,
    pub to: ListingState,
    pub actor: Pubkey,
    pub slot: u64,
}

#[event]
pub struct ListingAccepted {
    pub taker: Pubkey,
    pub price_usdc_base: u64,
}

#[error_code]
pub enum MarketplaceError {
    #[msg("State transition not allowed for the current listing state")]
    InvalidStateTransition,
    #[msg("Listing has already been taken")]
    AlreadyTaken,
    #[msg("Listing has expired")]
    Expired,
    #[msg("Listing has not yet expired")]
    NotYetExpired,
    #[msg("Signer not authorized for this action")]
    Unauthorized,
    #[msg("Amount mismatch or zero")]
    AmountMismatch,
    #[msg("Title exceeds maximum length")]
    TitleTooLong,
    #[msg("Duration is zero or exceeds maximum")]
    InvalidDuration,
    #[msg("Math overflow")]
    MathOverflow,
}
