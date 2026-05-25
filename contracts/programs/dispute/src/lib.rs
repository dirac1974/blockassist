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
        let dispute = &mut ctx.accounts.dispute;
        dispute.order_id = order_id;
        dispute.user = ctx.accounts.user.key();
        dispute.assistant = ctx.accounts.assistant.key();
        dispute.user_bond = bond_amount;
        dispute.status = DisputeStatus::EvidenceSubmission;
        dispute.created_at = Clock::get()?.unix_timestamp;

        // Lock user bond and assistant collateral
        // (In real implementation, transfer from user/assistant accounts)

        emit!(DisputeRaised {
            dispute_id: dispute.key(),
            order_id,
        });

        Ok(())
    }

    pub fn submit_evidence(
        ctx: Context<SubmitEvidence>,
        evidence_hash: [u8; 32],
        party: u8, // 0 = user, 1 = assistant
    ) -> Result<()> {
        let dispute = &mut ctx.accounts.dispute;
        require!(dispute.status == DisputeStatus::EvidenceSubmission, DisputeError::InvalidStatus);

        if party == 0 {
            dispute.user_evidence = evidence_hash;
        } else {
            dispute.assistant_evidence = evidence_hash;
        }

        Ok(())
    }

    pub fn select_jury(ctx: Context<SelectJury>) -> Result<()> {
        let dispute = &mut ctx.accounts.dispute;
        require!(dispute.status == DisputeStatus::EvidenceSubmission, DisputeError::InvalidStatus);

        // Select 5-9 jurors from 85th percentile reputation pool
        // (Simplified - real version uses on-chain reputation PDA)
        dispute.status = DisputeStatus::Voting;
        dispute.jury_selected = true;

        Ok(())
    }

    pub fn cast_vote(
        ctx: Context<CastVote>,
        support_user: bool,
    ) -> Result<()> {
        let dispute = &mut ctx.accounts.dispute;
        require!(dispute.status == DisputeStatus::Voting, DisputeError::InvalidStatus);

        // Quadratic voting logic (simplified)
        if support_user {
            dispute.user_votes += 1;
        } else {
            dispute.assistant_votes += 1;
        }

        Ok(())
    }

    pub fn resolve_dispute(ctx: Context<ResolveDispute>) -> Result<()> {
        let dispute = &mut ctx.accounts.dispute;
        require!(dispute.status == DisputeStatus::Voting, DisputeError::InvalidStatus);

        let user_wins = dispute.user_votes > dispute.assistant_votes;

        if user_wins {
            dispute.winner = dispute.user;
            // Transfer funds to user + slash assistant collateral
        } else {
            dispute.winner = dispute.assistant;
            // Transfer funds to assistant
        }

        dispute.status = DisputeStatus::Resolved;
        dispute.resolved_at = Clock::get()?.unix_timestamp;

        emit!(DisputeResolved {
            dispute_id: dispute.key(),
            winner: dispute.winner,
        });

        Ok(())
    }

    pub fn cast_outcome_vote(
        ctx: Context<OutcomeVote>,
        fairness_score: u8, // 1-5
    ) -> Result<()> {
        require!(fairness_score >= 1 && fairness_score <= 5, DisputeError::InvalidScore);
        // Record public vote (max 10% influence on jury fairness)
        Ok(())
    }
}

#[derive(Accounts)]
pub struct RaiseDispute<'info> {
    #[account(init, payer = user, space = 8 + 200)]
    pub dispute: Account<'info, Dispute>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub assistant: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct Dispute {
    pub order_id: Pubkey,
    pub user: Pubkey,
    pub assistant: Pubkey,
    pub user_bond: u64,
    pub status: DisputeStatus,
    pub user_evidence: [u8; 32],
    pub assistant_evidence: [u8; 32],
    pub user_votes: u32,
    pub assistant_votes: u32,
    pub winner: Pubkey,
    pub created_at: i64,
    pub resolved_at: i64,
    pub jury_selected: bool,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum DisputeStatus {
    EvidenceSubmission,
    Voting,
    Resolved,
    Appealed,
}

#[event]
pub struct DisputeRaised {
    pub dispute_id: Pubkey,
    pub order_id: Pubkey,
}

#[event]
pub struct DisputeResolved {
    pub dispute_id: Pubkey,
    pub winner: Pubkey,
}

#[error_code]
pub enum DisputeError {
    #[msg("Invalid dispute status")]
    InvalidStatus,
    #[msg("Invalid score")]
    InvalidScore,
}