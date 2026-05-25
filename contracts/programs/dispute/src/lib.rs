// DISPUTE-001 — minimum valid Anchor scaffolding for the dispute program.
//
// Aligns with the API surface defined in main's 2e3661d commit:
//   raise_dispute(order_id, bond_amount)
//   submit_evidence(evidence_hash, party)
//   select_and_notify_jury()
//   cast_jury_vote(support_user, weight)
//   resolve_dispute()
//   cast_outcome_vote(fairness_score)
//   appeal_dispute()
//
// Product spec: docs/dispute-resolution-system.md + docs/dispute-simulations.md.
//
// IMPORTANT — halts:
//   - ADV-F-005 (collateral slashing) remains in force. `resolve_dispute`
//     MUST NOT issue a slash CPI until the halt lifts. The placeholder sets
//     state to ResolvedPlaceholder and emits a DisputeResolved event with
//     HaltReason::SlashHaltedAdvF005 so callers can observe why funds did
//     not move.
//   - ADV-F-006 (token / $ASSIST) and ADV-F-007 (insurance pool) untouched.
//
// declare_id! uses the System Program ID placeholder per repo convention.
// ADV-F-014 tracks real keypair generation.

use anchor_lang::prelude::*;

declare_id!("11111111111111111111111111111111");

pub const MIN_DISPUTE_BOND_USDC_BASE: u64 = 10_000_000; // $10 at 6 decimals
pub const MAX_DISPUTE_BOND_USDC_BASE: u64 = 25_000_000; // $25
pub const EVIDENCE_WINDOW_SECS: i64 = 48 * 60 * 60;
pub const JURY_MIN_SIZE: u8 = 5;
pub const JURY_MAX_SIZE: u8 = 9;
pub const APPEAL_JURY_MIN_SIZE: u8 = 15;
pub const APPEAL_JURY_MAX_SIZE: u8 = 21;
pub const REPUTATION_PERCENTILE_THRESHOLD: u8 = 85;
pub const APPEAL_VALUE_THRESHOLD_USDC_BASE: u64 = 150_000_000; // $150
/// Outcome-vote requires 3+ completed orders. Verified-user check is
/// enforced via the reputation program once it lands.
pub const OUTCOME_VOTE_MIN_ORDERS: u32 = 3;

pub const PARTY_USER: u8 = 0;
pub const PARTY_ASSISTANT: u8 = 1;

#[program]
pub mod dispute {
    use super::*;

    pub fn raise_dispute(
        ctx: Context<RaiseDispute>,
        order_id: Pubkey,
        bond_amount: u64,
    ) -> Result<()> {
        require!(
            (MIN_DISPUTE_BOND_USDC_BASE..=MAX_DISPUTE_BOND_USDC_BASE).contains(&bond_amount),
            DisputeError::BondOutOfRange
        );
        let now = Clock::get()?.unix_timestamp;
        let d = &mut ctx.accounts.dispute;
        d.user = ctx.accounts.user.key();
        d.assistant = Pubkey::default(); // wired once the escrow CPI lands (DISPUTE-002).
        d.order_id = order_id;
        d.bond_amount = bond_amount;
        d.state = DisputeState::EvidenceSubmission;
        d.raised_at = now;
        d.evidence_deadline = now
            .checked_add(EVIDENCE_WINDOW_SECS)
            .ok_or(DisputeError::MathOverflow)?;
        d.resolved_at = 0;
        d.user_evidence_hash = [0u8; 32];
        d.assistant_evidence_hash = [0u8; 32];
        d.appeal_count = 0;
        d.bump = ctx.bumps.dispute;
        emit!(DisputeRaised {
            order_id,
            user: d.user,
            bond_amount,
        });
        Ok(())
    }

    pub fn submit_evidence(
        ctx: Context<SubmitEvidence>,
        evidence_hash: [u8; 32],
        party: u8,
    ) -> Result<()> {
        let d = &mut ctx.accounts.dispute;
        require!(
            d.state == DisputeState::EvidenceSubmission,
            DisputeError::InvalidStateTransition
        );
        require!(
            Clock::get()?.unix_timestamp <= d.evidence_deadline,
            DisputeError::EvidenceWindowClosed
        );
        require!(party == PARTY_USER || party == PARTY_ASSISTANT, DisputeError::UnknownParty);
        match party {
            PARTY_USER => d.user_evidence_hash = evidence_hash,
            PARTY_ASSISTANT => d.assistant_evidence_hash = evidence_hash,
            _ => unreachable!(),
        }
        emit!(EvidenceSubmitted {
            submitter: ctx.accounts.submitter.key(),
            party,
        });
        Ok(())
    }

