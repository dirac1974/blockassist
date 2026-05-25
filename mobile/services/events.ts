import { supabase } from '../lib/supabase';

// LV-003: Real-time Event Integration

export interface Event {
  id: string;
  title: string;
  venue: string;
  startTime: string;
  endTime: string;
  location: { lat: number; lng: number };
  category: 'concert' | 'conference' | 'sports' | 'festival';
}

export async function fetchUpcomingEvents(): Promise<Event[]> {
  // TODO: Replace with real Eventbrite / Ticketmaster API
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .gte('startTime', new Date().toISOString())
    .order('startTime', { ascending: true })
    .limit(10);

  if (error) throw error;
  return data || [];
}

export function isEventActive(event: Event): boolean {
  const now = new Date();
  return new Date(event.startTime) <= now && new Date(event.endTime) >= now;
}

export function getEventBoostRadius(event: Event): number {
  // Boost assistants within 2km of event
  return 2000; // meters
}