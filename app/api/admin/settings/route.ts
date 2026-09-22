import { NextRequest, NextResponse } from 'next/server';
import { requireOwner, supabaseAdmin } from '@/lib/api/admin-auth';

export async function GET(request: NextRequest) {
  const { user, error } = await requireOwner(request);
  if (error) return error;

  try {
    const { data, error: qError } = await supabaseAdmin
      .from('settings')
      .select('*')
      .order('key');

    if (qError) throw qError;

    const settings: Record<string, any> = {};
    for (const row of data ?? []) {
      settings[row.key] = row.value;
    }

    return NextResponse.json({ settings });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const { user, error } = await requireOwner(request);
  if (error) return error;

  try {
    const body = await request.json();
    const { key, value } = body;

    if (!key) {
      return NextResponse.json({ error: 'key is required' }, { status: 400 });
    }

    const { error: upsertError } = await supabaseAdmin
      .from('settings')
      .upsert({ key, value }, { onConflict: 'key' });

    if (upsertError) throw upsertError;

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
