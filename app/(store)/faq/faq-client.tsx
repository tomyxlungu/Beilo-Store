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
import { FAQItem } from '@/types/product';
import Accordion from '@/components/ui/Accordion';
import Input from '@/components/ui/Input';
import WhatsAppButton from '@/components/ui/WhatsAppButton';

interface FAQClientProps {
  initialFaqs: FAQItem[];
  faqTopics: string[];
}

export default function FAQClient({ initialFaqs, faqTopics }: FAQClientProps) {
  const [query, setQuery] = useState('');
  const [topic, setTopic] = useState<string>('All');

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const faq of initialFaqs) {
      const category = faq.category?.trim() || 'General';
      map.set(category, (map.get(category) ?? 0) + 1);
    }
    return map;
  }, [initialFaqs]);

  const filtered = useMemo(() => {
    const term = query.toLowerCase().trim();

    return initialFaqs.filter((faq) => {
      const matchesTopic =
        topic === 'All' || (faq.category?.trim() || 'General') === topic;

      const matchesQuery =
        !term ||
        faq.question.toLowerCase().includes(term) ||
        faq.answer.toLowerCase().includes(term);

      return matchesTopic && matchesQuery;
    });
  }, [query, topic, initialFaqs]);

  // Browse mode (no search, All topics): group answers under topic
  // headings. Searching or picking a topic flattens to one list.
  const grouped = useMemo(() => {
    if (topic !== 'All' || query.trim() !== '') return null;
    const order = faqTopics.filter((t) => t !== 'All');
    const groups: { topic: string; items: typeof filtered }[] = [];
    for (const t of order) {
      const items = filtered.filter((f) => (f.category?.trim() || 'General') === t);
      if (items.length > 0) groups.push({ topic: t, items });
    }
    const covered = new Set(groups.flatMap((g) => g.items));
    const rest = filtered.filter((f) => !covered.has(f));
    if (rest.length > 0) groups.push({ topic: 'General', items: rest });
    return groups;
  }, [filtered, topic, query, faqTopics]);

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
        {faqTopics.map((item) => {
          const active = topic === item;
          const count = item === 'All' ? initialFaqs.length : counts.get(item) ?? 0;
          return (
            <button
              key={item}
              type="button"
              role="tab"
              aria-selected={active}
              className={`shop-pill ${
                active ? 'shop-pill-active' : ''
              }`}
              onClick={() => setTopic(item)}
            >
              {item}
              <span className="faq-topic-count" aria-hidden="true">{count}</span>
            </button>
          );
        })}
      </div>

      <p className="faq-count" aria-live="polite">
        {filtered.length} answer
        {filtered.length !== 1 ? 's' : ''}
        {topic !== 'All' ? ` in ${topic}` : ''}
        {query.trim() !== '' ? ` matching “${query.trim()}”` : ''}
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
            ) : grouped ? (
              grouped.map((group) => (
                <section key={group.topic} className="faq-group" aria-label={group.topic}>
                  <h2 className="faq-group-title">
                    {group.topic}
                    <span className="faq-group-count">{group.items.length}</span>
                  </h2>
                  <Accordion
                    items={group.items}
                    allowMultiple
                  />
                </section>
              ))
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