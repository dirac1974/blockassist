# BlockAssist v2.1 — Project Instructions for All AI Agents

**MUST READ BEFORE ANY WORK**  
**Version**: 2.1 (Post-Adversarial Review — May 25, 2026)

## Core Philosophy (Updated)
This is a high-stakes financial protocol involving user custody (USDC escrow), staking, and gig work. We prioritize **soundness over speed** and **honest uncertainty over false certainty**.

## Non-Negotiable Guardrails (Revised)
- **Decisions are revisable** with logged rationale in `docs/decisions/DECISIONS.md`. There is no "locked" state.
- **Plan before implementation**: do a full deep thought plan before implementing any code.
- **Compliance Gate**: No mainnet deployment or token launch until Legal & Compliance Lead signs off.
- **Collateral & Insurance**: Must be USDC-denominated (or dual-stake with clear disclosure). Volatile $ASSIST collateral is prohibited without explicit PM + Legal approval.
- **Primary Framework**: Use **Anchor** for all programs. Pinocchio only for profiled hot paths after MVP.
- **Dispute System**: Prefer Solana-native optimistic + on-chain jury fallback. Cross-chain Kleros is experimental only.
- **Testing**: All tests must pass in CI. Self-attested checkmarks are insufficient.
- **Adversarial Review**: The Adversarial Reviewer can halt any task. Their concerns must be addressed before proceeding.
- **Token Necessity**: Explicitly explore and document a "No-Token Alternative" (USDC escrow + reputation only).

## Current Honest Status
Strong scaffolding on contracts, mobile, and process.  
Significant open questions remain on: legal viability, token economic necessity, insurance backstop model, and realistic timeline (now 12–18 months).

**Every agent must confirm they have read this file + latest PROJECT_STATUS.md before starting work.**