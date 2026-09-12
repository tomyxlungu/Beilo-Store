// app/(store)/checkout/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  MessageCircle,
  MapPin,
  Truck,
  Store,
  CheckCircle2,
  ShoppingBag,
} from 'lucide-react';
import { useCart } from '@/lib/cart-context';
import { stores } from '@/data/stores';
import {
  generateWhatsAppMessage,
  sendWhatsAppOrder,
} from '@/lib/whatsapp';
import { saveOrder } from '@/lib/orders';
import {
  getProfile,
  getDefaultStore,
} from '@/lib/preferences';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import SegmentedControl from '@/components/ui/SegmentedControl';

const BEILO_WHATSAPP = '260971234567';
const DELIVERY_FEE = 50;

type DeliveryMethod = 'pickup' | 'delivery';

interface SentSummary {
  total: number;
  method: DeliveryMethod;
  store: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalItems, totalPrice, clearCart } =
    useCart();

  const [deliveryMethod, setDeliveryMethod] =
    useState<DeliveryMethod>('pickup');
  const [selectedStore, setSelectedStore] = useState(
    () =>
      getDefaultStore() ||
      stores[0]?.name ||
      ''
  );
  const [customerName, setCustomerName] = useState(
    () => getProfile().name
  );
  const [customerPhone, setCustomerPhone] = useState(
    () => getProfile().phone
  );
  const [deliveryAddress, setDeliveryAddress] =
    useState('');

  const [nameError, setNameError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [addressError, setAddressError] = useState('');

  const [sent, setSent] = useState<SentSummary | null>(
    null
  );

  const deliveryFee =
    deliveryMethod === 'delivery' ? DELIVERY_FEE : 0;
  const total = totalPrice + deliveryFee;

  /* ---------- Confirmation screen ---------- */
  if (sent) {
    return (
      <div className="co-page">
        <div className="co-success">
          <CheckCircle2
            size={56}
            className="co-success-icon"
            aria-hidden="true"
          />
          <h1 className="co-success-title">
            Order sent!
          </h1>
          <p className="co-success-text">
            Your order of K{' '}
            {sent.total.toLocaleString()} is on its
            way to us on WhatsApp. We&apos;ll confirm{' '}
            {sent.method === 'pickup'
              ? `pickup at ${sent.store}`
              : 'your delivery'}{' '}
            shortly.
          </p>
          <div className="co-success-actions">
            <Button
              variant="primary"
              size="lg"
              onClick={() => router.push('/shop')}
            >
              Continue Shopping
            </Button>
            <Button
              variant="secondary"
              onClick={() => router.push('/')}
            >
              Back Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  /* ---------- Empty bag ---------- */
  if (items.length === 0) {
    return (
      <div className="co-page">
        <div className="co-success">
          <ShoppingBag
            size={56}
            className="bag-empty-icon"
            aria-hidden="true"
          />
          <h1 className="co-success-title">
            No items to check out
          </h1>
          <p className="co-success-text">
            Your bag is empty. Add something you love
            first.
          </p>
          <Button
            variant="primary"
            size="lg"
            onClick={() => router.push('/shop')}
          >
            Go Shopping
          </Button>
        </div>
      </div>
    );
  }

  const validate = (): boolean => {
    let valid = true;

    if (customerName.trim().length < 2) {
      setNameError('Please enter your name');
      valid = false;
    } else {
      setNameError('');
    }

    const digits = customerPhone.replace(/\D/g, '');
    if (digits.length < 9) {
      setPhoneError('Enter a valid phone number');
      valid = false;
    } else {
      setPhoneError('');
    }

    if (
      deliveryMethod === 'delivery' &&
      deliveryAddress.trim().length < 5
    ) {
      setAddressError('Please enter your address');
      valid = false;
    } else {
      setAddressError('');
    }

    return valid;
  };

  const handleSendOrder = () => {
    if (!validate()) return;

    const orderItems = items.map((item) => ({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      size: item.size,
      image: item.image,
    }));

    const message = generateWhatsAppMessage({
      items: orderItems,
      subtotal: totalPrice,
      deliveryFee,
      total,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      deliveryMethod,
      pickupStore:
        deliveryMethod === 'pickup'
          ? selectedStore
          : undefined,
      deliveryAddress:
        deliveryMethod === 'delivery'
          ? deliveryAddress.trim()
          : undefined,
    });

    sendWhatsAppOrder(BEILO_WHATSAPP, message);

    /* Keep a copy in order history */
    saveOrder({
      items: orderItems,
      subtotal: totalPrice,
      deliveryFee,
      total,
      customerName: customerName.trim(),
      deliveryMethod,
      pickupStore:
        deliveryMethod === 'pickup'
          ? selectedStore
          : undefined,
      deliveryAddress:
        deliveryMethod === 'delivery'
          ? deliveryAddress.trim()
          : undefined,
    });

    setSent({
      total,
      method: deliveryMethod,
      store: selectedStore,
    });
    clearCart();
  };

  return (
    <div className="co-page">
      {/* Header */}
      <div className="bag-header">
        <div>
          <h1 className="bag-title">Checkout</h1>
          <p className="bag-count">
            {totalItems} item
            {totalItems !== 1 ? 's' : ''} · K{' '}
            {totalPrice.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="grid bag-grid">
        {/* Form */}
        <div className="span-8 co-form-col">
          {/* Contact */}
          <section className="card co-card">
            <h3>Your Details</h3>
            <div className="co-fields">
              <Input
                label="Full Name"
                placeholder="e.g. Chanda Mwila"
                value={customerName}
                onChange={(event) => {
                  setCustomerName(
                    event.target.value
                  );
                  setNameError('');
                }}
                error={nameError}
                required
              />
              <Input
                label="Phone Number"
                placeholder="e.g. 097 1234567"
                value={customerPhone}
                inputMode="tel"
                onChange={(event) => {
                  setCustomerPhone(
                    event.target.value
                  );
                  setPhoneError('');
                }}
                error={phoneError}
                hint="We confirm your order on WhatsApp"
                required
              />
            </div>
          </section>

          {/* Fulfilment */}
          <section className="card co-card">
            <h3>How do you want it?</h3>
            <SegmentedControl
              options={[
                {
                  label: 'Store Pickup · Free',
                  value: 'pickup',
                },
                {
                  label: 'Delivery · K50',
                  value: 'delivery',
                },
              ]}
              value={deliveryMethod}
              onChange={(value) =>
                setDeliveryMethod(
                  value as DeliveryMethod
                )
              }
            />

            {deliveryMethod === 'pickup' ? (
              <div
                className="co-stores"
                role="radiogroup"
                aria-label="Pickup store"
              >
                {stores.map((store) => {
                  const active =
                    selectedStore === store.name;
                  return (
                    <button
                      key={store.id}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() =>
                        setSelectedStore(store.name)
                      }
                      className={`co-store ${
                        active ? 'is-active' : ''
                      }`}
                    >
                      <span className="co-store-radio"
                        aria-hidden="true"
                      />
                      <span className="co-store-info">
                        <span className="co-store-name">
                          <Store
                            size={15}
                            aria-hidden="true"
                          />
                          {store.name}
                        </span>
                        <span className="co-store-meta">
                          {store.address} ·{' '}
                          {store.hours}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="co-fields">
                <Input
                  label="Delivery Address"
                  placeholder="Plot, street, area, town"
                  value={deliveryAddress}
                  onChange={(event) => {
                    setDeliveryAddress(
                      event.target.value
                    );
                    setAddressError('');
                  }}
                  error={addressError}
                  hint="Lusaka delivery is K50 · countrywide on request"
                  required
                />
              </div>
            )}
          </section>
        </div>

        {/* Summary */}
        <div className="span-4">
          <aside className="bag-summary">
            <h2 className="bag-summary-title">
              Order Summary
            </h2>

            <ul className="co-lines">
              {items.map((item) => (
                <li
                  key={`${item.id}-${
                    item.size ?? 'os'
                  }`}
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

            <div className="bag-summary-row">
              <span>Subtotal</span>
              <span>
                K {totalPrice.toLocaleString()}
              </span>
            </div>

            <div className="bag-summary-row">
              <span className="co-row-icon">
                {deliveryMethod === 'delivery' ? (
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
                {deliveryMethod === 'delivery'
                  ? 'Delivery'
                  : 'Pickup'}
              </span>
              <span>
                {deliveryFee === 0
                  ? 'Free'
                  : `K ${deliveryFee}`}
              </span>
            </div>

            <div className="bag-summary-total">
              <span>Total</span>
              <span>K {total.toLocaleString()}</span>
            </div>

            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={handleSendOrder}
              icon={<MessageCircle size={17} />}
            >
              Send Order via WhatsApp
            </Button>

            <p className="bag-summary-note">
              Opens WhatsApp with your order ready to
              send
            </p>
          </aside>
        </div>
      </div>
    </div>
  );
}
