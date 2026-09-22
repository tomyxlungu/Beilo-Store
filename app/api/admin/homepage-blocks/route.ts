import { NextRequest, NextResponse } from 'next/server';
import { requireOwner, supabaseAdmin } from '@/lib/api/admin-auth';

export async function GET(request: NextRequest) {
  const { user, error } = await requireOwner(request);
  if (error) return error;

  try {
    const { data, error: qError } = await supabaseAdmin()
      .from('homepage_blocks')
      .select('*')
      .order('sort_order');

    if (qError) throw qError;

    return NextResponse.json({ blocks: data ?? [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { user, error } = await requireOwner(request);
  if (error) return error;

  try {
    const body = await request.json();
    const { type, title, content, sort_order, active } = body;

    if (!type || !title) {
      return NextResponse.json({ error: 'type and title are required' }, { status: 400 });
    }

    const validTypes = ['hero', 'quick_link', 'announcement'];
    if (!validTypes.includes(type)) {
      return NextResponse.json({ error: `Invalid type. Must be one of: ${validTypes.join(', ')}` }, { status: 400 });
    }

    const { data, error: insError } = await supabaseAdmin()
      .from('homepage_blocks')
      .insert({
        type,
        title,
        content: content || {},
        sort_order: sort_order ?? 0,
        active: active ?? true,
      })
      .select('id')
      .single();

    if (insError) throw insError;

    return NextResponse.json({ block: { id: data.id } }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const { user, error } = await requireOwner(request);
  if (error) return error;

  try {
    const body = await request.json();
    const { id, type, title, content, sort_order, active } = body;

    if (!id) {
      return NextResponse.json({ error: 'Block id is required' }, { status: 400 });
    }

    const updatePayload: any = {};
    if (type !== undefined) updatePayload.type = type;
    if (title !== undefined) updatePayload.title = title;
    if (content !== undefined) updatePayload.content = content;
    if (sort_order !== undefined) updatePayload.sort_order = sort_order;
    if (active !== undefined) updatePayload.active = active;

    const { error: uError } = await supabaseAdmin()
      .from('homepage_blocks')
      .update(updatePayload)
      .eq('id', id);

    if (uError) throw uError;

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const { user, error } = await requireOwner(request);
  if (error) return error;

  try {
    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: 'Block id is required' }, { status: 400 });

    const { error: dError } = await supabaseAdmin().from('homepage_blocks').delete().eq('id', id);
    if (dError) throw dError;

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
