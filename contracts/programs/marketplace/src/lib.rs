use anchor_lang::prelude::*;

#[program]
pub mod marketplace {
    use super::*;

    pub fn create_fast_order(ctx: Context<CreateFastOrder>) -> Result<()> {
        Ok(())
    }

    pub fn create_custom_job(ctx: Context<CreateCustomJob>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct CreateFastOrder {}

#[derive(Accounts)]
pub struct CreateCustomJob {}