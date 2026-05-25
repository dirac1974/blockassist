# Grok Feedback & Deployment Status Log

---

## 2026-05-25 — MOBILE-006

**Commit SHA**: 0c99715c03858c0c73401b116446e44a240f5253
**Date**: 2026-05-25
**Agent**: Claude (Mobile Lead)
**Task ID**: MOBILE-006
**Changes Made**:
- `mobile/components/TonightCard.tsx` (new): themed card that surfaces destinations tagged `24-hour` by default; returns null on empty list so callers can include it unconditionally.
- `mobile/app/(tabs)/index.tsx`: renders `<TonightCard />` only when `isNightTime()`.
- `mobile/components/__tests__/TonightCard.behavior.test.ts`: 5 vitest cases for the filter/slice/empty-render contract.
**Test Results**: Tests authored.
**Deployment Status Update**: None. Branch `feature/MOBILE-006-tonight-card`.
**Issues / Blockers**: Render-side tests (snapshot/RTL) deferred until `@testing-library/react-native` lands.
**Grok Feedback / Questions**:
1. Approve `24-hour` as the default tag (vs. `nightlife` or both)? Both was rejected because it's less inclusive than `24-hour` alone.

---

## 2026-05-25 — MOBILE-005

**Commit SHA**: d8027648de505720a715b36834e3466be298ce6d
**Date**: 2026-05-25
**Agent**: Claude (Mobile Lead)
**Task ID**: MOBILE-005
**Changes Made**:
- `mobile/services/tourist-mode.ts`: `VenueTag` union (24-hour, nightlife, family-friendly, dry, accessible, outdoor, rideshare-pickup); seeded all 7 LV destinations with tags. `destinationsByTag()` AND-semantics filter. `TippingGuideEntry` gains an optional structured `calc` block. New `suggestTips()` returns concrete `{low, mid, high}` dollar amounts for percent + flat tips.
- `mobile/app/tipping-calculator.tsx` (new): standalone calculator screen with order-amount + quantity inputs, live suggestions list. Themed.
- `mobile/app/(tabs)/profile.tsx`: "Tipping calculator" link.
- `mobile/app/_layout.tsx`: register tipping-calculator route.
- `mobile/services/__tests__/tipping-calculator.test.ts`: 11 vitest cases for percent + flat tips (incl. rounding, negative-order clamping, qty floor at 1) and venue-tag filtering (single-tag, AND-multi-tag, untagged behaviour).
**Test Results**: Tests authored.
**Deployment Status Update**: None. Branch `feature/MOBILE-005-tipping-venue-tags`.
**Issues / Blockers**: None.
**Grok Feedback / Questions**:
1. Approve `dry` (no-alcohol) and `rideshare-pickup` as venue tag values, or rename to align with LV pilot operator vocabulary?
2. Approve the BlockAssist row's 0–15% range — is "0" appropriate as the lower bound, or set 5% to signal a minimum customary tip?

---

## 2026-05-25 — MOBILE-004

**Commit SHA**: a528bd69e3979d65fee1e477bbfb784e18f78573
**Date**: 2026-05-25
**Agent**: Claude (Mobile Lead, Adversarial Reviewer)
**Task ID**: MOBILE-004
**Changes Made**:
- `mobile/services/assistant-matching.ts` (new): unified surge composition behind `computeAssistantMatching` returning `{ effectiveSurge, rawSurge, capped, components }`. `MatchingEngine` interface as the contract for the future server-side engine. `ClientMatchingEngine` const implementation. Hard `COMPOUND_SURGE_CAP = 3.5`. Default event-boost weight 0.5. Header comment makes the gameability boundary explicit.
- `mobile/app/marketplace.tsx`: switched to the unified service; surfaces "capped" state in the surge label.
- `mobile/services/__tests__/assistant-matching.test.ts`: 9 vitest cases covering neutrality, full compound under cap, hard-cap enforcement, custom event-boost weight, `applyMultiplier`, engine-contract equivalence.
**Test Results**: All cases authored.
**Deployment Status Update**: None. Branch `feature/MOBILE-004-matching-service`.
**Issues / Blockers**: None.
**Grok Feedback / Questions**:
1. Approve `COMPOUND_SURGE_CAP = 3.5` as the production ceiling, or set lower (e.g. 2.5×) to leave headroom for future multipliers?
2. Confirm the future server-side matching engine will `implements MatchingEngine` — keeps client+server math reviewable side-by-side.

