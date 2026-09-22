// ============================================
// BEILO Store — Seed Script
// ============================================
// Run: npx tsx scripts/seed.ts
//
// Creates:
//   - 5 stores
//   - 7 categories
//   - Owner user (existing Supabase Auth user, linked to users table)
//   - ~20 products with variants and stock levels
//   - Sample orders with items
//   - Homepage blocks
//   - Default settings
// ============================================

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const OWNER_EMAIL = process.env.SEED_OWNER_EMAIL || 'admin@beilo.store';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

// ---- Helpers ----

function slug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ---- Data ----

const STORES = [
  { name: 'Downtown', address: 'Cairo Road, Lusaka', phone: '+260 97 1234567', hours: 'Mon-Sat: 9AM - 6PM', map_url: 'https://maps.google.com/?q=Cairo+Road+Lusaka' },
  { name: 'City Market', address: 'Freedom Way, Lusaka', phone: '+260 96 7654321', hours: 'Mon-Sat: 8AM - 5PM', map_url: 'https://maps.google.com/?q=Freedom+Way+Lusaka' },
  { name: 'Manda Hill', address: 'Great East Road, Lusaka', phone: '+260 95 5551234', hours: 'Mon-Sun: 10AM - 8PM', map_url: 'https://maps.google.com/?q=Manda+Hill+Lusaka' },
  { name: 'East Park', address: 'Thabo Mbeki Road, Lusaka', phone: '+260 97 8889999', hours: 'Mon-Sat: 9AM - 7PM', map_url: 'https://maps.google.com/?q=East+Park+Mall+Lusaka' },
  { name: 'Levy Junction', address: 'Church Road, Lusaka', phone: '+260 96 4445555', hours: 'Mon-Sun: 9AM - 6PM', map_url: 'https://maps.google.com/?q=Levy+Junction+Lusaka' },
];

const CATEGORIES = [
  { name: 'Men', slug: 'men' },
  { name: 'Women', slug: 'women' },
  { name: 'Footwear', slug: 'footwear' },
  { name: 'Headwear', slug: 'headwear' },
  { name: 'Denim', slug: 'denim' },
  { name: 'Promos', slug: 'promos' },
  { name: 'Accessories', slug: 'accessories' },
];

