// LV-004: Tourist Mode.
//
// Pure logic + i18n catalog + saved-preferences shape. UI components import
// what they need from here so the data side is unit-testable.

export type Language = 'en' | 'es' | 'zh';

export const LANGUAGE_LABEL: Record<Language, string> = {
  en: 'English',
  es: 'Español',
  zh: '中文',
};

export interface TouristPrefs {
  isTourist: boolean;
  language: Language;
  arrivalDate?: string;
  departureDate?: string;
  hometownCity?: string;
  /** ISO timestamp of when the user last confirmed the mode. */
  lastConfirmedAt?: string;
}

export const DEFAULT_TOURIST_PREFS: TouristPrefs = {
  isTourist: false,
  language: 'en',
};

// --------------------------------------------------------------------------
// isLikelyTourist heuristic.
// --------------------------------------------------------------------------

export interface TouristSignal {
  /** True if device locale isn't en-US. */
  nonUsLocale?: boolean;
  /** True if the device timezone differs from America/Los_Angeles. */
  nonPacificTimezone?: boolean;
  /** Distance in km from a registered home address (if user has one). */
  distanceFromHomeKm?: number;
  /** True if app first opened within last 24h. */
  newInstall?: boolean;
  /** True if user has a hotel/airport address in their order history. */
  hotelOrAirportPickup?: boolean;
}

/**
 * Returns a 0..1 likelihood that the user is a tourist. The UI uses this as
 * a soft suggestion only — never auto-enables Tourist Mode without user
 * confirmation (consent matters; some locals will look "touristy" otherwise).
 */
export function isLikelyTourist(signal: TouristSignal): number {
  let score = 0;
  let weight = 0;
  const add = (value: boolean | undefined, w: number, contribute: number) => {
    if (value === undefined) return;
    weight += w;
    if (value) score += contribute;
  };
  add(signal.nonUsLocale, 0.20, 0.20);
  add(signal.nonPacificTimezone, 0.15, 0.15);
  add(signal.newInstall, 0.10, 0.10);
  add(signal.hotelOrAirportPickup, 0.25, 0.25);
  if (signal.distanceFromHomeKm !== undefined) {
    weight += 0.30;
    // 0 km → 0, 500 km → 1.0; clamp at 1.
    score += 0.30 * Math.min(1, signal.distanceFromHomeKm / 500);
  }
  if (weight === 0) return 0;
  return Math.min(1, score / weight);
}

// --------------------------------------------------------------------------
// Popular destinations + tipping guide.
// --------------------------------------------------------------------------

export interface Destination {
  id: string;
  name: string;
  category: 'attraction' | 'show' | 'restaurant' | 'tour' | 'transport';
  zone?: string;
  approxLocation?: { lat: number; lng: number };
  blurb: string;
}

export const POPULAR_DESTINATIONS: Destination[] = [
  { id: 'd-bellagio-fountains', name: 'Bellagio Fountains', category: 'attraction', zone: 'strip',
    approxLocation: { lat: 36.1126, lng: -115.1767 },
    blurb: 'Iconic choreographed fountain shows every 15–30 minutes.' },
  { id: 'd-fremont-st', name: 'Fremont Street Experience', category: 'attraction', zone: 'fremont',
    approxLocation: { lat: 36.1705, lng: -115.1420 },
    blurb: 'Pedestrian-only canopy with LED shows and street performers.' },
  { id: 'd-high-roller', name: 'High Roller Observation Wheel', category: 'attraction', zone: 'strip',
    approxLocation: { lat: 36.1175, lng: -115.1685 },
    blurb: '550-foot wheel; 30-minute rotation with city views.' },
  { id: 'd-grand-canyon-tour', name: 'Grand Canyon Day Tour', category: 'tour',
    blurb: 'Coach/helicopter tours depart morning; allow full day.' },
  { id: 'd-hoover-dam', name: 'Hoover Dam Tour', category: 'tour',
    approxLocation: { lat: 36.0161, lng: -114.7377 },
    blurb: 'About 45 minutes from the Strip; tickets recommended in advance.' },
  { id: 'd-cirque-o', name: 'Cirque du Soleil — "O"', category: 'show', zone: 'strip',
    blurb: 'Aquatic theatre at Bellagio.' },
  { id: 'd-rideshare', name: 'Strip ↔ Airport rideshare', category: 'transport',
    blurb: '~$25–40 to/from Harry Reid; surge applies during conventions.' },
];

export interface TippingGuideEntry {
  service: string;
  range: string;
  note?: string;
}

export const TIPPING_GUIDE: TippingGuideEntry[] = [
  { service: 'Restaurant server', range: '18–22%', note: 'Pre-tax. Check for auto-gratuity on parties of 6+.' },
  { service: 'Bartender', range: '$1–2 per drink' },
  { service: 'Cocktail server', range: '$2–5 per round' },
  { service: 'Taxi / rideshare driver', range: '15–20%', note: 'More for help with luggage.' },
  { service: 'Bellhop / porter', range: '$2–5 per bag' },
  { service: 'Housekeeping', range: '$3–5 per night', note: 'Leave daily; staff rotates.' },
  { service: 'Concierge (booking)', range: '$5–20', note: 'More for hard-to-get reservations or show tickets.' },
  { service: 'Valet', range: '$3–5 on retrieval' },
  { service: 'BlockAssist assistant', range: '0–15%', note: 'Built into platform pricing; extra is optional.' },
];

// --------------------------------------------------------------------------
// i18n catalog (tiny — translation work is out of scope right now).
// --------------------------------------------------------------------------

type CatalogKey =
  | 'welcome'
  | 'choose_language'
  | 'enable_tourist_mode'
  | 'popular_destinations'
  | 'tipping_guide'
  | 'tipping_guide_intro'
  | 'continue'
  | 'skip';

export const CATALOG: Record<Language, Record<CatalogKey, string>> = {
  en: {
    welcome: 'Welcome to BlockAssist',
    choose_language: 'Choose your language',
    enable_tourist_mode: 'Enable Tourist Mode',
    popular_destinations: 'Popular destinations',
    tipping_guide: 'Tipping guide',
    tipping_guide_intro: 'Las Vegas runs on tips. Suggested ranges:',
    continue: 'Continue',
    skip: 'Skip',
  },
  es: {
    welcome: 'Bienvenido a BlockAssist',
    choose_language: 'Elige tu idioma',
    enable_tourist_mode: 'Activar Modo Turista',
    popular_destinations: 'Destinos populares',
    tipping_guide: 'Guía de propinas',
    tipping_guide_intro: 'Las Vegas funciona con propinas. Rangos sugeridos:',
    continue: 'Continuar',
    skip: 'Omitir',
  },
  zh: {
    welcome: '欢迎使用 BlockAssist',
    choose_language: '选择您的语言',
    enable_tourist_mode: '开启游客模式',
    popular_destinations: '热门景点',
    tipping_guide: '小费指南',
    tipping_guide_intro: '拉斯维加斯依赖小费。建议范围：',
    continue: '继续',
    skip: '跳过',
  },
};

export function t(language: Language, key: CatalogKey): string {
  return CATALOG[language]?.[key] ?? CATALOG.en[key];
}
