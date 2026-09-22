-- ============================================
-- Order code helper (for the public checkout API)
-- Run this in Supabase Dashboard → SQL Editor.
-- BEI-1001, BEI-1002, ... via the order_code_seq
-- sequence created in 004_rebuild_schema.sql.
-- ============================================

CREATE OR REPLACE FUNCTION next_order_code()
RETURNS TEXT AS $$
  SELECT 'BEI-' || nextval('order_code_seq');
$$ LANGUAGE sql;
