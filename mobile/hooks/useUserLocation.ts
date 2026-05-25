import { useEffect, useRef, useState } from 'react';
import * as Location from 'expo-location';

// LV-002 / LV-001 / LV-005 location source.
//
// LOC-001 wires the real expo-location flow:
//   - Foreground permission request.
//   - One-shot getCurrentPositionAsync on grant.
//   - Continuous watchPositionAsync that updates state as the user moves.
//   - On denial / restricted: fall back to DEMO_LOCATION so downstream
//     screens still render and we don't crash the app.

export type PermissionStatus = 'unknown' | 'granted' | 'denied' | 'restricted';

export interface UserLocation {
  lat: number;
  lng: number;
  /** Epoch ms of the last fix. */
  ts: number;
  /** Estimated accuracy in meters; null if unknown. */
  accuracyM: number | null;
  /** True when the demo fallback is in use. */
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

export interface UseUserLocationOpts {
  /** Override `Date.now`-style clock for tests. */
  now?: () => number;
  /** If true, do not call expo-location at all and return DEMO_LOCATION (useful for offline UI work). */
  forceDemo?: boolean;
}

export function useUserLocation(opts: UseUserLocationOpts = {}): UseUserLocationResult {
  const now = opts.now ?? (() => Date.now());
  const [status, setStatus] = useState<PermissionStatus>('unknown');
  const [location, setLocation] = useState<UserLocation | null>(null);
  const watcherRef = useRef<{ remove: () => void } | null>(null);

  const applyPermission = (perm: Location.PermissionResponse): PermissionStatus => {
    if (perm.status === 'granted') return 'granted';
    if (perm.canAskAgain === false) return 'restricted';
    return 'denied';
  };

  const startWatch = async (): Promise<void> => {
    watcherRef.current?.remove();
    watcherRef.current = await Location.watchPositionAsync(
      { accuracy: Location.Accuracy.Balanced, distanceInterval: 25, timeInterval: 5_000 },
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          ts: pos.timestamp ?? now(),
          accuracyM: pos.coords.accuracy ?? null,
          demo: false,
        });
      },
    );
  };

  const request = async (): Promise<void> => {
    if (opts.forceDemo) {
      setStatus('granted');
      setLocation({ ...DEMO_LOCATION, ts: now() });
      return;
    }
    try {
      const perm = await Location.requestForegroundPermissionsAsync();
      const next = applyPermission(perm);
      setStatus(next);
      if (next !== 'granted') {
        setLocation({ ...DEMO_LOCATION, ts: now() });
        return;
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setLocation({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        ts: pos.timestamp ?? now(),
        accuracyM: pos.coords.accuracy ?? null,
        demo: false,
      });
      await startWatch();
    } catch {
      setStatus('denied');
      setLocation({ ...DEMO_LOCATION, ts: now() });
    }
  };

  useEffect(() => {
    void request();
    return () => {
      watcherRef.current?.remove();
      watcherRef.current = null;
    };
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

/**
 * Pure mapping from expo-location PermissionResponse to our internal status.
 * Extracted so tests can pin the rules without spinning up the hook.
 */
export function permissionStatusFrom(perm: { status: string; canAskAgain?: boolean }): PermissionStatus {
  if (perm.status === 'granted') return 'granted';
  if (perm.canAskAgain === false) return 'restricted';
  return 'denied';
}
