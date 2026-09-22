// components/home/HomeSections.tsx
'use client';

import { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ChevronLeft, ChevronRight, Globe, Images, Users } from 'lucide-react';

interface LookProduct {
  name: string;
  price: number;
  image: string;
}

interface Look {
  id: string;
  label: string;
  title: string;
  description: string;
  image: string;
  href: string;
  align: 'left' | 'right';
  products: LookProduct[];
}

interface CategoryBlock {
  id: string;
  title: string;
  href: string;
  items: { label: string; image: string }[];
}

interface DealProduct {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
}

interface SocialStats {
  source: string;
  sourceHandle: string;
  href: string;
  heading: string;
  stats: { id: string; value: string; label: string; Icon?: any }[];
}

interface Hero {
  title: string;
  subtitle?: string;
  image?: string;
  ctaText?: string;
  href?: string;
}

interface HomeSectionsProps {
  hero?: Hero | null;
  looks: Look[];
  categoryBlocks: CategoryBlock[];
  dealProducts: DealProduct[];
  socialStats: SocialStats;
}

export default function HomeSections({ hero, looks, categoryBlocks, dealProducts, socialStats }: HomeSectionsProps) {
  const catsRef = useRef<HTMLDivElement>(null);
  const dealsRef = useRef<HTMLDivElement>(null);

  const scrollTrack = (ref: React.RefObject<HTMLDivElement | null>, dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: 'smooth' });
  };

  return (
    <div className="home-sections">
      {hero && (
        <section className="hero-section">
          {hero.image && (
            <div className="hero-section-bg">
              <Image src={hero.image} alt={hero.title} fill sizes="100vw" className="hero-section-bg-img" priority />
              <div className="hero-section-bg-overlay" />
            </div>
          )}
          <div className="hero-section-content">
            {hero.subtitle && <p className="hero-section-label">{hero.subtitle}</p>}
            <h1 className="hero-section-title">{hero.title}</h1>
            {hero.ctaText && (
              <Link href={hero.href || '/shop'} className="hero-section-cta">
                {hero.ctaText} <span aria-hidden="true">→</span>
              </Link>
            )}
          </div>
        </section>
      )}
      {looks.map((look) => (
        <section key={look.id} className="look-section">
          <div className="look-section-bg">
            <Image src={look.image} alt={look.title} fill sizes="100vw" className="look-section-bg-img" priority={look.id === '1'} />
            <div className="look-section-bg-overlay" />
          </div>
          <div className={`look-section-content ${look.align === 'right' ? 'look-section-content--reverse' : ''}`}>
            <div className="look-section-text">
              <p className="look-section-label">{look.label}</p>
              <h2 className="look-section-title">{look.title}</h2>
              <p className="look-section-desc">{look.description}</p>
              <Link href={look.href} className="look-section-cta">SHOP THE LOOK <span className="look-section-cta-arrow">→</span></Link>
            </div>
            <div className="look-section-products">
              {look.products.map((product) => (
                <Link key={product.name} href={`/shop?search=${encodeURIComponent(product.name)}`} className="look-product-card">
                  <div className="look-product-card-img">
                    <Image src={product.image} alt={product.name} fill sizes="120px" className="object-cover" />
                  </div>
                  <p className="look-product-card-name">{product.name}</p>
                  <p className="look-product-card-price">K{product.price}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ))}

      <section className="home-section">
        <div className="social-proof">
          <div className="social-proof-brand">
            <span className="social-proof-icon"><Globe size={20} strokeWidth={2} /></span>
            <div>
              <p className="social-proof-heading">{socialStats.heading}</p>
              <p className="social-proof-sub">{socialStats.source} · {socialStats.sourceHandle}</p>
            </div>
          </div>
          <div className="social-proof-stats">
            {socialStats.stats.map(({ id, value, label, Icon }) => (
              <div key={id} className="social-proof-stat">
                <span className="social-proof-stat-icon">
                  {Icon ? <Icon size={16} strokeWidth={2} /> : <Users size={16} strokeWidth={2} />}
                </span>
                <span className="social-proof-stat-value">{value}</span>
                <span className="social-proof-stat-label">{label}</span>
              </div>
            ))}
          </div>
          <a href={socialStats.href} target="_blank" rel="noopener noreferrer" className="btn btn-secondary social-proof-cta">
            Follow us <ArrowRight size={16} strokeWidth={2.5} />
          </a>
        </div>
      </section>

      <section className="home-section">
        <div className="section-header">
          <h2 className="section-title">Shop by category</h2>
          <div className="slider-nav">
            <button type="button" className="slider-btn" onClick={() => scrollTrack(catsRef, -1)} aria-label="Scroll categories left"><ChevronLeft size={18} strokeWidth={2.5} /></button>
            <button type="button" className="slider-btn" onClick={() => scrollTrack(catsRef, 1)} aria-label="Scroll categories right"><ChevronRight size={18} strokeWidth={2.5} /></button>
          </div>
        </div>
        <div ref={catsRef} className="category-blocks-grid">
          {categoryBlocks.map((block) => (
            <div key={block.id} className="category-block">
              <h3 className="category-block-title">{block.title}</h3>
              <div className="category-block-items">
                {block.items.map((item) => (
                  <Link key={item.label} href={block.href} className="category-block-item">
                    <div className="category-block-item-image">
                      <Image src={item.image} alt={item.label} fill sizes="(max-width: 640px) 40vw, 200px)" className="object-cover" />
                    </div>
                    <span className="category-block-item-label">{item.label}</span>
                  </Link>
                ))}
              </div>
              <Link href={block.href} className="category-block-link">Shop now</Link>
            </div>
          ))}
        </div>
      </section>

      <section className="home-section">
        <div className="section-header">
          <h2 className="section-title">Deals for you</h2>
          <div className="section-header-actions">
            <div className="slider-nav">
              <button type="button" className="slider-btn" onClick={() => scrollTrack(dealsRef, -1)} aria-label="Scroll deals left"><ChevronLeft size={18} strokeWidth={2.5} /></button>
              <button type="button" className="slider-btn" onClick={() => scrollTrack(dealsRef, 1)} aria-label="Scroll deals right"><ChevronRight size={18} strokeWidth={2.5} /></button>
            </div>
            <Link href="/shop?maxPrice=3500" className="section-cta">See all <ArrowRight size={16} strokeWidth={2.5} /></Link>
          </div>
        </div>
        <div ref={dealsRef} className="deals-scroll">
          {dealProducts.map((product) => (
            <Link key={product.id} href={`/product/${product.id}`} className="deal-card">
              <div className="deal-card-image-wrap">
                <Image src={product.image} alt={product.name} fill sizes="160px" className="deal-card-image" />
              </div>
              <div className="deal-card-body">
                <p className="deal-card-name">{product.name}</p>
                <div className="deal-card-pricing">
                  <span className="deal-card-price">K {product.price.toLocaleString()}</span>
                  {product.originalPrice && <span className="deal-card-price-original">K {product.originalPrice.toLocaleString()}</span>}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}