import { describe, it, expect } from 'vitest';
import {
  Event,
  CATEGORY_WEIGHT,
  EVENT_BOOST_RADIUS_METERS,
  attendanceFactor,
  computeEventBoost,
  computeMatchScore,
  distanceFactor,
  distanceMeters,
  eventContribution,
  getActiveAndUpcomingEvents,
  isEventActive,
  shouldBoostAssistant,
  timeFactor,
} from '../events';

const NOW = new Date('2026-05-25T22:00:00Z'); // mid-EDC

function evt(partial: Partial<Event> = {}): Event {
  return {
    id: 'evt-x',
    title: 'Event X',
    venue: 'Venue X',
    startTime: '2026-05-25T20:00:00Z',
    endTime: '2026-05-26T04:00:00Z',
    location: { lat: 36.2719, lng: -115.0101 },
    category: 'festival',
    expectedAttendance: 50_000,
    ...partial,
  };
}

describe('distanceMeters', () => {
  it('returns 0 for same point', () => {
    expect(distanceMeters(36.1, -115.1, 36.1, -115.1)).toBe(0);
  });
  it('approximates a 1km north-south delta within 5%', () => {
    const d = distanceMeters(36.10, -115.0, 36.10899, -115.0); // ~1km north
    expect(d).toBeGreaterThan(950);
    expect(d).toBeLessThan(1050);
  });
});

describe('distanceFactor', () => {
  it('is 1 at distance 0', () => { expect(distanceFactor(0)).toBe(1); });
  it('is 0 at and beyond radius', () => {
    expect(distanceFactor(EVENT_BOOST_RADIUS_METERS)).toBe(0);
    expect(distanceFactor(EVENT_BOOST_RADIUS_METERS + 1)).toBe(0);
  });
  it('is 0.5 at half radius', () => {
    expect(distanceFactor(EVENT_BOOST_RADIUS_METERS / 2)).toBeCloseTo(0.5, 5);
  });
});

describe('isEventActive', () => {
  it('true during the window', () => {
    expect(isEventActive(evt(), NOW)).toBe(true);
  });
  it('false before start', () => {
    expect(isEventActive(evt({ startTime: '2026-05-26T00:00:00Z', endTime: '2026-05-26T02:00:00Z' }), NOW)).toBe(false);
  });
  it('false after end', () => {
    expect(isEventActive(evt({ startTime: '2026-05-24T00:00:00Z', endTime: '2026-05-24T02:00:00Z' }), NOW)).toBe(false);
  });
});

describe('timeFactor', () => {
  it('is 1 during the event', () => {
    expect(timeFactor(evt(), NOW)).toBe(1);
  });
  it('ramps up linearly in the lookahead window', () => {
    // 24h before a 48h-lookahead event start ⇒ 0.5
    const e = evt({ startTime: '2026-05-26T22:00:00Z', endTime: '2026-05-27T00:00:00Z' });
    expect(timeFactor(e, NOW)).toBeCloseTo(0.5, 2);
  });
  it('is 0 outside the lookahead window', () => {
    const e = evt({ startTime: '2026-05-30T00:00:00Z', endTime: '2026-05-30T02:00:00Z' });
    expect(timeFactor(e, NOW)).toBe(0);
  });
  it('ramps down in the lookback window', () => {
    // ended 1h ago, default 2h lookback ⇒ 0.5
    const e = evt({ startTime: '2026-05-25T19:00:00Z', endTime: '2026-05-25T21:00:00Z' });
    expect(timeFactor(e, NOW)).toBeCloseTo(0.5, 2);
  });
});

describe('attendanceFactor', () => {
  it('is bounded to [0,1]', () => {
    expect(attendanceFactor(1)).toBeGreaterThan(0);
    expect(attendanceFactor(1)).toBeLessThanOrEqual(1);
    expect(attendanceFactor(10_000_000)).toBeLessThanOrEqual(1);
  });
  it('grows with attendance', () => {
    expect(attendanceFactor(1_000)).toBeLessThan(attendanceFactor(100_000));
  });
  it('returns a default when missing', () => {
    expect(attendanceFactor(undefined)).toBe(0.8);
  });
});

