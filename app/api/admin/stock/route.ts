import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, supabaseAdmin } from '@/lib/api/admin-auth';

/**
 * GET /api/admin/stock?store_id=...&product_id=...
 * List stock levels with filters.
 */
export async function GET(request: NextRequest) {
  const { user, error } = await requireAdmin(request);
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const storeId = searchParams.get('store_id');
  const productId = searchParams.get('product_id');
  const lowOnly = searchParams.get('low') === 'true';

  try {
    let query = supabaseAdmin
      .from('stock_levels')
      .select(`
        quantity, variant_id, store_id,
        variants!inner(id, product_id, size, colour, sku, products!inner(id, name, low_stock_threshold)),
        stores!inner(id, name)
      `);

    if (user.role === 'STORE_STAFF' && user.storeId) {
      query = query.eq('store_id', user.storeId);
    } else if (storeId) {
      query = query.eq('store_id', storeId);
    }

    if (productId) {
      query = query.eq('variants.product_id', productId);
    }

    if (lowOnly) {
      query = query.lte('quantity', 10);
    }

    query = query.order('quantity', { ascending: true }).limit(200);

    const { data, error: qError } = await query;
    if (qError) throw qError;

    return NextResponse.json({ stock: data ?? [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * POST /api/admin/stock — Adjust stock level.
 * Body: { variant_id, store_id, delta, reason }
 * delta can be positive (restock) or negative (sell/adjust down).
 */
export async function POST(request: NextRequest) {
  const { user, error } = await requireAdmin(request);
  if (error) return error;

  try {
    const body = await request.json();
    const { variant_id, store_id, delta, reason } = body;

    if (!variant_id || !store_id || delta === undefined) {
      return NextResponse.json({ error: 'variant_id, store_id, and delta are required' }, { status: 400 });
    }

    if (user.role === 'STORE_STAFF' && user.storeId !== store_id) {
      return NextResponse.json({ error: 'Staff can only adjust stock for their own store' }, { status: 403 });
    }

    const { data: current, error: fetchErr } = await supabaseAdmin
      .from('stock_levels')
      .select('quantity')
      .eq('variant_id', variant_id)
      .eq('store_id', store_id)
      .single();

    const currentQty = current?.quantity ?? 0;
    const newQty = currentQty + delta;

    if (newQty < 0) {
      return NextResponse.json({ error: `Insufficient stock. Current: ${currentQty}, adjustment: ${delta}` }, { status: 400 });
    }

    const { error: upsertErr } = await supabaseAdmin
      .from('stock_levels')
      .upsert({
        variant_id,
        store_id,
        quantity: newQty,
      }, { onConflict: 'variant_id,store_id' });

    if (upsertErr) throw upsertErr;

    await supabaseAdmin.from('stock_adjustments').insert({
      variant_id,
      store_id,
      delta,
      reason: reason || 'Manual adjustment',
      user_id: user.id,
    });

    return NextResponse.json({ ok: true, previous: currentQty, current: newQty });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
