import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

let _client: SupabaseClient | null = null;

/**
 * Creates (once) the browser Supabase client. Called lazily on first
 * use — never at module scope — so static prerendering can't crash
 * when env vars are absent at build time.
 */
function real(): SupabaseClient {
  if (!_client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) {
      throw new Error(
        'Missing Supabase env vars (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY).'
      );
    }
    _client = createBrowserClient(url, key);
  }
  return _client;
}

/**
 * Shared browser client. Module evaluation never touches env vars:
 * the real client is created on the first method call, which only
 * happens in effects / event handlers at runtime — never during
 * `next build` prerendering. Use exactly like a normal client:
 *   supabaseBrowser.from('products').select('*')
 */
export const supabaseBrowser: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const value = (real() as unknown as Record<string | symbol, unknown>)[prop];
    return typeof value === 'function'
      ? (value as (...args: unknown[]) => unknown).bind(real())
      : value;
  },
});
