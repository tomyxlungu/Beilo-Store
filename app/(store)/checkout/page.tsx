// app/(store)/checkout/page.tsx
import { createServerSupabase } from '@/lib/supabase/server';
import CheckoutClient from './checkout-client';

export default async function CheckoutPage() {
  const supabase = await createServerSupabase();

  const { data: stores } = await supabase
    .from('stores')
    .select('*')
    .order('name');

  return <CheckoutClient initialStores={stores ?? []} />;
}