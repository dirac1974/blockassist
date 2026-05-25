use anchor_lang::prelude::*;

#[program]
pub mod dispute {
    use super::*;

    pub fn raise_dispute(ctx: Context<RaiseDispute>, order_id: Pubkey, bond_amount: u64) -> Result<()> {
        // 1. Lock user bond
        // 2. Lock assistant collateral
        // 3. Create Dispute PDA
        // 4. Set status = EvidenceSubmission
        Ok(())
    }

    pub fn submit_evidence(ctx: Context<SubmitEvidence>, evidence_hash: [u8; 32], party: u8) -> Result<()> {
        // Store IPFS hash + party (0 = user, 1 = assistant)
        // Require cryptographic timestamp
        Ok(())
    }

    pub fn select_and_notify_jury(ctx: Context<SelectJury>) -> Result<()> {
        // Select from 85th percentile reputation pool
        // Send notification via off-chain service
        Ok(())
    }

    pub fn cast_jury_vote(ctx: Context<CastVote>, support_user: bool, weight: u8) -> Result<()> {
        // Record quadratic vote
        // Prevent double voting
        Ok(())
    }

    pub fn resolve_dispute(ctx: Context<ResolveDispute>) -> Result<()> {
        // Calculate winner using quadratic votes + reputation weighting
        // Update reputation scores
        // Slash loser
        // Trigger ban if repeat offender
        Ok(())
    }

    pub fn cast_outcome_vote(ctx: Context<OutcomeVote>, fairness_score: u8) -> Result<()> {
        // Anyone can vote on outcome quality (1-5)
        // Only verified users (3+ orders)
        // Low weight impact on future jury selection
        Ok(())
    }

    pub fn appeal_dispute(ctx: Context<AppealDispute>) -> Result<()> {
        // Only for disputes > $150
        // Require 2x bond
        // Select larger jury (15-21)
        Ok(())
    }
}