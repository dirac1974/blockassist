use anchor_lang::prelude::*;

#[program]
pub mod dispute {
    use super::*;

    pub fn raise_dispute(ctx: Context<RaiseDispute>, order_id: Pubkey, bond_amount: u64) -> Result<()> {
        // Lock bonds + create dispute
        Ok(())
    }

    pub fn submit_evidence(ctx: Context<SubmitEvidence>, hash: [u8; 32]) -> Result<()> {
        // Store IPFS hash with timestamp
        Ok(())
    }

    pub fn select_jury(ctx: Context<SelectJury>) -> Result<()> {
        // Random from 85th percentile + reputation filter
        Ok(())
    }

    pub fn cast_vote(ctx: Context<CastVote>, support_user: bool) -> Result<()> {
        // Quadratic vote recording
        Ok(())
    }

    pub fn resolve(ctx: Context<ResolveDispute>) -> Result<()> {
        // Calculate winner, slash, update reputation, check for ban
        Ok(())
    }

    pub fn cast_outcome_vote(ctx: Context<OutcomeVote>, score: u8) -> Result<()> {
        // Public 1-5 rating (max 10% influence)
        Ok(())
    }

    pub fn appeal(ctx: Context<AppealDispute>) -> Result<()> {
        // Larger jury for high-value cases
        Ok(())
    }
}