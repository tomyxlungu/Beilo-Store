// app/(store)/product/[slug]/page.tsx
import { createServerSupabase } from '@/lib/supabase/server';
import { PRODUCT_SELECT, mapProduct } from '@/lib/supabase/store-mapper';
import ProductClient from './product-client';
import TrackView from '@/components/analytics/TrackView';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createServerSupabase();

  const { data: product } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (!product) notFound();

  const { data: relatedProducts } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('category_id', product.category_id)
    .eq('is_active', true)
    .neq('id', product.id)
    .order('created_at', { ascending: false })
    .limit(6);

  return (
    <>
      <TrackView type="product_view" productId={product.id} metadata={{ slug }} />
      <ProductClient
        product={mapProduct(product)}
        relatedProducts={(relatedProducts ?? []).map(mapProduct)}
      />
    </>
  );
}