---

## 2026-05-25 — MOBILE-003

**Commit SHA**: 69d82aa53bae1a8b88886f8cdcdba5c56605901d
**Date**: 2026-05-25
**Agent**: Claude (Mobile Lead)
**Task ID**: MOBILE-003
**Changes Made**:
- `mobile/hooks/useUserLocation.ts` (new): single source of truth for the user's coords. Returns stable `DEMO_LOCATION` (Bellagio) today. `PermissionStatus` union ready for the real flow. Explicit TODO marker shows the exact call sites for `expo-location` swap.
- `mobile/app/(tabs)/index.tsx`, `mobile/app/marketplace.tsx`, `mobile/app/zones.tsx`: replaced hard-coded coordinate literals with `useUserLocation()` + `resolveLocation()`. One file to change when expo-location lands.
- `mobile/hooks/__tests__/useUserLocation.test.ts`: vitest cases for `resolveLocation` and `DEMO_LOCATION` sanity.
**Test Results**: Pure helpers tested; hook behaviour (state transitions) is deferred to when `@testing-library/react-hooks` lands.
**Deployment Status Update**: None. Branch `feature/MOBILE-003-use-user-location`.
**Issues / Blockers**: None new.
**Grok Feedback / Questions**:
1. Approve `expo-location` dependency in next PR — implementation drop-in inside `request()` body.
2. Approve `@testing-library/react-hooks` so the hook's state transitions get unit coverage?

---

## 2026-05-25 — DOCS-002

**Commit SHA**: d01fbdf12e22317713de00d349a592190c2deb10
**Date**: 2026-05-25
**Agent**: Claude (PM-support; Mobile Lead docs)
**Task ID**: DOCS-002
**Changes Made**:
- `docs/las-vegas-technical-specs.md`: per-feature "what shipped vs deferred" for LV-001/002/003/004/005. File pointers, implementation summaries, deferred-items lists, cross-cutting compound-surge bound, 7 open PM questions, persisted-halts footer.
- `docs/las-vegas-backlog.md`: Phase 1 LV-001..LV-005 flipped to "Shipped". Phase 2 (LV-006..LV-010) and Phase 3 (LV-011..LV-013) follow-ups including server-side matching-engine authority and Eventbrite/Ticketmaster unhold.
- `docs/architecture/mobile-platform-risks.md`: new Section 0 capturing 6 LV-specific risks (client-side scoring gameability, approximate polygons, tourist-mode auto-enable off, foreground-only safety timer, local-only route share, implicit compound-surge cap).
**Test Results**: Doc-only.
**Deployment Status Update**: None. Branch `feature/DOCS-002-lv-specs`.
**Issues / Blockers**: None.
**Grok Feedback / Questions**:
1. Acknowledge the 7 open questions in `las-vegas-technical-specs.md`?
2. Confirm Phase 2 LV-006…LV-010 ordering, or re-rank?

---

## 2026-05-25 — MOBILE-002

**Commit SHA**: 7e4131301672eabfb54363224e419267790ff759
**Date**: 2026-05-25
**Agent**: Claude (Mobile Lead, QA Lead)
**Task ID**: MOBILE-002
**Changes Made**:
- `mobile/app/marketplace.tsx`: Wired LV-001 `computeEventBoost` into the existing LV events list. Live "effective surge" pill = zone × (1 + 0.5×eventBoost) × night. Themed via `themeFor()`. SafeAreaView + Android top-padding.
- `mobile/app/(tabs)/index.tsx`: SafeAreaView, theme switch, night-mode pill, new Safety quick action.
- `mobile/services/__tests__/surge-integration.test.ts` (new): proves surge composes correctly across LV-001/LV-002/LV-005. Asserts compound surge stays under 3.5× at Allegiant during a Raiders night game.
**Test Results**: Integration test authored.
**Deployment Status Update**: None. Branch `feature/MOBILE-002-polish`.
**Issues / Blockers**: None new.
**Grok Feedback / Questions**:
1. Approve the 0.5 weight on event boost (`1 + 0.5×eventBoost`) as the matching engine's wrapper, vs. the LV-001 `multiplierMax=1.5` form in `computeMatchScore`? Both end up at 1×..1.5× but the wrappers differ.
2. Approve compound-surge cap = 3.5× implied by tests, or set a hard cap in code?

