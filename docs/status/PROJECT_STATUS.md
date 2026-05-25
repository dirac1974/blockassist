# BlockAssist Project Status (Living Document)

**Current Phase**: Phase 0 – Foundation + Legal (Just Started)  
**Realistic Target**: Mainnet + 2 cities in **12–18 months**
**Overall Progress**: 5%
**Honest Assessment**: Strong process and contract scaffolding. Major open risks in legal, token economics, and insurance model.

## Key Decisions Log

| Date | Decision | Rationale | Alternatives | Impact | Approved By |
|------|----------|-----------|--------------|--------|-------------|
| 2026-05-25 | Remove "locked / no rework" policy | Creates dangerous pressure to ignore new information | Keep original | High — enables honest iteration | Grok (PM) + Adversarial Reviewer |
| 2026-05-25 | Add Legal & Compliance Lead + hard Compliance Gate | Regulatory exposure is existential | Proceed without | Prevents potential shutdown or fines | Grok (PM) |
| 2026-05-25 | Change collateral to USDC-denominated | Volatile $ASSIST collateral is known anti-pattern | Keep $ASSIST only | Stronger security guarantees | Grok + Legal |
| 2026-05-25 | Drop Pinocchio as Phase 0 mandate | Industry consensus: Anchor for speed-to-market | Use Pinocchio everywhere | Faster, safer MVP | Lead SC Engineer |
| 2026-05-25 | Drop Alpenglow as locked requirement | Not on mainnet until ~Q4 2026 | Build against it now | Avoids moving target | Grok (PM) |
| 2026-05-25 | Prioritize Solana-native dispute fallback | Cross-chain Kleros introduces unacceptable bridge risk | Kleros as primary | Safer money-at-stake resolution | Grok + Security Lead |
| 2026-05-25 | Add Adversarial Reviewer role with halt authority | Prevents compliance theater and groupthink | Self-review only | Higher quality, catches issues early | Grok (PM) |

## Open High-Risk Items
1. Final securities opinion on fee-funded $ASSIST yield (in progress)
2. Insurance pool backstop model (undefined)
3. Sybil resistance for reputation-weighted yield
4. Realistic audit firm lead times (being confirmed)

**Next Milestone**: Complete Phase 0 by June 2026