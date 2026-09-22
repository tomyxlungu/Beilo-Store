'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  ShoppingBag,
  MapPin,
  Phone,
  Mail,
  Clock,
  Camera,
  Globe,
  AtSign,
  Send,
  MessageCircle,
} from 'lucide-react';

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
  { label: 'Shopping Bag', href: '/cart' },
  { label: 'Checkout', href: '/checkout' },
  { label: 'Wishlist', href: '/wishlist' },
  { label: 'Orders', href: '/orders' },
  { label: 'Account', href: '/account' },
  { label: 'Stuff', href: '/admin/login' },
];

const socials = [
  { label: 'Instagram', href: 'https://instagram.com', Icon: Camera },
  { label: 'Facebook', href: 'https://facebook.com', Icon: Globe },
  { label: 'Twitter', href: 'https://twitter.com', Icon: AtSign },
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
                  <Icon size={18} strokeWidth={2} />
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
                <Phone size={16} strokeWidth={2} aria-hidden="true" />
                <span>+260 XXX XXX XXX</span>
              </li>
              <li>
                <Mail size={16} strokeWidth={2} aria-hidden="true" />
                <span>hello@beilo.store</span>
              </li>
              <li>
                <Clock size={16} strokeWidth={2} aria-hidden="true" />
                <span>Mon – Sat · 08:00 – 20:00</span>
              </li>
            </ul>

            <a
              href="https://wa.me/260XXXXXXXXX?text=Hi%20BEILO%2C%20I%20need%20some%20help."
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
          <div className="footer-legal">
            <Link href="/faq" className="footer-link footer-link-small">
              FAQ
            </Link>
            <Link href="/stores" className="footer-link footer-link-small">
              Stores
            </Link>
            <Link href="/shop" className="footer-link footer-link-small">
              Shop
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
