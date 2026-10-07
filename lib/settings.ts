import type { SupabaseClient } from '@supabase/supabase-js';

export interface PublicSettings {
  storeName: string;
  storeDescription: string;
  whatsappNumber: string;
  headerAnnouncement: string;
  headerAnnouncementHref: string;
}

export const DEFAULT_SETTINGS: PublicSettings = {
  storeName: 'BEILO',
  storeDescription: "Zambia's online fashion destination",
  whatsappNumber: '260971234567',
  headerAnnouncement: '',
  headerAnnouncementHref: '/shop',
};

/** Settings values may be stored as plain strings or JSON-encoded strings. */
export function normalizeSettingValue(value: unknown): string {
  if (value == null) return '';
  if (typeof value === 'string') {
    const trimmed = value.trim();
    // Unwrap JSON-encoded strings like '"BEILO"' (seed script stores JSON.stringify).
    if (
      trimmed.length >= 2 &&
      trimmed.startsWith('"') &&
      trimmed.endsWith('"')
    ) {
      try {
        const parsed: unknown = JSON.parse(trimmed);
        return typeof parsed === 'string' ? parsed : trimmed;
      } catch {
        return value;
      }
    }
    return value;
  }
  if (typeof value === 'number') return String(value);
  return '';
}

/** Digits only — suitable for wa.me links. */
export function toWhatsAppDigits(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  return digits || DEFAULT_SETTINGS.whatsappNumber;
}

export async function getPublicSettings(
  supabase: SupabaseClient
): Promise<PublicSettings> {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('key, value')
      .in('key', ['store_name', 'store_description', 'whatsapp_number', 'header_announcement', 'header_announcement_href']);
    if (error || !data) return DEFAULT_SETTINGS;
    const map = new Map(data.map((row) => [row.key, row.value]));
    const storeName =
      normalizeSettingValue(map.get('store_name')) ||
      DEFAULT_SETTINGS.storeName;
    const storeDescription =
      normalizeSettingValue(map.get('store_description')) ||
      DEFAULT_SETTINGS.storeDescription;
    const whatsappRaw =
      normalizeSettingValue(map.get('whatsapp_number')) ||
      DEFAULT_SETTINGS.whatsappNumber;
    return {
      storeName,
      storeDescription,
      whatsappNumber: toWhatsAppDigits(whatsappRaw),
      headerAnnouncement: normalizeSettingValue(map.get('header_announcement')),
      headerAnnouncementHref:
        normalizeSettingValue(map.get('header_announcement_href')) ||
        DEFAULT_SETTINGS.headerAnnouncementHref,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

// Short in-memory cache so every serverless invocation doesn't pay
// a Supabase round-trip for data that rarely changes. Per-instance;
// safe because settings are public and identical for all visitors.
let _cache: { at: number; data: PublicSettings } | null = null;
const SETTINGS_TTL_MS = 60_000;

export async function getCachedPublicSettings(
  supabase: SupabaseClient
): Promise<PublicSettings> {
  if (_cache && Date.now() - _cache.at < SETTINGS_TTL_MS) return _cache.data;
  const data = await getPublicSettings(supabase);
  _cache = { at: Date.now(), data };
  return data;
}
