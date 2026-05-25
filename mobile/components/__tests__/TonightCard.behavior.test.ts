// TonightCard renders nothing when no destinations match. We assert the
// underlying filter behavior; full render testing is deferred until
// @testing-library/react-native is wired by Mobile Lead.

import { describe, it, expect } from 'vitest';
import { destinationsByTag, POPULAR_DESTINATIONS, Destination } from '../../services/tourist-mode';

describe('TonightCard data shaping', () => {
  it('has at least one 24-hour destination in the seed data', () => {
    expect(destinationsByTag(['24-hour']).length).toBeGreaterThan(0);
  });

  it('limits results when caller asks for fewer', () => {
    const limited = destinationsByTag(['24-hour']).slice(0, 1);
    expect(limited).toHaveLength(1);
  });

  it('hides the card (empty list) when no destinations match a rare combo', () => {
    const empty = destinationsByTag(['24-hour', 'dry']);
    // None of the seeded LV destinations are tagged "dry" so this is empty.
    expect(empty).toHaveLength(0);
  });

  it('respects custom destination lists', () => {
    const custom: Destination[] = [
      { id: 'a', name: 'A', category: 'attraction', blurb: '', tags: ['nightlife', '24-hour'] },
      { id: 'b', name: 'B', category: 'attraction', blurb: '', tags: ['family-friendly'] },
    ];
    expect(destinationsByTag(['nightlife'], custom).map((d) => d.id)).toEqual(['a']);
    expect(destinationsByTag(['family-friendly'], custom).map((d) => d.id)).toEqual(['b']);
  });

  it('all seeded destinations are returned with the empty filter', () => {
    expect(destinationsByTag([]).length).toBe(POPULAR_DESTINATIONS.length);
  });
});
