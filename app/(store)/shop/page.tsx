// app/(store)/shop/page.tsx
import { createServerSupabase } from '@/lib/supabase/server';
import { PRODUCT_SELECT, mapProducts } from '@/lib/supabase/store-mapper';
import ShopClient from './shop-client';
import { Product } from '@/types/product';

export default async function ShopPage() {
  const supabase = await createServerSupabase();

  const { data: products } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  const { data: categories } = await supabase
    .from('categories')
    .select('name')
    .order('name');

  const mapped: Product[] = mapProducts(products ?? []);

  return (
    <ShopClient
      initialProducts={mapped}
      categories={categories?.map(c => c.name) ?? []}
    />
  );
}
