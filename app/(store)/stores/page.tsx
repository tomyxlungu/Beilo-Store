// app/(store)/stores/page.tsx
import { createServerSupabase } from '@/lib/supabase/server';
import StoresClient from './stores-client';

export default async function StoresPage() {
  const supabase = await createServerSupabase();

  const { data: stores } = await supabase
    .from('stores')
    .select('*')
    .order('name');

  return <StoresClient initialStores={stores ?? []} />;
}