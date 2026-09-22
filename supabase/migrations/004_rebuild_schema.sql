-- ============================================
-- BEILO Store — Full Schema Rebuild
-- ============================================
-- Drops old tables and recreates with normalized design.
-- Prices stored as INTEGER in ngwee (minor units).
-- K1,250.00 = 125000 stored.
-- ============================================

-- ============================================
-- Drop old tables (in reverse dependency order)
-- ============================================
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS stock_adjustments CASCADE;
DROP TABLE IF EXISTS stock_levels CASCADE;
DROP TABLE IF EXISTS variants CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS homepage_blocks CASCADE;
DROP TABLE IF EXISTS settings CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS stores CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS faqs CASCADE;

-- ============================================
-- Enums
-- ============================================
CREATE TYPE user_role AS ENUM ('OWNER', 'STORE_STAFF');
CREATE TYPE order_status AS ENUM (
  'NEW',
  'CONFIRMED',
  'READY_FOR_PICKUP',
  'COMPLETED',
  'CANCELLED'
);
CREATE TYPE event_type AS ENUM (
  'page_view',
  'product_view',
  'add_to_bag',
  'whatsapp_checkout'
);
CREATE TYPE homepage_block_type AS ENUM (
  'hero',
  'quick_link',
  'announcement'
);

-- ============================================
-- Users (staff / owner)
-- ============================================
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'STORE_STAFF',
  store_id UUID,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- Stores
-- ============================================
CREATE TABLE stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  phone TEXT NOT NULL DEFAULT '',
  whatsapp_number TEXT,
  hours TEXT NOT NULL DEFAULT '',
  image TEXT,
  map_url TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add FK now that stores exists
ALTER TABLE users ADD CONSTRAINT fk_users_store
  FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE SET NULL;

-- ============================================
-- Categories
-- ============================================
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- Products
-- ============================================
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL DEFAULT '',
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  price_minor INTEGER NOT NULL CHECK (price_minor > 0),
  sale_price_minor INTEGER CHECK (sale_price_minor > 0),
  images TEXT[] NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  is_trending BOOLEAN NOT NULL DEFAULT FALSE,
  is_new_arrival BOOLEAN NOT NULL DEFAULT FALSE,
  low_stock_threshold INTEGER NOT NULL DEFAULT 5,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- Variants (size + colour + SKU)
-- ============================================
CREATE TABLE variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  size TEXT NOT NULL DEFAULT '',
  colour TEXT NOT NULL DEFAULT '',
  sku TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_variants_product_id ON variants(product_id);

-- ============================================
-- Stock Levels (per variant per store)
-- ============================================
CREATE TABLE stock_levels (
  variant_id UUID NOT NULL REFERENCES variants(id) ON DELETE CASCADE,
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (variant_id, store_id)
);

CREATE INDEX idx_stock_levels_store_id ON stock_levels(store_id);

-- ============================================
-- Stock Adjustments (audit log)
-- ============================================
CREATE TABLE stock_adjustments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_id UUID NOT NULL REFERENCES variants(id) ON DELETE CASCADE,
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  delta INTEGER NOT NULL,
  reason TEXT NOT NULL DEFAULT '',
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_stock_adjustments_variant ON stock_adjustments(variant_id);
CREATE INDEX idx_stock_adjustments_created ON stock_adjustments(created_at);

-- ============================================
-- Customers
-- ============================================
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL DEFAULT '',
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_customers_phone ON customers(phone) WHERE phone IS NOT NULL AND phone != '';

-- ============================================
-- Orders
-- ============================================
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL DEFAULT '',
  customer_phone TEXT,
  pickup_store_id UUID NOT NULL REFERENCES stores(id) ON DELETE RESTRICT,
  status order_status NOT NULL DEFAULT 'NEW',
  total_minor INTEGER NOT NULL DEFAULT 0 CHECK (total_minor >= 0),
  cancel_reason TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_pickup_store ON orders(pickup_store_id);

-- ============================================
-- Order Items
-- ============================================
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES variants(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  unit_price_minor INTEGER NOT NULL CHECK (unit_price_minor >= 0),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);

-- ============================================
-- Events (analytics)
-- ============================================
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type event_type NOT NULL,
  session_id TEXT NOT NULL DEFAULT '',
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_events_type ON events(type);
CREATE INDEX idx_events_created_at ON events(created_at);
CREATE INDEX idx_events_session ON events(session_id);

-- ============================================
-- Homepage Blocks (CMS)
-- ============================================
CREATE TABLE homepage_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type homepage_block_type NOT NULL,
  title TEXT NOT NULL DEFAULT '',
  content JSONB NOT NULL DEFAULT '{}',
  sort_order INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- Settings (key-value)
-- ============================================
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '""',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- FAQs (keep from original)
-- ============================================
CREATE TABLE faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- Order code sequence (for BEI-XXXX format)
-- ============================================
CREATE SEQUENCE order_code_seq START 1001;

-- ============================================
-- updated_at trigger function
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stores_updated_at
  BEFORE UPDATE ON stores FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stock_levels_updated_at
  BEFORE UPDATE ON stock_levels FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_homepage_blocks_updated_at
  BEFORE UPDATE ON homepage_blocks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_updated_at
  BEFORE UPDATE ON settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
