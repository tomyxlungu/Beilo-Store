import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/api/admin-auth';
import { loadProductRatings } from '@/lib/supabase/reviews-server';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function digits(value: string): string {
  return value.replace(/\D/g, '');
}

/** Phone spellings that may appear in orders (as-typed, digits, +digits). */
function phoneQueryForms(phone: string): string[] {
  const raw = phone.trim().replace(/[,'()\\]/g, '');
  const d = digits(raw).replace(/[,'()\\]/g, '');
  const forms = [raw, d, `+${d}`].filter((p) => p.length >= 7);
  return [...new Set(forms)];
}

/**
 * True when this phone number actually bought this product:
 * orders.customer_phone → order_items → (variant.product_id OR product_name match).
 * The name fallback matters because checkout does not always send variant_id.
 */
async function hasRealPurchase(
  phone: string | null,
  productId: string,
  productName: string
): Promise<boolean> {
  if (!phone) return false;

  const forms = phoneQueryForms(phone);
  if (forms.length === 0) return false;
  const orExpr = forms.map((p) => `customer_phone.eq.${p}`).join(',');

  const { data: orders, error } = await supabaseAdmin()
    .from('orders')
    .select('id')
    .or(orExpr)
    .limit(50);
  if (error || !orders || orders.length === 0) return false;

  const { data: items, error: itemsError } = await supabaseAdmin()
    .from('order_items')
    .select('variant_id, product_name, variants(product_id)')
    .in('order_id', orders.map((o) => o.id));
  if (itemsError || !items) return false;

  const targetName = productName.trim().toLowerCase();
  return items.some((item) => {
    const variant = item.variants as { product_id?: string } | { product_id?: string }[] | null;
    const variantProductId = Array.isArray(variant)
      ? variant[0]?.product_id
      : variant?.product_id;
    if (variantProductId && variantProductId === productId) return true;
    return (item.product_name || '').trim().toLowerCase() === targetName;
  });
}

/**
 * GET /api/reviews?product_id=<uuid>&phone=<optional viewer phone>
 * Returns the real rating summary, the latest reviews, and whether
 * the current viewer has actually bought this product.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get('product_id') || '';
  const phone = searchParams.get('phone');

  if (!UUID_RE.test(productId)) {
    return NextResponse.json({ error: 'product_id query param required' }, { status: 400 });
  }

  try {
    const { summary, reviews, available } = await loadProductRatings(supabaseAdmin(), productId);

    let viewerVerified = false;
    if (phone) {
      const { data: product } = await supabaseAdmin()
        .from('products')
        .select('name')
        .eq('id', productId)
        .single();
      viewerVerified = await hasRealPurchase(phone, productId, product?.name ?? '');
    }

    return NextResponse.json({ summary, reviews, viewerVerified, available });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error && err.message ? err.message : 'Could not load reviews.' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/reviews — submit a review.
 * verified = true only when the phone number really ordered this product.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const productId = typeof body.product_id === 'string' ? body.product_id : '';
    const name = typeof body.name === 'string' ? body.name.trim().slice(0, 60) : '';
    const title = typeof body.title === 'string' ? body.title.trim().slice(0, 240) : '';
    const phone = typeof body.phone === 'string' ? body.phone.trim().slice(0, 30) : '';
    const rating = Math.round(Number(body.rating));

    if (!UUID_RE.test(productId)) {
      return NextResponse.json({ error: 'Unknown product.' }, { status: 400 });
    }
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Please pick a rating from 1 to 5.' }, { status: 400 });
    }
    if (title.length < 3) {
      return NextResponse.json({ error: 'Please write a short review (min 3 characters).' }, { status: 400 });
    }

    const { data: product } = await supabaseAdmin()
      .from('products')
      .select('id, name, is_active')
      .eq('id', productId)
      .single();
    if (!product || !product.is_active) {
      return NextResponse.json({ error: 'This product is no longer available.' }, { status: 404 });
    }

    // Real dedupe: one review per phone per product.
    if (phone) {
      const forms = phoneQueryForms(phone);
      const { data: existing } = await supabaseAdmin()
        .from('reviews')
        .select('id')
        .eq('product_id', productId)
        .or(forms.map((p) => `customer_phone.eq.${p}`).join(','))
        .limit(1);
      if (existing && existing.length > 0) {
        return NextResponse.json({ error: 'You have already reviewed this product.' }, { status: 409 });
      }
    }

    const verified = await hasRealPurchase(phone || null, productId, product.name);

    const { data: created, error: insertError } = await supabaseAdmin()
      .from('reviews')
      .insert({
        product_id: productId,
        customer_name: name || 'Anonymous',
        customer_phone: phone || null,
        rating,
        title,
        verified,
      })
      .select('id, product_id, customer_name, rating, title, verified, created_at')
      .single();

    if (insertError) {
      if (insertError.code === '23505') {
        return NextResponse.json({ error: 'You have already reviewed this product.' }, { status: 409 });
      }
      const missingTable =
        insertError.code === '42P01' ||
        insertError.code === 'PGRST205' ||
        /could not find the table/i.test(insertError.message ?? '');
      if (missingTable) {
        // Migration 008_reviews.sql not applied yet.
        return NextResponse.json({ error: 'Reviews are not enabled yet on this store.' }, { status: 503 });
      }
      throw insertError;
    }

    const { summary } = await loadProductRatings(supabaseAdmin(), productId);

    return NextResponse.json(
      {
        review: {
          id: created.id,
          productId: created.product_id,
          name: created.customer_name || 'Anonymous',
          rating: Number(created.rating),
          title: created.title,
          verified: !!created.verified,
          createdAt: created.created_at,
        },
        summary,
      },
      { status: 201 }
    );
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error && err.message ? err.message : 'Could not save your review.' },
      { status: 500 }
    );
  }
}
