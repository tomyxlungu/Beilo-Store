import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function generateOrderCode(): Promise<string> {
  // Prefer the DB sequence when the migration has been applied.
  try {
    const { data, error } = await supabaseAdmin.rpc('next_order_code');
    if (!error && typeof data === 'string' && data) return data;
  } catch {
    /* fall through to the retry loop */
  }

  // Fallback: count-based code with retries on unique collisions
  // (e.g. after order deletions leave gaps in the sequence).
  for (let attempt = 0; attempt < 5; attempt++) {
    const { count } = await supabaseAdmin
      .from('orders')
      .select('*', { count: 'exact', head: true });
    const candidate = `BEI-${(count ?? 0) + 1001 + attempt}`;
    const { data: existing } = await supabaseAdmin
      .from('orders')
      .select('id')
      .eq('code', candidate)
      .limit(1);
    if (!existing || existing.length === 0) return candidate;
  }
  // Last resort: timestamp code, always unique.
  return `BEI-${Date.now().toString(36).toUpperCase()}`;
}

/**
 * POST /api/orders/public — Save an order from WhatsApp checkout.
 * Creates order + order_items, then returns the order code.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      customer_name,
      customer_phone,
      pickup_store_id,
      delivery_fee_minor,
      items,
      notes,
    } = body;

    if (!customer_name || typeof customer_name !== 'string' || !customer_name.trim()) {
      return NextResponse.json({ error: 'Please enter your name.' }, { status: 400 });
    }
    if (!pickup_store_id || typeof pickup_store_id !== 'string' || !UUID_RE.test(pickup_store_id)) {
      return NextResponse.json({ error: 'Please choose a valid store.' }, { status: 400 });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Your bag is empty.' }, { status: 400 });
    }

    const feeMinor = Number(delivery_fee_minor) || 0;
    if (!Number.isFinite(feeMinor) || feeMinor < 0) {
      return NextResponse.json({ error: 'Invalid delivery fee.' }, { status: 400 });
    }

    // The store must exist (and be active) — otherwise the
    // foreign key fails with a cryptic error.
    const { data: store, error: storeError } = await supabaseAdmin
      .from('stores')
      .select('id, active')
      .eq('id', pickup_store_id)
      .single();
    if (storeError || !store) {
      return NextResponse.json({ error: 'The selected store is no longer available. Please choose another.' }, { status: 400 });
    }

    let itemsTotal = 0;
    const orderItems = [];
    for (const item of items) {
      const name = typeof item.product_name === 'string' ? item.product_name.trim() : '';
      const unit = Number(item.unit_price_minor);
      const qty = Math.floor(Number(item.quantity));
      if (!name) {
        return NextResponse.json({ error: 'An item in your bag has no name. Please re-add it.' }, { status: 400 });
      }
      if (!Number.isFinite(unit) || unit < 0 || !Number.isFinite(qty) || qty < 1) {
        return NextResponse.json({ error: `Invalid price or quantity for "${name}". Please re-add it.` }, { status: 400 });
      }
      itemsTotal += Math.round(unit) * qty;
      orderItems.push({
        variant_id: typeof item.variant_id === 'string' && UUID_RE.test(item.variant_id) ? item.variant_id : null,
        product_name: name,
        unit_price_minor: Math.round(unit),
        quantity: qty,
      });
    }

    const totalMinor = itemsTotal + Math.round(feeMinor);
    const orderCode = await generateOrderCode();

    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        code: orderCode,
        customer_name: customer_name.trim(),
        customer_phone: typeof customer_phone === 'string' && customer_phone.trim() ? customer_phone.trim() : null,
        pickup_store_id,
        status: 'NEW',
        total_minor: totalMinor,
        notes: typeof notes === 'string' && notes.trim() ? notes.trim() : null,
      })
      .select('id, code, status, total_minor, created_at')
      .single();

    if (orderError) throw orderError;

    const { error: itemsError } = await supabaseAdmin
      .from('order_items')
      .insert(orderItems.map((item) => ({ ...item, order_id: order.id })));

    if (itemsError) throw itemsError;

    return NextResponse.json({ order }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Could not save your order.' }, { status: 500 });
  }
}

/**
 * GET /api/orders/public?code=BEI-1001 or ?phone=097...
 * Look up order status by code or phone.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const phone = searchParams.get('phone');

  if (!code && !phone) {
    return NextResponse.json({ error: 'code or phone query param required' }, { status: 400 });
  }

  try {
    const selectCols = 'id, code, customer_name, customer_phone, status, total_minor, created_at, updated_at, stores!inner(name)';

    if (code) {
      const { data, error } = await supabaseAdmin
        .from('orders')
        .select(selectCols)
        .eq('code', code.toUpperCase())
        .single();
      if (error) throw error;
      return NextResponse.json({ orders: [data] });
    }

    const { data, error } = await supabaseAdmin
      .from('orders')
      .select(selectCols)
      .eq('customer_phone', phone)
      .order('created_at', { ascending: false })
      .limit(10);
    if (error) throw error;

    return NextResponse.json({ orders: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
