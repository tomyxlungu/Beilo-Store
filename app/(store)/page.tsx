// app/(store)/page.tsx
import { createServerSupabase } from '@/lib/supabase/server';
import { PRODUCT_SELECT_SIMPLE, mapProducts } from '@/lib/supabase/store-mapper';
import HomeSections from '@/components/home/HomeSections';
import HomeSearchBar from '@/components/home/HomeSearchBar';
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

  const heroBlocks = (blocks ?? []).filter((b: any) => b.type === 'hero');

  const quickLinkBlocks = (blocks ?? []).filter((b: any) => b.type === 'quick_link');
  // Ignore blocks with no usable links — one empty test block must
  // never wipe out the whole category section.
  const usableQuickLinks = quickLinkBlocks.filter(
    (b: any) => ((b.content?.items as any[]) || []).some((item: any) => item?.label?.trim())
  );
  const cmsCategoryBlocks = usableQuickLinks.map((b: any, i: number) => ({
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

  // Deals for you: real discounted products (sale price below
  // regular price), newest first, capped at 8.
  const dealProducts = mapped
    .filter((p) => p.salePrice != null)
    .slice(0, 8)
    .map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      price: p.salePrice as number,
      originalPrice: p.price,
      image: p.images[0] || '/products/cozy.jpeg',
    }));

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

  // Carousel slides: every active CMS hero block, falling back to the
  // editorial looks so the hero never renders empty.
  const usingLooksFallback = heroBlocks.length === 0;
  const heroSlides = !usingLooksFallback
    ? heroBlocks.map((b: any, i: number) => ({
        id: b.id ?? `hero-${i}`,
        title: b.title,
        subtext: b.content?.subtitle,
        image: b.content?.image,
        ctaText: b.content?.cta_text,
        href: b.content?.href || '/shop',
        offer: b.content?.offer,
      }))
    : looks.map((look) => ({
        id: look.id,
        title: look.title,
        eyebrow: look.label,
        subtext: look.description,
        image: look.image,
        ctaText: 'Shop Now',
        href: look.href,
        offer: undefined as string | undefined,
      }));

  return (
    <>
      <TrackView type="page_view" metadata={{ page: 'home' }} />
      <HomeSearchBar />
      <div className="mobile-shop-cta">
        <Link href="/shop" className="btn btn-primary">Shop Now</Link>
      </div>
      <HomeSections
        heroSlides={heroSlides}
        // When the looks double as carousel slides, hide the look
        // sections below so identical content isn't shown twice.
        looks={usingLooksFallback ? [] : looks}
        categoryBlocks={categoryBlocks}
        dealProducts={dealProducts}
        socialStats={socialStats}
      />
    </>
  );
}
