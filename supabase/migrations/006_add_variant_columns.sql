-- ============================================
-- Add missing columns to variants table
-- ============================================
ALTER TABLE variants ADD COLUMN IF NOT EXISTS price_override_minor INTEGER;
ALTER TABLE variants ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;
