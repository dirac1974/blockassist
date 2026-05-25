import { beforeEach, describe, expect, it } from 'vitest';
// @ts-expect-error: mock module path resolves via vitest alias
import * as TaskManager from 'expo-task-manager';
// @ts-expect-error: mock module path resolves via vitest alias
import * as SecureStore from 'expo-secure-store';
import {
  SAFETY_BACKGROUND_TASK,
  clearPersistedSafetySession,
  loadPersistedSafetySession,
  persistSafetySession,
  registerSafetyBackgroundTask,
  safeParseSession,
} from '../safety-background';
import { CHECK_IN_INTERVAL_MIN, SOS_AUTO_TRIGGER_MIN, startSession } from '../night-mode';

beforeEach(() => {
  (TaskManager as { __reset: () => void }).__reset();
  (SecureStore as { __reset: () => void }).__reset();
});

describe('registerSafetyBackgroundTask', () => {
  it('defines the task with the expected name', () => {
    registerSafetyBackgroundTask();
    expect(TaskManager.isTaskDefined(SAFETY_BACKGROUND_TASK)).toBe(true);
  });
  it('is idempotent', () => {
    registerSafetyBackgroundTask();
    registerSafetyBackgroundTask();
    registerSafetyBackgroundTask();
    expect(TaskManager.isTaskDefined(SAFETY_BACKGROUND_TASK)).toBe(true);
  });
});

describe('background task body', () => {
  it('no-ops when there is no persisted session', async () => {
    registerSafetyBackgroundTask();
    await (TaskManager as { __fire: (name: string) => Promise<void> }).__fire(SAFETY_BACKGROUND_TASK);
    expect(await loadPersistedSafetySession()).toBeNull();
  });

  it('escalates active → late once the check-in window passes', async () => {
    registerSafetyBackgroundTask();
    const t0 = Date.now() - CHECK_IN_INTERVAL_MIN * 60_000 - 30_000; // 30s past the window
    await persistSafetySession({ ...startSession(t0), startedAt: t0, lastCheckInAt: t0 });
    await (TaskManager as { __fire: (name: string) => Promise<void> }).__fire(SAFETY_BACKGROUND_TASK);
    const after = await loadPersistedSafetySession();
    expect(after?.status).toBe('late');
  });

  it('escalates active → sos once the late+SOS window passes', async () => {
    registerSafetyBackgroundTask();
    const t0 = Date.now() - (CHECK_IN_INTERVAL_MIN + SOS_AUTO_TRIGGER_MIN) * 60_000 - 60_000;
    await persistSafetySession({ ...startSession(t0), startedAt: t0, lastCheckInAt: t0 });
    await (TaskManager as { __fire: (name: string) => Promise<void> }).__fire(SAFETY_BACKGROUND_TASK);
    const after = await loadPersistedSafetySession();
    expect(after?.status).toBe('sos');
  });

  it('does not regress sos (sticky)', async () => {
    registerSafetyBackgroundTask();
    const s = startSession(Date.now());
    await persistSafetySession({ ...s, status: 'sos' });
    await (TaskManager as { __fire: (name: string) => Promise<void> }).__fire(SAFETY_BACKGROUND_TASK);
    const after = await loadPersistedSafetySession();
    expect(after?.status).toBe('sos');
  });
});

describe('safeParseSession', () => {
  it('parses a valid session', () => {
    const raw = JSON.stringify({
      startedAt: 1, lastCheckInAt: 2, status: 'active',
      emergencyContacts: ['+15551112222'], tripNote: 'walk home',
    });
    const parsed = safeParseSession(raw);
    expect(parsed?.status).toBe('active');
    expect(parsed?.emergencyContacts).toEqual(['+15551112222']);
    expect(parsed?.tripNote).toBe('walk home');
  });

  it('rejects unknown status values', () => {
    const raw = JSON.stringify({
      startedAt: 1, lastCheckInAt: 2, status: 'gibberish', emergencyContacts: [],
    });
    expect(safeParseSession(raw)).toBeNull();
  });

  it('rejects non-numeric timestamps', () => {
    const raw = JSON.stringify({
      startedAt: '1', lastCheckInAt: 2, status: 'active', emergencyContacts: [],
    });
    expect(safeParseSession(raw)).toBeNull();
  });

  it('filters non-string emergency contacts', () => {
    const raw = JSON.stringify({
      startedAt: 1, lastCheckInAt: 2, status: 'active',
      emergencyContacts: ['+15551112222', 42, null, '+12025550000'],
    });
    const parsed = safeParseSession(raw);
    expect(parsed?.emergencyContacts).toEqual(['+15551112222', '+12025550000']);
  });

  it('returns null on garbage JSON', () => {
    expect(safeParseSession('{not valid')).toBeNull();
  });
});

describe('persist/load/clear roundtrip', () => {
  it('null when nothing stored', async () => {
    expect(await loadPersistedSafetySession()).toBeNull();
  });
  it('roundtrips a session', async () => {
    const s = startSession(Date.now(), ['+15551112222'], 'walk home');
    await persistSafetySession(s);
    expect(await loadPersistedSafetySession()).toEqual(s);
  });
  it('clear erases the entry', async () => {
    await persistSafetySession(startSession(Date.now()));
    await clearPersistedSafetySession();
    expect(await loadPersistedSafetySession()).toBeNull();
  });
});
