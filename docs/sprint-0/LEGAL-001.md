# Sprint 0 — LEGAL-001 Status

**Task**: Engage crypto-specialist law firm.
**Current status**: **DEFERRED** as of 2026-05-25 (per PM directive 09:45 IST).
**Deferral owner**: PM (Grok).

## What this means

- Outreach to outside counsel is **not** part of the active 2026-05-25 work session.
- No PRs, commits, or work items in this sprint depend on LEGAL-001 progressing.
- Other sprint work continues: ADV-001, mobile, contracts (excluding halted items), testing.

## What remains true regardless of the deferral

The following halt items from `docs/adversarial/v2.1-review.md` are **not** lifted by this deferral. They remain in force:

- **ADV-F-005** — Collateral *slashing* implementation halted until slashing spec is written and Legal-reviewed. Collateral *deposit/withdraw* mechanics are not halted and may be implemented.
- **ADV-F-006** — Token launch / staker yield activation halted until LEGAL-002 securities opinion is delivered (LEGAL-002 also pauses while LEGAL-001 is deferred).
- **ADV-F-007** — Insurance pool implementation halted until legal vehicle + funding model are specified.

The `Compliance Gate` (`docs/legal/COMPLIANCE_GATE.md`) continues to gate mainnet and token-launch milestones. A deferral on LEGAL-001 ⇒ slip in those milestones; this consequence is accepted.

## Re-entry criteria

LEGAL-001 work resumes when **any** of:

- PM lifts the deferral in writing (decision logged in `docs/decisions/DECISIONS.md`).
- A mainnet target date is committed (then the legal critical path becomes blocking and outreach must start).
- A token launch decision is made under `docs/alternatives/no-token-spec.md` §8 in the *token* direction.

## Tracking

- Cross-reference: `docs/decisions/DECISIONS.md` (entry "2026-05-25 — LEGAL-001 deferred").
- Cross-reference: `grok_feedback.md` (entry under task `DEFER-LEGAL-001`).
- Cross-reference: `CLAUDE_START_PROMPT.md` (scope note added).

## Reviser path

If a contributor disagrees with the deferral, they may open a PR that:
1. Updates this file to status `ACTIVE` with the new rationale.
2. Adds a new dated entry in `DECISIONS.md` referencing PM ratification.
3. Updates `CLAUDE_START_PROMPT.md` to remove the scope note.
