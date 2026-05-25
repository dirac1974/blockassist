// Mobile lib/format.ts tests. Pure functions; run under any vitest/jest-compatible
// runner. No React/RN imports — safe to run in node.

import { describe, it, expect } from 'vitest';
import { formatUsdc, timeAgo, formatRemaining } from '../format';

describe('formatUsdc', () => {
  it('formats whole dollars', () => {
    expect(formatUsdc(0)).toBe('$0.00 USDC');
    expect(formatUsdc(100)).toBe('$1.00 USDC');
    expect(formatUsdc(150_000)).toBe('$1500.00 USDC');
  });
  it('rounds half-cents to nearest cent (toFixed default)', () => {
    expect(formatUsdc(125)).toBe('$1.25 USDC');
  });
});

describe('timeAgo', () => {
  const now = 1_700_000_000_000;
  it('handles "just now"', () => {
    expect(timeAgo(now - 1_000, now)).toBe('just now');
  });
  it('handles minutes', () => {
    expect(timeAgo(now - 5 * 60_000, now)).toBe('5 minutes ago');
  });
  it('handles hours', () => {
    expect(timeAgo(now - 3 * 3_600_000, now)).toBe('3 hours ago');
  });
  it('handles days', () => {
    expect(timeAgo(now - 2 * 24 * 3_600_000, now)).toBe('2 days ago');
  });
  it('handles weeks', () => {
    expect(timeAgo(now - 14 * 24 * 3_600_000, now)).toBe('2 weeks ago');
  });
});

describe('formatRemaining', () => {
  const now = 1_700_000_000_000;
  it('returns "now" for past or current', () => {
    expect(formatRemaining(now, now)).toBe('now');
    expect(formatRemaining(now - 1_000, now)).toBe('now');
  });
  it('formats minutes', () => {
    expect(formatRemaining(now + 30 * 60_000, now)).toBe('30m');
  });
  it('formats hours + minutes', () => {
    expect(formatRemaining(now + 2 * 3_600_000 + 15 * 60_000, now)).toBe('2h 15m');
  });
  it('formats days + hours', () => {
    expect(formatRemaining(now + 3 * 24 * 3_600_000 + 4 * 3_600_000, now)).toBe('3d 4h');
  });
});
