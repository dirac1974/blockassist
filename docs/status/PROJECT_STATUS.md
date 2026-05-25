# BlockAssist Project Status (Living Document)

**Last update**: 2026-05-25 (after Sprint 2 — blocker resolution + dispute scaffolding).
**Current Phase**: Phase 0 complete. Sprint 1 (Las Vegas pilot features) complete. Sprint 2 (blocker resolution) complete. Phase 1 (core contracts + dispute build-out) in flight.
**Realistic Target**: Mainnet + 2 cities in **14–20 months** (revised per `docs/adversarial/v2.1-review-deep-dive.md` §C; was 12–18).
**Overall Progress**: **~35%** (was 15% post-Sprint-0; advanced materially by Sprint 1 LV features + Sprint 2 dependency resolution + dispute scaffolding).
**Honest Assessment**: All identified blockers from Sprints 0 + 1 are cleared. Mobile foundation is buildable (Expo SDK 51 pinned, native deps wired). Dispute program now compiles and aligns with the user's API surface. Major remaining risks: legal viability, slashing spec, jury selection primitive, real-world tests on emulators by a human Mobile Lead.

---

## Active Halts (from `docs/adversarial/v2.1-review.md`)

| ID | Workstream | Halt until | Status today |
|---|---|---|---|
| ADV-F-005 | Collateral *slashing* | Slashing spec finalized + Legal-reviewed | `collateral.slash()` returns `SlashHalted`; `dispute.resolve_dispute()` emits `HaltReason::SlashHaltedAdvF005` (DISPUTE-001). Deposit/withdraw work. |
| ADV-F-006 | Token launch / staker yield | LEGAL-002 securities opinion delivered | No `$ASSIST` code path added in any session. |
| ADV-F-007 | Insurance pool implementation | Legal vehicle + funding model specified | No implementation. |

## Active Deferrals

| Item | Effective | Re-entry |
|---|---|---|
| LEGAL-001 — engage crypto-specialist counsel | 2026-05-25 09:45 IST (PM directive) | PM lift, mainnet target commit, or token-decision trigger. See `docs/sprint-0/LEGAL-001.md`. |
| LEGAL-002 — securities opinion | Implied by LEGAL-001 deferral | When LEGAL-001 resumes. |

---

## Sprint 0 Status — COMPLETE

13 of 14 PRs merged. PR #1 (CLEANUP-001) closed as superseded. Full table in `docs/sprint-0/README.md`.

Headline artifacts:
- Adversarial review + STRIDE threat model + No-Token Alternative spec + Compliance Gate.
- 5 Anchor programs scaffolded; escrow + marketplace + collateral *deposit/withdraw* implemented.
- Mobile shell with Expo Router tabs, sign-in modal, order detail, create-listing.
- CI workflows for mobile/web/sdk + gitleaks + repo hygiene.

## Sprint 1 Status — COMPLETE

