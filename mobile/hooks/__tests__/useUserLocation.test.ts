// Pure helpers in useUserLocation are testable without rendering the hook.
// Hook behaviour itself needs @testing-library/react-hooks; deferred.

import { describe, it, expect } from 'vitest';
import { DEMO_LOCATION, resolveLocation } from '../useUserLocation';

describe('resolveLocation', () => {
  it('returns the demo location when none is passed', () => {
    expect(resolveLocation(null)).toBe(DEMO_LOCATION);
  });
  it('returns the real location when present', () => {
    const real = { lat: 36.0, lng: -115.0, ts: 1, accuracyM: 5, demo: false };
    expect(resolveLocation(real)).toBe(real);
  });
});

describe('DEMO_LOCATION sanity', () => {
  it('is inside the Strip zone bounds (sanity)', () => {
    expect(DEMO_LOCATION.lat).toBeGreaterThan(36);
    expect(DEMO_LOCATION.lat).toBeLessThan(37);
    expect(DEMO_LOCATION.lng).toBeLessThan(-115);
    expect(DEMO_LOCATION.lng).toBeGreaterThan(-116);
  });
  it('is flagged as demo', () => {
    expect(DEMO_LOCATION.demo).toBe(true);
  });
});
