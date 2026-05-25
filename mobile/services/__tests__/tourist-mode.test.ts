import { describe, it, expect } from 'vitest';
import {
  CATALOG,
  DEFAULT_TOURIST_PREFS,
  LANGUAGE_LABEL,
  POPULAR_DESTINATIONS,
  TIPPING_GUIDE,
  isLikelyTourist,
  t,
} from '../tourist-mode';

describe('defaults', () => {
  it('default prefs are non-tourist, English', () => {
    expect(DEFAULT_TOURIST_PREFS).toEqual({ isTourist: false, language: 'en' });
  });
  it('three languages supported', () => {
    expect(Object.keys(LANGUAGE_LABEL).sort()).toEqual(['en', 'es', 'zh']);
  });
});

describe('isLikelyTourist', () => {
  it('returns 0 when no signal is provided', () => {
    expect(isLikelyTourist({})).toBe(0);
  });
  it('returns 1 when every signal screams tourist', () => {
    const score = isLikelyTourist({
      nonUsLocale: true,
      nonPacificTimezone: true,
      newInstall: true,
      hotelOrAirportPickup: true,
      distanceFromHomeKm: 500,
    });
    expect(score).toBeCloseTo(1, 5);
  });
  it('returns 0 when every signal says local', () => {
    const score = isLikelyTourist({
      nonUsLocale: false,
      nonPacificTimezone: false,
      newInstall: false,
      hotelOrAirportPickup: false,
      distanceFromHomeKm: 0,
    });
    expect(score).toBe(0);
  });
  it('partial signal returns a partial score in (0, 1)', () => {
    const score = isLikelyTourist({ nonUsLocale: true, nonPacificTimezone: false });
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThan(1);
  });
  it('clamps distance contribution at 500km', () => {
    const a = isLikelyTourist({ distanceFromHomeKm: 500 });
    const b = isLikelyTourist({ distanceFromHomeKm: 5000 });
    expect(a).toBe(b);
  });
});

describe('translation helper', () => {
  it('returns the requested-language string when available', () => {
    expect(t('es', 'welcome')).toBe(CATALOG.es.welcome);
    expect(t('zh', 'tipping_guide')).toBe(CATALOG.zh.tipping_guide);
  });
  it('falls back to English for unknown language', () => {
    // @ts-expect-error: testing fallback for unknown language code
    expect(t('xx', 'welcome')).toBe(CATALOG.en.welcome);
  });
});

describe('seed data', () => {
  it('has at least 5 popular destinations', () => {
    expect(POPULAR_DESTINATIONS.length).toBeGreaterThanOrEqual(5);
  });
  it('has at least 8 tipping rows', () => {
    expect(TIPPING_GUIDE.length).toBeGreaterThanOrEqual(8);
  });
  it('every destination has a name + blurb', () => {
    for (const d of POPULAR_DESTINATIONS) {
      expect(d.name.length).toBeGreaterThan(0);
      expect(d.blurb.length).toBeGreaterThan(0);
    }
  });
});
