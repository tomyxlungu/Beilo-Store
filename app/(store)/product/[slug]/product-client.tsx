'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Heart,
  ShoppingBag,
  Star,
  Minus,
  Plus,
  Truck,
  Lock,
  RotateCcw,
  Store,
  Award,
  ChevronLeft,
  ChevronRight,
  Zap,
} from 'lucide-react';
import { useCart } from '@/lib/cart-context';
import { useWishlist } from '@/lib/wishlist-context';
import type { Product } from '@/types/product';
import ProductCard from '@/components/ui/ProductCard';
import SizeSelector from '@/components/ui/SizeSelector';
import StockInfo from '@/components/ui/StockInfo';
import Accordion from '@/components/ui/Accordion';

interface ProductClientProps {
  product: Product;
  relatedProducts: Product[];
}

export default function ProductClient({ product, relatedProducts }: ProductClientProps) {
  const router = useRouter();
  const { addItem } = useCart();
  const { has, toggle, isHydrated } = useWishlist();

  const [activeImage, setActiveImage] = useState(0);
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>(
    () => (product && product.sizes.length === 1 ? product.sizes[0] : '')
  );
  const [sizeError, setSizeError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const relatedRef = useRef<HTMLDivElement>(null);

  const wishlisted = isHydrated && has(product.id);

  const CATEGORY_FALLBACKS: Record<string, string> = {
    Men: '/categories/tees/shirt.jpg',
    Women: '/categories/hoodies/hoodie.jpeg',
    Footwear: '/categories/sneekers/shoe.jpeg',
    Headwear: '/categories/caps/cap.jpeg',
    Denim: '/categories/denim/Jeans.jpeg',
    Promos: '/categories/basics/7318418141817825.jpeg',
  };

  const FINAL_FALLBACK = '/products/cozy.jpeg';

  function categoryFallback(product: Product): string {
    return CATEGORY_FALLBACKS[product.category] ?? FINAL_FALLBACK;
  }

  function productRating(slug: string): { rating: number; count: number } {
    let hash = 0;
    for (let i = 0; i < slug.length; i++) {
      hash = (hash * 31 + slug.charCodeAt(i)) >>> 0;
    }
    return { rating: 4.5 + (hash % 5) / 10, count: 48 + (hash % 1400) };
  }

  function Stars({ rating, size = 15 }: { rating: number; size?: number }) {
    return (
      <span className="pdp-stars" role="img" aria-label={`Rated ${rating.toFixed(1)} out of 5`}>
        {Array.from({ length: 5 }).map((_, index) => {
          const filled = rating >= index + 0.75;
          const half = !filled && rating >= index + 0.25;
          return (
            <Star
              key={index}
              size={size}
              strokeWidth={2}
              fill={filled || half ? 'currentColor' : 'none'}
              opacity={half ? 0.55 : 1}
              aria-hidden="true"
            />
          );
        })}
      </span>
    );
  }

  const SAMPLE_REVIEWS = [
    { initials: 'CM', name: 'Chanda M.', title: 'Great fit, quality fabric!' },
    { initials: 'MK', name: 'Mwila K.', title: 'Arrived fast, love it!' },
    { initials: 'TN', name: 'Tendai N.', title: 'True to size, will buy again!' },
  ];

  function ProductFaq({ name }: { name: string }) {
    return (
      <Accordion
        items={[
          {
            question: 'How fast is delivery?',
            answer: 'We deliver within Lusaka in 1–2 working days and countrywide in 2–5 working days. Delivery fees are confirmed at checkout.',
          },
          {
            question: 'What is your return policy?',
            answer: 'Changed your mind? Return unworn items with tags within 7 days for an exchange or refund. Need help? Chat to us on WhatsApp.',
          },
          {
            question: `How does ${name} fit?`,
            answer: 'Our fits run true to size. If you are between sizes, we recommend sizing up for a relaxed fit. Check the size guide on each size for measurements.',
          },
          {
            question: 'Can I pick up in store?',
            answer: 'Yes. Choose pickup at checkout and collect from any of our 5 stores — Lusaka, Ndola or Kitwe. We will message you when your order is ready.',
          },
          {
            question: 'How do I pay?',
            answer: 'We accept mobile money and pay on delivery in selected areas. All payments are confirmed before dispatch.',
          },
        ]}
      />
    );
  }

  const gallery = product.images.length > 0 ? product.images : [CATEGORY_FALLBACKS[product.category] ?? '/products/cozy.jpeg'];
  const mainSrc = imgSrc ?? gallery[activeImage];
  const { rating, count } = productRating(product.slug);

  const soldOut =
    product.stockByStore.length > 0 &&
    product.stockByStore.every((stock) => stock.status === 'out-of-stock');

  const requiresSize = product.sizes.length > 0;

  const handleImageError = () => {
    const fallback = CATEGORY_FALLBACKS[product.category] ?? '/products/cozy.jpeg';
    if (mainSrc !== fallback) {
      setImgSrc(fallback);
    } else if (mainSrc !== '/products/cozy.jpeg') {
      setImgSrc('/products/cozy.jpeg');
    }
  };

  const selectImage = (index: number) => {
    setActiveImage(index);
    setImgSrc(null);
  };

  const buildItem = () => ({
    id: product.id,
    name: product.name,
    price: product.price,
    image: gallery[0],
    size: selectedSize || undefined,
  });

  const handleAdd = () => {
    if (requiresSize && !selectedSize) {
      setSizeError('Please select a size first');
      return;
    }
    setSizeError('');
    addItem(buildItem(), quantity);
  };

  const handleBuyNow = () => {
    if (requiresSize && !selectedSize) {
      setSizeError('Please select a size first');
      return;
    }
    setSizeError('');
    addItem(buildItem(), quantity);
    router.push('/checkout');
  };

  const handleRelatedAdd = (relatedProduct: Product) => {
    addItem({
      id: relatedProduct.id,
      name: relatedProduct.name,
      price: relatedProduct.price,
      image: relatedProduct.images[0],
    });
  };

  const scrollRelated = (direction: 1 | -1) => {
    relatedRef.current?.scrollBy({ left: direction * 480, behavior: 'smooth' });
  };

  const tag = soldOut
    ? { label: 'Sold out', modifier: 'product-tag--sold' }
    : product.isPromo
    ? { label: 'Promo', modifier: 'product-tag--promo' }
    : product.isNew
    ? { label: 'New', modifier: 'product-tag--new' }
    : product.isTrending
    ? { label: 'Trending', modifier: 'product-tag--trend' }
    : null;

  const trustItems = [
    { Icon: Lock, label: 'Secure Checkout' },
    { Icon: Truck, label: 'Fast Shipping' },
    { Icon: RotateCcw, label: '7-Day Returns' },
    { Icon: Store, label: '5 Stores Countrywide' },
  ];

  const whyItems = [
    { Icon: Award, title: 'Premium Quality', text: 'Hand-picked fabrics and finishes that survive everyday wear and washing.' },
    { Icon: Zap, title: 'Fast Delivery', text: 'Same-week delivery in Lusaka and countrywide shipping to your door.' },
    { Icon: RotateCcw, title: 'Easy Returns', text: '7-day exchanges and refunds. No stories, no stress — just BEILO.' },
  ];

  return (
    <div className="pdp">
      <Link href="/shop" className="pdp-back">
        <ArrowLeft size={17} strokeWidth={2} />
        <span>Back to Shop</span>
      </Link>

      <div className="pdp-top">
        <div className="pdp-gallery">
          <div className="pdp-main">
            <Image
              key={mainSrc}
              src={mainSrc}
              alt={product.name}
              fill
              sizes="(max-width: 900px) 100vw, 50vw"
              className="pdp-main-image"
              priority
              onError={handleImageError}
            />

            {tag && (
              <span className={`product-tag ${tag.modifier}`}>
                {tag.label}
              </span>
            )}

            <button
              type="button"
              className="product-wishlist pdp-wishlist"
              aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              aria-pressed={wishlisted}
              onClick={() => toggle(product.id)}
            >
              <Heart
                size={18}
                strokeWidth={2}
                fill={wishlisted ? '#ef3030' : 'none'}
                color={wishlisted ? '#ef3030' : 'currentColor'}
              />
            </button>
          </div>

          {gallery.length > 1 && (
            <div className="pdp-thumbs">
              {gallery.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  onClick={() => selectImage(index)}
                  aria-label={`View image ${index + 1}`}
                  aria-pressed={activeImage === index}
                  className={`pdp-thumb ${activeImage === index ? 'is-active' : ''}`}
                >
                  <Image
                    src={image}
                    alt=""
                    fill
                    sizes="120px"
                    className="pdp-thumb-image"
                    onError={handleImageError}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="pdp-info">
          <p className="pdp-category">
            {product.category} · BEILO Essentials
          </p>
          <h1 className="pdp-title">{product.name}</h1>

          <div className="pdp-rating-row">
            <Stars rating={rating} />
            <span className="pdp-rating-value">{rating.toFixed(1)}</span>
            <a href="#pdp-reviews" className="pdp-review-link">
              {count.toLocaleString()} Reviews
            </a>
          </div>

          <p className="pdp-price">K {product.price.toLocaleString()}</p>
          <p className="pdp-description">{product.description}</p>

          {requiresSize && (
            <SizeSelector
              sizes={product.sizes}
              selectedSize={selectedSize}
              onSelect={(size) => { setSelectedSize(size); setSizeError(''); }}
              label="Select Size"
              required
              error={sizeError}
              showSelected={false}
            />
          )}

          <div className="pdp-qty-row">
            <div className="pdp-qty" role="group" aria-label="Quantity">
              <button type="button" className="pdp-qty-btn" aria-label="Decrease quantity" disabled={quantity <= 1} onClick={() => setQuantity((q) => Math.max(1, q - 1))}>
                <Minus size={15} strokeWidth={2.5} />
              </button>
              <span className="pdp-qty-value" aria-live="polite">{quantity}</span>
              <button type="button" className="pdp-qty-btn" aria-label="Increase quantity" disabled={quantity >= 9} onClick={() => setQuantity((q) => Math.min(9, q + 1))}>
                <Plus size={15} strokeWidth={2.5} />
              </button>
            </div>
            <p className="pdp-shipping">
              <Truck size={16} strokeWidth={2} aria-hidden="true" />
              <span>Fast delivery, pay on arrival</span>
            </p>
          </div>

          <div className="pdp-actions">
            <button type="button" className="btn btn-primary pdp-cta" disabled={soldOut} onClick={handleAdd}>
              <ShoppingBag size={17} strokeWidth={2} />
              <span>{soldOut ? 'Sold Out' : 'Add to Cart'}</span>
            </button>
            <button type="button" className="btn btn-secondary pdp-cta" disabled={soldOut} onClick={handleBuyNow}>
              <span>Buy Now</span>
            </button>
          </div>

          <div className="pdp-trust">
            {[
              { Icon: Lock, label: 'Secure Checkout' },
              { Icon: Truck, label: 'Fast Shipping' },
              { Icon: RotateCcw, label: '7-Day Returns' },
              { Icon: Store, label: '5 Stores Countrywide' },
            ].map(({ Icon, label }) => (
              <span key={label} className="pdp-trust-item">
                <Icon size={16} strokeWidth={2} aria-hidden="true" />
                <span>{label}</span>
              </span>
            ))}
          </div>

          <div className="pdp-stock">
            <StockInfo stockByStore={product.stockByStore} />
          </div>
        </div>
      </div>

      <section className="pdp-section">
        <h2 className="pdp-section-title pdp-section-title-center">Why {product.name}?</h2>
        <div className="pdp-why">
          {[
            { Icon: Award, title: 'Premium Quality', text: 'Hand-picked fabrics and finishes that survive everyday wear and washing.' },
            { Icon: Zap, title: 'Fast Delivery', text: 'Same-week delivery in Lusaka and countrywide shipping to your door.' },
            { Icon: RotateCcw, title: 'Easy Returns', text: '7-day exchanges and refunds. No stories, no stress — just BEILO.' },
          ].map(({ Icon, title, text }) => (
            <div key={title} className="pdp-why-item">
              <span className="pdp-why-icon">
                <Icon size={20} strokeWidth={2} aria-hidden="true" />
              </span>
              <div>
                <h3 className="pdp-why-title">{title}</h3>
                <p className="pdp-why-text">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="pdp-section" id="pdp-reviews">
        <h2 className="pdp-section-title">Customer Reviews</h2>
        <div className="pdp-reviews">
          {[
            { initials: 'CM', name: 'Chanda M.', title: 'Great fit, quality fabric!' },
            { initials: 'MK', name: 'Mwila K.', title: 'Arrived fast, love it!' },
            { initials: 'TN', name: 'Tendai N.', title: 'True to size, will buy again!' },
          ].map((review) => (
            <article key={review.name} className="pdp-review">
              <div className="pdp-review-head">
                <span className="pdp-review-avatar" aria-hidden="true">{review.initials}</span>
                <div>
                  <Stars rating={5} size={13} />
                  <p className="pdp-review-name">{review.name}</p>
                </div>
              </div>
              <p className="pdp-review-title">{review.title}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="pdp-section pdp-faq">
        <h2 className="pdp-section-title">Frequently Asked Questions</h2>
        <Accordion
          items={[
            {
              question: 'How fast is delivery?',
              answer: 'We deliver within Lusaka in 1–2 working days and countrywide in 2–5 working days. Delivery fees are confirmed at checkout.',
            },
            {
              question: 'What is your return policy?',
              answer: 'Changed your mind? Return unworn items with tags within 7 days for an exchange or refund. Need help? Chat to us on WhatsApp.',
            },
            {
              question: `How does ${product.name} fit?`,
              answer: 'Our fits run true to size. If you are between sizes, we recommend sizing up for a relaxed fit. Check the size guide on each size for measurements.',
            },
            {
              question: 'Can I pick up in store?',
              answer: 'Yes. Choose pickup at checkout and collect from any of our 5 stores — Lusaka, Ndola or Kitwe. We will message you when your order is ready.',
            },
            {
              question: 'How do I pay?',
              answer: 'We accept mobile money and pay on delivery in selected areas. All payments are confirmed before dispatch.',
            },
          ]}
        />
      </section>

      {relatedProducts.length > 0 && (
        <section className="pdp-section">
          <div className="pdp-related-head">
            <h2 className="pdp-section-title">Related Products</h2>
            <div className="pdp-related-nav">
              <button type="button" className="pdp-arrow" aria-label="Scroll related products left" onClick={() => scrollRelated(-1)}>
                <ChevronLeft size={18} strokeWidth={2} />
              </button>
              <button type="button" className="pdp-arrow" aria-label="Scroll related products right" onClick={() => scrollRelated(1)}>
                <ChevronRight size={18} strokeWidth={2} />
              </button>
            </div>
          </div>
          <div className="pdp-related-track" ref={relatedRef}>
            {relatedProducts.map((item) => (
              <div key={item.id} className="pdp-related-card">
                <ProductCard product={item} onAddToCart={handleRelatedAdd} />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}