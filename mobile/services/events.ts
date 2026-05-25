import { supabase } from '../lib/supabase';

// LV-003: Real-time Event Integration
// Note: Real Eventbrite/Ticketmaster integration is ON HOLD. Using mock + Supabase for now.

export interface Event {
  id: string;
  title: string;
  venue: string;
  startTime: string;
  endTime: string;
  location: { lat: number; lng: number };
  category: 'concert' | 'conference' | 'sports' | 'festival';
}

// Mock Las Vegas events (replace with real API later)
export const MOCK_LAS_VEGAS_EVENTS: Event[] = [
  {
    id: 'evt-001',
    title: 'EDC Las Vegas 2026',
    venue: 'Las Vegas Motor Speedway',
    startTime: '2026-05-25T20:00:00Z',
    endTime: '2026-05-26T04:00:00Z',
    location: { lat: 36.2719, lng: -115.0101 },
    category: 'festival',
  },
  {
    id: 'evt-002',
    title: 'CES 2027 Tech Conference',
    venue: 'Las Vegas Convention Center',
    startTime: '2026-05-26T09:00:00Z',
    endTime: '2026-05-26T18:00:00Z',
    location: { lat: 36.1327, lng: -115.1515 },
    category: 'conference',
  },
  {
    id: 'evt-003',
    title: 'Raiders vs Chiefs (Preseason)',
    venue: 'Allegiant Stadium',
    startTime: '2026-05-27T19:00:00Z',
    endTime: '2026-05-27T22:30:00Z',
    location: { lat: 36.0908, lng: -115.1833 },
    category: 'sports',
  },
];

export async function fetchUpcomingEvents(): Promise<Event[]> {
  // TODO: Replace with real Eventbrite / Ticketmaster API (ON HOLD)
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .gte('startTime', new Date().toISOString())
    .order('startTime', { ascending: true })
    .limit(10);

  if (error || !data || data.length === 0) {
    return MOCK_LAS_VEGAS_EVENTS; // Fallback to mock
  }
  return data;
}

export function isEventActive(event: Event): boolean {
  const now = new Date();
  return new Date(event.startTime) <= now && new Date(event.endTime) >= now;
}

export function getEventBoostRadius(): number {
  return 2000; // 2km boost radius
}

export function shouldBoostAssistant(userLat: number, userLng: number, event: Event): boolean {
  const distance = Math.sqrt(
    Math.pow(userLat - event.location.lat, 2) + Math.pow(userLng - event.location.lng, 2)
  ) * 111000; // rough meters
  return distance <= getEventBoostRadius();
}