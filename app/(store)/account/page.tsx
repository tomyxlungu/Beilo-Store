// app/(store)/account/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  User,
  Package,
  Heart,
  Settings,
  MapPin,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import {
  getProfile,
  saveProfile,
} from '@/lib/preferences';

const QUICK_LINKS = [
  {
    label: 'Orders',
    hint: 'Track what you sent us',
    href: '/orders',
    Icon: Package,
  },
  {
    label: 'Wishlist',
    hint: 'Everything you saved',
    href: '/wishlist',
    Icon: Heart,
  },
  {
    label: 'Stores',
    hint: 'Find us near you',
    href: '/stores',
    Icon: MapPin,
  },
  {
    label: 'Settings',
    hint: 'Stores, updates & data',
    href: '/settings',
    Icon: Settings,
  },
];

export default function AccountPage() {
  const [name, setName] = useState(
    () => getProfile().name
  );
  const [phone, setPhone] = useState(
    () => getProfile().phone
  );
  const [nameError, setNameError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [saved, setSaved] = useState(false);

  const initial = (name.trim()[0] ?? 'B').toUpperCase();

  const handleSave = () => {
    let valid = true;

    if (name.trim().length < 2) {
      setNameError('Please enter your name');
      valid = false;
    } else {
      setNameError('');
    }

    if (phone.replace(/\D/g, '').length < 9) {
      setPhoneError('Enter a valid phone number');
      valid = false;
    } else {
      setPhoneError('');
    }

    if (!valid) {
      setSaved(false);
      return;
    }

    saveProfile({
      name: name.trim(),
      phone: phone.trim(),
    });
    setSaved(true);
  };

  return (
    <div className="bag-page">
      <div className="bag-header">
        <div>
          <h1 className="bag-title">Profile</h1>
          <p className="bag-count">
            Your details speed up checkout
          </p>
        </div>
      </div>

      <div className="grid bag-grid">
        {/* Details form */}
        <div className="span-8 co-form-col">
          <section className="card co-card">
            <div className="acct-identity">
              <span
                className="pdp-review-avatar acct-avatar"
                aria-hidden="true"
              >
                {initial}
              </span>
              <div>
                <h2 className="acct-name">
                  {name.trim() || 'BEILO Shopper'}
                </h2>
                <p className="acct-sub">
                  {phone.trim() ||
                    'Add your number below'}
                </p>
              </div>
            </div>

            <div className="co-fields">
              <Input
                label="Full Name"
                placeholder="e.g. Chanda Mwila"
                value={name}
                onChange={(event) => {
                  setName(event.target.value);
                  setNameError('');
                  setSaved(false);
                }}
                error={nameError}
                icon={<User size={15} />}
                required
              />
              <Input
                label="Phone Number"
                placeholder="e.g. 097 1234567"
                value={phone}
                inputMode="tel"
                onChange={(event) => {
                  setPhone(event.target.value);
                  setPhoneError('');
                  setSaved(false);
                }}
                error={phoneError}
                hint="Used to confirm orders on WhatsApp"
                required
              />
            </div>

            <div className="acct-save-row">
              <Button
                variant="primary"
                onClick={handleSave}
              >
                Save Details
              </Button>
              {saved && (
                <span
                  className="acct-saved"
                  role="status"
                >
                  <CheckCircle2
                    size={15}
                    aria-hidden="true"
                  />
                  Saved
                </span>
              )}
            </div>
          </section>
        </div>

        {/* Quick links */}
        <div className="span-4">
          <nav
            className="acct-links"
            aria-label="Account"
          >
            {QUICK_LINKS.map(
              ({ label, hint, href, Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="acct-link"
                >
                  <span className="acct-link-icon">
                    <Icon
                      size={18}
                      strokeWidth={2}
                      aria-hidden="true"
                    />
                  </span>
                  <span className="acct-link-text">
                    <span className="acct-link-label">
                      {label}
                    </span>
                    <span className="acct-link-hint">
                      {hint}
                    </span>
                  </span>
                  <ChevronRight
                    size={16}
                    aria-hidden="true"
                    className="acct-link-chevron"
                  />
                </Link>
              )
            )}
          </nav>
        </div>
      </div>
    </div>
  );
}
