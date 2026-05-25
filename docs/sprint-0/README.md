# Sprint 0 — Deliverable Index

**Sprint window**: 2026-05-25 → 2026-06-08 (original) / **target rolled to 2026-07** due to LEGAL-001 deferral.
**Phase**: 0 — Foundation + Legal.

## Status by task

| Task | Status | Branch | Notes |
|---|---|---|---|
| LEGAL-001 — engage counsel | **Deferred** | n/a | See `docs/sprint-0/LEGAL-001.md`. |
| LEGAL-002 — securities opinion | Paused (blocked on LEGAL-001) | n/a | — |
| LEGAL-003 — no-token spec | Complete (PR) | `feature/LEGAL-003-no-token-spec` | `docs/alternatives/no-token-spec.md` |
| COMPLIANCE-001 — gate checklist | Complete (PR) | `feature/COMPLIANCE-001-gate-checklist` | `docs/legal/COMPLIANCE_GATE.md` |
| ADV-001 — adversarial review | Complete (PR) | `feature/ADV-001-architecture-review` | `docs/adversarial/v2.1-review.md` |
| ADV-001-v2 — deep dive | Complete (PR) | `feature/ADV-001-v2-deep-dive` | `docs/adversarial/v2.1-review-deep-dive.md` |
| DOCS-001 — templates + index | Complete (PR) | `feature/DOCS-001-templates` | `docs/templates/`, `docs/README.md` |
| CONTRACT-001 — CI/CD hardening | Complete (PR) | `feature/CONTRACT-001-ci-hardening` | mobile/web/sdk CI + security-scan + repo-hygiene |
| CONTRACT-002 — escrow program + state spec | Complete (PR) | `feature/CONTRACT-002-escrow` | `docs/architecture/escrow-state-machine.md` + lib.rs |
| CONTRACT-003 — marketplace + collateral | Complete (PR) | `feature/CONTRACT-003-marketplace-collateral` | slash halted; spec drafted |
| MOBILE-001 — cross-platform expansion | Complete (PR) | `feature/MOBILE-001-expansion` | tabs + sign-in + order detail + listing |
| SEC-001 — threat model | Complete (PR) | `feature/SEC-001-threat-model` | `docs/security/threat-model.md` |
| TEST-001 — Anchor + mobile tests | Complete (PR) | `feature/TEST-001` | `contracts/tests/*.spec.ts` + `mobile/lib/__tests__/` |
| DEFER-LEGAL-001 — log deferral | Complete (PR) | `feature/DEFER-LEGAL-001` | DECISIONS + sprint-0 doc + CLAUDE_START_PROMPT |
| CLEANUP-001 — move CLAUDE.md to root | Complete (PR) | `feature/CLEANUP-001-claude-md-root` | path standardization |
| STATUS-001 — sync status + arch + this index | Complete (this PR) | `feature/STATUS-001` | — |

## Sprint exit criteria (revised)

To close Sprint 0:

1. PRs above merged or explicitly rejected with rationale in `docs/decisions/DECISIONS.md`.
2. PM ratification of 3 halt items (ADV-F-005, F-006, F-007).
3. PM ratification of 14–20mo timeline range (was 12–18).
4. Named human Adversarial Reviewer assigned (ADV-F-013).
5. Pilot city candidates named with Legal applicability sketch (ADV-F-016).
6. LEGAL-001 deferral interval defined (open-ended vs. session-scoped).
7. Mobile SDK versions pinned (no `^0.XX.X` placeholders remaining).

Items 4–7 do **not** require Legal Lead engagement and can proceed during the LEGAL-001 deferral.

## Recommended PR merge order

To minimize conflict resolution on `grok_feedback.md` and other shared files:

1. `CLEANUP-001` — repository foundation; resolves docs/claude.md → CLAUDE.md.
2. `DOCS-001` — creates `docs/README.md` (no other PR touches this file).
3. `ADV-001` — adds `docs/adversarial/v2.1-review.md` + DECISIONS.md entry.
4. `ADV-001-v2` — adds companion deep-dive (independent file).
5. `SEC-001`, `COMPLIANCE-001`, `LEGAL-003` — independent docs; any order.
6. `CONTRACT-001` — CI workflows; conditional checks tolerate everything else.
7. `MOBILE-001` — independent of other branches.
8. `CONTRACT-002`, `CONTRACT-003`, `TEST-001` — order doesn't matter; conflicts only on `grok_feedback.md`.
9. `DEFER-LEGAL-001` — DECISIONS.md + new sprint-0/LEGAL-001.md.
10. `STATUS-001` — this PR; updates PROJECT_STATUS.md + v2-architecture.md + sprint-0/README.md.

`grok_feedback.md` conflicts: every PR adds a new entry above the Template section. When resolving, **keep all entries** ordered chronologically by SHA timestamp.
