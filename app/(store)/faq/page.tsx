// app/(store)/faq/page.tsx
import { createServerSupabase } from '@/lib/supabase/server';
import FAQClient from './faq-client';
import { FAQItem } from '@/types/product';

export default async function FAQPage() {
  const supabase = await createServerSupabase();

  const { data: faqs } = await supabase
    .from('faqs')
    .select('*')
    .order('created_at');

  // Topics come from the FAQs themselves (in first-seen order),
  // so chips always match real content.
  const seen = new Set<string>();
  for (const faq of faqs ?? []) {
    const category = (faq as FAQItem).category?.trim();
    if (category) seen.add(category);
  }
  const faqTopics = ['All', ...seen];

  return <FAQClient initialFaqs={(faqs ?? []) as FAQItem[]} faqTopics={faqTopics} />;
}