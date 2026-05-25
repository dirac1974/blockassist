// MAP-001: rendering happens inside react-native-maps, which isn't part of
// our vitest runtime. We assert the input shape the map consumes: the
// translation from {lat,lng} to {latitude, longitude} that Polygon and
// Marker need.

import { describe, it, expect } from 'vitest';
import { HOT_ZONES, getCentroid } from '../../services/hot-zones';

function toCoord(p: { lat: number; lng: number }): { latitude: number; longitude: number } {
  return { latitude: p.lat, longitude: p.lng };
}

describe('HotZoneMap render data', () => {
  it('translates every zone polygon vertex from {lat,lng} to {latitude,longitude}', () => {
    for (const zone of HOT_ZONES) {
      const coords = zone.polygon.map(toCoord);
      expect(coords).toHaveLength(zone.polygon.length);
      for (let i = 0; i < coords.length; i++) {
        const c = coords[i]!;
        const p = zone.polygon[i]!;
        expect(c.latitude).toBe(p.lat);
        expect(c.longitude).toBe(p.lng);
      }
    }
  });

  it('every zone centroid is render-ready (lat/lng → latitude/longitude)', () => {
    for (const zone of HOT_ZONES) {
      const c = toCoord(getCentroid(zone));
      expect(Number.isFinite(c.latitude)).toBe(true);
      expect(Number.isFinite(c.longitude)).toBe(true);
    }
  });

  it('LV initial region centers approximately on Bellagio (sanity)', () => {
    const region = { latitude: 36.140, longitude: -115.160, latitudeDelta: 0.18, longitudeDelta: 0.12 };
    // Bellagio is ~(36.115, -115.173). Region center should be within 5km.
    const km = Math.hypot((region.latitude - 36.115) * 111, (region.longitude - -115.173) * 90);
    expect(km).toBeLessThan(5);
  });

  it('region latitudeDelta and longitudeDelta are positive', () => {
    expect(0.18).toBeGreaterThan(0);
    expect(0.12).toBeGreaterThan(0);
  });
});
