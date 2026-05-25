# Grok Feedback & Deployment Status Log

**Last full rewrite**: 2026-05-25 (post Sprint-2). This document is the canonical historical log for AI-driven work to date. Per-commit entries below should be appended above the older sprint summaries when new work lands.

---

## Sprint 0 — Foundation + Legal (Session 1)

**Outcome**: 14 feature branches opened, **13 merged**, **1 closed as superseded** (PR #1 CLEANUP-001 — the user kept `docs/claude.md` as the canonical location instead of moving it to root).

| PR | Task | Squash SHA |
|---:|---|---|
| #1 | CLEANUP-001 — move docs/claude.md → CLAUDE.md | CLOSED (superseded) |
| #2 | DOCS-001 — documentation templates + docs/README.md index | `95f2987` |
| #3 | ADV-001 — first adversarial v2.1 architecture review (16 findings, 3 halts) | `fc6ae8a` |
| #4 | ADV-001-v2 — deep-dive companion (10 attack scenarios, dispute landscape, timeline analysis, mobile risks, 11 ADV-D items) | `f921869` |
| #5 | SEC-001 — initial STRIDE threat model (12 assets, 9 components, 10 cross-cutting threats, 15-item mitigation backlog) | `7e0893b` |
| #6 | COMPLIANCE-001 — milestone-gated Compliance Gate checklist (10 sections, sign-off block) | `5e7caa1` |
| #7 | LEGAL-003 — full No-Token Alternative parallel-track spec | `e924b92` |
| #8 | CONTRACT-001 — CI workflows (mobile/web/sdk) + security scan + repo hygiene | `55c0210` |
| #9 | MOBILE-001 — Expo Router tabs, sign-in modal, order/[id], create-listing, components/types/lib | `f647c80` |
| #10 | CONTRACT-002 — escrow state-machine spec + Anchor program (init/fund/accept/deliver/finalize/dispute/cancel) | `f7745ba` |
| #11 | CONTRACT-003 — marketplace listings + collateral deposit/withdraw; **slashing spec draft, slash() halted** | `43224a4` |
| #12 | TEST-001 — Anchor TS tests for escrow/marketplace/collateral + halted-slash regression | `2553f11` |
| #13 | DEFER-LEGAL-001 — log PM directive deferring legal outreach | `f98cc61` |
| #14 | STATUS-001 — PROJECT_STATUS + v2-architecture + docs/sprint-0/README.md index | `b9587ca` |

Recovery: `19e597d` restored 11 grok_feedback.md entries lost during the original squash-merge sync (root cause documented in DOCS-003).

---

## Sprint 1 — Las Vegas pilot features (Session 2)

**Outcome**: 11 PRs merged. ~86 new vitest cases. 5 new mobile services, 4 new UI components, 1 new hook, full Tourist Mode + Safety flows.

| PR | Task | Squash SHA |
|---:|---|---|
| #15 | LV-001 — expand event-based matching scoring (distance/time/attendance/category factors, stacking, `computeMatchScore`) | `0b037c9` |
| #16 | LV-002 — Strip & Downtown hot zones (6 polygons, `pointInPolygon`, `ZoneIndicator`, textual `HotZoneMap` placeholder) | `0823e11` |
| #17 | LV-004 — Tourist Mode onboarding modal (EN/ES/ZH, `isLikelyTourist` heuristic, 7 destinations, 9-row tipping guide) | `6858663` |
| #18 | LV-005 — Night-mode theme + safety screen + safety state machine (active → late → sos sticky) | `c3bb767` |
| #19 | MOBILE-002 — wire LV-001/002/005 into marketplace; surge pill on home; SafeAreaView + Android padding | `cee15e4` |
| #20 | DOCS-002 — refresh `docs/las-vegas-technical-specs.md`, `docs/las-vegas-backlog.md`, `docs/architecture/mobile-platform-risks.md` | `9a4de1a` |
| #21 | MOBILE-003 — `useUserLocation` hook unifying user coords; `permissionStatusFrom` pure helper | `4583a01` |
| #22 | MOBILE-004 — `AssistantMatching` service + `MatchingEngine` interface (`COMPOUND_SURGE_CAP` introduced) | `81d07a9` |
| #23 | MOBILE-005 — tipping calculator + `VenueTag` union + `destinationsByTag()` | `2b6d66d` |
| #24 | MOBILE-006 — "Tonight in Vegas" home card (night-only, 24-hour tag filter, null-render on empty) | `c63d5e0` |
| #25 | DOCS-003 — `docs/sprint-1-2026-05-25.md` session summary + cross-cutting decisions recap | `4f50eef` |

---

## Sprint 2 — Blocker resolution + dispute scaffolding (Session 3)

**Outcome**: 9 PRs merged. ~47 new vitest cases. All 4 PM-approved native dependencies wired in. Dispute program now compiles.

| PR | Task | Squash SHA |
|---:|---|---|
| #26 | PKG-001 — pin all mobile + sdk versions (Expo SDK 51 matrix, Privy 0.40.0, web3.js 1.95.3, the 4 approved deps); add tsconfig, vitest.config, 4 native-module mocks; app.json location + background-fetch + Google Maps key placeholders | `3367aec` |
| #27 | CAP-001 — `COMPOUND_SURGE_CAP` 3.5× → **2.8×** (PM-ratified); document category-weight rationale | `1629aad` |
| #28 | MAP-001 — real `react-native-maps` MapView in `HotZoneMap` with Polygons + Markers + user-location + zone highlight + textual web fallback | `43ea249` |
| #29 | LOC-001 — real `expo-location` in `useUserLocation` (permission flow + `watchPositionAsync` + denied/restricted DEMO fallback) | `30fa04c` |
| #30 | STORE-001 — `expo-secure-store` for TouristPrefs + EmergencyContacts (MAX 3); pure parsers + `isValidPhone` | `d382427` |
| #31 | SAFETY-001 — `expo-task-manager` background tick for safety state machine; SOS sticky; persistence | `c10ba71` |
| #32 | TEST-001b — 4 e2e integration tests across surge cap / venue tags / safety bg loop | `16cdcd4` |
| #33 | MANAGE-001 — `/safety-contacts` CRUD UI (Add/Delete with inline phone validation; MAX 3) | `75e9c14` |
| #34 | DISPUTE-001 — fix the user's dispute program scaffolding so `anchor build` compiles; aligned with main's 2e3661d API (7 instructions); `resolve_dispute` HALTED inline with `HaltReason::SlashHaltedAdvF005` | `11dc8b9` |

---

## PM Decisions Ratified

- **Pilot city**: Las Vegas (primary).
- **Timeline**: 14–20 months (was 12–18; revised per ADV-001-v2 §C).
- **COMPOUND_SURGE_CAP**: 2.8×.
- **Dependencies approved**: `expo-location`, `expo-secure-store`, `expo-task-manager`, `react-native-maps`.
- **Tipping range**: 0–15%.
- **Category weights**: festival 1.0 / sports 0.85 / nightlife 0.8 / concert 0.75 / conference 0.5 — rationale in `docs/las-vegas-technical-specs.md`.
- **LEGAL-001 deferred** for the autonomous-session window (knock-on: LEGAL-002 also pauses).

## Security Halts (still in force)

| ID | Workstream | Status today |
|---|---|---|
| ADV-F-005 | Collateral *slashing* | `collateral.slash()` returns `SlashHalted` unconditionally; `dispute.resolve_dispute()` emits `HaltReason::SlashHaltedAdvF005`. Deposit/withdraw mechanics work. |
| ADV-F-006 | Token launch / `$ASSIST` yield | No `$ASSIST` code path added in any session. |
| ADV-F-007 | Insurance pool implementation | No implementation. Spec exists (Compliance Gate §7). |

## Resolved Blockers (Sprint 2)

- ✅ Mobile `package.json` version placeholders pinned (PKG-001).
- ✅ `react-native-maps` integrated, no longer text-only (MAP-001).
- ✅ `expo-location` wired (LOC-001).
- ✅ `expo-secure-store` wired for prefs + emergency contacts (STORE-001).
- ✅ `expo-task-manager` background safety tick (SAFETY-001).
- ✅ Compound-surge cap settled at 2.8× with regression tests (CAP-001).
- ✅ Emergency contacts CRUD UI (MANAGE-001).
- ✅ Dispute program compiles (DISPUTE-001).

## Deferred (next session candidates)

| ID | Item | Gate |
|---|---|---|
| DISPUTE-002 | Switchboard VRF + 85th-percentile jury selection | Independent; ready to start. |
| DISPUTE-003 | Quadratic vote tally implementation | Independent; ready to start. |
| DISPUTE-004 | Real `resolve_dispute` body (winner determination + slash CPI + reputation update + ban) | Blocked on ADV-F-005 lift. |
| MAP-002 | Real Google Maps API keys in `app.json` | Mobile Lead injects; placeholders today. |
| RENDER-001 | `@testing-library/react-native` for render-side tests | Dep approval. |
| HUMAN-001 | `npm install` + emulator smoke test by a human Mobile Lead | Human action. |
| DISPUTE-005 | Anchor TS tests for dispute happy path | Pairs with DISPUTE-002/003. |

## Cumulative test count

- Anchor TS tests (Sprint 0 TEST-001): 18 (escrow) + 11 (marketplace) + 7 (collateral incl. halted-slash regression) ≈ 36
- Mobile vitest (Sprint 1): 86 new
- Mobile vitest (Sprint 2): 47 new
- **Total**: ~169 test cases authored across the three sprints.

## Architecture artifacts

- `docs/adversarial/v2.1-review.md` + `v2.1-review-deep-dive.md`
- `docs/security/threat-model.md`
- `docs/legal/COMPLIANCE_GATE.md`
- `docs/alternatives/no-token-spec.md`
- `docs/architecture/v2-architecture.md`
- `docs/architecture/escrow-state-machine.md`
- `docs/architecture/slashing-spec.md` (DRAFT; halted)
- `docs/architecture/mobile-platform-risks.md`
- `docs/dispute-resolution-system.md` (user-authored)
- `docs/dispute-simulations.md` (user-authored)
- `docs/dispute-gamification-risks.md` (user-authored)
- `docs/dispute-ui-spec.md` (user-authored)
- `docs/las-vegas-backlog.md`, `docs/las-vegas-technical-specs.md`
- `docs/sprint-0/README.md`, `docs/sprint-0/LEGAL-001.md`
- `docs/sprint-1-2026-05-25.md`

## Process notes

- All AI-authored work goes through feature branches → squash-merge via the GitHub API. No direct main pushes.
- `grok_feedback.md` accumulates per-commit entries above each session summary. Conflict resolution rule: keep all entries chronologically.
- PAT is sourced from `~/.git-credentials`; `gh` CLI is unauthenticated locally.
- The cache at `mobile/test-mocks/` lets vitest run without a native React-Native runtime.

---

## Template (per-commit entry)

```markdown
## YYYY-MM-DD — <TASK-ID>

**Commit SHA**: <full sha>
**Date**: YYYY-MM-DD
**Agent**: <role>
**Task ID**: <TASK-ID>
**Changes Made**: <summary>
**Test Results**: <pass/fail/n-a>
**Deployment Status Update**: <branch / none / env>
**Issues / Blockers**: <list or None>
**Grok Feedback / Questions**: <numbered>
```
