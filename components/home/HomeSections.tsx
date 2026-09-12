'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

/* ---------- Data ---------- */
const promoBanner = {
  title: 'New season just dropped',
  subtitle:
    'Fresh denim, essentials and streetwear for every day. Shop the looks that define BEILO.',
  cta: 'Shop new arrivals',
  href: '/shop?new=true',
  bg: '#2B2B2B',
};

const lookCards = [
  {
    id: '1',
    title: 'Street essentials',
    subtitle: 'Layered looks for the city',
    image: '/products/beliloimg.avif',
    href: '/looks/street',
  },
  {
    id: '2',
    title: 'Weekend casual',
    subtitle: 'Relaxed fits & soft layers',
    image: '/products/cozy.jpeg',
    href: '/looks/weekend',
  },
  {
    id: '3',
    title: 'Urban layering',
    subtitle: 'Denim, tees & outerwear',
    image: '/products/Wednesday.jpeg',
    href: '/looks/urban',
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
  const promoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const carousel = promoRef.current;

    if (!carousel) return;

    const interval = setInterval(() => {
      const slides =
        carousel.querySelectorAll<HTMLElement>('.promo-slide');

      if (!slides.length) return;

      const currentScroll = carousel.scrollLeft;

      const nextSlide = Array.from(slides).find(
        (slide) => slide.offsetLeft > currentScroll + 10
      );

      if (nextSlide) {
        carousel.scrollTo({
          left: nextSlide.offsetLeft - carousel.offsetLeft,
          behavior: 'smooth',
        });
      } else {
        carousel.scrollTo({
          left: 0,
          behavior: 'smooth',
        });
      }
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="home-sections">
      {/* ===== PROMO BANNER + LOOK CARDS (IKEA style) ===== */}
      {/* ===== PROMO CAROUSEL (minimal) ===== */}
      <section className="home-section">
        <div ref={promoRef} className="promo-carousel">
          {lookCards.map((card) => (
            <Link
              key={card.id}
              href={card.href}
              className="promo-slide"
            >
              <div className="promo-slide-image-wrap">
                <Image
                  src={card.image}
                  alt={card.title}
                  fill
                  sizes="(max-width: 768px) 90vw, 400px"
                  className="promo-slide-image"
                  priority={card.id === '1'}
                />
              </div>

              <div className="promo-slide-overlay">
                <p className="promo-slide-label">
                  {card.subtitle}
                </p>

                <h3 className="promo-slide-title">
                  {card.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ===== CATEGORY BLOCKS (Amazon style 2x2) ===== */}
      <section className="home-section">
        <div className="category-blocks-grid">
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

      {/* ===== DEALS STRIP ===== */}
      <section className="home-section">
        <div className="section-header">
          <h2 className="section-title">
            Deals for you
          </h2>

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

        <div className="deals-scroll">
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