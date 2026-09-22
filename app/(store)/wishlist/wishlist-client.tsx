'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Heart } from 'lucide-react';
import { useCart } from '@/lib/cart-context';
import { useWishlist } from '@/lib/wishlist-context';
import type { Product } from '@/types/product';
import ProductCard from '@/components/ui/ProductCard';
import Button from '@/components/ui/Button';

interface WishlistClientProps {
  initialProducts: Product[];
}

export default function WishlistClient({ initialProducts }: WishlistClientProps) {
  const router = useRouter();
  const { addItem } = useCart();
  const { ids, clear } = useWishlist();

  const saved = useMemo(
    () =>
      ids
        .map((id) => initialProducts.find((p) => p.id === id))
        .filter((p): p is Product => p !== undefined),
    [ids, initialProducts]
  );

  const handleAddToBag = (product: Product) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0],
    });
  };

  if (saved.length === 0) {
    return (
      <div className="bag-page">
        <div className="bag-empty">
          <Heart size={56} className="bag-empty-icon" aria-hidden="true" />
          <h1 className="bag-empty-title">Nothing saved yet</h1>
          <p className="bag-empty-text">
            Tap the heart on anything you love and it will wait for you here.
          </p>
          <Button variant="primary" size="lg" onClick={() => router.push('/shop')}>
            Discover Products
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bag-page">
      <div className="bag-header">
        <div>
          <h1 className="bag-title">Wishlist</h1>
          <p className="bag-count">
            {saved.length} saved item{saved.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button type="button" className="shop-chips-clear" onClick={clear}>
          Clear all
        </button>
      </div>

      <div className="product-grid">
        {saved.map((product) => (
          <ProductCard key={product.id} product={product} onAddToCart={handleAddToBag} />
        ))}
      </div>
    </div>
  );
}