'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const MESSAGES = [
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
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % MESSAGES.length);
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  const message = MESSAGES[index];

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
