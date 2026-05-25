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