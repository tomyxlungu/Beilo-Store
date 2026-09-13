'use client';

import { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ChevronLeft, ChevronRight, Globe, Images, Users } from 'lucide-react';

/* ---------- Data ---------- */
const promoBanner = {
  title: 'New season just dropped',
  subtitle:
    'Fresh denim, essentials and streetwear for every day. Shop the looks that define BEILO.',
  cta: 'Shop new arrivals',
  href: '/shop?new=true',
  bg: '#2B2B2B',
};

const looks = [
  {
    id: '1',
    label: 'STREET ESSENTIALS',
    title: 'Layered looks for the city',
    description:
      'The everyday staples, styled for whatever the city throws at you.',
    image: '/products/beliloimg.avif',
    href: '/looks/street',
    align: 'left' as const,
    products: [
      { name: 'Basic Tee', price: 250, image: '/categories/tees/shirt.jpg' },
      { name: 'Straight Jeans', price: 450, image: '/categories/denim/Jeans.jpeg' },
      { name: 'Sneakers', price: 850, image: '/categories/sneekers/shoe.jpeg' },
      { name: 'Cap', price: 180, image: '/categories/caps/cap.jpeg' },
      { name: 'Light Jacket', price: 650, image: '/categories/hoodies/hoodie.jpeg' },
    ],
  },
  {
    id: '2',
    label: 'WEEKEND CASUAL',
    title: 'Relaxed fits & soft layers',
    description:
      'Comfort meets style. Perfect for slow days, coffee runs and weekend plans.',
    image: '/products/cozy.jpeg',
    href: '/looks/weekend',
    align: 'right' as const,
    products: [
      { name: 'Hoodie', price: 550, image: '/categories/hoodies/hoodie.jpeg' },
      { name: 'Relaxed Trousers', price: 480, image: '/categories/cargo/166492517477861535.jpeg' },
      { name: 'Sneakers', price: 850, image: '/categories/sneekers/shoe.jpeg' },
      { name: 'Cap', price: 180, image: '/categories/caps/cap.jpeg' },
      { name: 'Oversized Tee', price: 280, image: '/categories/tees/shirt.jpg' },
    ],
  },
  {
    id: '3',
    label: 'URBAN LAYERING',
    title: 'Denim, tees & outerwear',
    description:
      'Classic pieces. Modern layers. Built for the urban grind.',
    image: '/products/Wednesday.jpeg',
    href: '/looks/urban',
    align: 'left' as const,
    products: [
      { name: 'Denim Jacket', price: 750, image: '/categories/denim/Jeans.jpeg' },
      { name: 'Graphic Tee', price: 280, image: '/categories/tees/shirt.jpg' },
      { name: 'Outerwear', price: 850, image: '/categories/hoodies/hoodie.jpeg' },
      { name: 'Jeans', price: 450, image: '/categories/denim/Jeans.jpeg' },
      { name: 'Sneakers', price: 850, image: '/categories/sneekers/shoe.jpeg' },
    ],
  },
];

const categoryBlocks = [
  {
    id: 'deals',
    title: 'Deals under K 3,500',
    href: '/shop?maxPrice=3500',
    items: [
      { label: 'Hoodies', image: '/categories/hoodies/hoodie.jpeg' },
      { label: 'Tees', image: '/categories/tees/shirt.jpg' },
      { label: 'Caps', image: '/categories/caps/cap.jpeg' },
      { label: 'Sneakers', image: '/categories/sneekers/shoe.jpeg' },
    ],
  },
  {
    id: 'trending',
    title: 'Trending now',
    href: '/shop?sort=trending',
    items: [
      { label: 'Denim', image: '/categories/denim/Jeans.jpeg' },
      { label: 'Cargo', image: '/categories/cargo/166492517477861535.jpeg' },
      { label: 'Headwear', image: '/categories/caps/cap.jpeg' },
      { label: 'Basics', image: '/categories/basics/7318418141817825.jpeg' },
    ],
  },
  {
    id: 'men',
    title: 'Shop Men',
    href: '/shop?category=Men',
    items: [
      { label: 'Jackets', image: '/categories/denim/Jeans.jpeg' },
      { label: 'Pants', image: '/categories/cargo/166492517477861535.jpeg' },
      { label: 'Footwear', image: '/categories/sneekers/shoe.jpeg' },
      { label: 'Accessories', image: '/categories/caps/cap.jpeg' },
    ],
  },
  {
    id: 'women',
    title: 'Shop Women',
    href: '/shop?category=Women',
    items: [
      { label: 'Tops', image: '/categories/tees/shirt.jpg' },
      { label: 'Denim', image: '/categories/denim/Jeans.jpeg' },
      { label: 'Hoodies', image: '/categories/hoodies/hoodie.jpeg' },
      { label: 'Hats', image: '/categories/caps/cap.jpeg' },
    ],
  },
];

