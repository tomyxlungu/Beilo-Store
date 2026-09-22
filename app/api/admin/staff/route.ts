import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/api/admin-auth';

/**
 * Verify the request has a valid Bearer token and return the user.
 */
async function verifyAuth(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.split(' ')[1];
  const { data: { user }, error } = await supabaseAdmin().auth.getUser(token);
  if (error || !user) return null;
  return user;
}

/**
 * Check if the authenticated user is OWNER in the users table.
 */
async function requireOwner(request: NextRequest) {
  const user = await verifyAuth(request);
  if (!user) return null;

  const { data: profile } = await supabaseAdmin()
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'OWNER') return null;
  return user;
}

export async function GET(request: NextRequest) {
  const user = await requireOwner(request);
  if (!user) {
    return NextResponse.json({ error: 'Forbidden: owner access required' }, { status: 403 });
  }

  try {
    const { data, error } = await supabaseAdmin()
      .from('users')
      .select('id, name, email, role, store_id, active, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ staff: data ?? [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const user = await requireOwner(request);
  if (!user) {
    return NextResponse.json({ error: 'Forbidden: owner access required' }, { status: 403 });
  }

  try {
    const { email, password, name, role, store_id } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }

    const userRole = role === 'OWNER' ? 'OWNER' : 'STORE_STAFF';

    const { data: authData, error: authError } = await supabaseAdmin().auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role: userRole },
    });
    if (authError) throw authError;

    const { error: profileError } = await supabaseAdmin().from('users').insert({
      id: authData.user.id,
      email,
      name: name || email.split('@')[0],
      role: userRole,
      store_id: store_id || null,
      active: true,
    });
    if (profileError) throw profileError;

    return NextResponse.json({
      staff: { id: authData.user.id, email, name: name || email.split('@')[0], role: userRole },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const user = await requireOwner(request);
  if (!user) {
    return NextResponse.json({ error: 'Forbidden: owner access required' }, { status: 403 });
  }

  try {
    const { userId } = await request.json();
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }
    if (userId === user.id) {
      return NextResponse.json({ error: 'Cannot remove yourself' }, { status: 400 });
    }

    const { error } = await supabaseAdmin().auth.admin.deleteUser(userId);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