// Products with size/colour variants and base prices in Kwacha
const PRODUCT_SEED = [
  { name: 'Striped Tee', category: 'Men', price: 150, sizes: ['S', 'M', 'L', 'XL'], colours: ['Black/White', 'Navy/White'], image: '/categories/tees/shirt.jpg', trending: true, arrival: true },
  { name: 'Ripped Jeans', category: 'Denim', price: 280, sizes: ['30', '32', '34', '36'], colours: ['Blue', 'Black'], image: '/categories/denim/Jeans.jpeg', trending: false, arrival: true },
  { name: 'Vans Old Skool', category: 'Footwear', price: 450, sizes: ['40', '42', '44'], colours: ['Black/White', 'Navy'], image: '/categories/sneekers/shoe.jpeg', trending: true, arrival: false },
  { name: 'Cargo Pants', category: 'Men', price: 320, sizes: ['S', 'M', 'L', 'XL'], colours: ['Khaki', 'Black', 'Olive'], image: '/categories/tees/shirt.jpg', trending: false, arrival: false },
  { name: 'Oversized Hoodie', category: 'Men', price: 380, sizes: ['M', 'L', 'XL', 'XXL'], colours: ['Grey', 'Black'], image: '/categories/tees/shirt.jpg', trending: true, arrival: false },
  { name: 'Crop Top', category: 'Women', price: 120, sizes: ['XS', 'S', 'M', 'L'], colours: ['White', 'Pink'], image: '/categories/tees/shirt.jpg', trending: false, arrival: true },
  { name: 'High Waist Jeans', category: 'Women', price: 300, sizes: ['XS', 'S', 'M', 'L'], colours: ['Blue', 'Black'], image: '/categories/denim/Jeans.jpeg', trending: true, arrival: false },
  { name: 'Floral Dress', category: 'Women', price: 250, sizes: ['S', 'M', 'L'], colours: ['Floral Print'], image: '/categories/tees/shirt.jpg', trending: false, arrival: true },
  { name: 'Canvas Sneakers', category: 'Footwear', price: 200, sizes: ['38', '40', '42', '44'], colours: ['White', 'Black', 'Red'], image: '/categories/sneekers/shoe.jpeg', trending: false, arrival: false },
  { name: 'Leather Boots', category: 'Footwear', price: 550, sizes: ['40', '42', '44'], colours: ['Brown', 'Black'], image: '/categories/sneekers/shoe.jpeg', trending: true, arrival: false },
  { name: 'Dad Cap', category: 'Headwear', price: 80, sizes: ['OS'], colours: ['Black', 'White', 'Khaki'], image: '/categories/tees/shirt.jpg', trending: false, arrival: false },
  { name: 'Beanie', category: 'Headwear', price: 90, sizes: ['OS'], colours: ['Black', 'Grey', 'Red'], image: '/categories/tees/shirt.jpg', trending: false, arrival: false },
  { name: 'Slim Fit Jeans', category: 'Denim', price: 260, sizes: ['30', '32', '34', '36'], colours: ['Blue', 'Dark Wash'], image: '/categories/denim/Jeans.jpeg', trending: false, arrival: false },
  { name: 'Denim Jacket', category: 'Denim', price: 400, sizes: ['M', 'L', 'XL'], colours: ['Blue', 'Black'], image: '/categories/denim/Jeans.jpeg', trending: true, arrival: false },
  { name: 'Graphic Tee', category: 'Promos', price: 100, sizes: ['S', 'M', 'L', 'XL'], colours: ['White', 'Black'], image: '/categories/tees/shirt.jpg', trending: false, arrival: false },
  { name: 'Joggers', category: 'Men', price: 220, sizes: ['S', 'M', 'L', 'XL'], colours: ['Black', 'Grey'], image: '/categories/tees/shirt.jpg', trending: false, arrival: false },
  { name: 'Bucket Hat', category: 'Headwear', price: 110, sizes: ['OS'], colours: ['Black', 'Khaki', 'Camo'], image: '/categories/tees/shirt.jpg', trending: false, arrival: true },
  { name: 'Crossbody Bag', category: 'Accessories', price: 180, sizes: ['OS'], colours: ['Black', 'Brown'], image: '/categories/tees/shirt.jpg', trending: false, arrival: false },
  { name: 'Linen Shirt', category: 'Men', price: 200, sizes: ['S', 'M', 'L', 'XL'], colours: ['White', 'Sky Blue'], image: '/categories/tees/shirt.jpg', trending: false, arrival: true },
  { name: 'Mini Skirt', category: 'Women', price: 160, sizes: ['XS', 'S', 'M', 'L'], colours: ['Black', 'Plaid'], image: '/categories/tees/shirt.jpg', trending: false, arrival: false },
];

