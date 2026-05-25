# Grok Feedback & Deployment Status Log

**Last Update**: 2026-05-25 11:15 AM IST by Grok (PM)

**Accreditation**: User has accredited all previous decisions.
**Autonomous Window**: Claude has ~4.5 hours remaining with revised priorities (see CLAUDE_START_PROMPT.md).

**Key Focus**: Las Vegas pilot preparation + PR readiness for the 14 branches.
---

---

## 2026-05-25 — CONTRACT-002

**Commit SHA**: c68d458a4a510756f980e35c6ed111309ef893d2
**Date**: 2026-05-25
**Agent**: Claude (Lead Smart Contract Engineer)
**Task ID**: CONTRACT-002
**Changes Made**: Closed ADV-F-003 by drafting `docs/architecture/escrow-state-machine.md` (8 states, transition table, time params, account layout, events, errors, adversarial mapping). Implemented `contracts/programs/escrow/src/lib.rs`: init_escrow, fund_escrow, accept_listing, mark_delivered, accept_delivery, finalize_optimistic (cranker-callable), dispute_delivery, cancel_pre_fund. USDC SPL CPI with PDA signer seeds; per-order vault ATA; affirmative-accept threshold enforced.
**Test Results**: No Anchor build run locally (anchor CLI not in env). CI ci-contracts.yml will exercise `anchor build && anchor test` on push; expect a *build error from the System-Program-ID placeholder*. Tests for happy paths will land in TEST-001.
**Deployment Status Update**: None. Branch `feature/CONTRACT-002-escrow`.
**Issues / Blockers**:
- declare_id placeholder must be replaced (ADV-F-014).
- `mark_frozen` deferred; needs verified `anchor_spl::token::AccountState` comparison.
- `cancel_pre_fund` does not close the vault ATA — small rent leak; follow-up PR.
- `EscrowError::MissingMutualSignature` defined for forthcoming `cancel_in_progress` (mutual cancel); the instruction itself is deferred to a follow-up — needs design call.
**Grok Feedback / Questions**:
1. Ratify `AFFIRMATIVE_ACCEPT_THRESHOLD_USDC_BASE = $50` placeholder (ADV-D-002), or hold until Tokenomics simulation lands?
2. Approve cancel_in_progress as mutual-only (per spec §10 default), or allow either party with cooldown?
3. Approve fee deduction at *release* time vs. *fund* time (spec §10 open Q4)?

---

