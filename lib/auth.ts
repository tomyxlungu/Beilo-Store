import { createServerSupabase } from '@/lib/supabase/server';
import type { UserRole } from '@/types/database';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  storeId: string | null;
  active: boolean;
}

/**
 * Get the current authenticated user's profile from the users table.
 * Returns null if not authenticated or not in the users table.
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  const supabase = await createServerSupabase();

  const {
    data: { user: authUser },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !authUser) return null;

  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('id, email, role, name, store_id, active')
    .eq('id', authUser.id)
    .single();

  if (profileError || !profile) return null;

  return {
    id: profile.id,
    email: profile.email,
    role: profile.role as UserRole,
    name: profile.name,
    storeId: profile.store_id,
    active: profile.active,
  };
}

/**
 * Get the current user's role. Returns null if not authenticated.
 */
export async function getUserRole(): Promise<UserRole | null> {
  const user = await getCurrentUser();
  return user?.role ?? null;
}

/**
 * Check if the current user is the OWNER.
 */
export async function isOwner(): Promise<boolean> {
  const role = await getUserRole();
  return role === 'OWNER';
}

/**
 * Check if the current user is STORE_STAFF.
 */
export async function isStaff(): Promise<boolean> {
  const role = await getUserRole();
  return role === 'STORE_STAFF';
}

/**
 * Get the current user's store_id. Only meaningful for STORE_STAFF.
 * Returns null for OWNER or if not authenticated.
 */
export async function getMyStoreId(): Promise<string | null> {
  const user = await getCurrentUser();
  return user?.storeId ?? null;
}

/**
 * Require an authenticated OWNER user. Throws if not.
 */
export async function requireOwner(): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');
  if (user.role !== 'OWNER') throw new Error('Forbidden: owner access required');
  return user;
}

/**
 * Require an authenticated user (OWNER or STORE_STAFF). Throws if not.
 */
export async function requireAuth(): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');
  return user;
}
