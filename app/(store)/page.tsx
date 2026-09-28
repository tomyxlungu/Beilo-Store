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

  // Resolve an editorial look product to the live catalogue entry so
  // prices are never stale and cards link to the real product page.
  // Returns null when the product no longer exists (dropped from UI).
  const lookProduct = (name: string) => {
    const match = mapped.find(
      (p) => p.name.trim().toLowerCase() === name.trim().toLowerCase()
    );
    if (!match) return null;
    return {
      name: match.name,
      slug: match.slug,
      price: match.salePrice ?? match.price,
      image: match.images[0] || '/products/cozy.jpeg',
    };
  };
  const lookProducts = (names: string[]) =>
    names
      .map(lookProduct)
      .filter((p): p is NonNullable<typeof p> => p !== null);

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

  const looks = [
    {
      id: '1',
      label: 'STREET ESSENTIALS',
      title: 'Layered looks for the city',
      description: 'The everyday staples, styled for whatever the city throws at you.',
      image: '/products/beliloimg.avif',
      href: '/shop?category=Men',
      align: 'left' as const,
      products: lookProducts(['Skull T shirt', 'T-shirt', 'Shirt']),
    },
    {
      id: '2',
      label: 'WEEKEND CASUAL',
      title: 'Relaxed fits & soft layers',
      description: 'Comfort meets style. Perfect for slow days, coffee runs and weekend plans.',
      image: '/products/cozy.jpeg',
      href: '/shop?category=Women',
      align: 'right' as const,
      products: lookProducts(['Female t from kens store', 'Long sleeved T shirt']),
    },
    {
      id: '3',
      label: 'URBAN LAYERING',
      title: 'Denim, tees & outerwear',
      description: 'Classic pieces. Modern layers. Built for the urban grind.',
      image: '/products/Wednesday.jpeg',
      href: '/shop?category=Denim',
      align: 'left' as const,
      products: lookProducts(['Flannel', 'Shoes']),
    },
  ];

  // Fallback categories mirror the REAL catalogue categories (each
  // linking to itself) so no dead-end labels like Cargo/Basics appear.
  const REAL_CATEGORIES = [
    { label: 'Men', image: '/categories/tees/shirt.jpg' },
    { label: 'Women', image: '/categories/hoodies/hoodie.jpeg' },
    { label: 'Footwear', image: '/categories/sneekers/shoe.jpeg' },
    { label: 'Headwear', image: '/categories/caps/cap.jpeg' },
    { label: 'Denim', image: '/categories/denim/Jeans.jpeg' },
  ];
  const categoryBlocks = cmsCategoryBlocks.length > 0 ? cmsCategoryBlocks : REAL_CATEGORIES.map((c, i) => ({
    id: `fallback-${i}`,
    title: `Shop ${c.label}`,
    href: `/shop?category=${c.label}`,
    items: [{ label: c.label, image: c.image }],
  }));

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
      />
    </>
  );
}
