import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
  storeId: string | null;
}

/**
 * Verify Bearer token and return user profile from the users table.
 * Returns null if unauthorized.
 */
export async function verifyAdmin(request: NextRequest): Promise<AuthenticatedUser | null> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;

  const token = authHeader.split(' ')[1];
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !user) return null;

  const { data: profile } = await supabaseAdmin
    .from('users')
    .select('id, email, role, store_id')
    .eq('id', user.id)
    .single();

  if (!profile) return null;

  return {
    id: profile.id,
    email: profile.email,
    role: profile.role,
    storeId: profile.store_id,
  };
}

/**
 * Require OWNER role. Returns 403 response if not owner.
 */
export async function requireOwner(request: NextRequest) {
  const user = await verifyAdmin(request);
  if (!user) {
    return { user: null, error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }
  if (user.role !== 'OWNER') {
    return { user: null, error: NextResponse.json({ error: 'Forbidden: owner access required' }, { status: 403 }) };
  }
  return { user, error: null };
}

/**
 * Require authenticated admin (OWNER or STORE_STAFF).
 */
export async function requireAdmin(request: NextRequest) {
  const user = await verifyAdmin(request);
  if (!user) {
    return { user: null, error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }
  return { user, error: null };
}

export { supabaseAdmin };
