import { beforeEach, describe, expect, it } from 'vitest';
// @ts-expect-error: mock module path resolves via vitest alias
import { __reset } from 'expo-secure-store';
import {
  MAX_EMERGENCY_CONTACTS,
  clearEmergencyContacts,
  clearTouristPrefs,
  isValidPhone,
  loadEmergencyContacts,
  loadTouristPrefs,
  parseEmergencyContacts,
  parseTouristPrefs,
  saveEmergencyContacts,
  saveTouristPrefs,
} from '../secure-store';
import { DEFAULT_TOURIST_PREFS } from '../../services/tourist-mode';

beforeEach(() => {
  __reset();
});

describe('parseTouristPrefs', () => {
  it('parses a valid blob', () => {
    const json = JSON.stringify({ isTourist: true, language: 'es' });
    expect(parseTouristPrefs(json)).toEqual({
      isTourist: true,
      language: 'es',
      arrivalDate: undefined,
      departureDate: undefined,
      hometownCity: undefined,
      lastConfirmedAt: undefined,
    });
  });
  it('returns null on invalid JSON', () => {
    expect(parseTouristPrefs('not-json')).toBeNull();
  });
  it('returns null on missing isTourist', () => {
    expect(parseTouristPrefs(JSON.stringify({ language: 'en' }))).toBeNull();
  });
  it('returns null on bad language', () => {
    expect(parseTouristPrefs(JSON.stringify({ isTourist: true, language: 'fr' }))).toBeNull();
  });
  it('drops unknown fields and preserves optional ones', () => {
    const json = JSON.stringify({ isTourist: true, language: 'zh', hometownCity: 'Tokyo', extra: 'ignore' });
    const parsed = parseTouristPrefs(json);
    expect(parsed?.hometownCity).toBe('Tokyo');
    expect(parsed).not.toHaveProperty('extra');
  });
});

describe('TouristPrefs roundtrip via SecureStore', () => {
  it('returns DEFAULT_TOURIST_PREFS when nothing stored', async () => {
    expect(await loadTouristPrefs()).toEqual(DEFAULT_TOURIST_PREFS);
  });
  it('survives save/load roundtrip', async () => {
    await saveTouristPrefs({ isTourist: true, language: 'es', hometownCity: 'Madrid' });
    expect(await loadTouristPrefs()).toEqual({
      isTourist: true,
      language: 'es',
      hometownCity: 'Madrid',
      arrivalDate: undefined,
      departureDate: undefined,
      lastConfirmedAt: undefined,
    });
  });
  it('falls back to defaults on corrupted data', async () => {
    // Manually plant garbage in the store via the mock.
    const SecureStore = await import('expo-secure-store');
    await SecureStore.setItemAsync('blockassist:tourist-prefs:v1', '{not valid json');
    expect(await loadTouristPrefs()).toEqual(DEFAULT_TOURIST_PREFS);
  });
  it('clear removes the entry', async () => {
    await saveTouristPrefs({ isTourist: true, language: 'en' });
    await clearTouristPrefs();
    expect(await loadTouristPrefs()).toEqual(DEFAULT_TOURIST_PREFS);
  });
});

describe('parseEmergencyContacts', () => {
  it('rejects non-array', () => {
    expect(parseEmergencyContacts(JSON.stringify({ foo: 1 }))).toBeNull();
  });
  it('drops items missing required fields', () => {
    const json = JSON.stringify([
      { id: 'a', name: 'A', phone: '+15551234567' },
      { id: 'b', name: 'B' }, // no phone
      { id: 'c' },             // no name
    ]);
    const out = parseEmergencyContacts(json);
    expect(out?.map((c) => c.id)).toEqual(['a']);
  });
  it('drops items with invalid phone', () => {
    const json = JSON.stringify([
      { id: 'a', name: 'A', phone: '+15551234567' },
      { id: 'b', name: 'B', phone: '123' },
    ]);
    const out = parseEmergencyContacts(json);
    expect(out?.map((c) => c.id)).toEqual(['a']);
  });
  it('caps at MAX_EMERGENCY_CONTACTS', () => {
    const many = Array.from({ length: 10 }, (_, i) => ({ id: `${i}`, name: `c${i}`, phone: '+15551234567' }));
    const out = parseEmergencyContacts(JSON.stringify(many));
    expect(out).toHaveLength(MAX_EMERGENCY_CONTACTS);
  });
});

describe('EmergencyContacts roundtrip', () => {
  it('returns [] when nothing stored', async () => {
    expect(await loadEmergencyContacts()).toEqual([]);
  });
  it('saves and reloads', async () => {
    const list = [{ id: '1', name: 'Mom', phone: '+15551112222' }];
    await saveEmergencyContacts(list);
    expect(await loadEmergencyContacts()).toEqual(list);
  });
  it('save() trims to MAX_EMERGENCY_CONTACTS', async () => {
    const many = Array.from({ length: 5 }, (_, i) => ({ id: `${i}`, name: `c${i}`, phone: '+15551112222' }));
    await saveEmergencyContacts(many);
    expect((await loadEmergencyContacts())).toHaveLength(MAX_EMERGENCY_CONTACTS);
  });
  it('clear removes the entry', async () => {
    await saveEmergencyContacts([{ id: '1', name: 'X', phone: '+15551112222' }]);
    await clearEmergencyContacts();
    expect(await loadEmergencyContacts()).toEqual([]);
  });
});

describe('isValidPhone', () => {
  it('accepts E.164 format', () => {
    expect(isValidPhone('+15551234567')).toBe(true);
    expect(isValidPhone('+442071234567')).toBe(true);
  });
  it('accepts 10-digit US after stripping punctuation', () => {
    expect(isValidPhone('(555) 123-4567')).toBe(true);
    expect(isValidPhone('555.123.4567')).toBe(true);
  });
  it('rejects empties and too-short strings', () => {
    expect(isValidPhone('')).toBe(false);
    expect(isValidPhone('+123')).toBe(false);
    expect(isValidPhone('555')).toBe(false);
  });
  it('rejects E.164 with non-digit body', () => {
    expect(isValidPhone('+1abc1234567')).toBe(false);
  });
});
