'use client';

import { useMemo, useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ArrowLeft,
  Truck,
  ShieldCheck,
  RotateCcw,
  Banknote,
} from 'lucide-react';
import { useCart } from '@/lib/cart-context';
import Button from '@/components/ui/Button';

const IMAGE_FALLBACK = '/products/cozy.jpeg';

function BagImage({ src, alt }: { src?: string; alt: string }) {
  const [imgSrc, setImgSrc] = useState(src || IMAGE_FALLBACK);

  return (
    <Image
      src={imgSrc}
      alt={alt}
      fill
      sizes="120px"
      className="bag-item-image"
      onError={() => {
        if (imgSrc !== IMAGE_FALLBACK) setImgSrc(IMAGE_FALLBACK);
      }}
    />
  );
}

interface CartClientProps {
  slugById: Map<string, string>;
}

export default function CartClient({ slugById }: CartClientProps) {
  const router = useRouter();
  const {
    items,
    savedForLater,
    updateQuantity,
    removeItem,
    saveForLater,
    moveToBag,
    removeSaved,
    totalItems,
    totalPrice,
    clearCart,
  } = useCart();

  // Two-tap confirm so "Clear bag" can't wipe the bag by accident.
  const [confirmClear, setConfirmClear] = useState(false);
  const confirmTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    return () => {
      if (confirmTimer.current) clearTimeout(confirmTimer.current);
    };
  }, []);
  const handleClearBag = () => {
    if (confirmClear) {
      if (confirmTimer.current) clearTimeout(confirmTimer.current);
      setConfirmClear(false);
      clearCart();
    } else {
      setConfirmClear(true);
      if (confirmTimer.current) clearTimeout(confirmTimer.current);
      confirmTimer.current = setTimeout(() => setConfirmClear(false), 3000);
    }
  };

  if (items.length === 0 && savedForLater.length === 0) {
    return (
      <div className="bag-page">
        <div className="bag-empty">
          <span className="bag-empty-badge">
            <ShoppingBag size={30} aria-hidden="true" />
          </span>
          <h1 className="bag-empty-title">Your bag is empty</h1>
          <p className="bag-empty-text">
            Looks like you haven&apos;t added anything yet. Fresh drops are waiting.
          </p>
          <Button variant="primary" size="lg" onClick={() => router.push('/shop')}>
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="bag-page">
        <div className="bag-empty">
          <span className="bag-empty-badge">
            <ShoppingBag size={30} aria-hidden="true" />
          </span>
          <h1 className="bag-empty-title">Your bag is empty</h1>
          <p className="bag-empty-text">
            You have {savedForLater.length} saved item{savedForLater.length !== 1 ? 's' : ''} waiting below.
          </p>
          <Button variant="primary" size="lg" onClick={() => router.push('/shop')}>
            Continue Shopping
          </Button>
        </div>
        <section aria-label="Saved for later">
          <div className="bag-header">
            <div>
              <h2 className="bag-title">Saved for later</h2>
              <p className="bag-count">{savedForLater.length} saved</p>
            </div>
          </div>
          <ul className="bag-list">
            {savedForLater.map((item) => (
              <li key={`saved-${item.id}-${item.size ?? 'os'}`} className="bag-item">
                <div className="bag-item-thumb">
                  <BagImage src={item.image} alt={item.name} />
                </div>
                <div className="bag-item-info">
                  <p className="bag-item-name">{item.name}</p>
                  {item.size && <p className="bag-item-meta">Size: {item.size}</p>}
                  <p className="bag-item-price">K {item.price.toLocaleString()}</p>
                  <div className="bag-item-controls">
                    <button type="button" className="btn btn-primary" onClick={() => moveToBag(item.id, item.size)}>
                      Move to bag
                    </button>
                    <button type="button" className="bag-remove" onClick={() => removeSaved(item.id, item.size)} aria-label={`Remove ${item.name} from saved`}>
                      <Trash2 size={14} />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
                <p className="bag-item-total">K {(item.price * item.quantity).toLocaleString()}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    );
  }

  return (
    <div className="bag-page">
      <div className="bag-header">
        <div>
          <h1 className="bag-title">Shopping Bag</h1>
          <p className="bag-count">
            {totalItems} item{totalItems !== 1 ? 's' : ''} · K {totalPrice.toLocaleString()}
          </p>
        </div>
        <button
          type="button"
          className={`shop-chips-clear${confirmClear ? ' is-confirm' : ''}`}
          onClick={handleClearBag}
          aria-live="polite"
        >
          {confirmClear ? 'Tap again to clear' : 'Clear bag'}
        </button>
      </div>

      <div className="grid bag-grid">
        <div className="span-8">
          <ul className="bag-list">
            {items.map((item) => {
              const slug = slugById.get(item.id);

              return (
                <li key={`${item.id}-${item.size ?? 'os'}`} className="bag-item">
                  <div className="bag-item-thumb">
                    <Image
                      src={item.image || IMAGE_FALLBACK}
                      alt={item.name}
                      fill
                      sizes="120px"
                      className="bag-item-image"
                    />
                  </div>

                  <div className="bag-item-info">
                    {slug ? (
                      <Link href={`/product/${slug}`} className="bag-item-name">
                        {item.name}
                      </Link>
                    ) : (
                      <p className="bag-item-name">{item.name}</p>
                    )}

                    {item.size && (
                      <span className="bag-size-chip">Size {item.size}</span>
                    )}
                    <p className="bag-item-price">K {item.price.toLocaleString()} each</p>

                    <div className="bag-item-controls">
                      <div className="bag-qty" role="group" aria-label={`Quantity for ${item.name}`}>
                        <button
                          type="button"
                          className="bag-qty-btn"
                          aria-label="Decrease quantity"
                          onClick={() => updateQuantity(item.id, item.quantity - 1, item.size)}
                        >
                          <Minus size={14} strokeWidth={2.5} />
                        </button>
                        <span className="bag-qty-value" aria-live="polite">{item.quantity}</span>
                        <button
                          type="button"
                          className="bag-qty-btn"
                          aria-label="Increase quantity"
                          onClick={() => updateQuantity(item.id, item.quantity + 1, item.size)}
                        >
                          <Plus size={14} strokeWidth={2.5} />
                        </button>
                      </div>

                      <button
                        type="button"
                        className="bag-icon-btn"
                        onClick={() => removeItem(item.id, item.size)}
                        aria-label={`Remove ${item.name} from bag`}
                      >
                        <Trash2 size={16} />
                      </button>

                      <button
                        type="button"
                        className="bag-save-btn"
                        onClick={() => saveForLater(item.id, item.size)}
                        aria-label={`Save ${item.name} for later`}
                      >
                        Save for later
                      </button>
                    </div>
                  </div>

                  <p className="bag-item-total">
                    K {(item.price * item.quantity).toLocaleString()}
                  </p>
                </li>
              );
            })}
          </ul>

          <button type="button" className="bag-continue" onClick={() => router.push('/shop')}>
            <ArrowLeft size={16} strokeWidth={2} />
            <span>Continue shopping</span>
          </button>
        </div>

        <div className="span-4">
          <aside className="bag-summary">
            <h2 className="bag-summary-title">Order Summary</h2>

            <div className="bag-summary-row">
              <span>Items ({totalItems})</span>
              <span>K {totalPrice.toLocaleString()}</span>
            </div>

            <div className="bag-summary-row">
              <span>Store pickup</span>
              <span className="bag-free">Free</span>
            </div>

            <div className="bag-summary-row">
              <span>Delivery in Lusaka</span>
              <span>K 50</span>
            </div>

            <div className="bag-summary-total">
              <span>Total</span>
              <span>K {totalPrice.toLocaleString()}</span>
            </div>

            <Button variant="primary" size="lg" fullWidth onClick={() => router.push('/checkout')} icon={<ArrowRight size={17} />} iconPosition="right">
              Proceed to Checkout
            </Button>

            <p className="bag-summary-note">You&apos;ll review your order before sending</p>

            <div className="bag-trust">
              <span className="bag-trust-item"><ShieldCheck size={14} /> Secure checkout</span>
              <span className="bag-trust-item"><Banknote size={14} /> Pay on delivery</span>
              <span className="bag-trust-item"><RotateCcw size={14} /> 7-Day returns</span>
              <span className="bag-trust-item"><Truck size={14} /> Fast delivery</span>
            </div>
          </aside>
        </div>
      </div>

      <div className="bag-stickybar" aria-label="Checkout bar">
        <div className="bag-stickybar-total">
          <span>Total</span>
          <strong>K {totalPrice.toLocaleString()}</strong>
        </div>
        <Button variant="primary" size="lg" onClick={() => router.push('/checkout')} icon={<ArrowRight size={17} />} iconPosition="right">
          Checkout
        </Button>
      </div>

      {savedForLater.length > 0 && (
        <section aria-label="Saved for later" style={{ marginTop: '2rem' }}>
          <div className="bag-header">
            <div>
              <h2 className="bag-title">Saved for later</h2>
              <p className="bag-count">{savedForLater.length} saved</p>
            </div>
          </div>
          <ul className="bag-list">
            {savedForLater.map((item) => (
              <li key={`saved-${item.id}-${item.size ?? 'os'}`} className="bag-item">
                <div className="bag-item-thumb">
                  <BagImage src={item.image} alt={item.name} />
                </div>
                <div className="bag-item-info">
                  <p className="bag-item-name">{item.name}</p>
                  {item.size && <p className="bag-item-meta">Size: {item.size}</p>}
                  <p className="bag-item-price">K {item.price.toLocaleString()}</p>
                  <div className="bag-item-controls">
                    <button type="button" className="btn btn-primary" onClick={() => moveToBag(item.id, item.size)}>
                      Move to bag
                    </button>
                    <button type="button" className="bag-remove" onClick={() => removeSaved(item.id, item.size)} aria-label={`Remove ${item.name} from saved`}>
                      <Trash2 size={14} />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
                <p className="bag-item-total">K {(item.price * item.quantity).toLocaleString()}</p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}