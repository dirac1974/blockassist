import { supabase } from '../lib/supabase';

// LV-001 / LV-003: Event-based matching.
//
// All scoring lives client-side as pure functions so it is unit-testable
// without a runtime. The matching engine will eventually wrap these with
// server-side authority — gameable on its own, so do NOT use client output
// as final authority for payout-affecting decisions.

export type EventCategory = 'concert' | 'conference' | 'sports' | 'festival' | 'nightlife';

export interface Event {
  id: string;
  title: string;
  venue: string;
  startTime: string;
  endTime: string;
  location: { lat: number; lng: number };
  category: EventCategory;
  expectedAttendance?: number;
}

export const MOCK_LAS_VEGAS_EVENTS: Event[] = [
  {
    id: 'evt-001',
    title: 'EDC Las Vegas 2026',
    venue: 'Las Vegas Motor Speedway',
    startTime: '2026-05-25T20:00:00Z',
    endTime: '2026-05-26T04:00:00Z',
    location: { lat: 36.2719, lng: -115.0101 },
    category: 'festival',
    expectedAttendance: 150_000,
  },
  {
    id: 'evt-002',
    title: 'CES 2027 Tech Conference',
    venue: 'Las Vegas Convention Center',
    startTime: '2026-05-26T09:00:00Z',
    endTime: '2026-05-26T18:00:00Z',
    location: { lat: 36.1327, lng: -115.1515 },
    category: 'conference',
    expectedAttendance: 180_000,
  },
  {
    id: 'evt-003',
    title: 'Raiders vs Chiefs (Preseason)',
    venue: 'Allegiant Stadium',
    startTime: '2026-05-27T19:00:00Z',
    endTime: '2026-05-27T22:30:00Z',
    location: { lat: 36.0908, lng: -115.1833 },
    category: 'sports',
    expectedAttendance: 65_000,
  },
];

export async function fetchUpcomingEvents(): Promise<Event[]> {
  // Eventbrite / Ticketmaster integration is ON HOLD. Supabase mirror only.
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .gte('startTime', new Date().toISOString())
    .order('startTime', { ascending: true })
    .limit(20);

  if (error || !data || data.length === 0) {
    return MOCK_LAS_VEGAS_EVENTS;
  }
  return data;
}

// --------------------------------------------------------------------------
// Pure scoring functions — unit-testable.
// --------------------------------------------------------------------------

export const EVENT_BOOST_RADIUS_METERS = 2000;
export const EVENT_LOOKAHEAD_HOURS = 48;
export const EVENT_LOOKBACK_HOURS = 2;

export const CATEGORY_WEIGHT: Record<EventCategory, number> = {
  festival: 1.0,
  sports: 0.85,
  nightlife: 0.8,
  concert: 0.75,
  conference: 0.5,
};

export interface EventBoostResult {
  /** 0..1 — combined boost score; the matching engine multiplies its base score by (1 + N*score) for some N. */
  score: number;
  /** Per-event contributions sorted highest-first; for UI debug + audit trail. */
  contributors: Array<{ eventId: string; eventTitle: string; contribution: number }>;
  /** True if the user is within radius of at least one currently-active event. */
  active: boolean;
}

export function isEventActive(event: Event, now: Date = new Date()): boolean {
  return new Date(event.startTime) <= now && new Date(event.endTime) >= now;
}

/**
 * Filter events that are either currently active or starting within
 * EVENT_LOOKAHEAD_HOURS ahead / EVENT_LOOKBACK_HOURS behind.
 */
export function getActiveAndUpcomingEvents(
  events: Event[],
  now: Date = new Date(),
  lookaheadHours: number = EVENT_LOOKAHEAD_HOURS,
  lookbackHours: number = EVENT_LOOKBACK_HOURS,
): Event[] {
  const t = now.getTime();
  const ahead = t + lookaheadHours * 3_600_000;
  const behind = t - lookbackHours * 3_600_000;
  return events.filter((e) => {
    const start = new Date(e.startTime).getTime();
    const end = new Date(e.endTime).getTime();
    return end >= behind && start <= ahead;
  });
}

/**
 * Approximate distance in meters using equirectangular projection.
 * Sufficient at city scale; not for navigation.
 */
export function distanceMeters(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const R = 6_371_000;
  const x = ((bLng - aLng) * Math.PI / 180) * Math.cos(((aLat + bLat) / 2) * Math.PI / 180);
  const y = (bLat - aLat) * Math.PI / 180;
  return Math.sqrt(x * x + y * y) * R;
}

