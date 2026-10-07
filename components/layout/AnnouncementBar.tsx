'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabaseBrowser as supabase } from '@/lib/supabase/client';

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

export default function AnnouncementBar({
  fixedText = '',
  fixedHref = '/shop',
}: {
  fixedText?: string;
  fixedHref?: string;
}) {
  const [messages, setMessages] = useState(
    fixedText ? [{ text: fixedText, href: fixedHref }] : FALLBACK
  );
  const [index, setIndex] = useState(0);

  useEffect(() => {
    // A settings announcement overrides the CMS rotation entirely.
    if (fixedText) {
      setMessages([{ text: fixedText, href: fixedHref }]);
      setIndex(0);
      return;
    }
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
  }, [fixedText, fixedHref]);

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