describe('getActiveAndUpcomingEvents', () => {
  it('includes events ending within the lookback window', () => {
    const recentlyEnded = evt({ startTime: '2026-05-25T18:00:00Z', endTime: '2026-05-25T21:00:00Z' });
    const all = [recentlyEnded];
    expect(getActiveAndUpcomingEvents(all, NOW)).toContain(recentlyEnded);
  });
  it('excludes events that ended more than the lookback window ago', () => {
    const old = evt({ startTime: '2026-05-24T18:00:00Z', endTime: '2026-05-24T21:00:00Z' });
    expect(getActiveAndUpcomingEvents([old], NOW)).toHaveLength(0);
  });
  it('excludes events further out than the lookahead window', () => {
    const distant = evt({ startTime: '2026-06-01T18:00:00Z', endTime: '2026-06-01T21:00:00Z' });
    expect(getActiveAndUpcomingEvents([distant], NOW)).toHaveLength(0);
  });
});

describe('eventContribution', () => {
  const userOnSite = { lat: 36.2719, lng: -115.0101 };
  it('returns near-max for an active event at the venue', () => {
    const c = eventContribution(userOnSite.lat, userOnSite.lng, evt(), NOW);
    // distance ≈ 0 → df=1, time=1, attendance(50k)=~0.83, weight(festival)=1
    expect(c).toBeGreaterThan(0.7);
    expect(c).toBeLessThanOrEqual(1);
  });
  it('returns 0 when far away', () => {
    expect(eventContribution(34.05, -118.25, evt(), NOW)).toBe(0);
  });
  it('weighs categories per CATEGORY_WEIGHT', () => {
    const conf = eventContribution(userOnSite.lat, userOnSite.lng, evt({ category: 'conference' }), NOW);
    const fest = eventContribution(userOnSite.lat, userOnSite.lng, evt({ category: 'festival' }), NOW);
    expect(conf).toBeLessThan(fest);
    expect(CATEGORY_WEIGHT.conference).toBeLessThan(CATEGORY_WEIGHT.festival);
  });
});

describe('computeEventBoost', () => {
  const user = { lat: 36.2719, lng: -115.0101 };
  it('returns 0 score with no contributing events', () => {
    const r = computeEventBoost(user.lat, user.lng, [], NOW);
    expect(r.score).toBe(0);
    expect(r.contributors).toHaveLength(0);
    expect(r.active).toBe(false);
  });
  it('stacking two events near the user beats one but is bounded ≤ 1', () => {
    const e1 = evt({ id: 'a' });
    const e2 = evt({ id: 'b' });
    const one = computeEventBoost(user.lat, user.lng, [e1], NOW).score;
    const two = computeEventBoost(user.lat, user.lng, [e1, e2], NOW).score;
    expect(two).toBeGreaterThan(one);
    expect(two).toBeLessThanOrEqual(1);
  });
  it('orders contributors highest-first', () => {
    const big = evt({ id: 'big', expectedAttendance: 200_000 });
    const small = evt({ id: 'small', expectedAttendance: 1_000 });
    const r = computeEventBoost(user.lat, user.lng, [small, big], NOW);
    expect(r.contributors[0]?.eventId).toBe('big');
  });
  it('marks active=true when user inside radius of a currently-running event', () => {
    expect(computeEventBoost(user.lat, user.lng, [evt()], NOW).active).toBe(true);
  });
});

describe('computeMatchScore', () => {
  it('multiplies the base score by 1..multiplierMax', () => {
    const base = 100;
    const { score: outside } = computeMatchScore(base, 34.05, -118.25, [evt()], NOW);
    expect(outside).toBe(base);
    const { score: inside } = computeMatchScore(base, 36.2719, -115.0101, [evt()], NOW, 1.5);
    expect(inside).toBeGreaterThan(base);
    expect(inside).toBeLessThanOrEqual(base * 1.5);
  });
});

describe('shouldBoostAssistant (back-compat)', () => {
  it('still returns true near the venue', () => {
    expect(shouldBoostAssistant(36.2719, -115.0101, evt())).toBe(true);
  });
  it('returns false far away', () => {
    expect(shouldBoostAssistant(34.05, -118.25, evt())).toBe(false);
  });
});
