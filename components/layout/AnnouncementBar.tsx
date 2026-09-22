'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const FALLBACK = [
  {
    text: 'New season just dropped — shop new arrivals',
    href: '/shop?new=true',
  },
  {
    text: 'Deals under K 3,500 — shop promos',
    href: '/shop?category=Promos',
  },
  {
    text: 'Pay on delivery & mobile money accepted',
    href: '/shop',
  },
];

export default function AnnouncementBar() {
  const [messages, setMessages] = useState(FALLBACK);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    async function load() {
      try {
        const { data } = await supabase
          .from('homepage_blocks')
          .select('title, content')
          .eq('type', 'announcement')
          .eq('active', true)
          .order('sort_order');
        if (data && data.length > 0) {
          setMessages(
            data.map((b: any) => ({
              text: b.title,
              href: b.content?.href || '/shop',
            }))
          );
        }
      } catch {
        /* fall back to defaults */
      }
    }
    load();
  }, []);

  useEffect(() => {
    if (messages.length < 2) return;
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % messages.length);
    }, 4500);

    return () => clearInterval(interval);
  }, [messages.length]);

  const message = messages[index % messages.length] || FALLBACK[0];

  return (
    <div className="announcement-bar">
      <Link
        key={index}
        href={message.href}
        className="announcement-link fade-in"
      >
        {message.text}
      </Link>
    </div>
  );
}
