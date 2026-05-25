use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

#[program]
pub mod dispute {
    use super::*;

    pub fn raise_dispute(
        ctx: Context<RaiseDispute>,
        order_id: Pubkey,
        bond_amount: u64,
    ) -> Result<()> {
        require!(bond_amount >= 10_000_000, DisputeError::BondTooLow); // Min $10

        let dispute = &mut ctx.accounts.dispute;
        dispute.order_id = order_id;
        dispute.user = ctx.accounts.user.key();
        dispute.assistant = ctx.accounts.assistant.key();
        dispute.user_bond = bond_amount;
        dispute.status = DisputeStatus::EvidenceSubmission;
        dispute.created_at = Clock::get()?.unix_timestamp;
        dispute.deadline = dispute.created_at + (48 * 60 * 60); // 48 hours

        emit!(DisputeRaised { dispute_id: dispute.key(), order_id });
        Ok(())
    }

    pub fn submit_evidence(
        ctx: Context<SubmitEvidence>,
        evidence_hash: [u8; 32],
        party: u8,
    ) -> Result<()> {
        let dispute = &mut ctx.accounts.dispute;
        require!(dispute.status == DisputeStatus::EvidenceSubmission, DisputeError::InvalidStatus);
        require!(Clock::get()?.unix_timestamp < dispute.deadline, DisputeError::DeadlinePassed);

        if party == 0 {
            dispute.user_evidence = evidence_hash;
        } else {
            dispute.assistant_evidence = evidence_hash;
        }

        emit!(EvidenceSubmitted { dispute_id: dispute.key(), party });
        Ok(())
    }

    pub fn select_jury(ctx: Context<SelectJury>) -> Result<()> {
        let dispute = &mut ctx.accounts.dispute;
        require!(dispute.status == DisputeStatus::EvidenceSubmission, DisputeError::InvalidStatus);

        dispute.status = DisputeStatus::Voting;
        dispute.jury_selected = true;

        emit!(JurySelected { dispute_id: dispute.key() });
        Ok(())
    }

    pub fn cast_vote(
        ctx: Context<CastVote>,
        support_user: bool,
    ) -> Result<()> {
        let dispute = &mut ctx.accounts.dispute;
        require!(dispute.status == DisputeStatus::Voting, DisputeError::InvalidStatus);

        if support_user {
            dispute.user_votes += 1;
        } else {
            dispute.assistant_votes += 1;
        }

        emit!(VoteCast { dispute_id: dispute.key(), support_user });
        Ok(())
    }

    pub fn resolve_dispute(ctx: Context<ResolveDispute>) -> Result<()> {
        let dispute = &mut ctx.accounts.dispute;
        require!(dispute.status == DisputeStatus::Voting, DisputeError::InvalidStatus);

        let user_wins = dispute.user_votes > dispute.assistant_votes;
        dispute.winner = if user_wins { dispute.user } else { dispute.assistant };
        dispute.status = DisputeStatus::Resolved;
        dispute.resolved_at = Clock::get()?.unix_timestamp;

        emit!(DisputeResolved { dispute_id: dispute.key(), winner: dispute.winner });
        Ok(())
    }

    pub fn cast_outcome_vote(
        ctx: Context<OutcomeVote>,
        fairness_score: u8,
    ) -> Result<()> {
        require!(fairness_score >= 1 && fairness_score <= 5, DisputeError::InvalidScore);
        // Record public vote (max 10% influence)
        Ok(())
    }

    pub fn appeal_dispute(ctx: Context<AppealDispute>) -> Result<()> {
        let dispute = &mut ctx.accounts.dispute;
        require!(dispute.status == DisputeStatus::Resolved, DisputeError::InvalidStatus);
        // Logic for appeal...
        dispute.status = DisputeStatus::Appealed;
        Ok(())
    }
}

// Account structs, events, and errors remain similar (expanded version)
#[account]
pub struct Dispute { /* ... */ }

#[event]
pub struct DisputeRaised { pub dispute_id: Pubkey, pub order_id: Pubkey }
#[event]
pub struct EvidenceSubmitted { pub dispute_id: Pubkey, pub party: u8 }
#[event]
pub struct JurySelected { pub dispute_id: Pubkey }
#[event]
pub struct VoteCast { pub dispute_id: Pubkey, pub support_user: bool }
#[event]
pub struct DisputeResolved { pub dispute_id: Pubkey, pub winner: Pubkey }

#[error_code]
pub enum DisputeError {
    InvalidStatus,
    DeadlinePassed,
    BondTooLow,
    InvalidScore,
}