11 PRs merged (PRs #15–25). 86 new vitest cases.

Headline outcomes:
- **LV-001**: event-based matching scoring (distance/time/attendance/category factors, stacking, `computeMatchScore`).
- **LV-002**: 6 LV hot zones (Strip / Downtown / Fremont / Airport / Allegiant / Convention Center) with point-in-polygon + surge.
- **LV-004**: Tourist Mode onboarding modal (EN/ES/ZH), `isLikelyTourist` heuristic, 7 destinations, 9-row tipping guide.
- **LV-005**: night-mode theme + safety state machine (active → late → SOS sticky); foreground-only at the end of Sprint 1.
- **MOBILE-002..006**: surge pill on home, `useUserLocation` hook, `AssistantMatching` unified service + `MatchingEngine` interface, tipping calculator + `VenueTag`, "Tonight in Vegas" night-only home card.
- **DOCS-002 + DOCS-003**: refreshed LV technical specs + sprint-1 summary.

Full per-PR table in `grok_feedback.md`.

## Sprint 2 Status — COMPLETE

9 PRs merged (PRs #26–34). 47 new vitest cases. **All 4 PM-approved deps wired.** Total tests across three sprints ≈ **169**.

Headline outcomes:
- **PKG-001**: pin Expo SDK 51 matrix + Privy 0.40.0 + web3.js 1.95.3 + the 4 approved deps. Add `tsconfig.json`, `vitest.config.ts`, 4 in-tree native-module mocks. `app.json` gains location usage strings, background-fetch modes, Android `ACCESS_*_LOCATION` + `FOREGROUND_SERVICE` permissions, Google Maps API key placeholders.
- **CAP-001**: `COMPOUND_SURGE_CAP` lowered to **2.8×** (PM-ratified); rationale + category-weight rationale documented.
- **MAP-001**: real `react-native-maps` with `Polygon` per zone + `Marker` per centroid + user-location pin + inside-zone highlight. Textual web fallback preserved.
- **LOC-001**: real `expo-location` permission flow + `watchPositionAsync`; denied/restricted fall back to `DEMO_LOCATION`.
- **STORE-001**: `expo-secure-store` wrapper for TouristPrefs + EmergencyContacts (MAX 3); pure parsers + `isValidPhone`.
- **SAFETY-001**: `expo-task-manager` background tick reading persisted session; SOS sticky. Soft escalation only.
- **TEST-001b**: 4 e2e integration tests (surge cap, venue tags, safety bg loop).
- **MANAGE-001**: `/safety-contacts` CRUD UI replacing the placeholder Alert in safety screen.
- **DISPUTE-001**: fixed the dispute program scaffolding so `anchor build` compiles. Aligned with main's `2e3661d` API (7 instructions). `resolve_dispute` HALTED inline with `HaltReason::SlashHaltedAdvF005`. Follow-ups DISPUTE-002 (VRF jury), DISPUTE-003 (quadratic voting), DISPUTE-004 (real resolve) deferred.

## Resolved Blockers (since Sprint 1 close)

- ✅ Mobile `package.json` placeholders (`^0.XX.X` → real pins).
- ✅ `react-native-maps` integration replaces the textual placeholder.
- ✅ `expo-location` wired into `useUserLocation`.
- ✅ `expo-secure-store` wired (TouristPrefs + EmergencyContacts).
- ✅ `expo-task-manager` background safety tick.
- ✅ Compound-surge cap settled at 2.8× with regression tests.
- ✅ Emergency contacts CRUD UI live.
- ✅ Dispute program compiles in Anchor.

---

## Key Decisions Log (extract; full log in `docs/decisions/DECISIONS.md`)

| Date | Decision | Approved By |
|------|----------|-------------|
| 2026-05-25 | Remove "locked / no rework" policy | Grok + Adversarial Reviewer |
| 2026-05-25 | Legal & Compliance Lead + hard Compliance Gate | Grok |
| 2026-05-25 | USDC-denominated collateral | Grok + Legal |
| 2026-05-25 | Drop Pinocchio as Phase 0 mandate; Anchor primary | Lead SC Engineer |
| 2026-05-25 | Solana-native dispute (cross-chain Kleros experimental only) | Grok + Security |
| 2026-05-25 | Adversarial Reviewer role with halt authority | Grok |
| 2026-05-25 | ADV-001 halt items: collateral slashing, token launch, insurance pool | PM |
| 2026-05-25 | LEGAL-001 deferred for the autonomous-session window | PM |
| 2026-05-25 | Las Vegas as primary pilot city | PM |
| 2026-05-25 | Timeline 14–20 months | PM |
| 2026-05-25 | COMPOUND_SURGE_CAP = 2.8× | PM |
| 2026-05-25 | Dependencies approved: expo-location, expo-secure-store, expo-task-manager, react-native-maps | PM |
| 2026-05-25 | Tipping range 0–15% | PM |
| 2026-05-25 | Category weights (festival 1.0 → conference 0.5) | PM |

---

## Open High-Risk Items

1. Final securities opinion on fee-funded `$ASSIST` yield — paused with LEGAL-001.
2. Insurance pool backstop model — halt in force; legal vehicle unselected.
3. Sybil resistance for reputation-weighted yield — ADV-F-009 / ADV-D-001 / CC-7. No primitive chosen.
4. On-chain Solana jury primitive — Switchboard VRF is the current plan (DISPUTE-002); not yet wired.
5. Named human Adversarial Reviewer — ADV-F-013 still unfilled.
6. Real Google Maps API keys — placeholder strings in `app.json` (PKG-001 / MAP-001).
7. Human Mobile Lead `npm install` + emulator smoke test — DISPUTE/LV work is logically complete but unverified on a real device.

## Open Questions (top picks for PM to clear)

1. Approve DISPUTE-002 (Switchboard VRF jury) as the next contracts work item.
2. Confirm DISPUTE-003 quadratic-voting parameters (vote weight curve, max weight per juror).
3. DISPUTE-004 will land **after** ADV-F-005 lifts — confirm that ordering.
4. Inject real Google Maps API keys into `app.json` so tiles render on emulators.
5. Approve `@testing-library/react-native` so render-side tests can land.
6. Schedule a Mobile-Lead `npm install` + emulator smoke session.

---

## Next Milestone

**Phase 1 — Core contracts + dispute build-out**. Targets:
- DISPUTE-002 (VRF jury) + DISPUTE-003 (quadratic voting) implementations.
- Anchor TS tests for the dispute happy path (DISPUTE-005).
- Real device validation pass on iOS + Android.

Phase 0 closure was rolled to 2026-07 originally (LEGAL-001 deferral). With Sprints 1 + 2 complete, the foundation milestones are met; only legal-gated items remain on the Phase 0 list (DISPUTE-004 final body waits on ADV-F-005, mainnet waits on the Compliance Gate).

---

## Cross-references

- `CLAUDE.md` — guardrails.
- `docs/adversarial/v2.1-review.md` + `v2.1-review-deep-dive.md` — findings + halts + attack scenarios.
- `docs/security/threat-model.md` — STRIDE + mitigation backlog.
- `docs/legal/COMPLIANCE_GATE.md` — milestone-gated legal checklist.
- `docs/alternatives/no-token-spec.md` — parallel-track spec.
- `docs/architecture/v2-architecture.md` — high-level architecture + dispute phased plan.
- `docs/architecture/escrow-state-machine.md` — CONTRACT-002 design.
- `docs/architecture/slashing-spec.md` — DRAFT; halt remains in force.
- `docs/architecture/mobile-platform-risks.md` — iOS/Android runbooks.
- `docs/dispute-resolution-system.md` + `docs/dispute-simulations.md` + `docs/dispute-gamification-risks.md` + `docs/dispute-ui-spec.md` — dispute spec.
- `docs/las-vegas-backlog.md` + `docs/las-vegas-technical-specs.md` — LV pilot.
- `docs/sprint-0/README.md` + `docs/sprint-1-2026-05-25.md` — sprint indexes.
- `grok_feedback.md` — canonical per-commit log.
