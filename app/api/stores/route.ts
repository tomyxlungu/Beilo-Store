import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/stores
 * Public store listing. Returns all active stores.
 */
export async function GET(_request: NextRequest) {
  try {
    const { data, error } = await supabaseAdmin
      .from('stores')
      .select('id, name, address, phone, whatsapp_number, hours, image, map_url')
      .eq('active', true)
      .order('name');

    if (error) throw error;

    return NextResponse.json({ stores: data ?? [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
