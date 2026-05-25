# Grok Feedback & Deployment Status Log

---

## 2026-05-25 — DISPUTE-001

**Commit SHA**: 593b134dd16cc4d576c518599646cfd81564253f
**Date**: 2026-05-25
**Agent**: Claude (Lead Smart Contract Engineer)
**Task ID**: DISPUTE-001
**Changes Made**:
- `contracts/programs/dispute/src/lib.rs`: aligned with main's 2e3661d API (7 instructions: `raise_dispute`, `submit_evidence`, `select_and_notify_jury`, `cast_jury_vote`, `resolve_dispute`, `cast_outcome_vote`, `appeal_dispute`) and added the missing scaffolding so `anchor build` compiles.
- 9 spec-derived constants (bond range, evidence window, jury sizes regular + appeal, percentile, appeal value threshold, outcome-vote min orders, party IDs).
- State-machine guards on every instruction. Per-party evidence hashes so a user submission doesn't overwrite the assistant's. `resolve_dispute` is **HALTED**: sets `ResolvedPlaceholder` + emits `DisputeResolved{halted_reason: SlashHaltedAdvF005}`. `cast_outcome_vote` enforces 1..=5. `appeal_dispute` increments `appeal_count` and re-enters Voting.
- Accounts structs for all 7 instructions; `Dispute` PDA with `InitSpace`; `DisputeState` (4 variants); 7 events; 9 errors.
- Follow-ups deferred: DISPUTE-002 (Switchboard VRF jury), DISPUTE-003 (quadratic voting tally), DISPUTE-004 (real resolve body — requires ADV-F-005 lift).
**Test Results**: Anchor TS tests for the new dispute flow are a DISPUTE-002 follow-up. The collateral-slash-halted regression test on the collateral program still pins the halt at the slash side.
**Deployment Status Update**: None. Branch `feature/DISPUTE-001-scaffolding`.
**Issues / Blockers**: Branch was reset to `origin/main` after the user's 2e3661d landed mid-session; this commit is the realigned version. No legal/token/insurance code touched.
**Grok Feedback / Questions**:
1. Approve the inline `HaltReason::SlashHaltedAdvF005` wiring so the dispute program is observably honest about why it doesn't move funds yet?
2. Approve splitting evidence hashes into `user_evidence_hash` + `assistant_evidence_hash` (vs. a single `last_evidence_hash` that gets overwritten)?

---

## 2026-05-25 — MANAGE-001

**Commit SHA**: 25bc59f58e2f304c87df04476a71160988c8d755
**Date**: 2026-05-25
**Agent**: Claude (Mobile Lead)
**Task ID**: MANAGE-001
**Changes Made**:
- `mobile/app/safety-contacts.tsx` (new): full CRUD UI for emergency contacts. Saved-list with per-row Delete. Add form with name + phone + relation inputs, inline validation via `isValidPhone()`. Themed; respects `MAX_EMERGENCY_CONTACTS = 3`.
- `mobile/app/_layout.tsx`: register the `/safety-contacts` route.
- `mobile/app/safety.tsx`: "Manage contacts" button now navigates instead of showing the placeholder Alert. Drop unused Alert import.
- `mobile/app/__tests__/safety-contacts.flow.test.ts` (new): 3 vitest cases — add-past-MAX caps at the limit on reload, delete-by-id survives reload, invalid-phone entries planted directly in storage are filtered on parse.
**Test Results**: 3 new flow cases authored.
**Deployment Status Update**: None. Branch `feature/MANAGE-001-contacts-ui`.
**Issues / Blockers**: None. With contacts UI live, the safety screen has a complete end-to-end flow: register background task → start session → manage contacts → escalate.
**Grok Feedback / Questions**:
1. Approve the "no auto-dial; user acts inside the app" stance carried forward in the contacts UI copy?

---

**Task**: Full Dispute Resolution System Specification
**Changes**:
- Created comprehensive technical spec (docs/dispute-resolution-system.md)
- Added detailed simulations for 3 scenarios
- Started smart contract skeleton (Dispute program)
- Recommended 85th percentile for jury + 2.8x surge cap already ratified

**Status**: Dispute system fully specified and partially integrated into architecture.
**Next**: Complete full Dispute.sol implementation + testing.
---

## 2026-05-25 — TEST-001b

**Commit SHA**: d3bb4927e52a40a52ad3cf631735b677f7d9b44f
**Date**: 2026-05-25
**Agent**: Claude (QA Lead)
**Task ID**: TEST-001b
**Changes Made**: `mobile/services/__tests__/end-to-end.test.ts` (new) — 4 integration cases: surge cap binds at Allegiant on Raiders night, cap is a no-op midday Strip with no events, venue-tag filter returns non-empty for `24-hour`, full safety-background loop (persist → fire task → reload as escalated).
**Test Results**: 4 e2e cases authored. Session-cumulative new test count = 43 (4 + 5 + 21 + 13 = MAP / LOC / STORE / SAFETY modules, plus these 4 e2e). Comfortably exceeds the ≥20 target.
**Deployment Status Update**: None. Branch `feature/TEST-001b-integration`.
**Issues / Blockers**: None.
**Grok Feedback / Questions**: None.

---

