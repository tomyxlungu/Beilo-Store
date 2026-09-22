-- ============================================
-- BEILO Store — Initial Schema
-- ============================================

-- Categories
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stores
CREATE TABLE stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  hours TEXT NOT NULL,
  phone TEXT NOT NULL,
  image TEXT,
  map_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  price INTEGER NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  sizes TEXT[] NOT NULL DEFAULT '{}',
  images TEXT[] NOT NULL DEFAULT '{}',
  stock_by_store JSONB NOT NULL DEFAULT '[]',
  is_new BOOLEAN DEFAULT FALSE,
  is_trending BOOLEAN DEFAULT FALSE,
  is_promo BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- FAQs
CREATE TABLE faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT,
  customer_phone TEXT,
  items JSONB NOT NULL DEFAULT '[]',
  total_price INTEGER NOT NULL,
  delivery_method TEXT NOT NULL CHECK (delivery_method IN ('pickup', 'delivery')),
  pickup_store TEXT,
  delivery_address TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_is_new ON products(is_new);
CREATE INDEX idx_products_is_trending ON products(is_trending);
CREATE INDEX idx_products_is_promo ON products(is_promo);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);

-- ============================================
-- Row Level Security
-- ============================================
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Public read categories" ON categories FOR SELECT USING (TRUE);
CREATE POLICY "Public read stores" ON stores FOR SELECT USING (TRUE);
CREATE POLICY "Public read products" ON products FOR SELECT USING (TRUE);
CREATE POLICY "Public read faqs" ON faqs FOR SELECT USING (TRUE);

-- Orders: public can insert (guest checkout), auth can read/update
CREATE POLICY "Public insert orders" ON orders FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Auth read orders" ON orders FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Auth update orders" ON orders FOR UPDATE USING (auth.role() = 'authenticated');
