import { describe, it, expect } from 'vitest';
import {
  Destination,
  POPULAR_DESTINATIONS,
  TIPPING_GUIDE,
  destinationsByTag,
  suggestTips,
} from '../tourist-mode';

describe('suggestTips', () => {
  it('returns percent-based suggestion for a $100 order', () => {
    const sugg = suggestTips(TIPPING_GUIDE, 100, 1);
    const server = sugg.find((s) => s.service === 'Restaurant server');
    expect(server).toBeDefined();
    expect(server!.low).toBe(18);
    expect(server!.high).toBe(22);
    expect(server!.mid).toBe(20);
    expect(server!.mode).toBe('percent');
  });

  it('multiplies flat tips by quantity', () => {
    const sugg = suggestTips(TIPPING_GUIDE, 0, 4);
    const bartender = sugg.find((s) => s.service === 'Bartender');
    expect(bartender).toBeDefined();
    expect(bartender!.low).toBe(4); // $1 × 4 drinks
    expect(bartender!.high).toBe(8);
    expect(bartender!.mid).toBe(6);
    expect(bartender!.mode).toBe('flat');
    expect(bartender!.unit).toBe('drink');
  });

  it('rounds to two decimal places', () => {
    const sugg = suggestTips(TIPPING_GUIDE, 33.33, 1);
    const server = sugg.find((s) => s.service === 'Restaurant server')!;
    // 18% of 33.33 = 5.9994 → 6.00
    expect(server.low).toBe(6.0);
    expect(server.high).toBe(7.33);
  });

  it('rejects negative order amounts (treats as 0)', () => {
    const sugg = suggestTips(TIPPING_GUIDE, -50, 1);
    const server = sugg.find((s) => s.service === 'Restaurant server')!;
    expect(server.low).toBe(0);
    expect(server.high).toBe(0);
  });

  it('treats quantity < 1 as 1', () => {
    const sugg = suggestTips(TIPPING_GUIDE, 0, 0);
    const bartender = sugg.find((s) => s.service === 'Bartender')!;
    expect(bartender.low).toBe(1);
    expect(bartender.high).toBe(2);
  });
});

describe('destinationsByTag', () => {
  it('returns all destinations when no filters provided', () => {
    expect(destinationsByTag([])).toHaveLength(POPULAR_DESTINATIONS.length);
  });

  it('filters by single tag', () => {
    const family = destinationsByTag(['family-friendly']);
    expect(family.length).toBeGreaterThan(0);
    expect(family.every((d) => d.tags?.includes('family-friendly'))).toBe(true);
  });

  it('intersects multiple tags (ALL semantics)', () => {
    const both = destinationsByTag(['24-hour', 'outdoor']);
    expect(both.every((d) => d.tags?.includes('24-hour') && d.tags?.includes('outdoor'))).toBe(true);
  });

  it('returns nightlife results that include Fremont', () => {
    const nl = destinationsByTag(['nightlife']);
    expect(nl.map((d) => d.id)).toContain('d-fremont-st');
  });

  it('returns 24-hour results that include airport rideshare', () => {
    const tf = destinationsByTag(['24-hour']);
    expect(tf.map((d) => d.id)).toContain('d-rideshare');
    expect(tf.map((d) => d.id)).toContain('d-fremont-st');
  });

  it('does not filter destinations without tags', () => {
    const custom: Destination[] = [
      { id: 'd-test', name: 'X', category: 'attraction', blurb: '...' },
    ];
    expect(destinationsByTag(['outdoor'], custom)).toHaveLength(0);
  });
});
