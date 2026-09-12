// app/(store)/faq/page.tsx
'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Search,
  SearchX,
  Phone,
  MapPin,
  ArrowRight,
} from 'lucide-react';
import { faqs, FAQ_TOPICS } from '@/data/faqs';
import Accordion from '@/components/ui/Accordion';
import Input from '@/components/ui/Input';
import WhatsAppButton from '@/components/ui/WhatsAppButton';

export default function FAQPage() {
  const [query, setQuery] = useState('');
  const [topic, setTopic] = useState<string>('All');

  const filtered = useMemo(() => {
    const term = query.toLowerCase().trim();

    return faqs.filter((faq) => {
      const matchesTopic =
        topic === 'All' || faq.category === topic;

      const matchesQuery =
        !term ||
        faq.question.toLowerCase().includes(term) ||
        faq.answer.toLowerCase().includes(term);

      return matchesTopic && matchesQuery;
    });
  }, [query, topic]);

  return (
    <div className="faq-page">
      {/* Header */}
      <div className="faq-header">
        <div>
          <h1 className="faq-title">
            Frequently Asked Questions
          </h1>
          <p className="faq-subtitle">
            Everything you need to know about ordering
            from BEILO.
          </p>
        </div>

        <form
          className="faq-search"
          role="search"
          onSubmit={(event) =>
            event.preventDefault()
          }
        >
          <Input
            type="search"
            placeholder="Search questions..."
            value={query}
            onChange={(event) =>
              setQuery(event.target.value)
            }
            icon={<Search size={16} />}
            size="md"
            variant="default"
            clearable
            onClear={() => setQuery('')}
            aria-label="Search frequently asked questions"
          />
        </form>
      </div>

      {/* Topic chips */}
      <div
        className="faq-topics"
        role="tablist"
        aria-label="FAQ topics"
      >
        {FAQ_TOPICS.map((item) => (
          <button
            key={item}
            type="button"
            role="tab"
            aria-selected={topic === item}
            className={`shop-pill ${
              topic === item
                ? 'shop-pill-active'
                : ''
            }`}
            onClick={() => setTopic(item)}
          >
            {item}
          </button>
        ))}
      </div>

      <p className="faq-count" aria-live="polite">
        {filtered.length} answer
        {filtered.length !== 1 ? 's' : ''}
        {topic !== 'All' ? ` in ${topic}` : ''}
      </p>

      <div className="grid faq-grid">
        {/* Answers */}
        <div className="span-8">
          <div className="faq-card">
            {filtered.length === 0 ? (
              <div className="faq-empty">
                <SearchX
                  size={40}
                  className="faq-empty-icon"
                  aria-hidden="true"
                />
                <h2 className="faq-empty-title">
                  No answers found
                </h2>
                <p className="faq-empty-text">
                  Try a different search or topic —
                  or ask us directly on WhatsApp.
                </p>
                <button
                  type="button"
                  className="shop-chips-clear"
                  onClick={() => {
                    setQuery('');
                    setTopic('All');
                  }}
                >
                  Clear search
                </button>
              </div>
            ) : (
              <Accordion
                items={filtered}
                allowMultiple
              />
            )}
          </div>
        </div>

        {/* Contact card */}
        <div className="span-4">
          <aside className="faq-contact">
            <h2 className="faq-contact-title">
              Still have questions?
            </h2>
            <p className="faq-contact-text">
              We&apos;re here to help. Reach out on
              WhatsApp and we&apos;ll get back to you
              quickly.
            </p>

            <WhatsAppButton
              phoneNumber="260971234567"
              message="Hi BEILO, I have a question."
              label="Chat on WhatsApp"
              className="faq-whatsapp"
            />

            <div className="faq-contact-divider" />

            <p className="faq-contact-row">
              <Phone size={14} aria-hidden="true" />
              <span>+260 97 1234567</span>
            </p>

            <Link
              href="/stores"
              className="faq-contact-row faq-contact-link"
            >
              <MapPin size={14} aria-hidden="true" />
              <span>Find a store near you</span>
              <ArrowRight
                size={14}
                aria-hidden="true"
              />
            </Link>
          </aside>
        </div>
      </div>
    </div>
  );
}
