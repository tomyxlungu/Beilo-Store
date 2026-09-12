import HomeSections from '@/components/home/HomeSections'; // adjust path if needed
import Link from 'next/link';

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <p className="hero-eyebrow">New season just dropped</p>
          <h1 className="hero-title">
            Welcome to<br />
            <span>BEILO</span>
          </h1>
          <p className="hero-subtitle">
            Your everyday essentials, elevated.
          </p>

          <div className="hero-actions">
            <Link href="/shop" className="btn btn-primary">
              Shop Now
            </Link>
            <Link href="/shop?new=true" className="btn btn-secondary">
              New Arrivals
            </Link>
          </div>
        </div>
      </section>
      {/* Trending + Deals under K-- + Shop the Look */}
      <HomeSections />
    </>
  );
}