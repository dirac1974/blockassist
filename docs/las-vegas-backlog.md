# Las Vegas Specific Features Backlog (Updated 2026-05-25)

**Primary Pilot City**: Las Vegas

## Phase 1 Immediate

| ID | Feature | Priority | Status |
|----|---------|----------|--------|
| LV-001 | Event-Based Matching | **Immediate** | **Shipped** (mobile-side scoring; server authority deferred) |
| LV-002 | Strip & Downtown Hot Zones | **Immediate** | **Shipped** (polygons + multiplier + placeholder map UI) |
| LV-003 | Real-time Event Integration | **Immediate** | **Shipped** (mock + Supabase fallback; external APIs on hold) |
| LV-004 | Tourist Mode | **Immediate** | **Shipped** (modal onboarding + EN/ES/ZH stubs + heuristic) |
| LV-005 | Late-Night / Nightlife Focus | **Immediate** | **Shipped** (theme + nightlife boost + safety screen; persistence/background deferred) |

## Phase 2 (After Core MVP)
- LV-006: Real route-sharing transport (LV-005 follow-up).
- LV-007: Background safety timer via `expo-task-manager` (LV-005 follow-up).
- LV-008: `react-native-maps` integration (LV-002 native-map upgrade).
- LV-009: City-GIS polygons for hot zones (LV-002 accuracy upgrade).
- LV-010: `expo-secure-store` persistence for Tourist Mode prefs and emergency contacts.

## Phase 3 (Post-Launch)
- LV-011: Server-side matching-engine authority that consumes client signals (LV-001 hardening).
- LV-012: Live Eventbrite + Ticketmaster integration (LV-003 unhold).
- LV-013: Tokenomics-calibrated category weights and multiplier caps.

## Persisted Halts (untouched in autonomous session)

- ADV-F-005 Collateral slashing — `slash()` still returns `SlashHalted`.
- ADV-F-006 Token launch / `$ASSIST` yield — no code added.
- ADV-F-007 Insurance pool — no implementation added.
