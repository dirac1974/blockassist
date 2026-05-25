// LV-002: Las Vegas Strip & Downtown Hot Zones.
//
// Coordinates approximate the named zones with simple convex polygons.
// Not survey-grade — accurate enough for "is this user near a hot zone?"
// decisions. Refine with city GIS data once available.
//
// Demand multipliers are placeholders; Tokenomics will calibrate against
// real order volume once the pilot has data.

export type ZoneId =
  | 'strip'
  | 'downtown'
  | 'fremont'
  | 'airport'
  | 'allegiant'
  | 'convention-center';

export interface HotZone {
  id: ZoneId;
  name: string;
  /** Closed polygon (last point need NOT repeat the first; algorithm closes it). */
  polygon: Array<{ lat: number; lng: number }>;
  /** Base demand multiplier (1.0 = neutral). */
  demandMultiplier: number;
  /** Optional centroid for UI display. Computed if absent. */
  centroid?: { lat: number; lng: number };
  /** Free-form description for tooltips. */
  description: string;
}

export const HOT_ZONES: HotZone[] = [
  {
    id: 'strip',
    name: 'Las Vegas Strip',
    polygon: [
      // South tip near Mandalay Bay → north tip near Sahara, both narrow rectangles around Las Vegas Blvd.
      { lat: 36.0900, lng: -115.1780 },
      { lat: 36.0900, lng: -115.1680 },
      { lat: 36.1450, lng: -115.1620 },
      { lat: 36.1450, lng: -115.1720 },
    ],
    demandMultiplier: 1.5,
    description: 'The Strip — highest sustained tourist density, peak demand evenings and weekends.',
  },
  {
    id: 'downtown',
    name: 'Downtown Las Vegas',
    polygon: [
      { lat: 36.1620, lng: -115.1500 },
      { lat: 36.1620, lng: -115.1340 },
      { lat: 36.1780, lng: -115.1340 },
      { lat: 36.1780, lng: -115.1500 },
    ],
    demandMultiplier: 1.3,
    description: 'Downtown — secondary tourist core + local-resident demand.',
  },
  {
    id: 'fremont',
    name: 'Fremont Street Experience',
    polygon: [
      { lat: 36.1690, lng: -115.1460 },
      { lat: 36.1690, lng: -115.1380 },
      { lat: 36.1720, lng: -115.1380 },
      { lat: 36.1720, lng: -115.1460 },
    ],
    demandMultiplier: 1.4,
    description: 'Fremont Street — pedestrian-only, very high evening foot traffic.',
  },
  {
    id: 'airport',
    name: 'Harry Reid International Airport',
    polygon: [
      { lat: 36.0700, lng: -115.1700 },
      { lat: 36.0700, lng: -115.1450 },
      { lat: 36.0950, lng: -115.1450 },
      { lat: 36.0950, lng: -115.1700 },
    ],
    demandMultiplier: 1.25,
    description: 'LAS airport — arrivals/departures with predictable demand spikes.',
  },
  {
    id: 'allegiant',
    name: 'Allegiant Stadium',
    polygon: [
      { lat: 36.0855, lng: -115.1880 },
      { lat: 36.0855, lng: -115.1780 },
      { lat: 36.0955, lng: -115.1780 },
      { lat: 36.0955, lng: -115.1880 },
    ],
    demandMultiplier: 1.6,
    description: 'Allegiant Stadium — game-day spikes (Raiders, concerts).',
  },
  {
    id: 'convention-center',
    name: 'Las Vegas Convention Center',
    polygon: [
      { lat: 36.1290, lng: -115.1550 },
      { lat: 36.1290, lng: -115.1480 },
      { lat: 36.1370, lng: -115.1480 },
      { lat: 36.1370, lng: -115.1550 },
    ],
    demandMultiplier: 1.45,
    description: 'Convention Center — major conferences (CES, etc.) drive multi-day demand.',
  },
];

/**
 * Ray-casting point-in-polygon. Returns true if (lat, lng) is strictly inside
 * the polygon. Behaviour on edges is unspecified but consistent.
 */
export function pointInPolygon(
  lat: number,
  lng: number,
  polygon: Array<{ lat: number; lng: number }>,
): boolean {
  if (polygon.length < 3) return false;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].lng, yi = polygon[i].lat;
    const xj = polygon[j].lng, yj = polygon[j].lat;
    const intersect =
      yi > lat !== yj > lat &&
      lng < ((xj - xi) * (lat - yi)) / (yj - yi + 1e-12) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

/** Returns the zone the user is in (first match) or null. */
export function getZoneAt(lat: number, lng: number, zones: HotZone[] = HOT_ZONES): HotZone | null {
  for (const z of zones) {
    if (pointInPolygon(lat, lng, z.polygon)) return z;
  }
  return null;
}

/** Returns all zones containing the point. Some zones overlap (e.g. fremont ⊂ downtown). */
export function getAllZonesAt(lat: number, lng: number, zones: HotZone[] = HOT_ZONES): HotZone[] {
  return zones.filter((z) => pointInPolygon(lat, lng, z.polygon));
}

/**
 * Aggregate demand multiplier: the maximum of all containing zones.
 * Maximum (not product) so overlapping zones don't compound unfairly.
 */
export function zoneDemandMultiplier(
  lat: number,
  lng: number,
  zones: HotZone[] = HOT_ZONES,
): number {
  const inside = getAllZonesAt(lat, lng, zones);
  if (inside.length === 0) return 1;
  return inside.reduce((acc, z) => Math.max(acc, z.demandMultiplier), 1);
}

/** Centroid of a polygon — simple average. Used for UI placement. */
export function centroidOf(polygon: Array<{ lat: number; lng: number }>): { lat: number; lng: number } {
  const sum = polygon.reduce((acc, p) => ({ lat: acc.lat + p.lat, lng: acc.lng + p.lng }), { lat: 0, lng: 0 });
  return { lat: sum.lat / polygon.length, lng: sum.lng / polygon.length };
}

/** Cached centroid lookup. */
export function getCentroid(zone: HotZone): { lat: number; lng: number } {
  return zone.centroid ?? centroidOf(zone.polygon);
}
