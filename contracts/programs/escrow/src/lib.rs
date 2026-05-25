use anchor_lang::prelude::*;

#[program]
pub mod escrow {
    use super::*;

    pub fn create_escrow(ctx: Context<CreateEscrow>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct CreateEscrow {}