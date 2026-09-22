import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/api/admin-auth';

/**
 * GET /api/stores
 * Public store listing. Returns all active stores.
 */
export async function GET(_request: NextRequest) {
  try {
    const { data, error } = await supabaseAdmin()
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