async function seed() {
  console.log('Starting seed...\n');

  // ---- Clear existing data (foreign key order) ----
  console.log('Clearing existing data...');
  await supabase.from('order_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('orders').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('stock_adjustments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('stock_levels').delete().neq('variant_id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('variants').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('events').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('homepage_blocks').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('settings').delete().neq('key', '__nonexistent__');
  await supabase.from('customers').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('faqs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('categories').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('stores').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('users').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  console.log('  ✓ Cleared');

  // ---- 1. Stores ----
  console.log('Seeding stores...');
  const { data: stores, error: storesErr } = await supabase
    .from('stores')
    .insert(STORES)
    .select();
  if (storesErr) throw new Error('Stores: ' + storesErr.message);
  console.log(`  ✓ ${stores.length} stores`);

  // ---- 2. Categories ----
  console.log('Seeding categories...');
  const { data: categories, error: catsErr } = await supabase
    .from('categories')
    .insert(CATEGORIES)
    .select();
  if (catsErr) throw new Error('Categories: ' + catsErr.message);
  console.log(`  ✓ ${categories.length} categories`);

  // ---- 3. Owner user ----
  console.log('Seeding owner user...');
  // Find existing auth user by email
  const { data: authUsers, error: listErr } = await supabase.auth.admin.listUsers();
  if (listErr) throw new Error('List users: ' + listErr.message);

  const existingOwner = authUsers.users.find((u) => u.email === OWNER_EMAIL);
  if (!existingOwner) {
    console.log(`  ⚠ No auth user found with email ${OWNER_EMAIL}.`);
    console.log('    Create one in Supabase Dashboard → Authentication → Users');
    console.log('    Then re-run this script.');
    process.exit(1);
  }

  const { error: ownerErr } = await supabase
    .from('users')
    .insert({
      id: existingOwner.id,
      name: 'Owner',
      email: OWNER_EMAIL,
      role: 'OWNER',
      store_id: null,
      active: true,
    });
  if (ownerErr) throw new Error('Owner user: ' + ownerErr.message);
  console.log(`  ✓ Owner user linked (${OWNER_EMAIL})`);

  // ---- 4. Products with variants and stock ----
  console.log('Seeding products with variants and stock...');
  let productCount = 0;
  let variantCount = 0;

  for (const p of PRODUCT_SEED) {
    const cat = categories.find((c) => c.name === p.category);
    if (!cat) continue;

    // Insert product
    const { data: product, error: prodErr } = await supabase
      .from('products')
      .insert({
        name: p.name,
        slug: slug(p.name),
        description: `${p.name} — available at BEILO stores in Lusaka.`,
        category_id: cat.id,
        price_minor: p.price * 100,
        images: [p.image],
        is_active: true,
        is_trending: p.trending,
        is_new_arrival: p.arrival,
        low_stock_threshold: 5,
      })
      .select()
      .single();
    if (prodErr) throw new Error(`Product "${p.name}": ${prodErr.message}`);
    productCount++;

    // Insert variants (size x colour)
    const variants: { product_id: string; size: string; colour: string; sku: string }[] = [];
    for (const size of p.sizes) {
      for (const colour of p.colours) {
        variants.push({
          product_id: product.id,
          size,
          colour,
          sku: `${slug(p.name)}-${slug(size)}-${slug(colour)}`.toUpperCase(),
        });
      }
    }

    const { data: insertedVariants, error: varErr } = await supabase
      .from('variants')
      .insert(variants)
      .select();
    if (varErr) throw new Error(`Variants for "${p.name}": ${varErr.message}`);
    variantCount += insertedVariants.length;

    // Insert stock levels for each variant at each store
    const stockLevels: { variant_id: string; store_id: string; quantity: number }[] = [];
    for (const v of insertedVariants) {
      for (const store of stores) {
        // Random stock: mostly in-stock, some low, some out
        const qty = pick([0, 0, 2, 3, 4, 8, 12, 15, 20, 25]);
        stockLevels.push({
          variant_id: v.id,
          store_id: store.id,
          quantity: qty,
        });
      }
    }

    const { error: stockErr } = await supabase
      .from('stock_levels')
      .insert(stockLevels);
    if (stockErr) throw new Error(`Stock for "${p.name}": ${stockErr.message}`);
  }
  console.log(`  ✓ ${productCount} products, ${variantCount} variants`);

  // ---- 5. Sample orders ----
  console.log('Seeding sample orders...');

  // Create sample customers
  const customerNames = [
    { name: 'Grace Mwanza', phone: '+260971111111' },
    { name: 'Joseph Banda', phone: '+260962222222' },
    { name: 'Mary Phiri', phone: '+260953333333' },
    { name: 'David Chileshe', phone: '+260974444444' },
    { name: 'Sarah Tembo', phone: '+260965555555' },
  ];

  const { data: customers, error: custErr } = await supabase
    .from('customers')
    .insert(customerNames)
    .select();
  if (custErr) throw new Error('Customers: ' + custErr.message);

  // Get some products with variants for orders
  const { data: allProducts } = await supabase
    .from('products')
    .select('id, name, price_minor, variants(id, sku)')
    .limit(10);

  if (!allProducts || allProducts.length === 0) {
    console.log('  ⚠ No products found, skipping orders');
  } else {
    const statuses = ['NEW', 'CONFIRMED', 'READY_FOR_PICKUP', 'COMPLETED', 'CANCELLED'] as const;

    // Insert orders one by one with their items
    for (let i = 0; i < 15; i++) {
      const customer = pick(customers);
      const store = pick(stores);
      const status = pick([...statuses]);
      const numItems = randInt(1, 3);
      let totalMinor = 0;

      const items: {
        variant_id: string;
        product_name: string;
        unit_price_minor: number;
        quantity: number;
      }[] = [];

      for (let j = 0; j < numItems; j++) {
        const product = pick(allProducts);
        const variant = product.variants?.[0];
        if (!variant) continue;
        const qty = randInt(1, 3);
        totalMinor += product.price_minor * qty;

        items.push({
          variant_id: variant.id,
          product_name: product.name,
          unit_price_minor: product.price_minor,
          quantity: qty,
        });
      }

      if (items.length === 0) continue;

      const { data: insertedOrder, error: orderErr } = await supabase
        .from('orders')
        .insert({
          code: `BEI-${1001 + i}`,
          customer_id: customer.id,
          customer_name: customer.name,
          customer_phone: customer.phone,
          pickup_store_id: store.id,
          status,
          total_minor: totalMinor,
          cancel_reason: status === 'CANCELLED' ? pick(['Changed mind', 'Out of stock', 'Customer no-show']) : null,
        })
        .select()
        .single();

      if (orderErr) {
        console.log(`  ⚠ Order BEI-${1001 + i}: ${orderErr.message}`);
        continue;
      }

      const { error: itemsErr } = await supabase
        .from('order_items')
        .insert(items.map((item) => ({ ...item, order_id: insertedOrder.id })));

      if (itemsErr) {
        console.log(`  ⚠ Order items BEI-${1001 + i}: ${itemsErr.message}`);
      }
    }
    console.log('  ✓ 15 orders with items');
  }

  // ---- 6. Homepage blocks ----
  console.log('Seeding homepage blocks...');
  const blocks = [
    {
      type: 'announcement',
      title: 'New season just dropped',
      content: { text: 'New season just dropped — shop new arrivals', link: '/shop?new=true' },
      sort_order: 1,
      active: true,
    },
    {
      type: 'hero',
      title: 'Street Essentials',
      content: { subtitle: 'Fresh fits for every day', image: '/categories/tees/shirt.jpg', link: '/shop' },
      sort_order: 2,
      active: true,
    },
    {
      type: 'quick_link',
      title: 'Shop Men',
      content: { image: '/categories/tees/shirt.jpg', link: '/shop?category=Men' },
      sort_order: 3,
      active: true,
    },
    {
      type: 'quick_link',
      title: 'Shop Women',
      content: { image: '/categories/tees/shirt.jpg', link: '/shop?category=Women' },
      sort_order: 4,
      active: true,
    },
  ];

  const { error: blocksErr } = await supabase
    .from('homepage_blocks')
    .insert(blocks);
  if (blocksErr) console.log(`  ⚠ Homepage blocks: ${blocksErr.message}`);
  else console.log(`  ✓ ${blocks.length} homepage blocks`);

  // ---- 7. Settings ----
  console.log('Seeding settings...');
  const settings = [
    { key: 'whatsapp_number', value: '+260XXXXXXXXX' },
    { key: 'low_stock_threshold', value: 5 },
    { key: 'order_code_prefix', value: 'BEI' },
    { key: 'store_name', value: 'BEILO' },
    { key: 'currency', value: 'ZMW' },
  ];

  for (const s of settings) {
    const { error } = await supabase
      .from('settings')
      .insert({ key: s.key, value: JSON.stringify(s.value) });
    if (error) console.log(`  ⚠ Setting "${s.key}": ${error.message}`);
  }
  console.log(`  ✓ ${settings.length} settings`);

  console.log('\nSeed complete!');
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
