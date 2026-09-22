// app/(store)/wishlist/page.tsx
import { createServerSupabase } from '@/lib/supabase/server';
import WishlistClient from './wishlist-client';
import { Product } from '@/types/product';

export default async function WishlistPage() {
  const supabase = await createServerSupabase();

  const { data: products } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  return <WishlistClient initialProducts={products ?? []} />;
}