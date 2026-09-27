// app/(store)/product/[slug]/page.tsx
import { createServerSupabase } from '@/lib/supabase/server';
import { PRODUCT_SELECT, mapProduct } from '@/lib/supabase/store-mapper';
import { loadProductRatings } from '@/lib/supabase/reviews-server';
import ProductClient from './product-client';
import TrackView from '@/components/analytics/TrackView';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createServerSupabase();

  // Accept URL-encoded slugs and tolerate historic slugs with spaces:
  // try the raw value plus a dash-normalized variant.
  // (Next usually decodes params already; the try/catch covers a
  // literal % surviving into the slug, which must not 500 the page.)
  let decoded: string;
  try {
    decoded = decodeURIComponent(slug).trim();
  } catch {
    decoded = slug.trim();
  }
  const candidates = [...new Set([slug, decoded, decoded.replace(/\s+/g, '-')])].filter(Boolean);

  const { data: product } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .in('slug', candidates)
    .eq('is_active', true)
    .single();

  if (!product) notFound();

  const { data: relatedProducts } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('category_id', product.category_id)
    .eq('is_active', true)
    .neq('id', product.id)
    .order('created_at', { ascending: false })
    .limit(6);

  // Complete-the-look: cross-category outfit companions (IKEA-style),
  // distinct from same-category Related. Prefer trending across other
  // categories so a jeans PDP surfaces tees/sneakers, not more jeans.
  const { data: completeLookRaw } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('is_active', true)
    .neq('id', product.id)
    .neq('category_id', product.category_id)
    .order('is_trending', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(6);

  // Real ratings/reviews from the reviews table (empty until 008_reviews.sql runs).
  const { summary, reviews } = await loadProductRatings(supabase, product.id);

  return (
    <>
      <TrackView type="product_view" productId={product.id} metadata={{ slug }} />
      <ProductClient
        product={mapProduct(product)}
        relatedProducts={(relatedProducts ?? []).map(mapProduct)}
        completeLookProducts={(completeLookRaw ?? []).map(mapProduct)}
        initialRating={summary}
        initialReviews={reviews}
      />
    </>
  );
}
