// app/(store)/cart/page.tsx
import { createServerSupabase } from '@/lib/supabase/server';
import CartClient from './cart-client';
import { Product } from '@/types/product';

export default async function CartPage() {
  const supabase = await createServerSupabase();

  const { data: products } = await supabase
    .from('products')
    .select('id, slug');

  const slugById = new Map<string, string>();
  products?.forEach(p => slugById.set(p.id, p.slug));

  return <CartClient slugById={slugById} />;
}