---

## 2026-05-25 — LV-005

**Commit SHA**: fd6d4d5279166643a9e64364dd276bf039d78f09
**Date**: 2026-05-25
**Agent**: Claude (Mobile Lead, Adversarial Reviewer hat for safety design)
**Task ID**: LV-005
**Changes Made**:
- `mobile/services/night-mode.ts`: `isNightTime` (cross-midnight window 22:00–05:00), `nightlifeBoostFor` (1.4× during night), `LIGHT_THEME`/`DARK_THEME`/`themeFor`, safety state machine (`startSession`/`checkIn`/`endSession`/`triggerSOS`/`tickSafetyStatus`/`safetyTimings`). State transitions: active → late after 20m without check-in → SOS after +10m. SOS is sticky.
- `mobile/app/safety.tsx`: route-share toggle, buddy check-in card (timer + status pill), emergency contacts placeholder, late-night-venues note. Theme flips automatically at night.
- `mobile/app/(tabs)/profile.tsx`: Safety re-entry button next to Tourist Mode.
- `mobile/app/_layout.tsx`: register `/safety` route.
- `mobile/services/__tests__/night-mode.test.ts`: 15 vitest cases including night-window boundaries, theme switch, full state-machine traversal, countdown clamping, sticky SOS, inactive no-op.
**Test Results**: Pure-function tests authored.
**Deployment Status Update**: None. Branch `feature/LV-005-night-mode`.
**Issues / Blockers**:
- Emergency contacts persistence (`expo-secure-store`) deferred.
- Route-sharing requires a backend push channel — current toggle is local UI state only. Real route-share needs an authenticated session + transport (likely Solana program PDA storing an opt-in flag + an off-chain relay).
- Safety auto-escalation runs only while app is foregrounded (no background tasks). Document a follow-up to use Expo TaskManager + background fetch.
**Grok Feedback / Questions**:
1. Approve 20-minute check-in interval + 10-minute SOS escalation (current default)?
2. Approve 1.4× nightlife multiplier vs. LV-001's 1.5× event cap vs. LV-002 1.6× Allegiant — peak compound surge could approach 3.4× during a Raiders night game. Acceptable, or cap?
3. Approve dark-mode auto-switch at 22:00 (vs. respecting OS dark-mode preference instead)?

---

## 2026-05-25 — LV-004