/** Back-compat: returns true if the user is within boost radius of the given event right now. */
export function shouldBoostAssistant(userLat: number, userLng: number, event: Event): boolean {
  return distanceMeters(userLat, userLng, event.location.lat, event.location.lng) <= EVENT_BOOST_RADIUS_METERS;
}

/**
 * Triangular decay: 1.0 inside the venue, 0.0 at the boost radius, 0 beyond.
 * Avoids the cliff edge of the original on/off behaviour.
 */
export function distanceFactor(distanceM: number, radiusM: number = EVENT_BOOST_RADIUS_METERS): number {
  if (distanceM <= 0) return 1;
  if (distanceM >= radiusM) return 0;
  return 1 - distanceM / radiusM;
}

/**
 * Time factor: 1.0 during the event window, ramps up linearly over the
 * lookahead window, ramps down linearly over the lookback window.
 */
export function timeFactor(
  event: Event,
  now: Date = new Date(),
  lookaheadHours: number = EVENT_LOOKAHEAD_HOURS,
  lookbackHours: number = EVENT_LOOKBACK_HOURS,
): number {
  const t = now.getTime();
  const start = new Date(event.startTime).getTime();
  const end = new Date(event.endTime).getTime();
  if (t >= start && t <= end) return 1;
  if (t < start) {
    const window = lookaheadHours * 3_600_000;
    if (start - t >= window) return 0;
    return 1 - (start - t) / window;
  }
  // t > end
  const window = lookbackHours * 3_600_000;
  if (t - end >= window) return 0;
  return 1 - (t - end) / window;
}

/** Attendance factor scales boost importance for very large events. */
export function attendanceFactor(expectedAttendance?: number): number {
  if (!expectedAttendance || expectedAttendance <= 0) return 0.8;
  // Logarithmic so 1k=0.5 .. 10k=0.7 .. 100k=0.9 .. 200k=1.0 (capped).
  const f = 0.3 + 0.15 * Math.log10(Math.max(1, expectedAttendance));
  return Math.min(1, f);
}

/**
 * Per-event contribution. All four factors multiply, then category weight.
 * Returns 0..1.
 */
export function eventContribution(
  userLat: number,
  userLng: number,
  event: Event,
  now: Date = new Date(),
): number {
  const dist = distanceMeters(userLat, userLng, event.location.lat, event.location.lng);
  const df = distanceFactor(dist);
  if (df === 0) return 0;
  const tf = timeFactor(event, now);
  if (tf === 0) return 0;
  const af = attendanceFactor(event.expectedAttendance);
  const cw = CATEGORY_WEIGHT[event.category] ?? 0.5;
  return df * tf * af * cw;
}

/**
 * Combine contributions from multiple events with diminishing returns so a
 * user near two events doesn't get a stack equal to the sum. Uses
 * 1 - prod(1 - c_i) which is bounded in [0,1] and monotone.
 */
export function computeEventBoost(
  userLat: number,
  userLng: number,
  events: Event[],
  now: Date = new Date(),
): EventBoostResult {
  const candidates = getActiveAndUpcomingEvents(events, now);
  const contributors: Array<{ eventId: string; eventTitle: string; contribution: number }> = [];
  let activeNearby = false;

  for (const e of candidates) {
    const c = eventContribution(userLat, userLng, e, now);
    if (c > 0) {
      contributors.push({ eventId: e.id, eventTitle: e.title, contribution: c });
      if (isEventActive(e, now) && distanceMeters(userLat, userLng, e.location.lat, e.location.lng) <= EVENT_BOOST_RADIUS_METERS) {
        activeNearby = true;
      }
    }
  }

  contributors.sort((a, b) => b.contribution - a.contribution);

  let combined = 0;
  for (const c of contributors) combined = 1 - (1 - combined) * (1 - c.contribution);

  return { score: combined, contributors, active: activeNearby };
}

/**
 * Convenience for the matching engine: returns the multiplier to apply to
 * an assistant's base matching score. multiplierMax tunes how aggressive
 * the boost can get (1.5x by default).
 */
export function computeMatchScore(
  baseScore: number,
  userLat: number,
  userLng: number,
  events: Event[],
  now: Date = new Date(),
  multiplierMax: number = 1.5,
): { score: number; boost: EventBoostResult } {
  const boost = computeEventBoost(userLat, userLng, events, now);
  const multiplier = 1 + (multiplierMax - 1) * boost.score;
  return { score: baseScore * multiplier, boost };
}

/** Legacy export: existing callers may still rely on this. */
export function getEventBoostRadius(): number {
  return EVENT_BOOST_RADIUS_METERS;
}
