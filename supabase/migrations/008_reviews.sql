-- ============================================
-- 008_reviews.sql — Real product reviews & rating aggregates
-- ============================================
-- Public reads happen through the anon key (RLS SELECT policy);
-- writes go only through the service-role API (/api/reviews).

CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL DEFAULT '',
  customer_phone TEXT,
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title TEXT NOT NULL DEFAULT '',
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reviews_product_created
  ON reviews(product_id, created_at DESC);

-- One review per phone number per product (real dedupe).
CREATE UNIQUE INDEX IF NOT EXISTS uidx_reviews_product_phone
  ON reviews(product_id, lower(coalesce(customer_phone, '')))
  WHERE customer_phone IS NOT NULL AND customer_phone <> '';

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read reviews" ON reviews;
CREATE POLICY "Public read reviews" ON reviews
  FOR SELECT USING (true);

-- Denormalised per-product aggregate: one cheap query for the PDP.
CREATE OR REPLACE VIEW product_rating_summary
WITH (security_invoker = true) AS
SELECT
  product_id,
  ROUND(AVG(rating)::numeric, 1) AS avg_rating,
  COUNT(*)::bigint AS review_count
FROM reviews
GROUP BY product_id;

GRANT SELECT ON product_rating_summary TO anon, authenticated;
GRANT SELECT ON reviews TO anon, authenticated;
