'use client';

/**
 * Real review data comes from Supabase via /api/reviews.
 * There is no fabricated/slug-hash rating anywhere in this module:
 * a product with no reviews honestly reports 0/0.
 */

export interface ProductReview {
  id: string;
  productId: string;
  name: string;
  rating: number;
  title: string;
  verified: boolean;
  createdAt: string;
}

export interface RatingSummary {
  rating: number;
  count: number;
}

export interface RatingsPayload {
  summary: RatingSummary;
  reviews: ProductReview[];
  viewerVerified: boolean;
  available: boolean;
}

export const EMPTY_SUMMARY: RatingSummary = { rating: 0, count: 0 };

/** Real rating summary + latest reviews (+ whether the viewer actually bought it). */
export async function fetchRatings(
  productId: string,
  phone?: string
): Promise<RatingsPayload> {
  const params = new URLSearchParams({ product_id: productId });
  if (phone) params.set('phone', phone);
  try {
    const res = await fetch(`/api/reviews?${params.toString()}`, {
      cache: 'no-store',
    });
    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();
    return {
      summary: data.summary ?? EMPTY_SUMMARY,
      reviews: data.reviews ?? [],
      viewerVerified: !!data.viewerVerified,
      available: data.available !== false,
    };
  } catch {
    // Table missing / API down: honest empty state, never fake numbers.
    return { summary: EMPTY_SUMMARY, reviews: [], viewerVerified: false, available: false };
  }
}

export interface SubmitReviewInput {
  productId: string;
  name: string;
  title: string;
  rating: number;
  phone?: string;
}

/**
 * Submit a review. The server marks `verified` only when the phone
 * number really appears on an order containing this product.
 */
export async function submitReview(
  input: SubmitReviewInput
): Promise<{ review: ProductReview; summary: RatingSummary }> {
  const res = await fetch('/api/reviews', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      product_id: input.productId,
      name: input.name,
      title: input.title,
      rating: input.rating,
      phone: input.phone || null,
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.review) {
    throw new Error(data.error || 'Could not save your review. Please try again.');
  }

  return {
    review: data.review as ProductReview,
    summary: (data.summary as RatingSummary) ?? EMPTY_SUMMARY,
  };
}
