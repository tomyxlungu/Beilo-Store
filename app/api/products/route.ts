import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/api/admin-auth';

const PRODUCT_SELECT = `
  *,
  categories!inner(name, slug),
  variants(
    id, size, colour, sku,
    stock_levels(quantity, store_id, stores!inner(name))
  )
`;

/**
 * GET /api/products
 * Public product listing with pagination, search, category filter.
 * Query params:
 *   - page (default 1)
 *   - limit (default 20, max 100)
 *   - search (fuzzy match on name)
 *   - category (category name)
 *   - sort (newest, price_asc, price_desc, trending)
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')));
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || 'newest';
  const offset = (page - 1) * limit;

  try {
    let query = supabaseAdmin()
      .from('products')
      .select(PRODUCT_SELECT, { count: 'exact' })
      .eq('is_active', true);

    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    if (category) {
      query = query.eq('categories.slug', category);
    }

    switch (sort) {
      case 'price_asc':
        query = query.order('price_minor', { ascending: true });
        break;
      case 'price_desc':
        query = query.order('price_minor', { ascending: false });
        break;
      case 'trending':
        query = query.eq('is_trending', true).order('created_at', { ascending: false });
        break;
      default:
        query = query.order('created_at', { ascending: false });
    }

    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;
    if (error) throw error;

    const products = (data ?? []).map((p: any) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      description: p.description,
      price_minor: p.price_minor,
      sale_price_minor: p.sale_price_minor,
      images: p.images,
      category: p.categories?.name ?? 'Uncategorized',
      is_trending: p.is_trending,
      is_new_arrival: p.is_new_arrival,
      sizes: [...new Set((p.variants ?? []).map((v: any) => v.size).filter(Boolean))],
      created_at: p.created_at,
    }));

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total: count ?? 0,
        totalPages: Math.ceil((count ?? 0) / limit),
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
