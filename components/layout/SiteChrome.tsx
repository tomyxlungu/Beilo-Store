import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { createPublicSupabase } from '@/lib/supabase/public';
import { getCachedPublicSettings, DEFAULT_SETTINGS } from '@/lib/settings';

/** Async brand header: streams in without blocking the page shell. */
export async function SiteHeader() {
  const settings = await getCachedPublicSettings(createPublicSupabase()).catch(
    () => DEFAULT_SETTINGS
  );
  return (
    <Header
      storeName={settings.storeName}
      whatsappNumber={settings.whatsappNumber}
      announcementText={settings.headerAnnouncement}
      announcementHref={settings.headerAnnouncementHref}
    />
  );
}

/** Async brand footer: streams in without blocking the page shell. */
export async function SiteFooter() {
  const settings = await getCachedPublicSettings(createPublicSupabase()).catch(
    () => DEFAULT_SETTINGS
  );
  return (
    <Footer
      storeName={settings.storeName}
      storeDescription={settings.storeDescription}
      whatsappNumber={settings.whatsappNumber}
    />
  );
}
