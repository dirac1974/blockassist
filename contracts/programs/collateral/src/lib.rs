use anchor_lang::prelude::*;

#[program]
pub mod collateral {
    use super::*;

    pub fn stake_usdc(ctx: Context<StakeUsdc>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct StakeUsdc {}