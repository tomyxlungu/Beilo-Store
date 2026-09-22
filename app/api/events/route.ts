import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/api/admin-auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, session_id, product_id, metadata } = body;

    if (!type || !session_id) {
      return NextResponse.json({ error: 'type and session_id required' }, { status: 400 });
    }

    const validTypes = ['page_view', 'product_view', 'add_to_bag', 'whatsapp_checkout'];
    if (!validTypes.includes(type)) {
      return NextResponse.json({ error: `Invalid event type. Must be one of: ${validTypes.join(', ')}` }, { status: 400 });
    }

    const { error } = await supabaseAdmin().from('events').insert({
      type,
      session_id,
      product_id: product_id || null,
      metadata: metadata || {},
    });

    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