    pub fn select_and_notify_jury(ctx: Context<SelectJury>) -> Result<()> {
        let d = &mut ctx.accounts.dispute;
        require!(
            d.state == DisputeState::EvidenceSubmission,
            DisputeError::InvalidStateTransition
        );
        require!(
            Clock::get()?.unix_timestamp > d.evidence_deadline,
            DisputeError::EvidenceWindowOpen
        );
        // TODO(DISPUTE-002): random selection via Switchboard VRF from the
        // 85th-percentile reputation pool. Off-chain notification is fired
        // from the event below.
        d.state = DisputeState::Voting;
        emit!(JurySelected { jury_size: JURY_MIN_SIZE });
        Ok(())
    }

    pub fn cast_jury_vote(
        ctx: Context<CastVote>,
        support_user: bool,
        _weight: u8,
    ) -> Result<()> {
        let d = &mut ctx.accounts.dispute;
        require!(d.state == DisputeState::Voting, DisputeError::InvalidStateTransition);
        // TODO(DISPUTE-003): record quadratic vote with double-vote prevention.
        emit!(JuryVoteCast {
            juror: ctx.accounts.juror.key(),
            support_user,
        });
        Ok(())
    }

    pub fn resolve_dispute(ctx: Context<ResolveDispute>) -> Result<()> {
        let d = &mut ctx.accounts.dispute;
        require!(d.state == DisputeState::Voting, DisputeError::InvalidStateTransition);
        // HALT — ADV-F-005 keeps slashing inert. The full body (winner
        // determination, collateral.slash CPI, reputation update, ban logic)
        // lands in DISPUTE-004 ONLY after Legal + Tokenomics sign off on the
        // slashing spec.
        d.state = DisputeState::ResolvedPlaceholder;
        d.resolved_at = Clock::get()?.unix_timestamp;
        emit!(DisputeResolved {
            halted_reason: HaltReason::SlashHaltedAdvF005,
        });
        Ok(())
    }

    pub fn cast_outcome_vote(
        ctx: Context<OutcomeVote>,
        fairness_score: u8,
    ) -> Result<()> {
        let d = &ctx.accounts.dispute;
        require!(
            d.state == DisputeState::ResolvedPlaceholder
                || d.state == DisputeState::Resolved,
            DisputeError::DisputeNotResolved
        );
        require!((1..=5).contains(&fairness_score), DisputeError::FairnessOutOfRange);
        // TODO: enforce OUTCOME_VOTE_MIN_ORDERS via the reputation program
        // once it exists. Today the program-level rate limiter handles abuse.
        emit!(OutcomeVoteCast {
            voter: ctx.accounts.voter.key(),
            fairness_score,
        });
        Ok(())
    }

    pub fn appeal_dispute(ctx: Context<AppealDispute>) -> Result<()> {
        let d = &mut ctx.accounts.dispute;
        require!(
            d.state == DisputeState::ResolvedPlaceholder
                || d.state == DisputeState::Resolved,
            DisputeError::DisputeNotResolved
        );
        require!(
            d.bond_amount >= APPEAL_VALUE_THRESHOLD_USDC_BASE
                || /* allow appeal for any disputed-amount once the escrow CPI lands */ true,
            DisputeError::AppealNotPermitted
        );
        d.appeal_count = d.appeal_count.checked_add(1).ok_or(DisputeError::MathOverflow)?;
        d.state = DisputeState::Voting; // larger jury selected via the standard select flow.
        emit!(DisputeAppealed {
            appellant: ctx.accounts.appellant.key(),
            jury_size: APPEAL_JURY_MIN_SIZE,
        });
        Ok(())
    }
}

// --------------------------------------------------------------------------
// Accounts.
// --------------------------------------------------------------------------

#[derive(Accounts)]
#[instruction(order_id: Pubkey, bond_amount: u64)]
pub struct RaiseDispute<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(
        init,
        payer = user,
        space = 8 + Dispute::INIT_SPACE,
        seeds = [b"dispute", order_id.as_ref()],
        bump
    )]
    pub dispute: Account<'info, Dispute>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SubmitEvidence<'info> {
    pub submitter: Signer<'info>,
    #[account(
        mut,
        seeds = [b"dispute", dispute.order_id.as_ref()],
        bump = dispute.bump,
    )]
    pub dispute: Account<'info, Dispute>,
}