const socialStats = {
  source: 'Facebook',
  sourceHandle: '@beilo.store',
  href: 'https://facebook.com',
  heading: 'Join our community',
  stats: [
    { id: 'followers', value: '98K', label: 'Followers', Icon: Users },
    { id: 'posts', value: '4.3K', label: 'Posts', Icon: Images },
  ],
};

const dealProducts = [
  {
    id: '1',
    name: 'Oversized Denim Jacket',
    price: 4200,
    originalPrice: 5200,
    image: '/categories/denim/Jeans.jpeg',
  },
  {
    id: '2',
    name: 'Cargo Utility Pants',
    price: 3800,
    originalPrice: 4500,
    image: '/categories/cargo/166492517477861535.jpeg',
  },
  {
    id: '3',
    name: 'Graphic Hoodie',
    price: 2800,
    originalPrice: 3500,
    image: '/categories/hoodies/hoodie.jpeg',
  },
  {
    id: '4',
    name: 'Canvas Sneakers',
    price: 2990,
    originalPrice: 3800,
    image: '/categories/sneekers/shoe.jpeg',
  },
  {
    id: '5',
    name: 'Beilo Classic Cap',
    price: 1850,
    image: '/categories/caps/cap.jpeg',
  },
  {
    id: '6',
    name: 'Relaxed Fit Tee',
    price: 1650,
    image: '/categories/tees/shirt.jpg',
  },
];

