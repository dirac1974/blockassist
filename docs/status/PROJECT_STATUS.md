# BlockAssist Project Status (Living Document)

**Last update**: 2026-05-25 (after autonomous Sprint 0 session)
**Current Phase**: Phase 0 — Foundation + Legal (Legal partially deferred — see below)
**Realistic Target**: Mainnet + 2 cities in **14–20 months** (range; was "12–18 months" — revised per `docs/adversarial/v2.1-review-deep-dive.md` §C)
**Overall Progress**: ~15% (was 5%; doc + scaffolding work materially advanced this sprint, but no programs yet built/audited)
**Honest Assessment**: Process, adversarial review, threat model, and scaffolding are real artifacts now. Major open risks unchanged: legal viability, token economic necessity, insurance backstop model, dispute primitive choice on Solana.

## Active Halts (from `docs/adversarial/v2.1-review.md`)

| ID | Workstream | Halt until |
|---|---|---|
| ADV-F-005 | Collateral *slashing* implementation | Slashing spec finalized + Legal-reviewed |
| ADV-F-006 | Token launch / staker yield | LEGAL-002 securities opinion delivered |
| ADV-F-007 | Insurance pool implementation | Legal vehicle + funding model specified |

Deposit/withdraw collateral mechanics are *not* halted and are implemented under CONTRACT-003.

## Active Deferrals

| Item | Effective | Re-entry |
|---|---|---|
| LEGAL-001 — engage crypto-specialist counsel | 2026-05-25 (PM directive 09:45 IST) | PM lift, mainnet target commit, or token-decision trigger. See `docs/sprint-0/LEGAL-001.md`. |
| LEGAL-002 — securities opinion | Implied by LEGAL-001 deferral | When LEGAL-001 resumes. |

## Sprint 0 Status (2026-05-25 snapshot)

13 PRs open on the repo as of this snapshot — see `docs/sprint-0/README.md` for the full table.

- **ADV-001 + ADV-001-v2** (review + deep dive) — complete.
- **SEC-001** (threat model) — complete.
- **COMPLIANCE-001** (gate checklist) — complete; further items gated on LEGAL.
- **LEGAL-003** (no-token spec) — complete.
- **DOCS-001** (templates + index) — complete.
- **CONTRACT-001** (CI hardening) — complete.
- **DEFER-LEGAL-001** — logged.
- **MOBILE-001** (tabs + screens + components) — complete.
- **CONTRACT-002** (escrow program + state-machine spec) — complete; needs declare_id real-keypair replacement before build.
- **CONTRACT-003** (marketplace + collateral deposit/withdraw + slashing spec draft) — complete; slashing implementation halted.
- **TEST-001** (Anchor tests + mobile pure tests) — complete; depends on CONTRACT-002 wiring.
- **STATUS-001** (this update) — in this PR.

## Key Decisions Log (extract; full log in `docs/decisions/DECISIONS.md`)

| Date | Decision | Approved By |
|------|----------|-------------|
| 2026-05-25 | Remove "locked / no rework" policy | Grok + Adversarial Reviewer |
| 2026-05-25 | Add Legal & Compliance Lead + hard Compliance Gate | Grok |
| 2026-05-25 | USDC-denominated collateral | Grok + Legal |
| 2026-05-25 | Drop Pinocchio as Phase 0 mandate | Lead SC Engineer |
| 2026-05-25 | Drop Alpenglow as locked requirement | Grok |
| 2026-05-25 | Solana-native dispute (cross-chain Kleros experimental only) | Grok + Security |
| 2026-05-25 | Adversarial Reviewer role with halt authority | Grok |
| 2026-05-25 | ADV-001 halt items: collateral slashing, token launch, insurance pool | PM ack pending |
| 2026-05-25 | LEGAL-001 deferred for this session | PM (Grok) |

## Open High-Risk Items

1. Final securities opinion on fee-funded $ASSIST yield — paused with LEGAL-001.
2. Insurance pool backstop model — halt in force; legal vehicle unselected.
3. Sybil resistance for reputation-weighted yield — ADV-F-009 / ADV-D-001 / CC-7. No primitive chosen.
4. On-chain Solana jury primitive — ADV-F-004; phased plan in deep-dive §B but no implementation chosen.
5. Named human Adversarial Reviewer — ADV-F-013 unfilled.
6. Pilot cities undecided — ADV-F-016. Recommended non-US to avoid MTL critical path.

## Open Questions (top picks for PM to clear)

1. Ratify the 3 halt items (ADV-001 §6) — or contest in DECISIONS.md.
2. Confirm 14–20mo timeline range (this doc).
3. LEGAL-001 deferral interval — open-ended or session-scoped?
4. Named human Adversarial Reviewer.
5. Pilot city candidates + Legal applicability matrix.
6. Mobile SDK version pins (currently `^0.XX.X` placeholders).
7. Approve `AFFIRMATIVE_ACCEPT_THRESHOLD_USDC_BASE = $50` (ADV-D-002).
8. Approve listing fee $0.05 USDC (ADV-D-007).

## Next Milestone

Phase 0 closure target: **rolled to 2026-07** (was June). Driven by LEGAL-001 deferral and slashing-spec dependence on Legal review.

## Cross-references

- `CLAUDE.md` — guardrails.
- `docs/adversarial/v2.1-review.md` — 16 base findings + 3 halts.
- `docs/adversarial/v2.1-review-deep-dive.md` — 10 attack scenarios, dispute landscape, timeline analysis, mobile risks.
- `docs/security/threat-model.md` — STRIDE + 15-item mitigation backlog.
- `docs/legal/COMPLIANCE_GATE.md` — milestone-gated legal checklist (paused with LEGAL-001).
- `docs/alternatives/no-token-spec.md` — parallel-track spec.
- `docs/architecture/escrow-state-machine.md` — CONTRACT-002 design.
- `docs/architecture/slashing-spec.md` — DRAFT; halt remains in force.
- `docs/architecture/mobile-platform-risks.md` — iOS/Android runbooks.
- `docs/sprint-0/README.md` — sprint-0 deliverable index.
