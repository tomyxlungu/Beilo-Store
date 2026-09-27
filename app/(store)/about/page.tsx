import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Users, Truck, Shield, Star, Globe, Music, Banknote, RotateCcw, MessageCircle } from 'lucide-react';

const FACTS = [
  { icon: Banknote, label: 'Pay on delivery' },
  { icon: Truck, label: 'K50 Lusaka delivery' },
  { icon: RotateCcw, label: '7-day returns' },
  { icon: MessageCircle, label: 'WhatsApp checkout' },
];

export default function AboutPage() {
  return (
    <main className="about-page">
      {/* Hero */}
      <section className="about-hero about-hero--dark">
        <div className="about-hero-content">
          <p className="about-hero-eyebrow">About BEILO · Lusaka, Zambia</p>
          <h1 className="about-hero-title">Built for the everyday.</h1>
          <p className="about-hero-text">
            We started BEILO with one goal: make fresh denim, solid essentials
            and real streetwear accessible across Zambia — without the markup.
          </p>
          <div className="about-hero-actions">
            <Link href="/shop" className="btn btn-primary about-hero-cta">
              Shop the collection
            </Link>
            <Link href="/stores" className="btn btn-ghost about-hero-ghost">
              <MapPin size={16} strokeWidth={2} aria-hidden="true" />
              <span>Find a store</span>
            </Link>
          </div>
          <ul className="about-facts" aria-label="Why shop with BEILO">
            {FACTS.map(({ icon: Icon, label }) => (
              <li key={label} className="about-fact">
                <Icon size={16} strokeWidth={2} aria-hidden="true" />
                <span>{label}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Mission */}
      <section className="about-section">
        <div className="about-mission">
          <div className="about-mission-image">
            <Image
              src="/products/beliloimg.avif"
              alt="Model wearing a BEILO overshirt"
              fill
              sizes="100vw"
              priority
              className="about-mission-img"
            />
          </div>
          <div className="about-mission-text">
            <p className="about-eyebrow">Designed in Lusaka</p>
            <h2 className="about-section-title">Why we exist</h2>
            <p className="about-section-body">
              Most people shop fast fashion because it&apos;s cheap, not because
              they love it. We think you shouldn&apos;t have to choose. Our
              collections are designed in Lusaka, sourced from vetted mills, and
              priced so you can build a wardrobe that actually lasts.
            </p>
            <p className="about-section-body">
              No drop-shipping. No mystery fabrics. Just honest product —
              denim that breaks in, tees that hold shape, outerwear that
              handles the weather.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="about-section">
        <h2 className="about-section-title about-section-title--center">
          What we stand for
        </h2>
        <div className="about-values">
          {[
            {
              icon: Shield,
              title: 'Quality first',
              desc: 'Every piece is inspected before it ships. If we wouldn&apos;t wear it, we don&apos;t sell it.',
            },
            {
              icon: Users,
              title: 'Local roots',
              desc: 'Designed in Zambia, for Zambian life. Our fits, fabrics and drops reflect the streets we walk.',
            },
            {
              icon: Truck,
              title: 'Fast delivery',
              desc: 'Lusaka, Ndola, Kitwe — pay on delivery, mobile money accepted, door to door in 1–3 days.',
            },
            {
              icon: Star,
              title: 'No fluff pricing',
              desc: 'You pay for the product, not the hype. Transparent K-prices, no hidden fees.',
            },
          ].map((value, i) => (
            <article key={i} className="about-value-card">
              <div className="about-value-icon">
                <value.icon size={24} strokeWidth={2} aria-hidden="true" />
              </div>
              <h3 className="about-value-title">{value.title}</h3>
              <p className="about-value-desc">{value.desc}</p>
            </article>
          ))}
        </div>
      </section>

{/* Stores */}
      <section className="about-section about-section--stores">
        <div className="about-stores">
          <div className="about-stores-text">
            <h2 className="about-section-title">Visit us</h2>
            <p className="about-section-body">
              Want to try before you buy? Walk into any of our three stores.
              Staff know the stock, fits are true to size, and you can pay on
              the spot — cash or mobile money.
            </p>
            <Link href="/stores" className="btn btn-secondary about-stores-cta">
              Find a store
              <MapPin size={16} strokeWidth={2} aria-hidden="true" />
            </Link>
          </div>
          <div className="about-stores-map">
            <Image
              src="/products/cozy.jpeg"
              alt="Folded BEILO streetwear pieces"
              fill
              sizes="100vw"
              className="about-stores-img"
            />
          </div>
        </div>
      </section>

      {/* CTA strip */}
      <section className="about-cta">
        <div className="about-cta-inner">
          <div className="about-cta-social" aria-label="BEILO community">
            <span className="about-cta-pill">
              <Globe size={16} strokeWidth={2} aria-hidden="true" />
              <strong>98K</strong>&nbsp;followers · Facebook
            </span>
            <span className="about-cta-pill">
              <Music size={16} strokeWidth={2} aria-hidden="true" />
              <strong>29.8K</strong>&nbsp;followers · TikTok
            </span>
          </div>

          <p className="about-cta-text">Ready to upgrade the rotation?</p>
          <Link href="/shop?new=true" className="btn btn-primary about-cta-button">
            Shop new arrivals
          </Link>
        </div>
      </section>
    </main>
  );
}