export default function HomeSections() {
  const catsRef = useRef<HTMLDivElement>(null);
  const dealsRef = useRef<HTMLDivElement>(null);

  const scrollTrack = (
    ref: React.RefObject<HTMLDivElement | null>,
    dir: 1 | -1
  ) => {
    const el = ref.current;

    if (!el) return;

    el.scrollBy({
      left: dir * el.clientWidth * 0.8,
      behavior: 'smooth',
    });
  };

  return (
    <div className="home-sections">
      {/* ===== LOOK SECTIONS (editorial hero) ===== */}
      {looks.map((look) => (
        <section
          key={look.id}
          className="look-section"
        >
          <div className="look-section-bg">
            <Image
              src={look.image}
              alt={look.title}
              fill
              sizes="100vw"
              className="look-section-bg-img"
              priority={look.id === '1'}
            />
            <div className="look-section-bg-overlay" />
          </div>

          <div
            className={`look-section-content ${look.align === 'right' ? 'look-section-content--reverse' : ''}`}
          >
            <div className="look-section-text">
              <p className="look-section-label">
                {look.label}
              </p>
              <h2 className="look-section-title">
                {look.title}
              </h2>
              <p className="look-section-desc">
                {look.description}
              </p>
              <Link
                href={look.href}
                className="look-section-cta"
              >
                SHOP THE LOOK
                <span className="look-section-cta-arrow">→</span>
              </Link>
            </div>

            <div className="look-section-products">
              {look.products.map((product) => (
                <Link
                  key={product.name}
                  href={`/shop?search=${encodeURIComponent(product.name)}`}
                  className="look-product-card"
                >
                  <div className="look-product-card-img">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      sizes="120px"
                      className="object-cover"
                    />
                  </div>
                  <p className="look-product-card-name">
                    {product.name}
                  </p>
                  <p className="look-product-card-price">
                    K{product.price}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* ===== SOCIAL PROOF (Facebook community) ===== */}
      <section className="home-section">
        <div className="social-proof">
          <div className="social-proof-brand">
            <span className="social-proof-icon">
              <Globe size={20} strokeWidth={2} />
            </span>
            <div>
              <p className="social-proof-heading">
                {socialStats.heading}
              </p>
              <p className="social-proof-sub">
                {socialStats.source} · {socialStats.sourceHandle}
              </p>
            </div>
          </div>

          <div className="social-proof-stats">
            {socialStats.stats.map(({ id, value, label, Icon }) => (
              <div key={id} className="social-proof-stat">
                <span className="social-proof-stat-icon">
                  <Icon size={16} strokeWidth={2} />
                </span>
                <span className="social-proof-stat-value">{value}</span>
                <span className="social-proof-stat-label">{label}</span>
              </div>
            ))}
          </div>

          <a
            href={socialStats.href}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary social-proof-cta"
          >
            Follow us
            <ArrowRight size={16} strokeWidth={2.5} />
          </a>
        </div>
      </section>

      {/* ===== CATEGORY SLIDER ===== */}
      <section className="home-section">
        <div className="section-header">
          <h2 className="section-title">
            Shop by category
          </h2>

          <div className="slider-nav">
            <button
              type="button"
              className="slider-btn"
              onClick={() => scrollTrack(catsRef, -1)}
              aria-label="Scroll categories left"
            >
              <ChevronLeft size={18} strokeWidth={2.5} />
            </button>

            <button
              type="button"
              className="slider-btn"
              onClick={() => scrollTrack(catsRef, 1)}
              aria-label="Scroll categories right"
            >
              <ChevronRight size={18} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        <div ref={catsRef} className="category-blocks-grid">
          {categoryBlocks.map((block) => (
            <div key={block.id} className="category-block">
              <h3 className="category-block-title">
                {block.title}
              </h3>

              <div className="category-block-items">
                {block.items.map((item) => (
                  <Link
                    key={item.label}
                    href={block.href}
                    className="category-block-item"
                  >
                    <div className="category-block-item-image">
                      <Image
                        src={item.image}
                        alt={item.label}
                        fill
                        sizes="(max-width: 640px) 40vw, 200px)"
                        className="object-cover"
                      />
                    </div>

                    <span className="category-block-item-label">
                      {item.label}
                    </span>
                  </Link>
                ))}
              </div>

              <Link
                href={block.href}
                className="category-block-link"
              >
                Shop now
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ===== DEALS SLIDER ===== */}
      <section className="home-section">
        <div className="section-header">
          <h2 className="section-title">
            Deals for you
          </h2>

          <div className="section-header-actions">
            <div className="slider-nav">
              <button
                type="button"
                className="slider-btn"
                onClick={() => scrollTrack(dealsRef, -1)}
                aria-label="Scroll deals left"
              >
                <ChevronLeft size={18} strokeWidth={2.5} />
              </button>

              <button
                type="button"
                className="slider-btn"
                onClick={() => scrollTrack(dealsRef, 1)}
                aria-label="Scroll deals right"
              >
                <ChevronRight size={18} strokeWidth={2.5} />
              </button>
            </div>

            <Link
              href="/shop?maxPrice=3500"
              className="section-cta"
            >
              See all
              <ArrowRight
                size={16}
                strokeWidth={2.5}
              />
            </Link>
          </div>
        </div>

        <div ref={dealsRef} className="deals-scroll">
          {dealProducts.map((product) => (
            <Link
              key={product.id}
              href={`/product/${product.id}`}
              className="deal-card"
            >
              <div className="deal-card-image-wrap">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="160px"
                  className="deal-card-image"
                />
              </div>

              <div className="deal-card-body">
                <p className="deal-card-name">
                  {product.name}
                </p>

                <div className="deal-card-pricing">
                  <span className="deal-card-price">
                    K {product.price.toLocaleString()}
                  </span>

                  {product.originalPrice && (
                    <span className="deal-card-price-original">
                      K {product.originalPrice.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}