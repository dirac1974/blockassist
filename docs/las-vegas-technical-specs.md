# Las Vegas Feature Technical Specifications (v2.1)

**Updated**: 2026-05-25 (after LV-001 / LV-002 / LV-004 / LV-005 shipped on `main`).

Each section now reflects **what is implemented today** vs. **what is still deferred**. The matching engine itself isn't built yet — these mobile-side functions produce client signals; server-side authority remains a hard requirement before any payout uses them.

---

## LV-001: Event-Based Matching

**Status**: Mobile-side scoring shipped. Server-side authority deferred.

**Where it lives**:
- `mobile/services/events.ts` — pure scoring (`distanceFactor`, `timeFactor`, `attendanceFactor`, `eventContribution`, `computeEventBoost`, `computeMatchScore`).
- `mobile/components/EventCard.tsx`, `mobile/app/marketplace.tsx` — UI surfaces the boost.
- `mobile/services/__tests__/events.test.ts` — 18 vitest cases.

**Implementation summary**:
- Boost radius 2 km, 48 h lookahead, 2 h lookback.
- Category weights: festival 1.0, sports 0.85, nightlife 0.8, concert 0.75, conference 0.5.
- Attendance contributes log-scaled and is bounded to [0, 1].
- Multi-event stacking uses `1 − Π(1 − cᵢ)` (diminishing returns; bounded by 1).
- Final multiplier: `1 + (multiplierMax − 1) × boost.score` with `multiplierMax = 1.5`.

**Deferred**:
- Real Eventbrite / Ticketmaster integration (ON HOLD per `services/events.ts` header).
- Server-side recomputation + signature before any payout-affecting decision.
- Tokenomics calibration of category weights against real pilot data.

---

## LV-002: Strip & Downtown Hot Zones

**Status**: Polygons + multipliers + UI placeholder shipped. Native map deferred.

**Where it lives**:
- `mobile/services/hot-zones.ts` — 6 LV zones (Strip / Downtown / Fremont / Airport / Allegiant / Convention Center) with closed polygons, demand multipliers, and ray-cast point-in-polygon.
- `mobile/components/ZoneIndicator.tsx`, `mobile/components/HotZoneMap.tsx`, `mobile/app/zones.tsx`.
- `mobile/services/__tests__/hot-zones.test.ts` — 10 vitest cases.

**Implementation summary**:
- `zoneDemandMultiplier()` uses `max` over containing zones (no compounding when zones overlap, e.g. Fremont ⊂ Downtown).
- Multiplier range 1.25 (Airport) … 1.6 (Allegiant on game days).
- Polygons are approximate; refine with city GIS data before live use.

**Deferred**:
- `react-native-maps` (or Mapbox) integration — current `HotZoneMap` is a textual placeholder.
- Real-time demand heat-map (Redis + geospatial queries) — server-side, future.
- Polygons refined from real GIS data.

---

## LV-003: Real-time Event Integration

**Status**: Mock data + UI shipped (prior session). External APIs ON HOLD.

**Where it lives**:
- `mobile/services/events.ts` (`fetchUpcomingEvents` with Supabase mirror + mock fallback).
- `mobile/lib/supabase.ts` — safe stub returning no data; swaps to `@supabase/supabase-js` when credentials land.

**Deferred**:
- Real Eventbrite + Ticketmaster integration (per user directive).
- Webhook listener for new events.
- Auto-create matching rules 48 hours before events (server-side).

---

## LV-004: Tourist Mode

**Status**: Onboarding flow + i18n stubs + heuristic shipped.

**Where it lives**:
- `mobile/services/tourist-mode.ts` — Languages (EN/ES/ZH), `TouristPrefs`, `isLikelyTourist` heuristic, `POPULAR_DESTINATIONS`, `TIPPING_GUIDE`, `CATALOG` + `t()`.
- `mobile/app/tourist-onboarding.tsx` — 4-step modal (language → destinations → tipping → confirm).
- `mobile/app/(tabs)/profile.tsx` — re-entry button.
- `mobile/services/__tests__/tourist-mode.test.ts` — 11 vitest cases.

