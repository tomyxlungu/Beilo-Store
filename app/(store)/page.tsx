import HomeSections from '@/components/home/HomeSections'; // adjust path if needed
import Link from 'next/link';

export default function HomePage() {
  return (
    <>
      {/* Mobile-only Shop CTA (welcome hero card removed) */}
      <div className="mobile-shop-cta">
        <Link href="/shop" className="btn btn-primary">
          Shop Now
        </Link>
      </div>
      {/* Trending + Deals under K-- + Shop the Look */}
      <HomeSections />
    </>
  );
}