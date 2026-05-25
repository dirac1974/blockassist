// SAFETY-001: register a background task that ticks the safety state
// machine while the phone is locked.
//
// expo-task-manager runs a JS function periodically while the app is
// backgrounded. The function persists the next session state to
// expo-secure-store so the UI can pick it up on next foreground.
//
// Limitations (documented for Mobile Lead):
//   - iOS background-fetch is best-effort; intervals can stretch to
//     hours under low battery / Low Power Mode.
//   - Android requires the FOREGROUND_SERVICE permission (already in
//     app.json) and an active "Trip" notification for reliable wakeups.
//   - This is a soft escalation. For hard SOS (call 911 / page
//     emergency contacts) the user MUST act inside the app; we do
//     not auto-dial.

import * as TaskManager from 'expo-task-manager';
import { setItemAsync, getItemAsync } from 'expo-secure-store';
import { SafetySession, tickSafetyStatus } from './night-mode';

export const SAFETY_BACKGROUND_TASK = 'blockassist.safety.background-tick';
const KEY_SAFETY_SESSION = 'blockassist:safety-session:v1';

/**
 * Register the safety background task. Idempotent — re-registering with
 * the same name is a no-op in expo-task-manager.
 *
 * The task body reads the persisted session, applies tickSafetyStatus,
 * and writes the result back. If no session is persisted, it exits early.
 */
export function registerSafetyBackgroundTask(): void {
  if (TaskManager.isTaskDefined(SAFETY_BACKGROUND_TASK)) return;
  TaskManager.defineTask(SAFETY_BACKGROUND_TASK, async () => {
    const raw = await getItemAsync(KEY_SAFETY_SESSION);
    if (!raw) return;
    const parsed = safeParseSession(raw);
    if (!parsed) return;
    const next = tickSafetyStatus(parsed);
    if (next === parsed) return; // no transition; nothing to write.
    await setItemAsync(KEY_SAFETY_SESSION, JSON.stringify(next));
  });
}

/** Persist the active session so the background task can read + advance it. */
export async function persistSafetySession(session: SafetySession): Promise<void> {
  await setItemAsync(KEY_SAFETY_SESSION, JSON.stringify(session));
}

/** Load and parse the persisted session (or null). */
export async function loadPersistedSafetySession(): Promise<SafetySession | null> {
  const raw = await getItemAsync(KEY_SAFETY_SESSION);
  if (!raw) return null;
  return safeParseSession(raw);
}

/** Clear the persisted session. */
export async function clearPersistedSafetySession(): Promise<void> {
  await setItemAsync(KEY_SAFETY_SESSION, '');
}

export function safeParseSession(raw: string): SafetySession | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!parsed || typeof parsed !== 'object') return null;
  const s = parsed as Record<string, unknown>;
  if (typeof s.startedAt !== 'number') return null;
  if (typeof s.lastCheckInAt !== 'number') return null;
  if (typeof s.status !== 'string') return null;
  if (!isValidStatus(s.status)) return null;
  if (!Array.isArray(s.emergencyContacts)) return null;
  return {
    startedAt: s.startedAt,
    lastCheckInAt: s.lastCheckInAt,
    status: s.status,
    emergencyContacts: s.emergencyContacts.filter((c): c is string => typeof c === 'string'),
    tripNote: typeof s.tripNote === 'string' ? s.tripNote : undefined,
  };
}

function isValidStatus(v: string): v is SafetySession['status'] {
  return v === 'inactive' || v === 'active' || v === 'late' || v === 'sos';
}