**Implementation summary**:
- Soft suggestion only: `isLikelyTourist` returns 0..1; the UI never auto-enables Tourist Mode without explicit user confirmation.
- 7 LV destinations and 9-row tipping guide with platform-specific note (BlockAssist's built-in 0–15% pricing).
- Translation catalog is intentionally minimal (8 strings × 3 languages). Real app-wide translation work is out of scope.

**Deferred**:
- Saved-preferences persistence via `expo-secure-store`.
- Real translation work across all UI strings.
- Auto-enable on high heuristic score (currently UI-only suggestion).

---

## LV-005: Late-Night / Nightlife Focus

**Status**: Theme switch + nightlife boost + safety screen shipped.

**Where it lives**:
- `mobile/services/night-mode.ts` — `isNightTime` (22:00–05:00 cross-midnight window), `nightlifeBoostFor` (1.4× at night), `LIGHT_THEME` / `DARK_THEME` / `themeFor`, safety state machine.
- `mobile/app/safety.tsx` — route-share toggle, buddy check-in card, emergency contacts.
- `mobile/services/__tests__/night-mode.test.ts` — 15 vitest cases.

**Implementation summary**:
- Safety state machine: `active → late` after 20 m without check-in → `sos` after +10 m. SOS is sticky.
- Theme auto-switches at the night boundary; matching engine applies the night multiplier on top of zone × event.
- All emergency-contact data stays on-device; nothing leaves the device without explicit opt-in.

**Deferred**:
- Background-running safety timer (currently foreground only — Expo TaskManager + background fetch follow-up).
- Real route-sharing transport (backend channel + opt-in PDA flag).
- Emergency contacts persistence (`expo-secure-store`).
- OS dark-mode preference respect vs. time-based switch.

---

## Cross-cutting

**Compound surge bound**: zone × (1 + 0.5 × eventBoost) × nightFactor, hard-capped at **2.8×** (PM-ratified 2026-05-25 12:57 IST). The cap lives in the matching-engine wrapper, not in any individual factor.

Why 2.8 specifically: the raw product can reach ≈3.36× at the worst-case spot (Allegiant 1.6 × event 1.5 × night 1.4 during a Raiders night game). 3.4× pricing during a major event invites press scrutiny — 2.8× leaves headroom for the engine's own ranking lift without surprising users. The cap binds rarely; in the common case (one factor at peak, others ~1.0) it is a no-op.

**Category weight rationale (LV-001 events)**: festival 1.0 / sports 0.85 / nightlife 0.8 / concert 0.75 / conference 0.5. Rationale:
- *Festival* weighted highest — multi-day events generate the most cross-task demand (food, transit, errands).
- *Sports* + *nightlife* mid-high — concentrated high-intensity demand around game time / late hours.
- *Concert* lower than sports — shorter window, more confined audience.
- *Conference* lowest — attendees are in scheduled sessions; order surface is narrower (lunch + transport mostly).

These are placeholders until Tokenomics simulates against pilot data; the structure (weights expressed as a single `CATEGORY_WEIGHT` table in `events.ts`) makes calibration a one-line PR.

**Open questions for PM** (remaining):
1. Confirm EN/ES/ZH as the LV pilot language set (LV-004).
2. Decide auto-dark vs. OS-preference for night theme (LV-005).
3. Google Maps vs. Apple Maps / Mapbox provider for `react-native-maps`.

**Resolved this session** (2026-05-25 12:57 IST):
- ✅ Compound surge cap: 2.8× (PM-ratified).
- ✅ Category weights: approved with rationale documented.
- ✅ Dependencies approved: `expo-location`, `expo-secure-store`, `expo-task-manager`, `react-native-maps`.
- ✅ Tipping range 0–15% confirmed.

**Persisted halts** (untouched this session):
- ADV-F-005 Collateral slashing: `slash()` still returns `SlashHalted`.
- ADV-F-006 Token launch: no `$ASSIST` code path added.
- ADV-F-007 Insurance pool: no implementation added.
