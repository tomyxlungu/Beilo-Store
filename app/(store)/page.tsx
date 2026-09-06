// app/(store)/page.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Search, MapPin, Star, Users, Package, Heart, ShoppingBag, ChevronRight, Sparkles, Clock, Phone, Menu, X } from 'lucide-react';

// Import components
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import ProductCard from '@/components/ui/ProductCard';
import StockInfo from '@/components/ui/StockInfo';
import Input from '@/components/ui/Input';
import Spinner from '@/components/ui/Spinner';
import Accordion from '@/components/ui/Accordion';
import Breadcrumb from '@/components/ui/Breadcrumb';
import Checkbox from '@/components/ui/Checkbox';
import SegmentedControl from '@/components/ui/SegmentedControl';
import VerifiedBadge from '@/components/ui/VerifiedBadge';
import PriceSlider from '@/components/ui/PriceSlider';
import BagSummary from '@/components/ui/BagSummary';
import SizeSelector from '@/components/ui/SizeSelector';

// Define types
interface StockLocation {
  storeName: string;
  quantity: number;
}

interface Product {
  id: string;
  slug: string;
  name: string;
  price: number;
  category: string;
  description: string;
  sizes: string[];
  images: string[];
  stockByStore: StockLocation[];
  isNew?: boolean;
  isTrending?: boolean;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface FAQItem {
  question: string;
  answer: string;
}

interface StoreLocation {
  name: string;
  address: string;
  hours: string;
}

// Sample data
const sampleProducts: Product[] = [
  {
    id: '1',
    slug: 'striped-tee',
    name: 'Striped Tee',
    price: 150,
    category: 'Men',
    description: 'Regular fit cotton striped tee',
    sizes: ['S', 'M', 'L', 'XL'],
    images: ['/products/striped-tee.jpg'],
    stockByStore: [
      { storeName: 'Downtown', quantity: 1 },
      { storeName: 'City Market', quantity: 1 },
      { storeName: 'Manda Hill', quantity: 1 },
    ],
    isNew: true,
    isTrending: true,
  },
  {
    id: '2',
    slug: 'ripped-jeans',
    name: 'Ripped Jeans',
    price: 280,
    category: 'Denim',
    description: 'Relaxed fit with ripped details',
    sizes: ['30', '32', '34', '36'],
    images: ['/products/ripped-jeans.jpg'],
    stockByStore: [
      { storeName: 'Downtown', quantity: 1 },
      { storeName: 'East Park', quantity: 0 },
    ],
    isNew: true,
    isTrending: false,
  },
  {
    id: '3',
    slug: 'vans-old-skool',
    name: 'Vans Old Skool',
    price: 450,
    category: 'Footwear',
    description: 'Classic skate shoe',
    sizes: ['40', '42', '44'],
    images: ['/products/vans.jpg'],
    stockByStore: [
      { storeName: 'City Market', quantity: 0 },
      { storeName: 'Levy Junction', quantity: 1 },
    ],
    isNew: false,
    isTrending: true,
  },
];

const sampleCartItems: CartItem[] = [
  { id: '1', name: 'Striped Tee', price: 150, quantity: 2 },
  { id: '2', name: 'Ripped Jeans', price: 280, quantity: 1 },
];

const faqItems: FAQItem[] = [
  { question: 'How do I pay?', answer: 'Pay on pickup at any of our 5 stores. We accept cash, mobile money, and card.' },
  { question: 'Can I return an item?', answer: 'Yes! Return within 7 days with tags attached for a full refund or exchange.' },
  { question: 'How long until my order is ready?', answer: 'Most orders are ready within 2 hours. We\'ll WhatsApp you when it\'s ready.' },
  { question: 'Do you deliver?', answer: 'Yes! Delivery available within Lusaka for K50. Free pickup at any store.' },
];

export default function HomePage() {
  const [cartCount, setCartCount] = useState<number>(0);
  const [savedCount, setSavedCount] = useState<number>(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [priceFilter, setPriceFilter] = useState<boolean>(false);
  const [sizeFilter, setSizeFilter] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [newsletterPhone, setNewsletterPhone] = useState<string>('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  const categories: string[] = ['All', 'Men', 'Women', 'Footwear', 'Headwear', 'Denim', 'Promos'];

  const handleAddToCart = (product: Product): void => {
    setCartCount(prev => prev + 1);
    console.log('Added to cart:', product.name);
  };

  const handleSaveForLater = (product: Product): void => {
    setSavedCount(prev => prev + 1);
    console.log('Saved for later:', product.name);
  };

  return (
    <div style={{
      fontFamily: "'Comfortaa', sans-serif",
      background: 'var(--canvas)',
      color: 'var(--charcoal-noir)',
      WebkitFontSmoothing: 'antialiased',
      minHeight: '100vh',
    }}>
      <main className="wrap">
        {/* Mobile Header */}
        <div className="hide-desktop" style={{ marginBottom: '16px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 0',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '8px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <Image
                src="/branding/logo.svg"
                alt="BEILO Logo"
                width={40}
                height={40}
                priority
                onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
              <span style={{ fontSize: '20px', fontWeight: 700 }}>BEILO</span>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button variant="secondary" size="sm" icon={<ShoppingBag size={13} />}>
                {cartCount}
              </Button>
              <Button variant="secondary" size="sm" icon={<Heart size={13} />}>
                {savedCount}
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div style={{
              background: 'var(--cloud-veil)',
              borderRadius: '18px',
              padding: '16px',
              marginBottom: '16px',
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {categories.map((cat: string) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setSelectedCategory(cat);
                      setIsMobileMenuOpen(false);
                    }}
                    style={{
                      background: selectedCategory === cat ? 'var(--charcoal-noir)' : 'var(--canvas)',
                      color: selectedCategory === cat ? 'var(--canvas)' : 'var(--charcoal-noir)',
                      border: '1.5px solid var(--charcoal-noir)',
                      borderRadius: '30px',
                      padding: '12px 20px',
                      cursor: 'pointer',
                      fontFamily: "'Comfortaa', sans-serif",
                      fontSize: '14px',
                      fontWeight: 600,
                      textAlign: 'left',
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Mobile Search */}
          <Input
            icon={<Search size={16} />}
            placeholder="Search products..."
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => console.log(e.target.value)}
          />
        </div>

        {/* Desktop Header */}
        <header className="header hide-mobile">
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <Image
              src="/branding/logo.svg"
              alt="BEILO Logo"
              width={88}
              height={88}
              priority
              onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
            <div>
              <h1>BEILO</h1>
              <p>Premium streetwear & fashion essentials. Shop online, pick up in store.</p>
              <div style={{ display: 'flex', gap: '16px', marginTop: '8px', flexWrap: 'wrap' }}>
                <span style={{ color: 'var(--moonlit-silver)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Users size={14} />
                  <strong style={{ color: 'var(--canvas)' }}>98K</strong> Followers
                </span>
                <span style={{ color: 'var(--moonlit-silver)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Package size={14} />
                  <strong style={{ color: 'var(--canvas)' }}>4.3K</strong> Posts
                </span>
                <span style={{ color: 'var(--moonlit-silver)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Star size={14} />
                  <strong style={{ color: 'var(--canvas)' }}>100%</strong> Recommend
                </span>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <Button variant="secondary" size="sm" icon={<ShoppingBag size={14} />}>
              Bag ({cartCount})
            </Button>
            <Button variant="secondary" size="sm" icon={<Heart size={14} />}>
              Saved ({savedCount})
            </Button>
          </div>
        </header>

        {/* Breadcrumb - Hidden on mobile */}
        <div className="hide-mobile">
          <Breadcrumb items={[
            { label: 'Home', href: '/' },
            { label: 'Shop', href: '/shop' },
            { label: 'New Arrivals' },
          ]} />
        </div>

        {/* Desktop Search */}
        <div className="hide-mobile" style={{ marginBottom: '16px' }}>
          <Input
            icon={<Search size={16} />}
            placeholder="Search for Vans, polo, jeans..."
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => console.log(e.target.value)}
          />
        </div>

        {/* Category Navigation - Desktop */}
        <div className="hide-mobile">
          <div className="section-label">BROWSE CATEGORIES</div>
          <div className="tag-row" style={{ marginBottom: '24px' }}>
            {categories.map((cat: string) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className="tag"
                style={{
                  background: selectedCategory === cat ? 'var(--charcoal-noir)' : 'var(--canvas)',
                  color: selectedCategory === cat ? 'var(--canvas)' : 'var(--charcoal-noir)',
                  border: '1.5px solid var(--charcoal-noir)',
                  cursor: 'pointer',
                  fontFamily: "'Comfortaa', sans-serif",
                  whiteSpace: 'nowrap',
                  minHeight: '44px',
                  display: 'inline-flex',
                  alignItems: 'center',
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Sorting & Filtering */}
        <div className="section-label">FILTER & SORT</div>
        <div className="grid">
          <div className="card span-12">
            <div className="filter-sort-container">
              <div style={{ width: '100%', overflowX: 'auto' }}>
                <SegmentedControl
                  options={[
                    { label: 'Newest', value: 'newest' },
                    { label: 'Price: Low-High', value: 'price-low' },
                    { label: 'Popular', value: 'popular' },
                  ]}
                  value={sortBy}
                  onChange={setSortBy}
                />
              </div>
              <div className="filter-checkboxes">
                <Checkbox
                  label="Under K200"
                  checked={priceFilter}
                  onChange={setPriceFilter}
                />
                <Checkbox
                  label="Size 34"
                  checked={sizeFilter}
                  onChange={setSizeFilter}
                />
              </div>
              <div className="filter-slider">
                <PriceSlider min={0} max={1000} />
              </div>
            </div>
          </div>
        </div>

        {/* Featured Drop */}
        <div className="section-label">THIS WEEK&apos;S DROP</div>
        <div className="grid">
          <div className="card span-12" style={{ padding: '0', overflow: 'hidden' }}>
            <div className="featured-grid" style={{
              background: 'linear-gradient(135deg, var(--charcoal-noir) 0%, var(--ironclad-grey) 100%)',
              color: 'var(--canvas)',
            }}>
              <div>
                <Badge variant="new" />
                <h2 className="featured-title" style={{ color: 'var(--canvas)' }}>
                  Street Essentials
                  <br />
                  Collection
                </h2>
                <p className="featured-description" style={{ color: 'var(--moonlit-silver)' }}>
                  Striped tees, ripped denim, and classic Vans — bundled as complete looks.
                </p>
                <div className="featured-buttons">
                  <Button variant="primary" size="lg" icon={<ShoppingBag size={18} />} fullWidth>
                    Shop the Drop
                  </Button>
                  <Button 
                    variant="secondary" 
                    size="lg" 
                    style={{ borderColor: 'var(--canvas)', color: 'var(--canvas)' }}
                    icon={<Sparkles size={18} />}
                    fullWidth
                  >
                    View Lookbook
                  </Button>
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div className="featured-image" style={{
                  background: 'var(--cloud-veil)',
                  color: 'var(--ironclad-grey)',
                  fontSize: '14px',
                }}>
                  {isLoading ? <Spinner size="lg" /> : 'Featured Drop Image'}
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setIsLoading(!isLoading)}
                  style={{ marginTop: '12px', color: 'var(--moonlit-silver)' }}
                >
                  {isLoading ? 'Hide Loading State' : 'Show Loading State'}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Product Grid - Full width on mobile, 3 columns on desktop */}
        <div className="section-label">TRENDING PRODUCTS</div>
        <div className="grid">
          {sampleProducts.map((product: Product) => (
            <div key={product.id} className="span-4">
              <ProductCard
                product={product}
                onAddToCart={handleAddToCart}
                onSaveForLater={handleSaveForLater}
                compact={false}
              />
            </div>
          ))}
        </div>

        {/* Size Selector */}
        <div className="section-label">SELECT YOUR SIZE</div>
        <div className="grid">
          <div className="card span-6">
            <h3>Size Selector</h3>
            <SizeSelector
              sizes={['S', 'M', 'L', 'XL', 'XXL']}
              selectedSize={selectedSize}
              onSelect={setSelectedSize}
            />
          </div>
          <div className="card span-6">
            <h3>Size Selector (Footwear)</h3>
            <SizeSelector
              sizes={['40', '41', '42', '43', '44', '45']}
              onSelect={(size: string) => console.log('Selected shoe size:', size)}
            />
          </div>
        </div>

        {/* Stock Info */}
        <div className="section-label">STOCK AVAILABILITY</div>
        <div className="grid">
          <div className="card span-6">
            <h3>Available Stores</h3>
            <StockInfo stockByStore={sampleProducts[0].stockByStore} />
          </div>
          <div className="card span-6">
            <h3>Out of Stock Example</h3>
            <StockInfo stockByStore={sampleProducts[2].stockByStore} showAll />
          </div>
        </div>

        {/* Bag Summary */}
        <div className="section-label">YOUR BAG</div>
        <div className="grid">
          <div className="card span-6">
            <h3>Bag Summary</h3>
            <BagSummary
              items={sampleCartItems}
              onCheckout={() => console.log('Proceeding to checkout')}
            />
          </div>
          <div className="card span-6">
            <h3>Empty Bag State</h3>
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <ShoppingBag size={48} style={{ color: 'var(--moonlit-silver)', marginBottom: '16px' }} />
              <p style={{ fontSize: '14px', color: 'var(--ironclad-grey)', marginBottom: '16px' }}>
                Your bag is empty
              </p>
              <Button variant="primary" size="sm">
                Start Shopping
              </Button>
            </div>
          </div>
        </div>

        {/* Trust Signals - Stack on mobile, grid on desktop */}
        <div className="section-label">WHY SHOP WITH BEILO</div>
        <div className="grid">
          <div className="card span-3">
            <VerifiedBadge variant="followers" text="98K Followers" subtext="Trusted community" />
          </div>
          <div className="card span-3">
            <VerifiedBadge variant="rating" text="100% Recommend" subtext="40+ reviews" />
          </div>
          <div className="card span-3">
            <VerifiedBadge variant="stores" text="5 Stores" subtext="Across Lusaka" />
          </div>
          <div className="card span-3">
            <VerifiedBadge variant="ready" text="24h Ready" subtext="Fast pickup" />
          </div>
        </div>

        {/* FAQ Accordion */}
        <div className="section-label">FREQUENTLY ASKED QUESTIONS</div>
        <div className="grid">
          <div className="card span-12">
            <Accordion items={faqItems} />
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="section-label">STAY UPDATED</div>
        <div className="grid">
          <div className="card span-12 newsletter-container">
            <h2 style={{ fontWeight: 700, marginBottom: '8px' }}>
              Never Miss a Drop
            </h2>
            <p style={{ color: 'var(--ironclad-grey)', marginBottom: '20px' }}>
              Get notified when new items arrive, restocks happen, or your size is back
            </p>
            <div className="newsletter-form">
              <Input
                icon={<Phone size={14} />}
                placeholder="Enter your WhatsApp number"
                value={newsletterPhone}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewsletterPhone(e.target.value)}
              />
              <Button variant="primary" fullWidth>
                Notify Me
              </Button>
            </div>
            <div style={{ 
              marginTop: '16px', 
              fontSize: '12px', 
              color: 'var(--ironclad-grey)',
            }}>
              We&apos;ll send you: New drop alerts • Restock pings • Weekly digest
            </div>
          </div>
        </div>

        {/* Store Locator */}
        <div className="section-label">FIND IN STORE</div>
        <div className="grid">
          {[
            { name: "Downtown", address: "Cairo Road, Lusaka", hours: "9AM - 6PM" },
            { name: "City Market", address: "Freedom Way, Lusaka", hours: "8AM - 5PM" },
            { name: "Manda Hill", address: "Great East Road", hours: "10AM - 8PM" },
          ].map((store: StoreLocation) => (
            <div key={store.name} className="card span-4">
              <h3 style={{ 
                fontSize: '14px', 
                fontWeight: 600, 
                marginBottom: '8px', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px' 
              }}>
                <MapPin size={16} style={{ flexShrink: 0 }} />
                {store.name}
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--ironclad-grey)', marginBottom: '4px' }}>{store.address}</p>
              <p style={{ fontSize: '12px', color: 'var(--ironclad-grey)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={12} style={{ flexShrink: 0 }} />
                {store.hours}
              </p>
              <div style={{ marginTop: '12px' }}>
                <Button variant="ghost" size="sm" icon={<ChevronRight size={14} />} iconPosition="right">
                  View on Map
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <footer style={{
          marginTop: '44px',
          paddingTop: '32px',
          borderTop: '1px solid var(--urban-fog)',
        }}>
          <div className="grid">
            <div className="span-6" style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px' }}>BEILO</h3>
              <p style={{ fontSize: '13px', color: 'var(--ironclad-grey)', lineHeight: 1.5 }}>
                Premium streetwear & fashion essentials. Shop online, pick up in store across Lusaka.
              </p>
            </div>
            <div className="span-3" style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px' }}>Shop</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <a href="#" className="footer-link">New Arrivals</a>
                <a href="#" className="footer-link">Best Sellers</a>
                <a href="#" className="footer-link">Promos</a>
              </div>
            </div>
            <div className="span-3">
              <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px' }}>Support</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <a href="#" className="footer-link">Contact Us</a>
                <a href="#" className="footer-link">Store Locator</a>
                <a href="#" className="footer-link">FAQ</a>
              </div>
            </div>
          </div>
          <div style={{
            textAlign: 'center',
            padding: '24px 0',
            marginTop: '32px',
            borderTop: '1px solid var(--urban-fog)',
            fontSize: '12px',
            color: 'var(--ironclad-grey)',
          }}>
            © 2024 BEILO. All rights reserved. • 98K Followers • 5 Stores in Lusaka
          </div>
        </footer>
      </main>
    </div>
  );
}