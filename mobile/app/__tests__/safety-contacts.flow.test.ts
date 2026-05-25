// MANAGE-001: contacts UI is React Native. Full RTL render is deferred.
// Here we test the storage flow the screen drives, end-to-end.

import { beforeEach, describe, expect, it } from 'vitest';
// @ts-expect-error: mock module path resolves via vitest alias
import { __reset } from 'expo-secure-store';
import {
  MAX_EMERGENCY_CONTACTS,
  loadEmergencyContacts,
  saveEmergencyContacts,
} from '../../lib/secure-store';

beforeEach(() => { __reset(); });

describe('add-flow: empty → 1 → 2 → 3 → blocked', () => {
  it('grows up to MAX then stays at MAX even if caller tries to push more', async () => {
    let list = await loadEmergencyContacts();
    expect(list).toEqual([]);

    for (let i = 1; i <= 5; i++) {
      list = [...list, { id: `c-${i}`, name: `c${i}`, phone: '+15551112222' }];
      await saveEmergencyContacts(list);
    }
    // Reload — secure-store layer caps at MAX_EMERGENCY_CONTACTS.
    const reloaded = await loadEmergencyContacts();
    expect(reloaded.length).toBe(MAX_EMERGENCY_CONTACTS);
    expect(reloaded[0]?.id).toBe('c-1');
  });
});

describe('delete-flow: filter by id and persist', () => {
  it('removing a contact survives reload', async () => {
    const initial = [
      { id: 'a', name: 'A', phone: '+15551110001' },
      { id: 'b', name: 'B', phone: '+15551110002' },
      { id: 'c', name: 'C', phone: '+15551110003' },
    ];
    await saveEmergencyContacts(initial);
    const next = initial.filter((c) => c.id !== 'b');
    await saveEmergencyContacts(next);
    const reloaded = await loadEmergencyContacts();
    expect(reloaded.map((c) => c.id)).toEqual(['a', 'c']);
  });
});

describe('add-flow: invalid phone is rejected by the parser on reload', () => {
  it('attempting to save an invalid-phone contact via the parser path drops it', async () => {
    // We can simulate the legacy path by writing raw bytes through the mock.
    const SecureStore = await import('expo-secure-store');
    await SecureStore.setItemAsync(
      'blockassist:emergency-contacts:v1',
      JSON.stringify([
        { id: 'good', name: 'OK', phone: '+15551112222' },
        { id: 'bad', name: 'X', phone: 'definitely-not-a-phone' },
      ]),
    );
    const reloaded = await loadEmergencyContacts();
    expect(reloaded.map((c) => c.id)).toEqual(['good']);
  });
});
