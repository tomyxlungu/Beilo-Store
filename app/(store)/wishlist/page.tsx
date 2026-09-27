// app/(store)/wishlist/page.tsx
import { createServerSupabase } from '@/lib/supabase/server';
import { PRODUCT_SELECT, mapProducts } from '@/lib/supabase/store-mapper';
import WishlistClient from './wishlist-client';
import { Product } from '@/types/product';

export default async function WishlistPage() {
  const supabase = await createServerSupabase();

  // NOTE: must use the full select + mapper (not select('*')) — the
  // storefront Product type needs mapped fields (price, stockByStore,
  // category, sizes). Raw rows crashed ProductCard on undefined.
  const { data: products } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  const mapped: Product[] = mapProducts(products ?? []);

  return <WishlistClient initialProducts={mapped} />;
}