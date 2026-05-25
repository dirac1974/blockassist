use anchor_lang::prelude::*;

#[program]
pub mod dispute {
    use super::*;

    pub fn raise_dispute(ctx: Context<RaiseDispute>, bond_amount: u64) -> Result<()> {
        // Lock user bond + assistant collateral
        // Create dispute PDA
        // Emit DisputeRaised event
        Ok(())
    }

    pub fn submit_evidence(ctx: Context<SubmitEvidence>, evidence_hash: [u8; 32]) -> Result<()> {
        // Store IPFS hash
        Ok(())
    }

    pub fn select_jury(ctx: Context<SelectJury>) -> Result<()> {
        // Random selection from 85th percentile reputation
        // Apply quadratic voting weights
        Ok(())
    }

    pub fn vote(ctx: Context<Vote>, vote_weight: u8) -> Result<()> {
        // Record quadratic vote
        Ok(())
    }

    pub fn resolve_dispute(ctx: Context<ResolveDispute>) -> Result<()> {
        // Determine winner
        // Slash loser collateral
        // Update reputation
        // Possible ban logic
        Ok(())
    }
}