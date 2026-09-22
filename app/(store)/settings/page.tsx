// app/(store)/settings/page.tsx
import { createServerSupabase } from '@/lib/supabase/server';
import SettingsClient from './settings-client';

export default async function SettingsPage() {
  const supabase = await createServerSupabase();

  const { data: stores } = await supabase
    .from('stores')
    .select('*')
    .order('name');

  return <SettingsClient initialStores={stores ?? []} />;
}