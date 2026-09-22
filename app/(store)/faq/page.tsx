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

  const { data: categories } = await supabase
    .from('categories')
    .select('name')
    .order('name');

  const faqTopics = ['All', ...(categories?.map(c => c.name) ?? [])];

  return <FAQClient initialFaqs={(faqs ?? []) as FAQItem[]} faqTopics={faqTopics} />;
}