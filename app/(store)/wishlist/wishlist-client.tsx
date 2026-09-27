'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, ShoppingBag } from 'lucide-react';
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

  // Two-tap confirm so "Clear all" can't wipe the list by accident.
  const [confirmClear, setConfirmClear] = useState(false);
  const confirmTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    return () => {
      if (confirmTimer.current) clearTimeout(confirmTimer.current);
    };
  }, []);
  const handleClear = () => {
    if (confirmClear) {
      if (confirmTimer.current) clearTimeout(confirmTimer.current);
      setConfirmClear(false);
      clear();
    } else {
      setConfirmClear(true);
      if (confirmTimer.current) clearTimeout(confirmTimer.current);
      confirmTimer.current = setTimeout(() => setConfirmClear(false), 3000);
    }
  };

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

  const handleMoveAllToBag = () => {
    for (const product of saved) {
      handleAddToBag(product);
    }
    router.push('/cart');
  };

  if (saved.length === 0) {
    return (
      <div className="bag-page">
        <div className="bag-empty">
          <span className="bag-empty-badge">
            <Heart size={30} aria-hidden="true" />
          </span>
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
        <div className="wish-actions">
          <button type="button" className="shop-chips-clear" onClick={handleMoveAllToBag}>
            <ShoppingBag size={14} aria-hidden="true" />
            <span>Move all to bag</span>
          </button>
          <button
            type="button"
            className={`shop-chips-clear${confirmClear ? ' is-confirm' : ''}`}
            onClick={handleClear}
            aria-live="polite"
          >
            {confirmClear ? 'Tap again to clear' : 'Clear all'}
          </button>
        </div>
      </div>

      <div className="product-grid">
        {saved.map((product) => (
          <ProductCard key={product.id} product={product} onAddToCart={handleAddToBag} />
        ))}
      </div>
    </div>
  );
}