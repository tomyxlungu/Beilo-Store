// app/(store)/page.tsx
import { createServerSupabase } from '@/lib/supabase/server';
import { PRODUCT_SELECT_SIMPLE, mapProducts } from '@/lib/supabase/store-mapper';
import HomeSections from '@/components/home/HomeSections';
import TrackView from '@/components/analytics/TrackView';
import Link from 'next/link';

export default async function HomePage() {
  const supabase = await createServerSupabase();

  // Fetch products for looks (join category name)
  const { data: products } = await supabase
    .from('products')
    .select(PRODUCT_SELECT_SIMPLE)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(20);

  const mapped = mapProducts(products ?? []);

  // Homepage CMS blocks (announcements render in the top bar)
  const { data: blocks } = await supabase
    .from('homepage_blocks')
    .select('type, title, content, sort_order')
    .eq('active', true)
    .order('sort_order');

  const heroBlock = (blocks ?? []).find((b: any) => b.type === 'hero');
  const hero = heroBlock
    ? {
        title: heroBlock.title,
        subtitle: heroBlock.content?.subtitle,
        image: heroBlock.content?.image,
        ctaText: heroBlock.content?.cta_text,
        href: heroBlock.content?.href || '/shop',
      }
    : null;

  const quickLinkBlocks = (blocks ?? []).filter((b: any) => b.type === 'quick_link');
  const cmsCategoryBlocks = quickLinkBlocks.map((b: any, i: number) => ({
    id: `cms-${i}`,
    title: b.title,
    href: b.content?.href || '/shop',
    items: ((b.content?.items as any[]) || []).map((item: any, j: number) => ({
      label: item.label || `Link ${j + 1}`,
      image: item.image || '/products/cozy.jpeg',
    })),
  }));

  const mensProducts = mapped.filter(p => p.category === 'Men');
  const womensProducts = mapped.filter(p => p.category === 'Women');
  const denimProducts = mapped.filter(p => p.category === 'Denim');

  const looks = [
    {
      id: '1',
      label: 'STREET ESSENTIALS',
      title: 'Layered looks for the city',
      description: 'The everyday staples, styled for whatever the city throws at you.',
      image: '/products/beliloimg.avif',
      href: '/shop?category=Men',
      align: 'left' as const,
      products: mensProducts.slice(0, 5).map(p => ({ name: p.name, price: p.price, image: p.images[0] })),
    },
    {
      id: '2',
      label: 'WEEKEND CASUAL',
      title: 'Relaxed fits & soft layers',
      description: 'Comfort meets style. Perfect for slow days, coffee runs and weekend plans.',
      image: '/products/cozy.jpeg',
      href: '/shop?category=Women',
      align: 'right' as const,
      products: womensProducts.slice(0, 5).map(p => ({ name: p.name, price: p.price, image: p.images[0] })),
    },
    {
      id: '3',
      label: 'URBAN LAYERING',
      title: 'Denim, tees & outerwear',
      description: 'Classic pieces. Modern layers. Built for the urban grind.',
      image: '/products/Wednesday.jpeg',
      href: '/shop?category=Denim',
      align: 'left' as const,
      products: denimProducts.slice(0, 5).map(p => ({ name: p.name, price: p.price, image: p.images[0] })),
    },
  ];

  const categoryBlocks = cmsCategoryBlocks.length > 0 ? cmsCategoryBlocks : [
    { id: 'deals', title: 'Deals under K 3,500', href: '/shop?maxPrice=3500', items: [{ label: 'Hoodies', image: '/categories/hoodies/hoodie.jpeg' }, { label: 'Tees', image: '/categories/tees/shirt.jpg' }, { label: 'Caps', image: '/categories/caps/cap.jpeg' }, { label: 'Sneakers', image: '/categories/sneekers/shoe.jpeg' }] },
    { id: 'trending', title: 'Trending now', href: '/shop?sort=trending', items: [{ label: 'Denim', image: '/categories/denim/Jeans.jpeg' }, { label: 'Cargo', image: '/categories/cargo/166492517477861535.jpeg' }, { label: 'Headwear', image: '/categories/caps/cap.jpeg' }, { label: 'Basics', image: '/categories/basics/7318418141817825.jpeg' }] },
    { id: 'men', title: 'Shop Men', href: '/shop?category=Men', items: [{ label: 'Jackets', image: '/categories/denim/Jeans.jpeg' }, { label: 'Pants', image: '/categories/cargo/166492517477861535.jpeg' }, { label: 'Footwear', image: '/categories/sneekers/shoe.jpeg' }, { label: 'Accessories', image: '/categories/caps/cap.jpeg' }] },
    { id: 'women', title: 'Shop Women', href: '/shop?category=Women', items: [{ label: 'Tops', image: '/categories/tees/shirt.jpg' }, { label: 'Denim', image: '/categories/denim/Jeans.jpeg' }, { label: 'Hoodies', image: '/categories/hoodies/hoodie.jpeg' }, { label: 'Hats', image: '/categories/caps/cap.jpeg' }] },
  ];

  const socialStats = {
    source: 'Facebook',
    sourceHandle: '@beilo.store',
    href: 'https://facebook.com',
    heading: 'Join our community',
    stats: [
      { id: 'followers', value: '98K', label: 'Followers' },
      { id: 'posts', value: '4.3K', label: 'Posts' },
    ],
  };

  return (
    <>
      <TrackView type="page_view" metadata={{ page: 'home' }} />
      <div className="mobile-shop-cta">
        <Link href="/shop" className="btn btn-primary">Shop Now</Link>
      </div>
      <HomeSections
        hero={hero}
        looks={looks}
        categoryBlocks={categoryBlocks}
        dealProducts={[]}
        socialStats={socialStats}
      />
    </>
  );
}
