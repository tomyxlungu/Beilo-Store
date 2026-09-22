import { NextRequest, NextResponse } from 'next/server';
import { requireOwner, supabaseAdmin } from '@/lib/api/admin-auth';

const PRODUCT_SELECT = `
  *,
  categories!inner(id, name, slug),
  variants(
    id, size, colour, sku,
    stock_levels(quantity, store_id, stores!inner(id, name))
  )
`;

export async function GET(request: NextRequest) {
  const { user, error } = await requireOwner(request);
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50')));
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const offset = (page - 1) * limit;

  try {
    let query = supabaseAdmin
      .from('products')
      .select(PRODUCT_SELECT, { count: 'exact' });

    if (search) {
      query = query.ilike('name', `%${search}%`);
    }
    if (category) {
      query = query.eq('categories.name', category);
    }

    query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);

    const { data, error: qError, count } = await query;
    if (qError) throw qError;

    return NextResponse.json({
      products: data ?? [],
      pagination: { page, limit, total: count ?? 0, totalPages: Math.ceil((count ?? 0) / limit) },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { user, error } = await requireOwner(request);
  if (error) return error;

  try {
    const body = await request.json();
    const { name, slug, description, price_minor, sale_price_minor, category_id, images, low_stock_threshold, is_active, is_trending, is_new_arrival, variants } = body;

    if (!name || !price_minor || !category_id) {
      return NextResponse.json({ error: 'name, price_minor, and category_id are required' }, { status: 400 });
    }

    const { data: product, error: pError } = await supabaseAdmin
      .from('products')
      .insert({
        name,
        slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        description: description || '',
        price_minor,
        sale_price_minor: sale_price_minor || null,
        category_id,
        images: images || [],
        low_stock_threshold: low_stock_threshold || 5,
        is_active: is_active ?? true,
        is_trending: is_trending ?? false,
        is_new_arrival: is_new_arrival ?? false,
      })
      .select('id')
      .single();

    if (pError) throw pError;

    if (variants?.length) {
      const variantRows = variants.map((v: any) => ({
        product_id: product.id,
        size: v.size,
        colour: v.colour,
        sku: v.sku || null,
        price_override_minor: v.price_override_minor || null,
        is_active: v.is_active ?? true,
      }));
      const { data: insertedVariants, error: vError } = await supabaseAdmin
        .from('variants')
        .insert(variantRows)
        .select('id');
      if (vError) throw vError;

      if (insertedVariants) {
        const stockRows: any[] = [];
        for (let i = 0; i < insertedVariants.length; i++) {
          const stock = variants[i].stock || [];
          for (const s of stock) {
            if (s.store_id && s.quantity > 0) {
              stockRows.push({
                variant_id: insertedVariants[i].id,
                store_id: s.store_id,
                quantity: s.quantity,
              });
            }
          }
        }
        if (stockRows.length) {
          const { error: sError } = await supabaseAdmin.from('stock_levels').insert(stockRows);
          if (sError) throw sError;
        }
      }
    }

    return NextResponse.json({ product: { id: product.id } }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const { user, error } = await requireOwner(request);
  if (error) return error;

  try {
    const body = await request.json();
    const { id, name, slug, description, price_minor, sale_price_minor, category_id, images, low_stock_threshold, is_active, is_trending, is_new_arrival, variants } = body;

    if (!id) {
      return NextResponse.json({ error: 'Product id is required' }, { status: 400 });
    }

    const { error: uError } = await supabaseAdmin
      .from('products')
      .update({
        name, slug, description, price_minor, sale_price_minor, category_id,
        images, low_stock_threshold, is_active, is_trending, is_new_arrival,
      })
      .eq('id', id);

    if (uError) throw uError;

    if (variants) {
      const { data: existing } = await supabaseAdmin.from('variants').select('id').eq('product_id', id);
      const existingIds = (existing ?? []).map((v) => v.id);
      const incomingIds = variants.filter((v: any) => v.id).map((v: any) => v.id);
      const toDelete = existingIds.filter((eid) => !incomingIds.includes(eid));

      if (toDelete.length) {
        await supabaseAdmin.from('stock_levels').delete().in('variant_id', toDelete);
        await supabaseAdmin.from('variants').delete().in('id', toDelete);
      }

      for (const v of variants) {
        const variantPayload = {
          product_id: id,
          size: v.size,
          colour: v.colour,
          sku: v.sku || null,
          price_override_minor: v.price_override_minor || null,
          is_active: v.is_active ?? true,
        };

        let variantId: string;
        if (v.id) {
          await supabaseAdmin.from('variants').update(variantPayload).eq('id', v.id);
          variantId = v.id;
        } else {
          const { data, error: insErr } = await supabaseAdmin.from('variants').insert(variantPayload).select('id').single();
          if (insErr) throw insErr;
          variantId = data.id;
        }

        if (v.stock) {
          for (const s of v.stock) {
            await supabaseAdmin.from('stock_levels').upsert({
              variant_id: variantId,
              store_id: s.store_id,
              quantity: s.quantity ?? 0,
            }, { onConflict: 'variant_id,store_id' });
          }
        }
      }
    }

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
    if (!id) return NextResponse.json({ error: 'Product id is required' }, { status: 400 });

    const { error: dError } = await supabaseAdmin.from('products').delete().eq('id', id);
    if (dError) throw dError;

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
