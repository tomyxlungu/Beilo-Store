// app/(store)/cart/page.tsx
'use client';

import { useMemo, useState } from 'react';
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
import { products } from '@/data/products';
import Button from '@/components/ui/Button';

const IMAGE_FALLBACK = '/products/cozy.jpeg';

function BagImage({
  src,
  alt,
}: {
  src?: string;
  alt: string;
}) {
  const [imgSrc, setImgSrc] = useState(
    src || IMAGE_FALLBACK
  );

  return (
    <Image
      src={imgSrc}
      alt={alt}
      fill
      sizes="120px"
      className="bag-item-image"
      onError={() => {
        if (imgSrc !== IMAGE_FALLBACK) {
          setImgSrc(IMAGE_FALLBACK);
        }
      }}
    />
  );
}

export default function CartPage() {
  const router = useRouter();
  const {
    items,
    updateQuantity,
    removeItem,
    totalItems,
    totalPrice,
    clearCart,
  } = useCart();

  /* Link items back to their product pages when possible */
  const slugById = useMemo(() => {
    const map = new Map<string, string>();
    for (const product of products) {
      map.set(product.id, product.slug);
    }
    return map;
  }, []);

  if (items.length === 0) {
    return (
      <div className="bag-page">
        <div className="bag-empty">
          <ShoppingBag
            size={56}
            className="bag-empty-icon"
            aria-hidden="true"
          />
          <h1 className="bag-empty-title">
            Your bag is empty
          </h1>
          <p className="bag-empty-text">
            Looks like you haven&apos;t added anything
            yet. Fresh drops are waiting.
          </p>
          <Button
            variant="primary"
            size="lg"
            onClick={() => router.push('/shop')}
          >
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bag-page">
      {/* Header */}
      <div className="bag-header">
        <div>
          <h1 className="bag-title">Shopping Bag</h1>
          <p className="bag-count">
            {totalItems} item
            {totalItems !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          type="button"
          className="shop-chips-clear"
          onClick={clearCart}
        >
          Clear bag
        </button>
      </div>

      <div className="grid bag-grid">
        {/* Items */}
        <div className="span-8">
          <ul className="bag-list">
            {items.map((item) => {
              const slug = slugById.get(item.id);

              return (
                <li
                  key={`${item.id}-${item.size ?? 'os'}`}
                  className="bag-item"
                >
                  <div className="bag-item-thumb">
                    <BagImage
                      src={item.image}
                      alt={item.name}
                    />
                  </div>

                  <div className="bag-item-info">
                    {slug ? (
                      <Link
                        href={`/product/${slug}`}
                        className="bag-item-name"
                      >
                        {item.name}
                      </Link>
                    ) : (
                      <p className="bag-item-name">
                        {item.name}
                      </p>
                    )}

                    {item.size && (
                      <p className="bag-item-meta">
                        Size: {item.size}
                      </p>
                    )}
                    <p className="bag-item-price">
                      K{' '}
                      {item.price.toLocaleString()}
                    </p>

                    <div className="bag-item-controls">
                      <div
                        className="pdp-qty"
                        role="group"
                        aria-label={`Quantity for ${item.name}`}
                      >
                        <button
                          type="button"
                          className="pdp-qty-btn"
                          aria-label="Decrease quantity"
                          onClick={() =>
                            updateQuantity(
                              item.id,
                              item.quantity - 1,
                              item.size
                            )
                          }
                        >
                          <Minus
                            size={14}
                            strokeWidth={2.5}
                          />
                        </button>
                        <span
                          className="pdp-qty-value"
                          aria-live="polite"
                        >
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          className="pdp-qty-btn"
                          aria-label="Increase quantity"
                          onClick={() =>
                            updateQuantity(
                              item.id,
                              item.quantity + 1,
                              item.size
                            )
                          }
                        >
                          <Plus
                            size={14}
                            strokeWidth={2.5}
                          />
                        </button>
                      </div>

                      <button
                        type="button"
                        className="bag-remove"
                        onClick={() =>
                          removeItem(
                            item.id,
                            item.size
                          )
                        }
                        aria-label={`Remove ${item.name} from bag`}
                      >
                        <Trash2 size={14} />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>

                  <p className="bag-item-total">
                    K{' '}
                    {(
                      item.price * item.quantity
                    ).toLocaleString()}
                  </p>
                </li>
              );
            })}
          </ul>

          <button
            type="button"
            className="bag-continue"
            onClick={() => router.push('/shop')}
          >
            <ArrowLeft size={16} strokeWidth={2} />
            <span>Continue shopping</span>
          </button>
        </div>

        {/* Summary */}
        <div className="span-4">
          <aside className="bag-summary">
            <h2 className="bag-summary-title">
              Order Summary
            </h2>

            <div className="bag-summary-row">
              <span>
                Items ({totalItems})
              </span>
              <span>
                K {totalPrice.toLocaleString()}
              </span>
            </div>

            <div className="bag-summary-row">
              <span>Delivery</span>
              <span>Free pickup · K50 Lusaka</span>
            </div>

            <div className="bag-summary-total">
              <span>Total</span>
              <span>
                K {totalPrice.toLocaleString()}
              </span>
            </div>

            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={() =>
                router.push('/checkout')
              }
              icon={<ArrowRight size={17} />}
              iconPosition="right"
            >
              Proceed to Checkout
            </Button>

            <p className="bag-summary-note">
              You&apos;ll review your order before
              sending
            </p>

            <div className="bag-trust">
              <span className="bag-trust-item">
                <ShieldCheck size={14} />
                Secure checkout
              </span>
              <span className="bag-trust-item">
                <Banknote size={14} />
                Pay on delivery
              </span>
              <span className="bag-trust-item">
                <RotateCcw size={14} />
                7-Day returns
              </span>
              <span className="bag-trust-item">
                <Truck size={14} />
                Fast delivery
              </span>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
