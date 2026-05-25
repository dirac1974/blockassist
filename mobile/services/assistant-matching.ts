// MOBILE-004: AssistantMatching service.
//
// Unifies the three LV multipliers (LV-001 event boost, LV-002 zone surge,
// LV-005 night boost) behind one entry point so the future server-side
// matching engine can implement the same contract.
//
// **Gameability boundary**: every input to this service is client-supplied
// (location is from the device, events are read from a cached/mock source,
// the clock is `new Date()`). A determined user can fake any of them. The
// matching engine running on the server MUST recompute these factors from
// authoritative sources before any payout-affecting decision. Use this
// service for UI surge displays and ranking *hints*, not for money.

import { Event, computeEventBoost } from './events';
import { zoneDemandMultiplier } from './hot-zones';
import { nightlifeBoostFor } from './night-mode';

/** Hard upper bound on the combined surge multiplier. Tokenomics owns this number. */
export const COMPOUND_SURGE_CAP = 3.5;

/** Default weight applied to the event-boost score when composing the multiplier. */
export const DEFAULT_EVENT_BOOST_WEIGHT = 0.5;

export interface MatchingContext {
  /** User's current coordinates (or a defensible default — never trust as authoritative). */
  userLat: number;
  userLng: number;
  /** Active and upcoming events to consider (filter happens inside). */
  events: Event[];
  /** Override the clock for tests / replay. */
  now?: Date;
  /** How much weight to give the event boost. Default 0.5. */
  eventBoostWeight?: number;
  /** Hard cap on the combined surge. Default `COMPOUND_SURGE_CAP`. */
  cap?: number;
}

export interface MatchingResult {
  /** Final multiplier; the matching engine multiplies the assistant's base score by this. */
  effectiveSurge: number;
  /** Pre-cap surge — used to detect when the cap clipped the value. */
  rawSurge: number;
  /** True when `rawSurge > cap`. */
  capped: boolean;
  /** Component-by-component breakdown. */
  components: {
    zone: number;
    eventFactor: number;
    night: number;
    /** Underlying event boost details for explainability. */
    eventBoost: ReturnType<typeof computeEventBoost>;
  };
}

/**
 * Compute the effective surge multiplier for a user position at a given
 * time. Pure function — replay-safe by passing `now`.
 */
export function computeAssistantMatching(ctx: MatchingContext): MatchingResult {
  const now = ctx.now ?? new Date();
  const eventBoostWeight = ctx.eventBoostWeight ?? DEFAULT_EVENT_BOOST_WEIGHT;
  const cap = ctx.cap ?? COMPOUND_SURGE_CAP;

  const zone = zoneDemandMultiplier(ctx.userLat, ctx.userLng);
  const eventBoost = computeEventBoost(ctx.userLat, ctx.userLng, ctx.events, now);
  const eventFactor = 1 + eventBoostWeight * eventBoost.score;
  const night = nightlifeBoostFor(now);
  const rawSurge = zone * eventFactor * night;
  const effectiveSurge = Math.min(cap, rawSurge);
  const capped = rawSurge > cap;

  return {
    effectiveSurge,
    rawSurge,
    capped,
    components: { zone, eventFactor, night, eventBoost },
  };
}

/**
 * Apply the matching multiplier to an assistant's base score. Server-side
 * code uses this directly once it re-validates the inputs.
 */
export function applyMatchingMultiplier(baseScore: number, ctx: MatchingContext): {
  score: number;
  result: MatchingResult;
} {
  const result = computeAssistantMatching(ctx);
  return { score: baseScore * result.effectiveSurge, result };
}

/**
 * Contract every matching-engine implementation (client UI / server / future
 * on-chain crank) must satisfy. Future server code will `implements` this.
 */
export interface MatchingEngine {
  /** Pure surge math. */
  computeMatching(ctx: MatchingContext): MatchingResult;
  /** Apply a base score to surge. */
  applyMultiplier(baseScore: number, ctx: MatchingContext): { score: number; result: MatchingResult };
}

export const ClientMatchingEngine: MatchingEngine = {
  computeMatching: computeAssistantMatching,
  applyMultiplier: applyMatchingMultiplier,
};
