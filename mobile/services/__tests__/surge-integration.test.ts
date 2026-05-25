// Integration: surge composition across LV-001 + LV-002 + LV-005.
// The matching engine ultimately applies the product:
//   effective = zone × eventFactor × nightFactor
// where eventFactor = 1 + 0.5*eventBoost.score and nightFactor = nightlifeBoostFor(now).

import { describe, it, expect } from 'vitest';
import { computeEventBoost, Event } from '../events';
import { zoneDemandMultiplier } from '../hot-zones';
import { nightlifeBoostFor } from '../night-mode';

function localDate(year: number, month: number, day: number, hour: number, minute = 0): Date {
  return new Date(year, month - 1, day, hour, minute, 0, 0);
}

const ALLEGIANT = { lat: 36.0908, lng: -115.1833 };
const BELLAGIO = { lat: 36.1147, lng: -115.1728 };
const DESERT = { lat: 36.5, lng: -115.5 };

const RAIDERS_NIGHT: Event = {
  id: 'evt-raiders',
  title: 'Raiders vs Chiefs',
  venue: 'Allegiant Stadium',
  startTime: '2026-05-25T22:00:00Z',
  endTime: '2026-05-26T01:00:00Z',
  location: ALLEGIANT,
  category: 'sports',
  expectedAttendance: 65_000,
};

describe('compound surge', () => {
  it('multiplier is 1 in the desert during the day with no events', () => {
    const t = localDate(2026, 5, 25, 14);
    const zone = zoneDemandMultiplier(DESERT.lat, DESERT.lng);
    const evt = computeEventBoost(DESERT.lat, DESERT.lng, [RAIDERS_NIGHT], t);
    const night = nightlifeBoostFor(t);
    expect(zone * (1 + 0.5 * evt.score) * night).toBe(1);
  });

  it('at Allegiant during a Raiders night game, all three boosts compound', () => {
    // Use a local-time "night" so isNightTime fires (the test runs in local TZ).
    const t = localDate(2026, 5, 25, 22, 30);
    const zone = zoneDemandMultiplier(ALLEGIANT.lat, ALLEGIANT.lng);
    const evt = computeEventBoost(ALLEGIANT.lat, ALLEGIANT.lng, [{
      ...RAIDERS_NIGHT,
      startTime: localDate(2026, 5, 25, 22).toISOString(),
      endTime: localDate(2026, 5, 26, 1).toISOString(),
    }], t);
    const night = nightlifeBoostFor(t);
    const combined = zone * (1 + 0.5 * evt.score) * night;
    expect(zone).toBeGreaterThan(1);
    expect(evt.score).toBeGreaterThan(0);
    expect(night).toBeGreaterThan(1);
    expect(combined).toBeGreaterThan(zone);
    // Sanity cap: combined surge should not absurdly exceed 3.5×.
    expect(combined).toBeLessThan(3.5);
  });

  it('at Bellagio during the day with no event nearby, only zone surges', () => {
    const t = localDate(2026, 5, 25, 14);
    const zone = zoneDemandMultiplier(BELLAGIO.lat, BELLAGIO.lng);
    const evt = computeEventBoost(BELLAGIO.lat, BELLAGIO.lng, [], t);
    const night = nightlifeBoostFor(t);
    const combined = zone * (1 + 0.5 * evt.score) * night;
    expect(combined).toBe(zone);
  });
});
