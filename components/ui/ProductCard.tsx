'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingBag } from 'lucide-react';
import type { Product } from '@/types/product';
import { useWishlist } from '@/lib/wishlist-context';

/*
 * Fallback images (real files) used when a product
 * image asset is missing. Keyed by category.
 */
const CATEGORY_FALLBACKS: Record<string, string> = {
  Men: '/categories/tees/shirt.jpg',
  Women: '/categories/hoodies/hoodie.jpeg',
  Footwear: '/categories/sneekers/shoe.jpeg',
  Headwear: '/categories/caps/cap.jpeg',
  Denim: '/categories/denim/Jeans.jpeg',
  Promos: '/categories/basics/7318418141817825.jpeg',
};

const FINAL_FALLBACK = '/products/cozy.jpeg';

function resolveFallback(product: Product): string {
  return CATEGORY_FALLBACKS[product.category] ?? FINAL_FALLBACK;
}

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
}

export default function ProductCard({
  product,
  onAddToCart,
}: ProductCardProps) {
  const { has, toggle, isHydrated } = useWishlist();
  const wishlisted = isHydrated && has(product.id);
  const [imgSrc, setImgSrc] = useState(
    product.images[0] ?? resolveFallback(product)
  );

  const soldOut = product.stockByStore.every(
    (stock) => stock.status === 'out-of-stock'
  );

  const tag = soldOut
    ? { label: 'Sold out', modifier: 'product-tag--sold' }
    : product.isPromo
      ? { label: 'Promo', modifier: 'product-tag--promo' }
      : product.isNew
        ? { label: 'New', modifier: 'product-tag--new' }
        : product.isTrending
          ? { label: 'Trending', modifier: 'product-tag--trend' }
          : null;

  const handleImageError = () => {
    const fallback = resolveFallback(product);

    if (imgSrc !== fallback) {
      setImgSrc(fallback);
    } else if (imgSrc !== FINAL_FALLBACK) {
      setImgSrc(FINAL_FALLBACK);
    }
  };

  return (
    <article className="product-card">
      <div className="product-card-image-wrapper">
        <Link
          href={`/product/${product.slug}`}
          aria-label={product.name}
          style={{
            position: 'absolute',
            inset: 0,
          }}
        >
          <Image
            src={imgSrc}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="product-card-image"
            onError={handleImageError}
          />
        </Link>

        {tag && (
          <span className={`product-tag ${tag.modifier}`}>
            {tag.label}
          </span>
        )}

        <button
          type="button"
          className="product-wishlist"
          aria-label={
            wishlisted
              ? `Remove ${product.name} from wishlist`
              : `Add ${product.name} to wishlist`
          }
          aria-pressed={wishlisted}
          onClick={() => toggle(product.id)}
        >
          <Heart
            size={17}
            strokeWidth={2}
            fill={wishlisted ? '#ef3030' : 'none'}
            color={wishlisted ? '#ef3030' : 'currentColor'}
          />
        </button>
      </div>

      <div className="product-card-body">
        <Link
          href={`/product/${product.slug}`}
          style={{ textDecoration: 'none', color: 'inherit' }}
        >
          <h3 className="product-card-name">{product.name}</h3>
        </Link>

        <div className="product-card-pricing">
          <span className="product-price">
            K {product.price.toLocaleString()}
          </span>
        </div>

        {onAddToCart && (
          <button
            type="button"
            className="btn btn-secondary product-card-add"
            disabled={soldOut}
            onClick={() => onAddToCart(product)}
          >
            <ShoppingBag size={15} strokeWidth={2} />
            <span>{soldOut ? 'Sold out' : 'Add to Bag'}</span>
          </button>
        )}
      </div>
    </article>
  );
}
