import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let _public: SupabaseClient | null = null;

/**
 * Cookie-free Supabase client for public storefront reads.
 * No `cookies()` call, so using it in a layout does NOT force
 * dynamic rendering — pages stay static / CDN-cacheable.
 * Only use for tables with public SELECT policies (settings, etc.).
 */
export function createPublicSupabase(): SupabaseClient {
  if (!_public) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    _public = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return _public;
}
