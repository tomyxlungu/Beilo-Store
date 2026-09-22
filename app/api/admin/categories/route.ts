import { NextRequest, NextResponse } from 'next/server';
import { requireOwner, supabaseAdmin } from '@/lib/api/admin-auth';

export async function GET(request: NextRequest) {
  const { user, error } = await requireOwner(request);
  if (error) return error;

  try {
    const { data, error: qError } = await supabaseAdmin
      .from('categories')
      .select('*')
      .order('name');

    if (qError) throw qError;

    return NextResponse.json({ categories: data ?? [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { user, error } = await requireOwner(request);
  if (error) return error;

  try {
    const body = await request.json();
    const { name, slug, image } = body;

    if (!name) {
      return NextResponse.json({ error: 'name is required' }, { status: 400 });
    }

    const { data, error: insError } = await supabaseAdmin
      .from('categories')
      .insert({
        name,
        slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        image: image || null,
      })
      .select('id')
      .single();

    if (insError) throw insError;

    return NextResponse.json({ category: { id: data.id } }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const { user, error } = await requireOwner(request);
  if (error) return error;

  try {
    const body = await request.json();
    const { id, name, slug, image } = body;

    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

    const updatePayload: any = {};
    if (name !== undefined) updatePayload.name = name;
    if (slug !== undefined) updatePayload.slug = slug;
    if (image !== undefined) updatePayload.image = image;

    const { error: uError } = await supabaseAdmin
      .from('categories')
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
    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

    const { error: dError } = await supabaseAdmin.from('categories').delete().eq('id', id);
    if (dError) throw dError;

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
