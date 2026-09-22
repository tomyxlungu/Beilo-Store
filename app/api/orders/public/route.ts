import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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
      items,
      notes,
    } = body;

    if (!customer_name || !pickup_store_id || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'customer_name, pickup_store_id, and items are required' },
        { status: 400 }
      );
    }

    const { data: codeRow, error: codeError } = await supabaseAdmin
      .rpc('nextval', { seq: 'order_code_seq' })
      .single();

    let orderCode: string;
    if (codeError) {
      const { count } = await supabaseAdmin
        .from('orders')
        .select('*', { count: 'exact', head: true });
      orderCode = `BEI-${(count ?? 0) + 1001}`;
    } else {
      orderCode = `BEI-${codeRow}`;
    }

    const totalMinor = items.reduce(
      (sum: number, item: any) => sum + (item.unit_price_minor || 0) * (item.quantity || 1),
      0
    );

    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        code: orderCode,
        customer_name,
        customer_phone: customer_phone || null,
        pickup_store_id,
        status: 'NEW',
        total_minor: totalMinor,
        notes: notes || null,
      })
      .select('id, code, status, total_minor, created_at')
      .single();

    if (orderError) throw orderError;

    const orderItems = items.map((item: any) => ({
      order_id: order.id,
      variant_id: item.variant_id || null,
      product_name: item.product_name || item.name,
      unit_price_minor: item.unit_price_minor || 0,
      quantity: item.quantity || 1,
    }));

    const { error: itemsError } = await supabaseAdmin
      .from('order_items')
      .insert(orderItems);

    if (itemsError) throw itemsError;

    return NextResponse.json({ order }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
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
    let query = supabaseAdmin
      .from('orders')
      .select('id, code, customer_name, customer_phone, status, total_minor, created_at, updated_at, stores!inner(name)');

    if (code) {
      query = query.eq('code', code.toUpperCase()).single();
    } else {
      query = query.eq('customer_phone', phone).order('created_at', { ascending: false }).limit(10);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ orders: code ? [data] : data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
