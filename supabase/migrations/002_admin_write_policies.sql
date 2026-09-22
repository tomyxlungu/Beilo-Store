-- ============================================
-- Admin write policies for authenticated users
-- ============================================

-- Products: authenticated can CRUD
CREATE POLICY "Auth insert products" ON products FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Auth update products" ON products FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Auth delete products" ON products FOR DELETE USING (auth.role() = 'authenticated');

-- Categories: authenticated can CRUD
CREATE POLICY "Auth insert categories" ON categories FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Auth update categories" ON categories FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Auth delete categories" ON categories FOR DELETE USING (auth.role() = 'authenticated');

-- Stores: authenticated can CRUD
CREATE POLICY "Auth insert stores" ON stores FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Auth update stores" ON stores FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Auth delete stores" ON stores FOR DELETE USING (auth.role() = 'authenticated');

-- FAQs: authenticated can CRUD
CREATE POLICY "Auth insert faqs" ON faqs FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Auth update faqs" ON faqs FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Auth delete faqs" ON faqs FOR DELETE USING (auth.role() = 'authenticated');

-- Orders: authenticated can also delete
CREATE POLICY "Auth delete orders" ON orders FOR DELETE USING (auth.role() = 'authenticated');
