use anchor_lang::prelude::*;

#[program]
pub mod dispute {
    use super::*;

    pub fn raise_dispute(ctx: Context<RaiseDispute>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct RaiseDispute {}