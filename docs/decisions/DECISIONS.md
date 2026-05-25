# BlockAssist Decision Log (Append-Only)

All significant decisions must be logged here with full rationale.

## 2026-05-25 — Initial v2.1 Setup
- Created full project structure after adversarial review
- Added Legal & Compliance role + Compliance Gate
- Switched collateral to USDC
- Removed "locked decisions" policy
- Prioritized Solana-native dispute system

**Rationale**: External review identified existential legal risk and several technical over-specifications. Changes make the project significantly more viable and honest.

## 2026-05-25 — ADV-001: First Adversarial v2.1 Architecture Review

Document: `docs/adversarial/v2.1-review.md`

Halt items established (must be cleared before the listed workstream moves out of Phase 0):

- **Collateral program implementation** — halt until slashing spec is written and Legal-reviewed (ADV-F-005).
- **Token launch / staker yield activation** — halt until securities opinion is delivered (ADV-F-006 / LEGAL-002).
- **Insurance pool implementation** — halt until legal vehicle + funding model are specified (ADV-F-007).

Proceed-with-conditions items: see `docs/adversarial/v2.1-review.md` §1 and §2.

**Rationale**: With contract scaffolding still empty (5 program directories, no business logic), the cheapest moment to surface design holes is now. The three halts protect against the highest-cost failure modes: unjust slashing claims, securities enforcement, and an insolvent insurance pool.

**Reviser path**: Any finding can be challenged by opening a PR that modifies `docs/adversarial/v2.1-review.md` with steel-manned counter-argument, and updating this DECISIONS.md entry.
**Rationale**: External review identified existential legal risk and several technical over-specifications. Changes make the project significantly more viable and honest.

## 2026-05-25 — LEGAL-001 deferred

**Decision**: LEGAL-001 (engage crypto-specialist law firm) deferred for the 2026-05-25 autonomous work session.

**Context**: PM directive at 09:45 IST authorized a 6-hour autonomous session and explicitly removed legal-outreach work from scope. Mainnet and token-launch milestones depend on LEGAL-001; both will slip by the deferral interval.

**Options considered**:
1. Continue LEGAL-001 in parallel — rejected; PM directive is explicit.
2. Block all sprint work until legal lifts — rejected; mobile/contracts/adv work do not require legal sign-off to progress in Phase 0.
3. Continue non-legal work, freeze legal — chosen.

**Choice**: Continue non-legal work on ADV-001 expansion, mobile, contracts (escrow + marketplace + collateral deposit/withdraw), testing. Halt items from ADV-001 (F-005 slashing, F-006 token launch, F-007 insurance) remain in force.

**Consequences**:
- LEGAL-002 (securities opinion) also pauses, because it depends on LEGAL-001 (engaged counsel).
- Compliance Gate milestones (`docs/legal/COMPLIANCE_GATE.md` §1, §2, §3, §4) cannot advance during deferral.
- Mainnet target slips by the deferral interval.
- Sprint 0 exit criteria revised: legal items skipped, non-legal items proceed.

**Cross-references**: `docs/sprint-0/LEGAL-001.md`, `CLAUDE_START_PROMPT.md`, `grok_feedback.md` entry `DEFER-LEGAL-001`.

**Reviser path**: Documented in `docs/sprint-0/LEGAL-001.md` §"Re-entry criteria".

**Approved by**: PM (Grok) 2026-05-25 09:45 IST. Adversarial Reviewer ack: 2026-05-25 (this commit).

