# Slashing Specification (DRAFT — does NOT lift halt)

**Owner**: Lead Smart Contract Engineer (draft), Tokenomics Engineer (econ review), Legal & Compliance Lead (legal review — **paused** under DEFER-LEGAL-001).
**Status**: DRAFT. The slashing halt (ADV-F-005) is **NOT lifted** by the existence of this draft. It is lifted only when Legal Lead signs off — see `docs/sprint-0/LEGAL-001.md` for re-entry.
**Purpose**: Capture the design space *before* the Lead SC Engineer starts writing the on-chain slash logic, so when the halt lifts, the spec is ready for review.
**Cross-refs**: `ADV-F-005`, `docs/adversarial/v2.1-review-deep-dive.md` §A.3 (dispute-bribery mitigations).

---

## 1. Goal

Slash assistant collateral when the assistant breaches protocol rules in a way that harms a counterparty. The slash deters bad behavior and funds the harmed party's recovery via the insurance pool.

## 2. Non-goals

- Slashing customers. Customers do not stake collateral.
- Slashing jurors. Juror misbehavior is handled in dispute-system design (separate spec).
- Slashing for ToS violations unrelated to a specific order. Out of scope — those go through account-suspension flows handled off-chain.

## 3. Slash trigger conditions

Each trigger must be deterministic, on-chain-observable, and have an unambiguous payload.

| Trigger | Source | Evidence on-chain | Notes |
|---|---|---|---|
| Adverse dispute resolution | Dispute program CPI | Dispute resolution event with `payout_assistant = 0` | Most common; slash magnitude tied to disputed amount. |
| Failure to deliver (escrow `WORK_TIMEOUT`) | Crank | Escrow `accepted_at + WORK_TIMEOUT_SECS` elapsed without `mark_delivered` | Time-driven; needs cranker action. |
| Provable fraud (e.g. signed receipt for undelivered order) | Off-chain proof submitted on-chain | Hash-and-signature check | Rare; needs careful spec. |
| Reputation tier downgrade auto-slash | Tier engine | N consecutive disputes lost in window | **Open question**: does this constitute "punishment without process"? Legal must opine. |

## 4. Slash magnitude

Open design question. Three candidates:

**a) Fixed % of collateral**
- Simple, predictable.
- Doesn't scale with harm size — small disputes can wipe out collateral.

**b) Amount-matched (slash = disputed amount, capped at collateral)**
- Compensates harmed party 1:1.
- Better incentive alignment.
- Can leave the slashed assistant with $0 collateral, blocking future work without a re-stake.

**c) Tiered scaling (small first offense, growing on repeat)**
- Three-strikes style.
- Encourages first-time-mistake recovery.
- More complex to specify and audit.

**Recommendation (draft)**: option (b) with a floor: `slash_amount = min(disputed_amount, collateral_balance)`, plus a 10% protocol "process fee" (to insurance pool) on the slash itself. Open for Tokenomics simulation.

## 5. Slash destination

Order of priority for slashed funds:

1. **Harmed party (customer)** — restored to original deposit, up to the disputed amount.
2. **Insurance pool** — any excess (if collateral > disputed amount + process fee, the surplus stays with the assistant; if there's a process-fee component it routes here).
3. **Burn / ops** — **rejected**. Slash should not enrich the protocol beyond stated fees. This is an anti-abuse rule.

The slashed funds **never** flow to a juror as bounty. Juror compensation is a separate fee, paid from a different bucket. Otherwise we create the incentive to slash for revenue.

## 6. Slash authority

Only the dispute program may call `slash` (CPI). The collateral program rejects calls from any other program. This is enforced by checking the calling program ID against the deployed dispute program ID stored in a config PDA. Until the dispute program is implemented and audited, the `slash` instruction must return `Unauthorized` unconditionally. This is the current `CONTRACT-003` PR posture.

## 7. Appeal & reversal

Slashes are **reversible** within a window:

- Window: 7 days (`SLASH_APPEAL_WINDOW`).
- Appellant: slashed assistant.
- Forum: appellate jury (per dispute-system spec).
- If appeal succeeds: funds are restored to assistant's collateral PDA from the insurance pool (or from the harmed party's account if they have not yet withdrawn).

After 7 days, slash becomes final on-chain.

## 8. Due-process minimums

Items the Legal Lead must opine on before this spec can be finalized:

1. **Notice**: assistant receives notice of dispute opening + ability to submit evidence — implemented in dispute program.
2. **Hearing**: jury reviews evidence from both sides — implemented in dispute program.
3. **Right to counsel** (or off-chain advocate?) — open.
4. **Standard of proof**: preponderance of evidence (civil-style) vs. clear-and-convincing — open. Document choice.
5. **Right of appeal**: §7 above.
6. **Time-limited slashes** vs. permanent — current design is permanent after appeal window. Confirm.

## 9. State machine

```
collateral PDA states:
  Active  ──slash──►  PendingAppeal  ──appeal_window_elapses──►  Slashed (terminal)
                                  │
                                  └──appeal_success──► Restored ──► Active
```

- `Active`: assistant can withdraw freely (subject to collateral requirements for active orders).
- `PendingAppeal`: withdraw locked. UI shows slash and appeal status.
- `Slashed`: terminal balance reduced; remaining (if any) is `Active`.
- `Restored`: transient; immediately returns to `Active` upon emit.

## 10. Account layout (draft)

```
Collateral PDA per assistant:
  seeds = [b"collateral", assistant.key().as_ref()]
  fields:
    assistant: Pubkey
    usdc_mint: Pubkey
    total_deposited: u64
    total_slashed: u64
    pending_slash_amount: u64        // during appeal window
    pending_slash_started_at: i64
    pending_slash_dispute_id: [u8; 32]
    bump: u8
```

Vault ATA per assistant, owned by the collateral PDA, holds USDC.

## 11. Events

- `CollateralDeposited { assistant, amount, new_total }`
- `CollateralWithdrawn { assistant, amount, new_total }`
- `SlashInitiated { assistant, amount, dispute_id, appeal_deadline }`
- `SlashAppealed { assistant, dispute_id }`
- `SlashFinalized { assistant, amount, dispute_id, paid_to_customer, paid_to_insurance }`
- `SlashReversed { assistant, dispute_id, restored_amount }`

## 12. Open questions tracked

OQ-1. Slash magnitude model (§4) — Tokenomics simulation required.
OQ-2. Auto-slash on reputation tier downgrade (§3) — Legal opinion required.
OQ-3. Slash appeal jury composition — depends on dispute-system spec.
OQ-4. Statute of limitations on initiating a dispute that leads to slash — Legal.
OQ-5. Withdraw cooldown after deposit (anti-money-laundering optic) — Legal.

## 13. Reviser path

This document moves to status `READY` only when Legal Lead signs off on §8 and Tokenomics signs off on §4. Both pause under `DEFER-LEGAL-001`. Sign-offs are logged in `docs/decisions/DECISIONS.md`.
