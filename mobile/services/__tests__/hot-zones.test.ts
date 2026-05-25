import { describe, it, expect } from 'vitest';
import {
  HOT_ZONES,
  centroidOf,
  getAllZonesAt,
  getCentroid,
  getZoneAt,
  pointInPolygon,
  zoneDemandMultiplier,
} from '../hot-zones';

describe('pointInPolygon', () => {
  const square = [
    { lat: 0, lng: 0 },
    { lat: 0, lng: 10 },
    { lat: 10, lng: 10 },
    { lat: 10, lng: 0 },
  ];
  it('detects interior point', () => {
    expect(pointInPolygon(5, 5, square)).toBe(true);
  });
  it('rejects exterior point', () => {
    expect(pointInPolygon(15, 15, square)).toBe(false);
    expect(pointInPolygon(-1, 5, square)).toBe(false);
  });
  it('handles degenerate polygon (<3 vertices)', () => {
    expect(pointInPolygon(0, 0, [])).toBe(false);
    expect(pointInPolygon(0, 0, [{ lat: 0, lng: 0 }, { lat: 1, lng: 1 }])).toBe(false);
  });
});

describe('HOT_ZONES seed data', () => {
  it('has the 6 expected zones', () => {
    const ids = HOT_ZONES.map((z) => z.id).sort();
    expect(ids).toEqual(['airport', 'allegiant', 'convention-center', 'downtown', 'fremont', 'strip']);
  });
  it('each zone polygon has at least 3 vertices', () => {
    for (const z of HOT_ZONES) expect(z.polygon.length).toBeGreaterThanOrEqual(3);
  });
  it('each zone has demand multiplier >= 1', () => {
    for (const z of HOT_ZONES) expect(z.demandMultiplier).toBeGreaterThanOrEqual(1);
  });
});

describe('zone detection', () => {
  const stripPoint = { lat: 36.1147, lng: -115.1728 }; // ~Bellagio
  const fremontPoint = { lat: 36.1705, lng: -115.1420 };
  const desertPoint = { lat: 36.5000, lng: -115.5000 }; // out in the desert

  it('detects Strip', () => {
    expect(getZoneAt(stripPoint.lat, stripPoint.lng)?.id).toBe('strip');
  });
  it('detects Fremont among zones at that point', () => {
    const ids = getAllZonesAt(fremontPoint.lat, fremontPoint.lng).map((z) => z.id);
    expect(ids).toContain('fremont');
    // Fremont sits inside the Downtown polygon, so both are expected here.
    expect(ids).toContain('downtown');
  });
  it('returns null off-map', () => {
    expect(getZoneAt(desertPoint.lat, desertPoint.lng)).toBeNull();
  });
  it('zoneDemandMultiplier returns 1 outside all zones', () => {
    expect(zoneDemandMultiplier(desertPoint.lat, desertPoint.lng)).toBe(1);
  });
  it('zoneDemandMultiplier picks the maximum for overlapping zones', () => {
    // Construct a synthetic point inside two test zones with different multipliers.
    const a = { id: 'z-a' as const, name: 'A', polygon: [
      { lat: 0, lng: 0 }, { lat: 0, lng: 10 }, { lat: 10, lng: 10 }, { lat: 10, lng: 0 },
    ], demandMultiplier: 1.2, description: '' };
    const b = { id: 'z-b' as const, name: 'B', polygon: [
      { lat: 2, lng: 2 }, { lat: 2, lng: 8 }, { lat: 8, lng: 8 }, { lat: 8, lng: 2 },
    ], demandMultiplier: 1.7, description: '' };
    expect(zoneDemandMultiplier(5, 5, [a as any, b as any])).toBe(1.7);
  });
  it('getAllZonesAt returns at least Fremont at the Fremont point', () => {
    expect(getAllZonesAt(fremontPoint.lat, fremontPoint.lng).map((z) => z.id))
      .toEqual(expect.arrayContaining(['fremont']));
  });
});

describe('centroid', () => {
  it('centroidOf returns average of vertices', () => {
    const c = centroidOf([
      { lat: 0, lng: 0 },
      { lat: 0, lng: 10 },
      { lat: 10, lng: 10 },
      { lat: 10, lng: 0 },
    ]);
    expect(c.lat).toBe(5);
    expect(c.lng).toBe(5);
  });
  it('getCentroid prefers explicit centroid when present', () => {
    const z = {
      id: 'strip' as const,
      name: 'X',
      polygon: [{ lat: 0, lng: 0 }, { lat: 0, lng: 1 }, { lat: 1, lng: 1 }],
      demandMultiplier: 1,
      centroid: { lat: 99, lng: 99 },
      description: '',
    };
    expect(getCentroid(z)).toEqual({ lat: 99, lng: 99 });
  });
});
