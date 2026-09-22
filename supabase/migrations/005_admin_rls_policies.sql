-- ============================================
-- BEILO Store — Row Level Security Policies
-- ============================================
-- Strategy:
--   OWNER: full access to everything
--   STORE_STAFF: own store's orders/stock, all products/stores/categories for storefront
--   Anonymous (public): read products/stores/categories/faqs, insert orders/events
-- ============================================

-- ============================================
-- Enable RLS on all tables
-- ============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE homepage_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Helper: check if current user is OWNER
-- ============================================
CREATE OR REPLACE FUNCTION is_owner()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'OWNER' AND active = TRUE
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================
-- Helper: get current user's store_id
-- ============================================
CREATE OR REPLACE FUNCTION my_store_id()
RETURNS UUID AS $$
  SELECT store_id FROM users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================
-- USERS
-- ============================================
-- Authenticated users can read their own profile
CREATE POLICY "Users read own profile"
  ON users FOR SELECT
  USING (id = auth.uid());

-- OWNER can read all users
CREATE POLICY "Owner read all users"
  ON users FOR SELECT
  USING (is_owner());

-- OWNER can insert users (create staff)
CREATE POLICY "Owner insert users"
  ON users FOR INSERT
  WITH CHECK (is_owner());

-- OWNER can update all users
CREATE POLICY "Owner update users"
  ON users FOR UPDATE
  USING (is_owner());

-- OWNER can delete users
CREATE POLICY "Owner delete users"
  ON users FOR DELETE
  USING (is_owner());

-- ============================================
-- STORES
-- ============================================
-- Public read all active stores
CREATE POLICY "Public read active stores"
  ON stores FOR SELECT
  USING (active = TRUE);

-- Authenticated admin read all stores (including inactive)
CREATE POLICY "Admin read all stores"
  ON stores FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- OWNER can manage stores
CREATE POLICY "Owner manage stores"
  ON stores FOR ALL
  USING (is_owner());

-- ============================================
-- CATEGORIES
-- ============================================
-- Public read
CREATE POLICY "Public read categories"
  ON categories FOR SELECT
  USING (TRUE);

-- Authenticated admin full access
CREATE POLICY "Admin manage categories"
  ON categories FOR ALL
  USING (auth.uid() IS NOT NULL);

-- ============================================
-- PRODUCTS
-- ============================================
-- Public read active products
CREATE POLICY "Public read active products"
  ON products FOR SELECT
  USING (is_active = TRUE);

-- Authenticated admin read all products
CREATE POLICY "Admin read all products"
  ON products FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Authenticated admin can insert products
CREATE POLICY "Admin insert products"
  ON products FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Authenticated admin can update products
CREATE POLICY "Admin update products"
  ON products FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- Authenticated admin can delete products
CREATE POLICY "Admin delete products"
  ON products FOR DELETE
  USING (auth.uid() IS NOT NULL);

-- ============================================
-- VARIANTS
-- ============================================
-- Public read (via active products)
CREATE POLICY "Public read variants"
  ON variants FOR SELECT
  USING (TRUE);

-- Authenticated admin full access
CREATE POLICY "Admin manage variants"
  ON variants FOR ALL
  USING (auth.uid() IS NOT NULL);

-- ============================================
-- STOCK LEVELS
-- ============================================
-- Public read (for storefront stock display)
CREATE POLICY "Public read stock levels"
  ON stock_levels FOR SELECT
  USING (TRUE);

-- OWNER: full access to all stock
CREATE POLICY "Owner manage stock levels"
  ON stock_levels FOR ALL
  USING (is_owner());

-- STORE_STAFF: read/write own store stock
CREATE POLICY "Staff read own store stock"
  ON stock_levels FOR SELECT
  USING (
    store_id = my_store_id()
    AND EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'STORE_STAFF')
  );

CREATE POLICY "Staff update own store stock"
  ON stock_levels FOR UPDATE
  USING (store_id = my_store_id());

