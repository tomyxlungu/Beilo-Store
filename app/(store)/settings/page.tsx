// app/(store)/settings/page.tsx
'use client';

import { useState } from 'react';
import {
  Store,
  MessageCircle,
  Trash2,
  Info,
} from 'lucide-react';
import { stores } from '@/data/stores';
import { useCart } from '@/lib/cart-context';
import { useWishlist } from '@/lib/wishlist-context';
import { clearOrders } from '@/lib/orders';
import {
  getDefaultStore,
  saveDefaultStore,
  getOrderUpdates,
  saveOrderUpdates,
} from '@/lib/preferences';

export default function SettingsPage() {
  const { clearCart } = useCart();
  const { clear: clearWishlist } = useWishlist();

  const [defaultStore, setDefaultStore] = useState(
    () => getDefaultStore()
  );
  const [updates, setUpdates] = useState(() =>
    getOrderUpdates()
  );
  const [cleared, setCleared] = useState('');

  const handleStore = (value: string) => {
    setDefaultStore(value);
    saveDefaultStore(value);
    setCleared('');
  };

  const handleUpdates = (enabled: boolean) => {
    setUpdates(enabled);
    saveOrderUpdates(enabled);
    setCleared('');
  };

  const handleClear = (
    action: 'bag' | 'wishlist' | 'orders',
    run: () => void,
    label: string
  ) => {
    run();
    setCleared(label);
  };

  return (
    <div className="bag-page">
      <div className="bag-header">
        <div>
          <h1 className="bag-title">Settings</h1>
          <p className="bag-count">
            Stored on this device only
          </p>
        </div>
      </div>

      <div className="settings-list">
        {/* Default store */}
        <section className="card co-card">
          <h3>
            <span className="settings-heading">
              <Store
                size={16}
                aria-hidden="true"
              />
              Default pickup store
            </span>
          </h3>
          <p className="settings-hint">
            Preselected at checkout to save you time.
          </p>
          <div className="shop-sort-wrap settings-select-wrap">
            <select
              value={defaultStore}
              onChange={(event) =>
                handleStore(event.target.value)
              }
              className="shop-sort settings-select"
              aria-label="Default pickup store"
            >
              <option value="">
                No default — ask me each time
              </option>
              {stores.map((store) => (
                <option
                  key={store.id}
                  value={store.name}
                >
                  {store.name} · {store.address}
                </option>
              ))}
            </select>
          </div>
        </section>

        {/* Order updates */}
        <section className="card co-card">
          <h3>
            <span className="settings-heading">
              <MessageCircle
                size={16}
                aria-hidden="true"
              />
              Order updates
            </span>
          </h3>
          <label className="settings-toggle">
            <span className="settings-toggle-text">
              <span className="settings-toggle-label">
                WhatsApp updates
              </span>
              <span className="settings-hint">
                Confirmation, ready-for-pickup and
                delivery messages.
              </span>
            </span>
            <input
              type="checkbox"
              className="settings-switch"
              checked={updates}
              onChange={(event) =>
                handleUpdates(
                  event.target.checked
                )
              }
              aria-label="WhatsApp order updates"
            />
          </label>
        </section>

        {/* Data */}
        <section className="card co-card">
          <h3>
            <span className="settings-heading">
              <Trash2
                size={16}
                aria-hidden="true"
              />
              Your data
            </span>
          </h3>
          <div className="settings-data">
            <button
              type="button"
              className="btn btn-secondary settings-data-btn"
              onClick={() =>
                handleClear(
                  'bag',
                  clearCart,
                  'Shopping bag cleared'
                )
              }
            >
              Clear shopping bag
            </button>
            <button
              type="button"
              className="btn btn-secondary settings-data-btn"
              onClick={() =>
                handleClear(
                  'wishlist',
                  clearWishlist,
                  'Wishlist cleared'
                )
              }
            >
              Clear wishlist
            </button>
            <button
              type="button"
              className="btn btn-secondary settings-data-btn"
              onClick={() =>
                handleClear(
                  'orders',
                  clearOrders,
                  'Order history cleared'
                )
              }
            >
              Clear order history
            </button>
          </div>
          {cleared && (
            <p
              className="acct-saved"
              role="status"
            >
              {cleared}
            </p>
          )}
        </section>

        {/* About */}
        <section className="card co-card">
          <h3>
            <span className="settings-heading">
              <Info size={16} aria-hidden="true" />
              About BEILO
            </span>
          </h3>
          <p className="settings-hint">
            Fresh denim, essentials and streetwear —
            Lusaka · Ndola · Kitwe. Pay on delivery
            &amp; mobile money accepted.
          </p>
        </section>
      </div>
    </div>
  );
}
