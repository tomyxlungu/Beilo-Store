import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Creates a Supabase server client for use in Server Components,
 * Route Handlers, and Server Actions.
 *
 * @param useServiceRole - Use the service role key (bypasses RLS).
 *   Only use in trusted server contexts (seed script, admin API that
 *   manages users). Never expose this to the client.
 */
export async function createServerSupabase(useServiceRole = false) {
  const cookieStore = await cookies();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = useServiceRole
    ? process.env.SUPABASE_SERVICE_ROLE_KEY!
    : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Ignore errors in Server Components (read-only cookies).
          // This only matters in Route Handlers / Server Actions.
        }
      },
    },
  });
}
