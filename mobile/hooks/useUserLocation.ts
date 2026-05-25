import { useEffect, useState } from 'react';

// LV-002 / LV-001 / LV-005 location source.
//
// Demo behaviour today: returns a fixed Bellagio coordinate with a fake
// "granted" permission state after a short delay. Real expo-location wires
// in by replacing the inner body of `requestAndWatch()` below.
//
// Why this exists as its own hook: keep one place to swap in real
// geolocation. Today multiple screens hard-coded the demo coords; that
// makes wiring up real location a multi-file change. Now it's a one-file change.

export type PermissionStatus = 'unknown' | 'granted' | 'denied' | 'restricted';

export interface UserLocation {
  lat: number;
  lng: number;
  /** Epoch ms of the last fix. */
  ts: number;
  /** Estimated accuracy in meters; null if unknown. */
  accuracyM: number | null;
  /** True when the demo fallback is in use (real expo-location not wired). */
  demo: boolean;
}

export interface UseUserLocationResult {
  status: PermissionStatus;
  location: UserLocation | null;
  /** Imperative re-request (used by the safety screen when the user taps Allow). */
  request: () => Promise<void>;
}

export const DEMO_LOCATION: UserLocation = {
  lat: 36.1147,
  lng: -115.1728, // near Bellagio
  ts: 0,
  accuracyM: null,
  demo: true,
};

/**
 * Returns a permission status and the user's last known location. When
 * `expo-location` is not yet wired, returns a stable demo coordinate so
 * downstream screens render meaningfully in dev.
 *
 * Tests use the second `opts` arg to inject a fake `now()` and disable
 * the setTimeout so behaviour is deterministic.
 */
export function useUserLocation(
  opts: {
    /** Override the granted-state delay (ms) for tests. */
    grantDelayMs?: number;
    /** Override `Date.now`-style clock for tests. */
    now?: () => number;
  } = {},
): UseUserLocationResult {
  const grantDelayMs = opts.grantDelayMs ?? 400;
  const now = opts.now ?? (() => Date.now());

  const [status, setStatus] = useState<PermissionStatus>('unknown');
  const [location, setLocation] = useState<UserLocation | null>(null);

  const request = async (): Promise<void> => {
    // TODO(MOBILE-008): replace with `await Location.requestForegroundPermissionsAsync()`
    // and `Location.getCurrentPositionAsync()`. Until then, simulate granted.
    setStatus('granted');
    setLocation({ ...DEMO_LOCATION, ts: now() });
  };

  useEffect(() => {
    if (grantDelayMs <= 0) {
      void request();
      return;
    }
    const id = setTimeout(() => { void request(); }, grantDelayMs);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { status, location, request };
}

/**
 * Pure helper for resolving a (possibly absent) location to either the real
 * coords or the demo fallback. Used by screens that want to render
 * something useful even before permission is granted.
 */
export function resolveLocation(loc: UserLocation | null): UserLocation {
  return loc ?? DEMO_LOCATION;
}
