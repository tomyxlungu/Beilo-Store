import type { SupabaseClient } from '@supabase/supabase-js';

export interface RatingSummary {
  rating: number;
  count: number;
}

export interface ReviewDTO {
  id: string;
  productId: string;
  name: string;
  rating: number;
  title: string;
  verified: boolean;
  createdAt: string;
}

export const EMPTY_SUMMARY: RatingSummary = { rating: 0, count: 0 };

/**
 * Real rating aggregate + latest reviews for a product.
 * Reads are public (RLS SELECT policy on reviews + product_rating_summary view).
 * If migration 008_reviews.sql has not been applied yet, returns an honest
 * empty summary with `available: false` instead of failing the page.
 */
export async function loadProductRatings(
  client: SupabaseClient,
  productId: string
): Promise<{ summary: RatingSummary; reviews: ReviewDTO[]; available: boolean }> {
  // 1. Prefer the denormalised SQL view (avg + count in one query).
  let summary = EMPTY_SUMMARY;
  let available = false;

  const { data: viewRow, error: viewError } = await client
    .from('product_rating_summary')
    .select('avg_rating, review_count')
    .eq('product_id', productId)
    .maybeSingle();

  if (!viewError && viewRow) {
    summary = {
      rating: Number(viewRow.avg_rating) || 0,
      count: Number(viewRow.review_count) || 0,
    };
    available = true;
  } else {
    // 2. Fallback: compute from raw rows (still real data).
    const { data: rows, error } = await client
      .from('reviews')
      .select('rating')
      .eq('product_id', productId)
      .limit(2000);

    if (!error) {
      available = true;
      const ratings = (rows ?? []).map((r) => Number(r.rating));
      if (ratings.length > 0) {
        const avg = ratings.reduce((s, r) => s + r, 0) / ratings.length;
        summary = { rating: Math.round(avg * 10) / 10, count: ratings.length };
      }
    }
  }

  // 3. Latest 12 reviews.
  const { data: reviewRows, error: reviewsError } = await client
    .from('reviews')
    .select('id, product_id, customer_name, rating, title, verified, created_at')
    .eq('product_id', productId)
    .order('created_at', { ascending: false })
    .limit(12);

  const reviews: ReviewDTO[] =
    !reviewsError && reviewRows
      ? reviewRows.map((r) => ({
          id: r.id,
          productId: r.product_id,
          name: r.customer_name || 'Anonymous',
          rating: Number(r.rating),
          title: r.title,
          verified: !!r.verified,
          createdAt: r.created_at,
        }))
      : [];

  return { summary, reviews, available };
}
