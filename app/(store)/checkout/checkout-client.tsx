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
import {
  generateWhatsAppMessage,
  sendWhatsAppOrder,
} from '@/lib/whatsapp';
import { saveOrder } from '@/lib/orders';
import { trackEvent } from '@/lib/analytics';
import { getProfile, getDefaultStore, saveProfile, saveDefaultStore } from '@/lib/preferences';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import SegmentedControl from '@/components/ui/SegmentedControl';

const BEILO_WHATSAPP = '260971234567';
const DELIVERY_FEE = 50;

type DeliveryMethod = 'pickup' | 'delivery';

interface Store {
  id: string;
  name: string;
  address: string;
  hours: string;
  phone: string;
  mapUrl?: string;
}

interface SentSummary {
  total: number;
  method: DeliveryMethod;
  store: string;
  code: string;
}

interface CheckoutClientProps {
  initialStores: Store[];
}

export default function CheckoutClient({ initialStores }: CheckoutClientProps) {
  const router = useRouter();
  const { items, totalItems, totalPrice, clearCart } = useCart();

  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('pickup');
  // Track the store by ID (the DB column is a UUID). The human-readable
  // name lives in localStorage preferences, so resolve it to an ID.
  const [selectedStoreId, setSelectedStoreId] = useState(() => {
    const savedName = getDefaultStore();
    return (
      initialStores.find((s) => s.name === savedName)?.id ||
      initialStores[0]?.id ||
      ''
    );
  });
  const selectedStore =
    initialStores.find((s) => s.id === selectedStoreId) || initialStores[0];
  const [customerName, setCustomerName] = useState(() => getProfile().name);
  const [customerPhone, setCustomerPhone] = useState(() => getProfile().phone);
  const [deliveryAddress, setDeliveryAddress] = useState('');

  const [nameError, setNameError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [addressError, setAddressError] = useState('');
  const [sendError, setSendError] = useState('');
  const [sending, setSending] = useState(false);

  const [sent, setSent] = useState<SentSummary | null>(null);

  const deliveryFee = deliveryMethod === 'delivery' ? DELIVERY_FEE : 0;
  const total = totalPrice + deliveryFee;

  if (sent) {
    return (
      <div className="co-page">
        <div className="co-success">
          <CheckCircle2 size={56} className="co-success-icon" aria-hidden="true" />
          <h1 className="co-success-title">Order sent!</h1>
          <p className="co-success-text">
            Your order of K {sent.total.toLocaleString()} is on its way to us on WhatsApp. We&apos;ll confirm
            {sent.method === 'pickup' ? ` pickup at ${sent.store}` : ' your delivery'} shortly.
          </p>
          <p className="co-success-text">
            Order code: <strong>{sent.code}</strong> — keep it to track your order.
          </p>
          <div className="co-success-actions">
            <Button variant="primary" size="lg" onClick={() => router.push('/shop')}>Continue Shopping</Button>
            <Button variant="secondary" onClick={() => router.push('/')}>Back Home</Button>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="co-page">
        <div className="co-success">
          <ShoppingBag size={56} className="bag-empty-icon" aria-hidden="true" />
          <h1 className="co-success-title">No items to check out</h1>
          <p className="co-success-text">Your bag is empty. Add something you love first.</p>
          <Button variant="primary" size="lg" onClick={() => router.push('/shop')}>Go Shopping</Button>
        </div>
      </div>
    );
  }

  const validate = (): boolean => {
    let valid = true;
    if (customerName.trim().length < 2) { setNameError('Please enter your name'); valid = false; } else { setNameError(''); }
    const digits = customerPhone.replace(/\D/g, '');
    if (digits.length < 9) { setPhoneError('Enter a valid phone number'); valid = false; } else { setPhoneError(''); }
    if (deliveryMethod === 'delivery' && deliveryAddress.trim().length < 5) { setAddressError('Please enter your address'); valid = false; } else { setAddressError(''); }
    return valid;
  };

  const handleSendOrder = async () => {
    if (sending) return;
    if (!validate()) return;

    const storeId = selectedStore?.id || '';
    if (deliveryMethod === 'pickup' && !storeId) {
      setSendError('Please choose a pickup store first.');
      return;
    }

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
      pickupStore: deliveryMethod === 'pickup' ? selectedStore?.name : undefined,
      deliveryAddress: deliveryMethod === 'delivery' ? deliveryAddress.trim() : undefined,
    });

    setSending(true);
    setSendError('');

    try {
      const saved = await saveOrder({
        items: orderItems,
        subtotal: totalPrice,
        deliveryFee,
        total,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        deliveryMethod,
        pickupStore: deliveryMethod === 'pickup' ? selectedStore?.name : undefined,
        pickupStoreId: storeId || initialStores[0]?.id || '',
        deliveryAddress: deliveryMethod === 'delivery' ? deliveryAddress.trim() : undefined,
      });

      sendWhatsAppOrder(BEILO_WHATSAPP, message);

      trackEvent('whatsapp_checkout', {
        metadata: {
          order_code: saved.code,
          total_minor: Math.round(total * 100),
          item_count: totalItems,
          delivery_method: deliveryMethod,
          store: deliveryMethod === 'pickup' ? selectedStore?.name : undefined,
        },
      });

      saveProfile({ name: customerName.trim(), phone: customerPhone.trim() });
      if (selectedStore?.name) saveDefaultStore(selectedStore.name);

      setSent({ total, method: deliveryMethod, store: selectedStore?.name || '', code: saved.code });
      clearCart();
    } catch (err: any) {
      setSendError(err?.message || 'Could not save your order. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="co-page">
      <div className="bag-header">
        <div>
          <h1 className="bag-title">Checkout</h1>
          <p className="bag-count">{totalItems} item{totalItems !== 1 ? 's' : ''} · K {totalPrice.toLocaleString()}</p>
        </div>
      </div>

      <div className="grid bag-grid">
        <div className="span-8 co-form-col">
          <section className="card co-card">
            <h3>Your Details</h3>
            <div className="co-fields">
              <Input label="Full Name" placeholder="e.g. Chanda Mwila" value={customerName} onChange={(e) => { setCustomerName(e.target.value); setNameError(''); }} error={nameError} required />
              <Input label="Phone Number" placeholder="e.g. 097 1234567" value={customerPhone} inputMode="tel" onChange={(e) => { setCustomerPhone(e.target.value); setPhoneError(''); }} error={phoneError} hint="We confirm your order on WhatsApp" required />
            </div>
          </section>

          <section className="card co-card">
            <h3>How do you want it?</h3>
            <SegmentedControl options={[{ label: 'Store Pickup · Free', value: 'pickup' }, { label: 'Delivery · K50', value: 'delivery' }]} value={deliveryMethod} onChange={(v) => setDeliveryMethod(v as DeliveryMethod)} />

            {deliveryMethod === 'pickup' ? (
              <div className="co-stores" role="radiogroup" aria-label="Pickup store">
                {initialStores.map((store) => {
                  const active = selectedStoreId === store.id;
                  return (
                    <button key={store.id} type="button" role="radio" aria-checked={active} onClick={() => setSelectedStoreId(store.id)} className={`co-store ${active ? 'is-active' : ''}`}>
                      <span className="co-store-radio" aria-hidden="true" />
                      <span className="co-store-info">
                        <span className="co-store-name"><Store size={15} aria-hidden="true" /> {store.name}</span>
                        <span className="co-store-meta">{store.address} · {store.hours}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="co-fields">
                <Input label="Delivery Address" placeholder="Plot, street, area, town" value={deliveryAddress} onChange={(e) => { setDeliveryAddress(e.target.value); setAddressError(''); }} error={addressError} hint="Lusaka delivery is K50 · countrywide on request" required />
              </div>
            )}
          </section>
        </div>

        <div className="span-4">
          <aside className="bag-summary">
            <h2 className="bag-summary-title">Order Summary</h2>

            <ul className="co-lines">
              {items.map((item) => (
                <li key={`${item.id}-${item.size ?? 'os'}`} className="co-line">
                  <span className="co-line-name">{item.name}{item.size ? ` · ${item.size}` : ''} × {item.quantity}</span>
                  <span className="co-line-price">K {(item.price * item.quantity).toLocaleString()}</span>
                </li>
              ))}
            </ul>

            <div className="bag-summary-row"><span>Subtotal</span><span>K {totalPrice.toLocaleString()}</span></div>
            <div className="bag-summary-row">
              <span className="co-row-icon">{deliveryMethod === 'delivery' ? <Truck size={14} aria-hidden="true" /> : <MapPin size={14} aria-hidden="true" />} {deliveryMethod === 'delivery' ? 'Delivery' : 'Pickup'}</span>
              <span>{deliveryFee === 0 ? 'Free' : `K ${deliveryFee}`}</span>
            </div>
            <div className="bag-summary-total"><span>Total</span><span>K {total.toLocaleString()}</span></div>

            <Button variant="primary" size="lg" fullWidth onClick={handleSendOrder} loading={sending} icon={<MessageCircle size={17} />}>
              {sending ? 'Sending…' : 'Send Order via WhatsApp'}
            </Button>
            {sendError && (
              <p className="bag-summary-note" role="alert" style={{ color: '#dc2626' }}>{sendError}</p>
            )}
            <p className="bag-summary-note">Opens WhatsApp with your order ready to send</p>
          </aside>
        </div>
      </div>
    </div>
  );
}