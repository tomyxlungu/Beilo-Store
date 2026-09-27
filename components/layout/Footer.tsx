'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  ShoppingBag,
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  MessageCircle,
} from 'lucide-react';

function BrandIcon({ size = 18, children }: { size?: number; children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

function InstagramIcon({ size = 18 }: { size?: number }) {
  return (
    <BrandIcon size={size}>
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </BrandIcon>
  );
}

function FacebookIcon({ size = 18 }: { size?: number }) {
  return (
    <BrandIcon size={size}>
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </BrandIcon>
  );
}

function TwitterIcon({ size = 18 }: { size?: number }) {
  return (
    <BrandIcon size={size}>
      <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
    </BrandIcon>
  );
}

const WHATSAPP_NUMBER = '260971234567';
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}?text=Hi%20BEILO%2C%20I%20need%20some%20help.`;

const shopLinks = [
  { label: 'Shop All', href: '/shop' },
  { label: 'New Arrivals', href: '/shop?new=true' },
  { label: 'Men', href: '/shop?category=Men' },
  { label: 'Women', href: '/shop?category=Women' },
  { label: 'Footwear', href: '/shop?category=Footwear' },
  { label: 'Denim', href: '/shop?category=Denim' },
  { label: 'Promos', href: '/shop?category=Promos' },
];

const helpLinks = [
  { label: 'Stores', href: '/stores' },
  { label: 'About us', href: '/about' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Orders', href: '/orders' },
  { label: 'Wishlist', href: '/wishlist' },
  { label: 'Account', href: '/account' },
];

const socials = [
  { label: 'Instagram', href: 'https://instagram.com', Icon: InstagramIcon },
  { label: 'Facebook', href: 'https://facebook.com', Icon: FacebookIcon },
  { label: 'Twitter', href: 'https://twitter.com', Icon: TwitterIcon },
];

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email.trim()) return;
    setSubscribed(true);
    setEmail('');
  };

  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Newsletter band */}
        <div className="footer-newsletter">
          <div className="footer-newsletter-copy">
            <h2 className="footer-newsletter-title">Join BEILO</h2>
            <p className="footer-newsletter-text">
              New drops, promos and store updates. No spam, just heat.
            </p>
          </div>

          {subscribed ? (
            <p className="footer-newsletter-success" role="status">
              You&apos;re in. Watch your inbox for the next drop.
            </p>
          ) : (
            <form
              className="footer-newsletter-form"
              onSubmit={handleSubscribe}
            >
              <label htmlFor="footer-newsletter-email" className="sr-only">
                Email address
              </label>
              <input
                id="footer-newsletter-email"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Email address"
                className="footer-input"
              />
              <button type="submit" className="btn footer-newsletter-button">
                <span>Sign up</span>
                <Send size={15} strokeWidth={2} aria-hidden="true" />
              </button>
            </form>
          )}
        </div>

        {/* Link grid */}
        <div className="footer-grid">
          {/* Brand */}
          <div className="footer-brand">
            <Link
              href="/"
              className="footer-logo"
              aria-label="BEILO home"
            >
              <span className="footer-logo-mark">
                <ShoppingBag size={26} strokeWidth={2.5} />
              </span>
              <span>BEILO</span>
            </Link>

            <p className="footer-tagline">
              Fresh denim, essentials and streetwear for every day in
              Zambia.
            </p>

            <p className="footer-location">
              <MapPin size={16} strokeWidth={2} aria-hidden="true" />
              <span>Lusaka · Ndola · Kitwe</span>
            </p>

            <div className="footer-socials">
              {socials.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-social"
                  aria-label={`BEILO on ${label}`}
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Shop */}
          <nav className="footer-col" aria-label="Shop">
            <h3 className="footer-heading">Shop</h3>
            <ul className="footer-links">
              {shopLinks.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="footer-link">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Help */}
          <nav className="footer-col" aria-label="Help">
            <h3 className="footer-heading">Help</h3>
            <ul className="footer-links">
              {helpLinks.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="footer-link">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact */}
          <div className="footer-col">
            <h3 className="footer-heading">Talk to us</h3>
            <ul className="footer-contact">
              <li>
                <a href={`tel:+${WHATSAPP_NUMBER}`}>
                  <Phone size={16} strokeWidth={2} aria-hidden="true" />
                  <span>+260 97 123 4567</span>
                </a>
              </li>
              <li>
                <a href="mailto:hello@beilo.store">
                  <Mail size={16} strokeWidth={2} aria-hidden="true" />
                  <span>hello@beilo.store</span>
                </a>
              </li>
              <li>
                <Clock size={16} strokeWidth={2} aria-hidden="true" />
                <span>Mon – Sat · 08:00 – 20:00</span>
              </li>
            </ul>

            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="footer-whatsapp"
            >
              <span className="footer-whatsapp-icon">
                <MessageCircle size={16} strokeWidth={2} />
              </span>
              <span>Chat on WhatsApp</span>
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="footer-bottom">
          <p className="footer-copy">
            © {new Date().getFullYear()} BEILO. All rights reserved.
          </p>
          <p className="footer-payment">
            Pay on delivery &amp; mobile money accepted
          </p>
        </div>
      </div>
    </footer>
  );
}
