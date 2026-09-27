'use client';

import { useEffect, useRef, useState } from 'react';
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
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useCart } from '@/lib/cart-context';
import { useWishlist } from '@/lib/wishlist-context';
import {
  fetchRatings,
  submitReview,
  EMPTY_SUMMARY,
  type ProductReview,
  type RatingSummary,
} from '@/lib/reviews';
import { saveDefaultStore, getProfile } from '@/lib/preferences';
import type { Product } from '@/types/product';
import ProductCard from '@/components/ui/ProductCard';
import SizeSelector from '@/components/ui/SizeSelector';
import StockInfo from '@/components/ui/StockInfo';

interface ProductClientProps {
  product: Product;
  relatedProducts: Product[];
  completeLookProducts?: Product[];
  /** Real aggregate fetched server-side from the reviews table. */
  initialRating?: RatingSummary;
  /** Real reviews fetched server-side (latest 12). */
  initialReviews?: ProductReview[];
}

export default function ProductClient({
  product,
  relatedProducts,
  completeLookProducts = [],
  initialRating = EMPTY_SUMMARY,
  initialReviews = [],
}: ProductClientProps) {
  const router = useRouter();
  const { addItem } = useCart();
  const { has, toggle, isHydrated } = useWishlist();

  const [activeImage, setActiveImage] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const dragStartX = useRef(0);
  const thumbsRef = useRef<HTMLDivElement>(null);
  const [selectedSize, setSelectedSize] = useState<string>(
    () => (product && product.sizes.length === 1 ? product.sizes[0] : '')
  );
  const [sizeError, setSizeError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const relatedRef = useRef<HTMLDivElement>(null);
  const lookRef = useRef<HTMLDivElement>(null);
  const [storeQuery, setStoreQuery] = useState('');
  const [userReviews, setUserReviews] = useState<ProductReview[]>(initialReviews);
  const [reviewName, setReviewName] = useState('');
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewError, setReviewError] = useState('');
  const [posting, setPosting] = useState(false);
  const [posted, setPosted] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [verifiedBuyer, setVerifiedBuyer] = useState(false);
  // Hydration-safe: starts as the server-provided real summary, then
  // refreshes from the API with the viewer's phone for the verified flag.
  const [rating, setRating] = useState<RatingSummary>(initialRating);

  useEffect(() => {
    let cancelled = false;
    const phone = getProfile().phone || undefined;
    fetchRatings(product.id, phone).then((data) => {
      if (cancelled) return;
      setRating(data.summary);
      setUserReviews(data.reviews);
      setVerifiedBuyer(data.viewerVerified);
    });
    return () => {
      cancelled = true;
    };
  }, [product.id]);

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

  const gallery = product.images.length > 0 ? product.images : [CATEGORY_FALLBACKS[product.category] ?? '/products/cozy.jpeg'];
  const { rating: ratingValue, count: ratingCount } = rating;
  const TRUNCATE_AT = 110;
  const isLong = product.description.length > TRUNCATE_AT;
  const visibleDescription = expanded || !isLong
    ? product.description
    : `${product.description.slice(0, TRUNCATE_AT).trimEnd()}…`;

  const soldOut =
    product.stockByStore.length > 0 &&
    product.stockByStore.every((stock) => stock.status === 'out-of-stock');

  // Per-image fallback (a broken URL swaps to the category/cozy fallback once).
  const [failedSrcs, setFailedSrcs] = useState<Set<string>>(new Set());
  const srcFor = (src: string) => {
    if (!failedSrcs.has(src)) return src;
    const catFallback = CATEGORY_FALLBACKS[product.category] ?? '/products/cozy.jpeg';
    if (src !== catFallback && !failedSrcs.has(catFallback)) return catFallback;
    return '/products/cozy.jpeg';
  };
  const handleSlideError = (src: string) => {
    setFailedSrcs((prev) => (src === '/products/cozy.jpeg' || prev.has(src) ? prev : new Set(prev).add(src)));
  };

  const requiresSize = product.sizes.length > 0;

  const selectImage = (index: number) => {
    setActiveImage(index);
  };

  const goToImage = (index: number) => {
    setActiveImage(((index % gallery.length) + gallery.length) % gallery.length);
  };

  // Slides reset whenever the product itself changes (client-side nav
  // between products reuses this component and its state).
  useEffect(() => {
    setActiveImage(0);
    setDragX(0);
    setDragging(false);
    setFailedSrcs(new Set());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id]);

  // Keep the active thumbnail in view as the slides change.
  useEffect(() => {
    thumbsRef.current
      ?.querySelector(`[data-index="${activeImage}"]`)
      ?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, [activeImage]);

  // Pointer drag: swipe/drag horizontally to change slides.
  // Vertical touch scrolling still works via `touch-action: pan-y`.
  const onStagePointerDown = (e: React.PointerEvent) => {
    if (gallery.length < 2) return;
    dragStartX.current = e.clientX;
    setDragging(true);
  };
  const onStagePointerMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    setDragX(e.clientX - dragStartX.current);
  };
  const endDrag = () => {
    if (!dragging) return;
    if (dragX <= -60) goToImage(activeImage + 1);
    else if (dragX >= 60) goToImage(activeImage - 1);
    setDragX(0);
    setDragging(false);
  };

  const onStageKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') goToImage(activeImage + 1);
    else if (e.key === 'ArrowLeft') goToImage(activeImage - 1);
  };

  const buildItem = () => ({
    id: product.id,
    name: product.name,
    price: product.price,
    image: srcFor(gallery[0]),
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

  const handleAddAllLook = () => {
    for (const item of completeLookProducts.slice(0, 4)) {
      addItem({
        id: item.id,
        name: item.name,
        price: item.price,
        image: item.images[0],
      });
    }
  };

  const scrollRelated = (direction: 1 | -1) => {
    relatedRef.current?.scrollBy({ left: direction * 480, behavior: 'smooth' });
  };

  const scrollLook = (direction: 1 | -1) => {
    lookRef.current?.scrollBy({ left: direction * 480, behavior: 'smooth' });
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

  return (
    <div className="pdp">
      <div className="pdp-top">
        <div className="pdp-gallery">
          <div
            className={`pdp-main pdp-hero-card pdp-stage${dragging ? ' is-dragging' : ''}`}
            role="region"
            aria-roledescription="carousel"
            aria-label={`${product.name} images`}
            tabIndex={gallery.length > 1 ? 0 : undefined}
            onKeyDown={onStageKeyDown}
            onPointerDown={onStagePointerDown}
            onPointerMove={onStagePointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            onPointerLeave={endDrag}
          >
            <div
              className="pdp-track"
              style={{ transform: `translateX(calc(${-activeImage * 100}% + ${dragX}px))` }}
            >
              {gallery.map((image, index) => (
                <div
                  key={`${image}-${index}`}
                  className="pdp-slide"
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`Image ${index + 1} of ${gallery.length}`}
                  aria-hidden={index !== activeImage}
                >
                  <Image
                    src={srcFor(image)}
                    alt={index === 0 ? product.name : `${product.name} — view ${index + 1}`}
                    fill
                    sizes="(max-width: 900px) 100vw, 50vw"
                    className="pdp-main-image"
                    priority={index === 0}
                    draggable={false}
                    onError={() => handleSlideError(image)}
                  />
                </div>
              ))}
            </div>

            <Link href="/shop" className="pdp-nav-btn pdp-nav-back" aria-label="Back to shop">
              <ArrowLeft size={17} strokeWidth={2} />
            </Link>

            <button
              type="button"
              className="pdp-nav-btn pdp-nav-heart"
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

            {gallery.length > 1 && (
              <>
                <button
                  type="button"
                  className="pdp-arrow-btn pdp-arrow-prev"
                  aria-label="Previous image"
                  onClick={() => goToImage(activeImage - 1)}
                >
                  <ChevronLeft size={20} strokeWidth={2.5} />
                </button>
                <button
                  type="button"
                  className="pdp-arrow-btn pdp-arrow-next"
                  aria-label="Next image"
                  onClick={() => goToImage(activeImage + 1)}
                >
                  <ChevronRight size={20} strokeWidth={2.5} />
                </button>
                <span className="pdp-counter" aria-hidden="true">
                  {activeImage + 1} / {gallery.length}
                </span>
              </>
            )}

            {ratingCount > 0 && (
              <a href="#pdp-reviews" className="pdp-rating-pill" aria-label={`${ratingValue.toFixed(1)} stars, ${ratingCount} ratings. Go to reviews.`}>
                <span className="pdp-rating-pill-value">{ratingValue.toFixed(1)}</span>
                <Star size={13} strokeWidth={2} fill="currentColor" aria-hidden="true" />
                <span className="pdp-rating-pill-sep" aria-hidden="true">|</span>
                <span>Ratings</span>
                <ChevronRight size={13} strokeWidth={2.5} aria-hidden="true" />
              </a>
            )}
            <span className="pdp-visually-hidden" role="status">
              Image {activeImage + 1} of {gallery.length}
            </span>
          </div>

          {gallery.length > 1 && (
            <div className="pdp-thumbs" ref={thumbsRef}>
              {gallery.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  data-index={index}
                  onClick={() => selectImage(index)}
                  aria-label={`View image ${index + 1}`}
                  aria-pressed={activeImage === index}
                  aria-current={activeImage === index}
                  className={`pdp-thumb ${activeImage === index ? 'is-active' : ''}`}
                >
                  <Image
                    src={srcFor(image)}
                    alt=""
                    fill
                    sizes="120px"
                    className="pdp-thumb-image"
                    draggable={false}
                    onError={() => handleSlideError(image)}
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

          {tag && (
            <span className="pdp-badge-pill" data-tone={tag.modifier}>
              {tag.label === 'Trending' ? 'Best Seller' : tag.label}
            </span>
          )}

          <p className="pdp-description">
            {visibleDescription}
            {isLong && (
              <button
                type="button"
                className="pdp-readmore"
                onClick={() => setExpanded((v) => !v)}
                aria-expanded={expanded}
              >
                {expanded ? 'read less' : 'read more'}
              </button>
            )}
          </p>

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

          <div className="pdp-buybar">
            <span className="pdp-price-pill">K {product.price.toLocaleString()}</span>
            <div className="pdp-qty" role="group" aria-label="Quantity">
              <button type="button" className="pdp-qty-btn" aria-label="Decrease quantity" disabled={quantity <= 1} onClick={() => setQuantity((q) => Math.max(1, q - 1))}>
                <Minus size={15} strokeWidth={2.5} />
              </button>
              <span className="pdp-qty-value" aria-live="polite">{String(quantity).padStart(2, '0')}</span>
              <button type="button" className="pdp-qty-btn" aria-label="Increase quantity" disabled={quantity >= 9} onClick={() => setQuantity((q) => Math.min(9, q + 1))}>
                <Plus size={15} strokeWidth={2.5} />
              </button>
            </div>
            <button
              type="button"
              className="pdp-cart-fab"
              disabled={soldOut}
              onClick={handleAdd}
              aria-label={soldOut ? 'Sold out' : `Add ${product.name} to bag`}
            >
              <ShoppingBag size={19} strokeWidth={2} />
            </button>
          </div>
          {!soldOut && (
            <button type="button" className="btn btn-secondary pdp-cta" onClick={handleBuyNow}>
              <span>Buy Now</span>
            </button>
          )}
          {soldOut && (
            <p className="pdp-review-error" role="status">Sold out — check stock below or try another size.</p>
          )}
          <p className="pdp-shipping">
            <Truck size={16} strokeWidth={2} aria-hidden="true" />
            <span>Fast delivery, pay on arrival</span>
          </p>

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
            <StockInfo
              stockByStore={product.stockByStore}
              searchable
              query={storeQuery}
              onQueryChange={setStoreQuery}
              onStoreClick={(storeName) => {
                saveDefaultStore(storeName);
                setStoreQuery(storeName);
              }}
            />
          </div>
        </div>
      </div>

      <section className="pdp-section" id="pdp-reviews">
        <h2 className="pdp-section-title">Customer Reviews</h2>
        <div className="pdp-reviews">
          {userReviews.length === 0 ? (
            <p className="pdp-reviews-empty">
              No reviews yet — be the first to tell the next shopper how it fits.
            </p>
          ) : (
            userReviews.map((review) => (
              <article key={review.id} className="pdp-review">
                <div className="pdp-review-head">
                  <span className="pdp-review-avatar" aria-hidden="true">
                    {review.name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase()}
                  </span>
                  <div>
                    <Stars rating={review.rating} size={13} />
                    <p className="pdp-review-name">
                      {review.name}{' '}
                      {review.verified && (
                        <span className="pdp-review-verified">
                          · Verified order
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <p className="pdp-review-title">{review.title}</p>
              </article>
            ))
          )}
        </div>

        <div className="pdp-review-cta">
          <div>
            <h3 className="pdp-review-cta-title">Wore it? Rate it.</h3>
            <p className="pdp-review-cta-text">
              Tell the next shopper how {product.name} fits. Reviews are checked against real
              orders before they get the verified badge.
            </p>
            {verifiedBuyer && (
              <span className="pdp-review-cta-badge">
                <Star size={12} strokeWidth={2.5} fill="currentColor" aria-hidden="true" />
                Verified buyer — your review gets the badge
              </span>
            )}
          </div>

          <form
            className="pdp-review-form"
            onSubmit={async (e) => {
              e.preventDefault();
              if (reviewTitle.trim().length < 3) {
                setReviewError('Please write a short review (min 3 characters).');
                return;
              }
              if (posting) return;
              setPosting(true);
              setReviewError('');
              setPosted(false);
              try {
                const { review, summary } = await submitReview({
                  productId: product.id,
                  name: reviewName,
                  title: reviewTitle,
                  rating: reviewRating,
                  phone: getProfile().phone || undefined,
                });
                setUserReviews((prev) =>
                  prev.some((r) => r.id === review.id) ? prev : [review, ...prev]
                );
                setRating(summary);
                if (review.verified) setVerifiedBuyer(true);
                setReviewTitle('');
                setPosted(true);
              } catch (err) {
                setReviewError(
                  err instanceof Error && err.message
                    ? err.message
                    : 'Could not save your review. Please try again.'
                );
              } finally {
                setPosting(false);
              }
            }}
          >
            <div className="pdp-field">
              <span id="pdp-rate-label" className="pdp-review-cta-text" style={{ fontWeight: 700 }}>
                Your rating
              </span>
              <div className="pdp-stars-input" role="radiogroup" aria-labelledby="pdp-rate-label">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    role="radio"
                    aria-checked={reviewRating === n}
                    aria-label={`${n} star${n === 1 ? '' : 's'}`}
                    className={`pdp-star-btn ${reviewRating >= n ? 'is-active' : ''}`}
                    onClick={() => setReviewRating(n)}
                  >
                    <Star
                      size={20}
                      strokeWidth={2}
                      fill={reviewRating >= n ? 'currentColor' : 'none'}
                      aria-hidden="true"
                    />
                  </button>
                ))}
                <span className="pdp-review-cta-text" aria-live="polite">{reviewRating}.0 / 5</span>
              </div>
            </div>

            <div className="pdp-field">
              <label htmlFor="pdp-review-name">Name</label>
              <input
                id="pdp-review-name"
                placeholder="e.g. Chanda"
                value={reviewName}
                onChange={(e) => { setReviewName(e.target.value); setPosted(false); }}
                autoComplete="name"
              />
            </div>

            <div className="pdp-field">
              <label htmlFor="pdp-review-text">Review</label>
              <textarea
                id="pdp-review-text"
                placeholder={`How does ${product.name} fit? True to size?`}
                value={reviewTitle}
                onChange={(e) => { setReviewTitle(e.target.value); setReviewError(''); setPosted(false); }}
              />
            </div>

            {reviewError && <p className="pdp-review-error" role="alert">{reviewError}</p>}
            {posted && !reviewError && <p className="pdp-review-success" role="status">Thanks! Your review is live below.</p>}

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <button type="submit" className="btn btn-primary" disabled={posting}>
                {posting ? 'Posting…' : 'Post review'}
              </button>
              <span className="pdp-review-hint">No account needed</span>
            </div>
          </form>
        </div>
      </section>

      {completeLookProducts.length > 0 && (
        <section className="pdp-section">
          <div className="pdp-related-head">
            <div>
              <h2 className="pdp-section-title">Complete the look</h2>
              <p className="pdp-description">Styled with {product.name} — add the full outfit in one tap.</p>
            </div>
            <div className="pdp-related-nav">
              <button type="button" className="btn btn-secondary" onClick={handleAddAllLook}>
                <ShoppingBag size={16} strokeWidth={2} />
                <span>Add all to bag</span>
              </button>
              <button type="button" className="pdp-arrow" aria-label="Scroll complete the look left" onClick={() => scrollLook(-1)}>
                <ChevronLeft size={18} strokeWidth={2} />
              </button>
              <button type="button" className="pdp-arrow" aria-label="Scroll complete the look right" onClick={() => scrollLook(1)}>
                <ChevronRight size={18} strokeWidth={2} />
              </button>
            </div>
          </div>
          <div className="pdp-related-track" ref={lookRef}>
            {completeLookProducts.map((item) => (
              <div key={item.id} className="pdp-related-card">
                <ProductCard product={item} onAddToCart={handleRelatedAdd} />
              </div>
            ))}
          </div>
        </section>
      )}

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