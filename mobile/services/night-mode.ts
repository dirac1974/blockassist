// LV-005: Late-Night / Nightlife Focus.
//
// Logic is split from UI so it is unit-testable. Time-of-day detection,
// theme colors, assistant-availability boost, and a small "buddy"
// safety-state machine.

export const NIGHT_START_HOUR = 22; // 10pm
export const NIGHT_END_HOUR = 5; // 5am
export const NIGHTLIFE_BOOST_MULTIPLIER = 1.4;
export const CHECK_IN_INTERVAL_MIN = 20;
export const SOS_AUTO_TRIGGER_MIN = 10;

/**
 * Returns true if `at` falls in the night window [NIGHT_START_HOUR..NIGHT_END_HOUR].
 * The window crosses midnight, which is the only subtlety here.
 */
export function isNightTime(at: Date = new Date()): boolean {
  const h = at.getHours();
  if (NIGHT_START_HOUR <= NIGHT_END_HOUR) {
    return h >= NIGHT_START_HOUR && h < NIGHT_END_HOUR;
  }
  // Window spans midnight (the default 22..5).
  return h >= NIGHT_START_HOUR || h < NIGHT_END_HOUR;
}

/**
 * Nightlife availability boost: assistants who are online during the
 * night window are surfaced more aggressively (because supply is thinner).
 */
export function nightlifeBoostFor(at: Date = new Date()): number {
  return isNightTime(at) ? NIGHTLIFE_BOOST_MULTIPLIER : 1;
}

export interface NightTheme {
  background: string;
  surface: string;
  text: string;
  textMuted: string;
  accent: string;
  border: string;
  status: 'light' | 'dark';
}

export const LIGHT_THEME: NightTheme = {
  background: '#ffffff',
  surface: '#ffffff',
  text: '#111111',
  textMuted: '#555555',
  accent: '#1a73e8',
  border: '#e5e7eb',
  status: 'light',
};

export const DARK_THEME: NightTheme = {
  background: '#0d1117',
  surface: '#161b22',
  text: '#e6edf3',
  textMuted: '#8b949e',
  accent: '#58a6ff',
  border: '#30363d',
  status: 'dark',
};

export function themeFor(at: Date = new Date()): NightTheme {
  return isNightTime(at) ? DARK_THEME : LIGHT_THEME;
}

// --------------------------------------------------------------------------
// Safety state machine.
// --------------------------------------------------------------------------

export type SafetyStatus = 'inactive' | 'active' | 'late' | 'sos';

export interface SafetySession {
  startedAt: number;
  /** Last user check-in time (epoch ms). */
  lastCheckInAt: number;
  /** Status as of the most recent transition. */
  status: SafetyStatus;
  /** Friendly contact phone numbers (no PII storage on chain). */
  emergencyContacts: string[];
  /** Plain-text trip description shared with contacts on activation. */
  tripNote?: string;
}

export function startSession(now: number = Date.now(), emergencyContacts: string[] = [], tripNote?: string): SafetySession {
  return {
    startedAt: now,
    lastCheckInAt: now,
    status: 'active',
    emergencyContacts: [...emergencyContacts],
    tripNote,
  };
}

export function checkIn(session: SafetySession, now: number = Date.now()): SafetySession {
  return { ...session, lastCheckInAt: now, status: 'active' };
}

/**
 * Returns the new session state given the current time. Transitions:
 *
 *   active → late   when (now - lastCheckIn) >= CHECK_IN_INTERVAL_MIN min
 *   late   → sos    when (now - lastCheckIn) >= CHECK_IN_INTERVAL_MIN + SOS_AUTO_TRIGGER_MIN min
 *   sos    → sos    (sticky; only user can clear)
 *
 * This function is pure — the UI calls it on a timer and persists the result.
 */
export function tickSafetyStatus(session: SafetySession, now: number = Date.now()): SafetySession {
  if (session.status === 'inactive') return session;
  const elapsedMin = (now - session.lastCheckInAt) / 60_000;
  let next: SafetyStatus = session.status;
  if (session.status === 'sos') {
    next = 'sos'; // sticky
  } else if (elapsedMin >= CHECK_IN_INTERVAL_MIN + SOS_AUTO_TRIGGER_MIN) {
    next = 'sos';
  } else if (elapsedMin >= CHECK_IN_INTERVAL_MIN) {
    next = 'late';
  } else {
    next = 'active';
  }
  return next === session.status ? session : { ...session, status: next };
}

export function endSession(session: SafetySession): SafetySession {
  return { ...session, status: 'inactive' };
}

export function triggerSOS(session: SafetySession): SafetySession {
  return { ...session, status: 'sos' };
}

export interface SafetyTickInfo {
  minutesSinceCheckIn: number;
  minutesUntilLate: number;
  minutesUntilSos: number;
}

export function safetyTimings(session: SafetySession, now: number = Date.now()): SafetyTickInfo {
  const elapsedMin = (now - session.lastCheckInAt) / 60_000;
  return {
    minutesSinceCheckIn: elapsedMin,
    minutesUntilLate: Math.max(0, CHECK_IN_INTERVAL_MIN - elapsedMin),
    minutesUntilSos: Math.max(0, CHECK_IN_INTERVAL_MIN + SOS_AUTO_TRIGGER_MIN - elapsedMin),
  };
}
