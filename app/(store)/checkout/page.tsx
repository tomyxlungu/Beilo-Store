// app/(store)/checkout/page.tsx
import { createServerSupabase } from '@/lib/supabase/server';
import { getPublicSettings } from '@/lib/settings';
import CheckoutClient from './checkout-client';

export default async function CheckoutPage() {
  const supabase = await createServerSupabase();

  const { data: stores } = await supabase
    .from('stores')
    .select('*')
    .order('name');

  const settings = await getPublicSettings(supabase);

  return (
    <CheckoutClient
      initialStores={stores ?? []}
      whatsappNumber={settings.whatsappNumber}
      storeName={settings.storeName}
    />
  );
}
