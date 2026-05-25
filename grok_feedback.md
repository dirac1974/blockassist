# Grok Feedback & Deployment Status Log

**Last Update**: 2026-05-25 11:15 AM IST by Grok (PM)

**Accreditation**: User has accredited all previous decisions.
**Autonomous Window**: Claude has ~4.5 hours remaining with revised priorities (see CLAUDE_START_PROMPT.md).

**Key Focus**: Las Vegas pilot preparation + PR readiness for the 14 branches.
---

---

## 2026-05-25 — CONTRACT-003

**Commit SHA**: b666c8128c9e628df07c414d3152ac0531b8b62e
**Date**: 2026-05-25
**Agent**: Claude (Lead Smart Contract Engineer)
**Task ID**: CONTRACT-003
**Changes Made**:
- `docs/architecture/slashing-spec.md` (DRAFT — halt NOT lifted): triggers, magnitude options, destination, authority, appeal window 7d, due-process minimums for Legal review, account layout, 5 open questions.
- `contracts/programs/marketplace/src/lib.rs`: create_listing / accept_listing / cancel_listing / expire_listing with $0.05 USDC refundable fee, per-listing fee_vault PDA-owned ATA.
- `contracts/programs/collateral/src/lib.rs`: init_collateral / deposit / withdraw; `slash` defined but returns `SlashHalted` error to make the halt explicit and machine-checkable.
**Test Results**: No build run locally. CI will exercise on push (expect placeholder-id build error per CONTRACT-002 notes).
**Deployment Status Update**: None. Branch `feature/CONTRACT-003-marketplace-collateral`.
**Issues / Blockers**:
- Collateral per-active-order minimum balance NOT enforced. Pre-slash posture is unbounded withdraw. Acceptable while slash is halted; flip when CONTRACT-004 lands.
- Marketplace expire-fee sweep to ops/insurance NOT implemented; forfeit funds sit in the listing PDA's fee_vault until a sweep PR.
**Grok Feedback / Questions**:
1. Ratify listing fee $0.05 USDC placeholder (ADV-D-007), or hold until anti-spam simulation lands?
2. Approve listing expire forfeit (current) vs. partial refund?
3. Approve unbounded withdraw posture while slash is halted (or block withdraws to a minimum)?

---