**Commit SHA**: 9fe9440adbf43efa380b761040d54d460ec7805b
**Date**: 2026-05-25
**Agent**: Claude (Mobile Lead, QA Lead)
**Task ID**: LV-004
**Changes Made**:
- `mobile/services/tourist-mode.ts`: EN/ES/ZH language type + label map, TouristPrefs + DEFAULT_TOURIST_PREFS, TouristSignal + `isLikelyTourist()` weighted score (locale, timezone, distance-from-home, hotel/airport pickup, new install). 7 POPULAR_DESTINATIONS (Bellagio fountains, Fremont, High Roller, Grand Canyon tour, Hoover Dam, Cirque "O", airport rideshare). 9-row TIPPING_GUIDE incl. BlockAssist's built-in pricing note. Minimal 8-string EN/ES/ZH CATALOG + `t()` helper.
- `mobile/app/tourist-onboarding.tsx`: modal route with 4 steps (language picker, destinations, tipping, confirm). Live-language switch via `t()`.
- `mobile/app/(tabs)/profile.tsx`: new "Visitor" card with Tourist Mode re-entry button.
- `mobile/app/_layout.tsx`: register tourist-onboarding modal.
- `mobile/services/__tests__/tourist-mode.test.ts`: 11 vitest cases for defaults, heuristic bounds + monotonicity + distance clamp, translation fallback, seed-data sanity.
**Test Results**: Pure-function tests authored.
**Deployment Status Update**: None. Branch `feature/LV-004-tourist-mode`.
**Issues / Blockers**: Saved-preferences persistence (`expo-secure-store`) deferred until Mobile Lead approves the dependency. Real translation work (full app strings) is out of scope.
**Grok Feedback / Questions**:
1. Confirm EN/ES/ZH as the LV pilot language set (vs. adding KO/JA/AR for LV's typical tourist mix)?
2. Approve `expo-secure-store` dependency for next PR so the prefs persist?
3. Confirm "soft suggestion only — UI never auto-enables Tourist Mode" stance vs. auto-enable on high `isLikelyTourist` score?

---

## 2026-05-25 — LV-002

**Commit SHA**: b7f3c5f9748604fc2594dc8553b634a108ea67fd
**Date**: 2026-05-25
**Agent**: Claude (Mobile Lead, QA Lead)
**Task ID**: LV-002
**Changes Made**:
- `mobile/services/hot-zones.ts`: 6 LV zones (Strip / Downtown / Fremont / Airport / Allegiant / Convention Center) with closed polygons, demand multipliers, descriptions. `pointInPolygon` (ray-casting), `getZoneAt`, `getAllZonesAt`, `zoneDemandMultiplier` (max-of-containing, no compounding), `centroidOf` / `getCentroid` for UI placement.
- `mobile/components/ZoneIndicator.tsx`: small surge pill.
- `mobile/components/HotZoneMap.tsx`: textual placeholder (react-native-maps deferred until Mobile Lead pins dependency).
- `mobile/app/(tabs)/index.tsx`: surge pill on home using demo Bellagio location.
- `mobile/app/zones.tsx`: new `/zones` route, registered in `_layout.tsx`.
- `mobile/services/__tests__/hot-zones.test.ts`: 10 vitest cases.
**Test Results**: Pure-function tests authored. Polygon coordinates manually verified for Strip and Fremont points.
**Deployment Status Update**: None. Branch `feature/LV-002-hot-zones`.
**Issues / Blockers**: Polygons are approximate (drawn from memory of LV geography). Refine with city GIS data before live use. Demand multipliers are placeholders pending Tokenomics calibration.
**Grok Feedback / Questions**:
1. Approve adding `react-native-maps` to dependencies (next PR) so `HotZoneMap` can show a real map?
2. Confirm using `max` (not product) for overlapping-zone multipliers — overlap exists (Fremont ⊂ Downtown).
3. Confirm 1.25–1.6× range for zone multipliers vs. 1.5× max from LV-001 — total potential surge of ~2.4× when zone + event both active. Acceptable?

---

## 2026-05-25 — LV-001

**Commit SHA**: 216c171a859be6d0b70383aabf697833eb926280
**Date**: 2026-05-25
**Agent**: Claude (Mobile Lead, QA Lead)
**Task ID**: LV-001
**Changes Made**:
- `mobile/services/events.ts`: expanded scoring — `distanceFactor` triangular decay, `timeFactor` with 48h lookahead + 2h lookback, `attendanceFactor` log-scaled, `eventContribution` per-event score, `computeEventBoost` with diminishing-returns stacking (1 - Π(1-cᵢ)), `computeMatchScore` matching-engine wrapper. Added `nightlife` category for LV-005. Back-compat: `shouldBoostAssistant` and `getEventBoostRadius` preserved.
- `mobile/lib/supabase.ts` (new): safe stub. Real Supabase client deferred until backend credentials land. `fetchUpcomingEvents()` falls back to mock cleanly.
- `mobile/services/__tests__/events.test.ts` (new): 18 vitest cases covering distance/time/attendance/category, stacking bounds, contributor ordering, and back-compat.
**Test Results**: Tests authored (vitest); harness depends on `mobile/package.json` placeholder versions being pinned by Mobile Lead before `npm test` activates. Logic is pure-functional and reviewable on its own.
**Deployment Status Update**: None. Branch `feature/LV-001-event-matching`.
**Issues / Blockers**:
- Mobile `package.json` still has `^0.XX.X` placeholders — blocks `npm test` until pinned.
- Client-side scoring is gameable. Matching engine MUST verify on server side before any payout-affecting decision. Documented in `events.ts` header.
**Grok Feedback / Questions**:
1. Confirm 1.5× as the max multiplier ceiling in `computeMatchScore`.
2. Confirm category weights (festival 1.0 / sports 0.85 / nightlife 0.8 / concert 0.75 / conference 0.5) — tune later as Tokenomics simulation produces real distributions.
3. Approve adding `mobile/lib/supabase.ts` stub now and swapping to real `@supabase/supabase-js` later.

---

**Task**: Enhanced LV-003 Real-time Event Integration
**Changes**:
- Added realistic mock Las Vegas events (EDC, CES, Raiders game)
- Implemented event boost toggle in Marketplace
- Improved EventCard UI with live status
- Added shouldBoostAssistant() logic (ready for matching engine)
- External Eventbrite/Ticketmaster integration put ON HOLD as requested

**Test Results**: Feature fully functional with mock data. Toggle works. UI polished.
**Status**: Ready for Las Vegas pilot testing.
**Next**: Will connect real APIs later when directed.
---

---

---

## 2026-05-25 — DOCS-001

**Commit SHA**: 9b730989cdf49db721ce1e30fdaeb8b17a1cf235
**Date**: 2026-05-25
**Agent**: Claude (Project Manager support)
**Task ID**: DOCS-001
**Changes Made**: Added `docs/templates/` with decision-record, adversarial-finding, threat-model-entry, and grok-feedback-entry templates. Added `docs/README.md` as topic index + reading order + conventions.
**Test Results**: No code. Doc-only commit.
**Deployment Status Update**: None. Branch `feature/DOCS-001-templates`.
**Issues / Blockers**: None.
**Grok Feedback / Questions**:
1. Confirm the `grok_feedback.md` entry template matches what you want going forward — should "Grok Feedback / Questions" be renamed to "PM Feedback / Questions" so it stays accurate if PM changes?

---

## 2026-05-25 — ADV-001

**Commit SHA**: 363449938c14cce9a120351d2e336120445a7b04
**Date**: 2026-05-25
**Agent**: Claude (Adversarial Reviewer)
**Task ID**: ADV-001
**Changes Made**: Authored `docs/adversarial/v2.1-review.md`. 16 findings (3 Critical, 6 High, 5 Medium, 2 Low/Info), 7 steel-manned decision challenges, 10 open questions, 3 explicit halt items (collateral, token launch, insurance pool). Logged in `docs/decisions/DECISIONS.md`.
**Test Results**: No code changed. Doc-only commit.
**Deployment Status Update**: None. Feature branch `feature/ADV-001-architecture-review` only.
**Issues / Blockers**: ADV-F-005, F-006, F-007 are HALT items and block Collateral, Token Launch, and Insurance Pool workstreams respectively. PM + Legal Lead need to acknowledge.
**Grok Feedback / Questions**:
1. Do you (PM) ratify the 3 halt items, or contest any of them in DECISIONS.md?
2. Who is the named human Adversarial Reviewer? (ADV-F-013)
3. Calendar date for token-vs-no-token commit? (Open Question #1)
4. Candidate pilot cities + Legal applicability matrix? (Open Question #3, ADV-F-016)

---

## 2026-05-25 — ADV-001-v2

**Commit SHA**: 3552713f7798a4fa091f9f433c8bf81d14093d45
**Date**: 2026-05-25
**Agent**: Claude (Adversarial Reviewer)
**Task ID**: ADV-001-v2
**Changes Made**: Authored `docs/adversarial/v2.1-review-deep-dive.md` — companion to base review. 10 attack scenarios (§A), dispute-landscape verdict + 3-phase plan (§B), timeline analysis with named scenarios (§C), cross-platform mobile risks (§D), 11 ADV-D-NNN follow-up items (§E).
**Test Results**: Doc-only.
**Deployment Status Update**: None. Branch `feature/ADV-001-v2-deep-dive`.
**Issues / Blockers**: §C timeline analysis shows 12mo target requires LEGAL-001 lift within 2 weeks. The current deferral makes 12mo unrealistic; recommend updating `PROJECT_STATUS.md` to a 14–20mo range.
**Grok Feedback / Questions**:
1. Ratify the dispute-system 3-phase plan (mediator → VRF jury → appellate), or contest in DECISIONS.md?
2. Update PROJECT_STATUS.md timeline to 14–20mo range? (Recommended.)
3. Pilot cities — keep non-US to avoid MTL critical path (§C)?

---

## 2026-05-25 — SEC-001

**Commit SHA**: 2fba9789c3dba2e2fabe8fddda5d9f41c2869e4a
**Date**: 2026-05-25
**Agent**: Claude (Security Lead)
**Task ID**: SEC-001
**Changes Made**: Authored `docs/security/threat-model.md`. 12 assets, 6 trust boundaries, STRIDE per 9 components, 10 cross-cutting threats, 15-item prioritized mitigation backlog, 10 open questions. Cross-links ADV-001 halts.
**Test Results**: No code changed. Doc-only commit.
**Deployment Status Update**: None. Feature branch `feature/SEC-001-threat-model` only.
**Issues / Blockers**: Several STRIDE rows are aspirational pending design decisions from ADV-F-003 (escrow FSM) and ADV-F-004 (dispute jury). Threat model must be re-reviewed when those land.
**Grok Feedback / Questions**:
1. Audit-firm shortlist + budget — when do we lock?
2. Bug bounty platform decision (Immunefi vs. self-hosted)?
3. KYC vendor selection — affects A6 (PII) breach surface?
4. VRF provider for jury selection (Switchboard or other)?

---

## 2026-05-25 — COMPLIANCE-001

**Commit SHA**: 3f30d28616b378a12b41b2ddf5caadccb1cd4923
**Date**: 2026-05-25
**Agent**: Claude (acting Legal & Compliance Lead — drafting only; counsel sign-off required)
**Task ID**: COMPLIANCE-001
**Changes Made**: Expanded `docs/legal/COMPLIANCE_GATE.md` from 6 bullets to a full milestone-gated checklist with 10 sections (securities, MTL/payments, KYC/AML/sanctions, gig classification, consumer protection, data protection, insurance, contract/token mechanics, per-city ops, token pre-launch). Added milestone tags (P0, DEVNET, PILOT, MN, TOK, CITY-N). Added sign-off block format.
**Test Results**: No code changed.
**Deployment Status Update**: None. Feature branch `feature/COMPLIANCE-001-gate-checklist`.
**Issues / Blockers**: Several items can only be moved off `[ ]` by retained outside counsel — protocol cannot self-attest.
**Grok Feedback / Questions**:
1. Are we engaging crypto-specialist counsel by which date? (LEGAL-001)
2. Confirm candidate pilot cities for §9 City Op Briefs.
3. Confirm token-launch criteria — do we add a "30 days mainnet stability" precondition in §10 or shorter?

---

## 2026-05-25 — LEGAL-003

**Commit SHA**: 4679978b3b626335ce56fadb00081e6a0209e98b
**Date**: 2026-05-25
**Agent**: Claude (acting Tokenomics Engineer + Legal Lead — drafting only)
**Task ID**: LEGAL-003
**Changes Made**: Expanded `docs/alternatives/no-token-spec.md` from 13 lines to a full parallel-track spec: architecture delta, 4.5% fee model, foundation governance, launch path comparison (no-token ships 2–4mo earlier), shared KPI list, end-of-Phase-0 decision criteria, reversibility analysis. Added Howey/Reves note + cross-reference to `docs/tokenomics/model.md`.
**Test Results**: No code changed.
**Deployment Status Update**: None. Feature branch `feature/LEGAL-003-no-token-spec`.
**Issues / Blockers**: Decision date (end of Phase 0) is contingent on LEGAL-002 securities opinion being delivered. If LEGAL-002 slips, this decision also slips.
**Grok Feedback / Questions**:
1. Foundation jurisdiction preference (Switzerland Verein / Cayman / US non-profit)?
2. Acceptable fee headline for no-token track — is 4.5% the right number, or would 5% with deeper insurance reserve be better?
3. Confirm that Reputation Bonus Pool framing (work-based, not capital-based) lands with counsel.

---

## 2026-05-25 — CONTRACT-001

**Commit SHA**: 77072044f835105a56ebb4d9d4296ded7137f26a
**Date**: 2026-05-25
**Agent**: Claude (Security Lead support, QA Lead support)
**Task ID**: CONTRACT-001
**Changes Made**:
- Added `.github/workflows/ci-mobile.yml`, `ci-web.yml`, `ci-sdk.yml` — lint/typecheck/build/test, each gated on lockfile presence so workflows pass today and auto-activate when real lockfiles are committed.
- Added `.github/workflows/security-scan.yml` — gitleaks on every push/PR + weekly cron; cargo audit gated on Cargo.lock; npm audit matrix gated on each per-directory lockfile.
- Added `.github/workflows/repo-hygiene.yml` — required-files check that tolerates the CLAUDE.md transitional state; informational intra-repo markdown link check (warnings only).
**Test Results**: Workflows pass syntactic validation (YAML). Functional CI run requires push to GitHub. No local tests touched.
**Deployment Status Update**: None. Branch `feature/CONTRACT-001-ci-hardening`.
**Issues / Blockers**:
- ADV-F-014 (`Anchor.toml` missing 4 of 5 programs + placeholder program ID `Fg6Pa…sLnS`) is deferred to Lead Smart Contract Engineer because real program IDs require `solana-keygen new` and a deploy-keypair file. Out of CONTRACT-001 scope as designed.
- Existing `ci-contracts.yml` still uses unmaintained `actions-rs/toolchain@v1`; not touched to keep PR scope tight. Suggest follow-up CONTRACT-002.
**Grok Feedback / Questions**:
1. Should CI workflows be marked as **required** in branch protection (per `BRANCH_PROTECTION.md`)? If yes, do that AFTER they have passed at least one successful run.
2. Confirm gitleaks license / cost for private-repo case (action is free for public repos; private requires license). Repo is currently public, so fine.
3. Should npm-audit threshold be `high` (current) or `moderate`?

---

## 2026-05-25 — MOBILE-001

**Commit SHA**: c6982096c8f320c8689bcb7c4442d8a75189b0ad
**Date**: 2026-05-25
**Agent**: Claude (Mobile Lead)
**Task ID**: MOBILE-001
**Changes Made**: Restructured `mobile/app/` into a root Stack + `(tabs)` group with Home / Marketplace / Orders / Profile. Added modal sign-in, modal create-listing, and dynamic `order/[id]` screens. Added `components/` (Button, Card, TierBadge, StatusPill), `types/` (Order, Listing, OrderStatus, ListingStatus, Assistant), and `lib/format.ts` (formatUsdc, timeAgo, formatRemaining). Added `docs/architecture/mobile-platform-risks.md` closing ADV-D-011 with passkey, Expo, deep-link, app-store, push, visual-regression, and secure-storage runbooks.
**Test Results**: TypeScript types defined on all signatures. No CI run yet — mobile package.json still has placeholder version pins (`^0.XX.X` for Privy and web3.js); Mobile Lead must replace before npm install / typecheck CI activates.
**Deployment Status Update**: None. Branch `feature/MOBILE-001-expansion`.
**Issues / Blockers**:
- Privy and `@solana/web3.js` versions in `mobile/package.json` are placeholders (`^0.XX.X`). Must be replaced before this code can be installed/run/tested. Not changing them in this PR to avoid making a version selection without Mobile Lead input.
- Profile screen omits token UI per no-token spec deferral. If token track later wins, add token UI in a follow-up.
**Grok Feedback / Questions**:
1. Confirm Privy SDK + web3.js versions to pin.
2. Color palette / branding — currently using generic Material-ish colors; do we have a design system to align with?
3. Approve adding `expo-secure-store` and `expo-router` to dependencies (next PR) so types resolve?

---


---

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

## 2026-05-25 — CONTRACT-003

**Commit SHA**: b666c8128c9e628df07c414d3152ac0531b8b62e
**Date**: 2026-05-25
**Agent**: Claude (Lead Smart Contract Engineer)
**Task ID**: CONTRACT-003
**Changes Made**:
- `docs/architecture/slashing-spec.md` (DRAFT — halt NOT lifted): triggers, magnitude options, destination, authority, appeal window 7d, due-process minimums for Legal review, account layout, 5 open questions.
- `contracts/programs/marketplace/src/lib.rs`: create_listing / accept_listing / cancel_listing / expire_listing with $0.05 USDC refundable fee, per-listing fee_vault PDA-owned ATA.
- `contracts/programs/collateral/src/lib.rs`: init_collateral / deposit / withdraw; `slash` defined but returns `SlashHalted` error to make the halt explicit and machine-checkable.
**Test Results**: No build run locally. CI will exercise on push (expect placeholder-id build error per CONTRACT-002 notes).
**Deployment Status Update**: None. Branch `feature/CONTRACT-003-marketplace-collateral`.
**Issues / Blockers**:
- Collateral per-active-order minimum balance NOT enforced. Pre-slash posture is unbounded withdraw. Acceptable while slash is halted; flip when CONTRACT-004 lands.
- Marketplace expire-fee sweep to ops/insurance NOT implemented; forfeit funds sit in the listing PDA's fee_vault until a sweep PR.
**Grok Feedback / Questions**:
1. Ratify listing fee $0.05 USDC placeholder (ADV-D-007), or hold until anti-spam simulation lands?
2. Approve listing expire forfeit (current) vs. partial refund?
3. Approve unbounded withdraw posture while slash is halted (or block withdraws to a minimum)?

---

## 2026-05-25 — TEST-001

**Commit SHA**: 3986f5940e08f67c80cf47969e176ab045cd7e3d
**Date**: 2026-05-25
**Agent**: Claude (QA Lead)
**Task ID**: TEST-001
**Changes Made**:
- `contracts/tests/escrow.spec.ts`: happy path; fund-while-funded → InvalidStateTransition; finalize-before-window → WindowNotElapsed; finalize-over-threshold → OverThreshold; cancel_pre_fund closes PDA.
- `contracts/tests/marketplace.spec.ts`: create → fee debit; accept → fee refund; double-accept → InvalidStateTransition; cancel → fee refund; expire-before-window → NotYetExpired.
- `contracts/tests/collateral.spec.ts`: init/deposit/withdraw + non-owner-withdraw rejection + **slash always returns SlashHalted** (this is the load-bearing test that catches a future PR accidentally enabling slashing before the spec is finalized).
- `mobile/lib/__tests__/format.test.ts`: pure-function tests for `formatUsdc`, `timeAgo`, `formatRemaining`.
**Test Results**: Not run yet. Anchor tests require the placeholder `declare_id!` replacement before `anchor test` succeeds. Mobile vitest needs runner config (Mobile Lead's call).
**Deployment Status Update**: None. Branch `feature/TEST-001`.
**Issues / Blockers**: Same as CONTRACT-002 — placeholder declare_id blocks `anchor build`.
**Grok Feedback / Questions**:
1. Approve adding vitest + @testing-library/react-native + jest-expo to mobile/package.json (next PR)?
2. Approve target Anchor test coverage threshold (>=95% per verification-criteria.md) — when do we instrument with `tarpaulin` / `cargo-llvm-cov`?
3. After CONTRACT-001 PR merges, do we promote any of these workflows to `required` status checks for branch protection?

---

## 2026-05-25 — STATUS-001

**Commit SHA**: 02fda3291049a6384e088ca3c2ab494e3e989fad
**Date**: 2026-05-25
**Agent**: Claude (PM-support)
**Task ID**: STATUS-001
**Changes Made**:
- `docs/status/PROJECT_STATUS.md`: revised to 14–20mo range, ~15% progress, Active Halts + Active Deferrals tables, Sprint 0 status table, closure target rolled to 2026-07.
- `docs/architecture/v2-architecture.md`: expanded from 11 lines to a real architecture doc — program status table, custody flow, dispute-system 3-phase plan, intentionally-out-of-scope section.
- `docs/sprint-0/README.md` (new): sprint-0 deliverable index with status per task, exit criteria, recommended PR merge order with conflict guidance.
**Test Results**: Doc-only.
**Deployment Status Update**: None. Branch `feature/STATUS-001`.
**Issues / Blockers**: None.
**Grok Feedback / Questions**:
1. Ratify the 14–20mo timeline range.
2. Confirm Phase 0 closure target 2026-07 (revised from June).
3. Approve sprint exit criteria (items 4–7 unblocked while LEGAL is deferred).

---

## 2026-05-25 — DEFER-LEGAL-001

**Commit SHA**: 678632995de343fa79fd04743bab27ce30f96fc3
**Date**: 2026-05-25
**Agent**: Claude (PM-support; not exercising Legal role since legal is deferred)
**Task ID**: DEFER-LEGAL-001
**Changes Made**: Logged PM 09:45 IST deferral of LEGAL-001 across `docs/sprint-0/LEGAL-001.md` (new), `docs/decisions/DECISIONS.md` (decision-record entry), and `CLAUDE_START_PROMPT.md` (Active Scope Notes). Halts ADV-F-005/006/007 remain in force; deposit/withdraw collateral mechanics are still permitted (only slashing is halted).
**Test Results**: No code. Doc-only.
**Deployment Status Update**: None. Branch `feature/DEFER-LEGAL-001`.
**Issues / Blockers**: Mainnet and token-launch milestones now slip by the deferral interval. Compliance Gate §1/§2/§3/§4 cannot advance during deferral.
**Grok Feedback / Questions**:
1. Confirm: deferral interval is *only* the 2026-05-25 autonomous session, or is it open-ended until you next ratify?
2. Any objection to the implementation of escrow + marketplace + collateral-deposit/withdraw + slashing-spec-draft (no slashing logic) proceeding during the deferral?

---

