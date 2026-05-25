import { describe, it, expect } from 'vitest';
import {
  COMPOUND_SURGE_CAP,
  ClientMatchingEngine,
  applyMatchingMultiplier,
  computeAssistantMatching,
} from '../assistant-matching';
import { Event } from '../events';

function localDate(year: number, month: number, day: number, hour: number, minute = 0): Date {
  return new Date(year, month - 1, day, hour, minute, 0, 0);
}

const RAIDERS: Event = {
  id: 'raiders',
  title: 'Raiders',
  venue: 'Allegiant Stadium',
  startTime: localDate(2026, 5, 25, 22).toISOString(),
  endTime: localDate(2026, 5, 26, 1).toISOString(),
  location: { lat: 36.0908, lng: -115.1833 },
  category: 'sports',
  expectedAttendance: 65_000,
};

const ALLEGIANT = { userLat: 36.0908, userLng: -115.1833 };
const DESERT = { userLat: 36.5, userLng: -115.5 };

describe('computeAssistantMatching', () => {
  it('returns 1× in the desert at midday with no events', () => {
    const r = computeAssistantMatching({
      ...DESERT,
      events: [],
      now: localDate(2026, 5, 25, 14),
    });
    expect(r.effectiveSurge).toBe(1);
    expect(r.rawSurge).toBe(1);
    expect(r.capped).toBe(false);
    expect(r.components.zone).toBe(1);
    expect(r.components.eventFactor).toBe(1);
    expect(r.components.night).toBe(1);
  });

  it('compounds zone × event × night at Allegiant on game night, under cap', () => {
    const r = computeAssistantMatching({
      ...ALLEGIANT,
      events: [RAIDERS],
      now: localDate(2026, 5, 25, 22, 30),
    });
    expect(r.components.zone).toBeGreaterThan(1);
    expect(r.components.eventFactor).toBeGreaterThan(1);
    expect(r.components.night).toBeGreaterThan(1);
    expect(r.effectiveSurge).toBeGreaterThan(r.components.zone);
    expect(r.capped).toBe(false);
    expect(r.effectiveSurge).toBeLessThan(COMPOUND_SURGE_CAP);
  });

  it('caps the surge at COMPOUND_SURGE_CAP when forced', () => {
    const r = computeAssistantMatching({
      ...ALLEGIANT,
      events: [RAIDERS],
      now: localDate(2026, 5, 25, 22, 30),
      cap: 1.0,
    });
    expect(r.effectiveSurge).toBe(1.0);
    expect(r.capped).toBe(true);
    expect(r.rawSurge).toBeGreaterThan(1);
  });

  it('respects a custom event boost weight', () => {
    const r0 = computeAssistantMatching({
      ...ALLEGIANT,
      events: [RAIDERS],
      now: localDate(2026, 5, 25, 22, 30),
      eventBoostWeight: 0,
    });
    const r1 = computeAssistantMatching({
      ...ALLEGIANT,
      events: [RAIDERS],
      now: localDate(2026, 5, 25, 22, 30),
      eventBoostWeight: 1,
    });
    expect(r0.components.eventFactor).toBe(1);
    expect(r1.components.eventFactor).toBeGreaterThan(1);
    expect(r1.effectiveSurge).toBeGreaterThan(r0.effectiveSurge);
  });
});

describe('applyMatchingMultiplier', () => {
  it('multiplies the base score by effectiveSurge', () => {
    const ctx = { ...DESERT, events: [], now: localDate(2026, 5, 25, 14) };
    const { score, result } = applyMatchingMultiplier(100, ctx);
    expect(result.effectiveSurge).toBe(1);
    expect(score).toBe(100);
  });

  it('boosts a base score at Allegiant on game night', () => {
    const ctx = { ...ALLEGIANT, events: [RAIDERS], now: localDate(2026, 5, 25, 22, 30) };
    const { score, result } = applyMatchingMultiplier(100, ctx);
    expect(score).toBeGreaterThan(100);
    expect(score).toBe(100 * result.effectiveSurge);
  });
});

describe('ClientMatchingEngine contract', () => {
  it('implements computeMatching and applyMultiplier', () => {
    expect(typeof ClientMatchingEngine.computeMatching).toBe('function');
    expect(typeof ClientMatchingEngine.applyMultiplier).toBe('function');
  });
  it('produces identical results to direct calls', () => {
    const ctx = { ...ALLEGIANT, events: [RAIDERS], now: localDate(2026, 5, 25, 22, 30) };
    const a = ClientMatchingEngine.computeMatching(ctx);
    const b = computeAssistantMatching(ctx);
    expect(a).toEqual(b);
  });
});
