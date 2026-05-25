// Pure helpers in useUserLocation are testable without rendering the hook.
// Hook behaviour itself needs @testing-library/react-hooks; deferred.

import { describe, it, expect } from 'vitest';
import { DEMO_LOCATION, permissionStatusFrom, resolveLocation } from '../useUserLocation';

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

describe('permissionStatusFrom', () => {
  it('granted → granted', () => {
    expect(permissionStatusFrom({ status: 'granted' })).toBe('granted');
  });
  it('denied + canAskAgain=true → denied', () => {
    expect(permissionStatusFrom({ status: 'denied', canAskAgain: true })).toBe('denied');
  });
  it('denied + canAskAgain=false → restricted (cannot prompt again)', () => {
    expect(permissionStatusFrom({ status: 'denied', canAskAgain: false })).toBe('restricted');
  });
  it('undetermined → denied (treated as not-yet-granted)', () => {
    expect(permissionStatusFrom({ status: 'undetermined', canAskAgain: true })).toBe('denied');
  });
  it('any non-granted with canAskAgain=false → restricted', () => {
    expect(permissionStatusFrom({ status: 'undetermined', canAskAgain: false })).toBe('restricted');
  });
});