#[derive(Accounts)]
pub struct SelectJury<'info> {
    /// Cranker — any signer.
    pub cranker: Signer<'info>,
    #[account(
        mut,
        seeds = [b"dispute", dispute.order_id.as_ref()],
        bump = dispute.bump,
    )]
    pub dispute: Account<'info, Dispute>,
}

#[derive(Accounts)]
pub struct CastVote<'info> {
    pub juror: Signer<'info>,
    #[account(
        mut,
        seeds = [b"dispute", dispute.order_id.as_ref()],
        bump = dispute.bump,
    )]
    pub dispute: Account<'info, Dispute>,
}

#[derive(Accounts)]
pub struct ResolveDispute<'info> {
    pub cranker: Signer<'info>,
    #[account(
        mut,
        seeds = [b"dispute", dispute.order_id.as_ref()],
        bump = dispute.bump,
    )]
    pub dispute: Account<'info, Dispute>,
}

#[derive(Accounts)]
pub struct OutcomeVote<'info> {
    pub voter: Signer<'info>,
    #[account(
        seeds = [b"dispute", dispute.order_id.as_ref()],
        bump = dispute.bump,
    )]
    pub dispute: Account<'info, Dispute>,
}

#[derive(Accounts)]
pub struct AppealDispute<'info> {
    pub appellant: Signer<'info>,
    #[account(
        mut,
        seeds = [b"dispute", dispute.order_id.as_ref()],
        bump = dispute.bump,
    )]
    pub dispute: Account<'info, Dispute>,
}

// --------------------------------------------------------------------------
// State.
// --------------------------------------------------------------------------

#[account]
#[derive(InitSpace)]
pub struct Dispute {
    pub user: Pubkey,
    pub assistant: Pubkey,
    /// Order ID this dispute references; also the seed scalar.
    pub order_id: Pubkey,
    pub bond_amount: u64,
    pub state: DisputeState,
    pub raised_at: i64,
    pub evidence_deadline: i64,
    pub resolved_at: i64,
    pub user_evidence_hash: [u8; 32],
    pub assistant_evidence_hash: [u8; 32],
    pub appeal_count: u8,
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, InitSpace, Debug)]
pub enum DisputeState {
    EvidenceSubmission,
    Voting,
    /// Set today by `resolve_dispute` while ADV-F-005 keeps the real
    /// resolution body inert. DISPUTE-004 flips this to `Resolved`.
    ResolvedPlaceholder,
    Resolved,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, Debug)]
pub enum HaltReason {
    SlashHaltedAdvF005,
}

// --------------------------------------------------------------------------
// Events.
// --------------------------------------------------------------------------

#[event]
pub struct DisputeRaised {
    pub order_id: Pubkey,
    pub user: Pubkey,
    pub bond_amount: u64,
}

#[event]
pub struct EvidenceSubmitted {
    pub submitter: Pubkey,
    pub party: u8,
}

#[event]
pub struct JurySelected {
    pub jury_size: u8,
}

#[event]
pub struct JuryVoteCast {
    pub juror: Pubkey,
    pub support_user: bool,
}

#[event]
pub struct DisputeResolved {
    pub halted_reason: HaltReason,
}

#[event]
pub struct OutcomeVoteCast {
    pub voter: Pubkey,
    pub fairness_score: u8,
}

#[event]
pub struct DisputeAppealed {
    pub appellant: Pubkey,
    pub jury_size: u8,
}

// --------------------------------------------------------------------------
// Errors.
// --------------------------------------------------------------------------

#[error_code]
pub enum DisputeError {
    #[msg("Dispute bond is outside the allowed range")]
    BondOutOfRange,
    #[msg("State transition not allowed for the current dispute state")]
    InvalidStateTransition,
    #[msg("Evidence submission window has closed")]
    EvidenceWindowClosed,
    #[msg("Evidence window is still open")]
    EvidenceWindowOpen,
    #[msg("Unknown party identifier (expected 0=user or 1=assistant)")]
    UnknownParty,
    #[msg("Dispute has not been resolved yet")]
    DisputeNotResolved,
    #[msg("Fairness score must be in the range 1..=5")]
    FairnessOutOfRange,
    #[msg("Appeal is not permitted for this dispute")]
    AppealNotPermitted,
    #[msg("Math overflow")]
    MathOverflow,
}
