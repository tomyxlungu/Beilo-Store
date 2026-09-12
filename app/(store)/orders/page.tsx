// app/(store)/orders/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Package,
  MapPin,
  Truck,
  ChevronRight,
} from 'lucide-react';
import {
  getOrders,
  type SavedOrder,
} from '@/lib/orders';
import Button from '@/components/ui/Button';

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-ZM', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

export default function OrdersPage() {
  const router = useRouter();
  const [orders] = useState<SavedOrder[]>(() =>
    getOrders()
  );

  if (orders.length === 0) {
    return (
      <div className="bag-page">
        <div className="bag-empty">
          <Package
            size={56}
            className="bag-empty-icon"
            aria-hidden="true"
          />
          <h1 className="bag-empty-title">
            No orders yet
          </h1>
          <p className="bag-empty-text">
            Orders you send via WhatsApp will show up
            here so you can track them.
          </p>
          <Button
            variant="primary"
            size="lg"
            onClick={() => router.push('/shop')}
          >
            Start Shopping
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bag-page">
      <div className="bag-header">
        <div>
          <h1 className="bag-title">Orders</h1>
          <p className="bag-count">
            {orders.length} order
            {orders.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <ul className="order-list">
        {orders.map((order) => (
          <li key={order.id} className="order-card">
            <div className="order-head">
              <div>
                <p className="order-id">{order.id}</p>
                <p className="order-date">
                  {formatDate(order.date)}
                </p>
              </div>
              <span className="order-status">
                {order.status}
              </span>
            </div>

            <ul className="co-lines">
              {order.items.map((item, index) => (
                <li
                  key={`${item.id}-${index}`}
                  className="co-line"
                >
                  <span className="co-line-name">
                    {item.name}
                    {item.size
                      ? ` · ${item.size}`
                      : ''}{' '}
                    × {item.quantity}
                  </span>
                  <span className="co-line-price">
                    K{' '}
                    {(
                      item.price * item.quantity
                    ).toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>

            <div className="order-foot">
              <span className="order-fulfilment">
                {order.deliveryMethod ===
                'delivery' ? (
                  <Truck
                    size={14}
                    aria-hidden="true"
                  />
                ) : (
                  <MapPin
                    size={14}
                    aria-hidden="true"
                  />
                )}
                {order.deliveryMethod ===
                'delivery'
                  ? order.deliveryAddress ??
                    'Delivery'
                  : `Pickup · ${
                      order.pickupStore ?? 'Store'
                    }`}
              </span>
              <span className="order-total">
                K {order.total.toLocaleString()}
              </span>
            </div>

            <button
              type="button"
              className="order-reorder"
              onClick={() => router.push('/shop')}
            >
              <span>Shop again</span>
              <ChevronRight
                size={15}
                aria-hidden="true"
              />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
