import { describe, it, expect } from 'vitest';
import {
  CHECK_IN_INTERVAL_MIN,
  DARK_THEME,
  LIGHT_THEME,
  NIGHTLIFE_BOOST_MULTIPLIER,
  NIGHT_END_HOUR,
  NIGHT_START_HOUR,
  SOS_AUTO_TRIGGER_MIN,
  checkIn,
  endSession,
  isNightTime,
  nightlifeBoostFor,
  safetyTimings,
  startSession,
  themeFor,
  tickSafetyStatus,
  triggerSOS,
} from '../night-mode';

function localDate(year: number, month: number, day: number, hour: number): Date {
  // Use local time so isNightTime's getHours() reads the intended hour.
  return new Date(year, month - 1, day, hour, 0, 0, 0);
}

describe('isNightTime', () => {
  it('is true at 23:00', () => {
    expect(isNightTime(localDate(2026, 5, 25, 23))).toBe(true);
  });
  it('is true at 02:00 (after midnight)', () => {
    expect(isNightTime(localDate(2026, 5, 26, 2))).toBe(true);
  });
  it('is false at 09:00', () => {
    expect(isNightTime(localDate(2026, 5, 25, 9))).toBe(false);
  });
  it('is false at NIGHT_END_HOUR', () => {
    expect(isNightTime(localDate(2026, 5, 26, NIGHT_END_HOUR))).toBe(false);
  });
  it('is true at NIGHT_START_HOUR', () => {
    expect(isNightTime(localDate(2026, 5, 25, NIGHT_START_HOUR))).toBe(true);
  });
});

describe('nightlifeBoostFor', () => {
  it('returns 1 during the day', () => {
    expect(nightlifeBoostFor(localDate(2026, 5, 25, 12))).toBe(1);
  });
  it('returns NIGHTLIFE_BOOST_MULTIPLIER at night', () => {
    expect(nightlifeBoostFor(localDate(2026, 5, 25, 23))).toBe(NIGHTLIFE_BOOST_MULTIPLIER);
  });
});

describe('theme', () => {
  it('returns LIGHT during the day, DARK at night', () => {
    expect(themeFor(localDate(2026, 5, 25, 12))).toBe(LIGHT_THEME);
    expect(themeFor(localDate(2026, 5, 25, 23))).toBe(DARK_THEME);
  });
  it('themes have status labels', () => {
    expect(LIGHT_THEME.status).toBe('light');
    expect(DARK_THEME.status).toBe('dark');
  });
});

describe('safety session', () => {
  const t0 = 1_000_000_000_000;
  const minutes = (n: number) => t0 + n * 60_000;

  it('startSession seeds active state', () => {
    const s = startSession(t0, ['+15551234567']);
    expect(s.status).toBe('active');
    expect(s.lastCheckInAt).toBe(t0);
    expect(s.emergencyContacts).toEqual(['+15551234567']);
  });

  it('tickSafetyStatus stays active before the check-in interval', () => {
    const s = startSession(t0);
    const s2 = tickSafetyStatus(s, minutes(CHECK_IN_INTERVAL_MIN - 1));
    expect(s2.status).toBe('active');
  });

  it('escalates to late at the check-in interval', () => {
    const s = startSession(t0);
    const s2 = tickSafetyStatus(s, minutes(CHECK_IN_INTERVAL_MIN));
    expect(s2.status).toBe('late');
  });

  it('escalates to sos at interval + sos-trigger', () => {
    const s = startSession(t0);
    const s2 = tickSafetyStatus(s, minutes(CHECK_IN_INTERVAL_MIN + SOS_AUTO_TRIGGER_MIN));
    expect(s2.status).toBe('sos');
  });

  it('check-in resets the timer back to active', () => {
    let s = startSession(t0);
    s = tickSafetyStatus(s, minutes(CHECK_IN_INTERVAL_MIN));
    expect(s.status).toBe('late');
    s = checkIn(s, minutes(CHECK_IN_INTERVAL_MIN + 1));
    expect(s.status).toBe('active');
  });

  it('sos is sticky — even after a tick, status remains sos until user acts', () => {
    let s = triggerSOS(startSession(t0));
    s = tickSafetyStatus(s, minutes(CHECK_IN_INTERVAL_MIN - 1));
    expect(s.status).toBe('sos');
  });

  it('endSession marks status inactive', () => {
    const s = endSession(startSession(t0));
    expect(s.status).toBe('inactive');
  });

  it('tickSafetyStatus is a no-op on inactive sessions', () => {
    const s = endSession(startSession(t0));
    expect(tickSafetyStatus(s, minutes(60))).toBe(s);
  });

  it('safetyTimings returns positive countdowns until expiry', () => {
    const s = startSession(t0);
    const ti = safetyTimings(s, minutes(5));
    expect(ti.minutesSinceCheckIn).toBeCloseTo(5);
    expect(ti.minutesUntilLate).toBeCloseTo(CHECK_IN_INTERVAL_MIN - 5);
    expect(ti.minutesUntilSos).toBeCloseTo(CHECK_IN_INTERVAL_MIN + SOS_AUTO_TRIGGER_MIN - 5);
  });

  it('safetyTimings clamps countdowns at 0 once expired', () => {
    const s = startSession(t0);
    const ti = safetyTimings(s, minutes(999));
    expect(ti.minutesUntilLate).toBe(0);
    expect(ti.minutesUntilSos).toBe(0);
  });
});
