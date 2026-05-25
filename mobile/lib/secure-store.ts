// STORE-001: typed wrapper over expo-secure-store.
//
// Two domains right now:
//   - TouristPrefs (LV-004): language, isTourist flag, optional dates + hometown.
//   - EmergencyContacts (LV-005): up to 3 phone numbers + names + relation.
//
// All values are JSON-serialized before storage. Validation lives in the
// parse functions so corrupted writes return null (caller falls back to
// defaults) rather than crashing the app.

import * as SecureStore from 'expo-secure-store';
import { DEFAULT_TOURIST_PREFS, Language, TouristPrefs } from '../services/tourist-mode';

const KEY_TOURIST_PREFS = 'blockassist:tourist-prefs:v1';
const KEY_EMERGENCY_CONTACTS = 'blockassist:emergency-contacts:v1';

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string; // E.164 format expected, validated at write time
  relation?: string;
}

export const MAX_EMERGENCY_CONTACTS = 3;

// --------------------------------------------------------------------------
// Tourist prefs.
// --------------------------------------------------------------------------

export async function loadTouristPrefs(): Promise<TouristPrefs> {
  const raw = await SecureStore.getItemAsync(KEY_TOURIST_PREFS);
  if (!raw) return DEFAULT_TOURIST_PREFS;
  return parseTouristPrefs(raw) ?? DEFAULT_TOURIST_PREFS;
}

export async function saveTouristPrefs(prefs: TouristPrefs): Promise<void> {
  await SecureStore.setItemAsync(KEY_TOURIST_PREFS, JSON.stringify(prefs));
}

export async function clearTouristPrefs(): Promise<void> {
  await SecureStore.deleteItemAsync(KEY_TOURIST_PREFS);
}

export function parseTouristPrefs(raw: string): TouristPrefs | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!parsed || typeof parsed !== 'object') return null;
  const p = parsed as Record<string, unknown>;
  if (typeof p.isTourist !== 'boolean') return null;
  if (!isLanguage(p.language)) return null;
  return {
    isTourist: p.isTourist,
    language: p.language,
    arrivalDate: typeof p.arrivalDate === 'string' ? p.arrivalDate : undefined,
    departureDate: typeof p.departureDate === 'string' ? p.departureDate : undefined,
    hometownCity: typeof p.hometownCity === 'string' ? p.hometownCity : undefined,
    lastConfirmedAt: typeof p.lastConfirmedAt === 'string' ? p.lastConfirmedAt : undefined,
  };
}

function isLanguage(v: unknown): v is Language {
  return v === 'en' || v === 'es' || v === 'zh';
}

// --------------------------------------------------------------------------
// Emergency contacts.
// --------------------------------------------------------------------------

export async function loadEmergencyContacts(): Promise<EmergencyContact[]> {
  const raw = await SecureStore.getItemAsync(KEY_EMERGENCY_CONTACTS);
  if (!raw) return [];
  return parseEmergencyContacts(raw) ?? [];
}

export async function saveEmergencyContacts(contacts: EmergencyContact[]): Promise<void> {
  const trimmed = contacts.slice(0, MAX_EMERGENCY_CONTACTS);
  await SecureStore.setItemAsync(KEY_EMERGENCY_CONTACTS, JSON.stringify(trimmed));
}

export async function clearEmergencyContacts(): Promise<void> {
  await SecureStore.deleteItemAsync(KEY_EMERGENCY_CONTACTS);
}

export function parseEmergencyContacts(raw: string): EmergencyContact[] | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!Array.isArray(parsed)) return null;
  const out: EmergencyContact[] = [];
  for (const item of parsed) {
    if (!item || typeof item !== 'object') continue;
    const c = item as Record<string, unknown>;
    if (typeof c.id !== 'string' || typeof c.name !== 'string' || typeof c.phone !== 'string') continue;
    if (!isValidPhone(c.phone)) continue;
    out.push({
      id: c.id,
      name: c.name,
      phone: c.phone,
      relation: typeof c.relation === 'string' ? c.relation : undefined,
    });
    if (out.length >= MAX_EMERGENCY_CONTACTS) break;
  }
  return out;
}

/**
 * Light phone-format check: E.164-ish (+ then 7–15 digits) OR a domestic
 * 10-digit US number. Permissive on purpose — heavy validation belongs in
 * a vendor library, not here.
 */
export function isValidPhone(phone: string): boolean {
  const trimmed = phone.trim();
  if (/^\+\d{7,15}$/.test(trimmed)) return true;
  if (/^\d{10}$/.test(trimmed.replace(/[^0-9]/g, ''))) return true;
  return false;
}
