import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, supabaseAdmin } from '@/lib/api/admin-auth';

export async function GET(request: NextRequest) {
  const { user, error } = await requireAdmin(request);
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.min(100, parseInt(searchParams.get('limit') || '50'));
  const status = searchParams.get('status') || '';
  const search = searchParams.get('search') || '';
  const offset = (page - 1) * limit;

  try {
    let query = supabaseAdmin()
      .from('orders')
      .select('*, stores!inner(name)', { count: 'exact' });

    if (user.role === 'STORE_STAFF' && user.storeId) {
      query = query.eq('pickup_store_id', user.storeId);
    }

    if (status) query = query.eq('status', status);
    if (search) {
      query = query.or(`customer_name.ilike.%${search}%,customer_phone.ilike.%${search}%,code.ilike.%${search}%`);
    }

    query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);

    const { data, error: qError, count } = await query;
    if (qError) throw qError;

    const orders = (data ?? []).map((o: any) => ({
      ...o,
      store_name: o.stores?.name ?? 'Unknown',
    }));

    return NextResponse.json({
      orders,
      pagination: { page, limit, total: count ?? 0, totalPages: Math.ceil((count ?? 0) / limit) },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const { user, error } = await requireAdmin(request);
  if (error) return error;

  try {
    const body = await request.json();
    const { id, status, cancel_reason } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'id and status are required' }, { status: 400 });
    }

    const validStatuses = ['NEW', 'CONFIRMED', 'READY_FOR_PICKUP', 'COMPLETED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` }, { status: 400 });
    }

    const updatePayload: any = { status };
    if (status === 'CANCELLED') {
      updatePayload.cancel_reason = cancel_reason || null;
    }

    let query = supabaseAdmin().from('orders').update(updatePayload).eq('id', id);

    if (user.role === 'STORE_STAFF' && user.storeId) {
      query = query.eq('pickup_store_id', user.storeId);
    }

    const { error: uError } = await query;
    if (uError) throw uError;

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