CREATE POLICY "Staff insert own store stock"
  ON stock_levels FOR INSERT
  WITH CHECK (store_id = my_store_id());

-- ============================================
-- STOCK ADJUSTMENTS (audit log)
-- ============================================
-- OWNER: read all
CREATE POLICY "Owner read stock adjustments"
  ON stock_adjustments FOR SELECT
  USING (is_owner());

-- STORE_STAFF: read own store adjustments
CREATE POLICY "Staff read own store adjustments"
  ON stock_adjustments FOR SELECT
  USING (
    store_id = my_store_id()
    AND EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'STORE_STAFF')
  );

-- Authenticated admin can insert (log adjustments)
CREATE POLICY "Admin insert stock adjustments"
  ON stock_adjustments FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================
-- CUSTOMERS
-- ============================================
-- Public can insert (creates customer from order)
CREATE POLICY "Public insert customers"
  ON customers FOR INSERT
  WITH CHECK (TRUE);

-- Authenticated admin read
CREATE POLICY "Admin read customers"
  ON customers FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- OWNER can manage
CREATE POLICY "Owner manage customers"
  ON customers FOR ALL
  USING (is_owner());

-- ============================================
-- ORDERS
-- ============================================
-- Public can insert (guest checkout)
CREATE POLICY "Public insert orders"
  ON orders FOR INSERT
  WITH CHECK (TRUE);

-- OWNER: full access to all orders
CREATE POLICY "Owner manage orders"
  ON orders FOR ALL
  USING (is_owner());

-- STORE_STAFF: read/update orders for their store
CREATE POLICY "Staff read own store orders"
  ON orders FOR SELECT
  USING (
    pickup_store_id = my_store_id()
    AND EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'STORE_STAFF')
  );

CREATE POLICY "Staff update own store orders"
  ON orders FOR UPDATE
  USING (
    pickup_store_id = my_store_id()
    AND EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'STORE_STAFF')
  );

-- ============================================
-- ORDER ITEMS
-- ============================================
-- Public can insert (with order)
CREATE POLICY "Public insert order items"
  ON order_items FOR INSERT
  WITH CHECK (TRUE);

-- OWNER: full access
CREATE POLICY "Owner read order items"
  ON order_items FOR SELECT
  USING (is_owner());

-- STORE_STAFF: read items for their store orders
CREATE POLICY "Staff read own store order items"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
        AND orders.pickup_store_id = my_store_id()
    )
    AND EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'STORE_STAFF')
  );

-- ============================================
-- EVENTS
-- ============================================
-- Public can insert events (analytics)
CREATE POLICY "Public insert events"
  ON events FOR INSERT
  WITH CHECK (TRUE);

-- Authenticated admin read
CREATE POLICY "Admin read events"
  ON events FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- ============================================
-- HOMEPAGE BLOCKS
-- ============================================
-- Public read active blocks
CREATE POLICY "Public read active homepage blocks"
  ON homepage_blocks FOR SELECT
  USING (active = TRUE);

-- Authenticated admin read all
CREATE POLICY "Admin read all homepage blocks"
  ON homepage_blocks FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- OWNER manage
CREATE POLICY "Owner manage homepage blocks"
  ON homepage_blocks FOR ALL
  USING (is_owner());

-- STORE_STAFF read only
CREATE POLICY "Staff read homepage blocks"
  ON homepage_blocks FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- ============================================
-- SETTINGS
-- ============================================
-- Public read (for storefront config like WhatsApp number)
CREATE POLICY "Public read settings"
  ON settings FOR SELECT
  USING (TRUE);

-- OWNER manage
CREATE POLICY "Owner manage settings"
  ON settings FOR ALL
  USING (is_owner());

-- ============================================
-- FAQs
-- ============================================
-- Public read
CREATE POLICY "Public read faqs"
  ON faqs FOR SELECT
  USING (TRUE);

-- Authenticated admin full access
CREATE POLICY "Admin manage faqs"
  ON faqs FOR ALL
  USING (auth.uid() IS NOT NULL);
