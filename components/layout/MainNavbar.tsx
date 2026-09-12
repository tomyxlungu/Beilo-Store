'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { ChevronDown } from 'lucide-react';

const navigation = [
  { label: 'Shop', href: '/shop' },
  { label: 'New Arrivals', href: '/shop?new=true' },
  { label: 'Men', href: '/shop?category=Men' },
  { label: 'Women', href: '/shop?category=Women' },
  {
    label: 'Collections',
    dropdown: [
      { label: 'Footwear', href: '/shop?category=Footwear' },
      { label: 'Denim', href: '/shop?category=Denim' },
      { label: 'Headwear', href: '/shop?category=Headwear' },
    ],
  },
  { label: 'Promos', href: '/shop?category=Promos' },
];

function isLinkActive(
  href: string,
  pathname: string,
  searchParams: URLSearchParams
): boolean {
  if (pathname !== '/shop') return false;

  // Exact match for plain /shop
  if (href === '/shop') {
    return searchParams.toString() === '';
  }

  // Match query parameters
  const target = new URL(href, 'http://dummy');
  const targetParams = target.searchParams;

  // Every key/value in the target must exist in the current URL
  for (const [key, value] of targetParams.entries()) {
    if (searchParams.get(key) !== value) return false;
  }

  // Current URL should not have extra meaningful params
  // (optional – remove if you want partial matches)
  return true;
}

export default function MainNavbar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [collectionsOpen, setCollectionsOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  /* Close the Collections dropdown on Escape or outside click */
  useEffect(() => {
    if (!collectionsOpen) return;

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setCollectionsOpen(false);
      }
    };

    const handlePointer = (event: MouseEvent) => {
      if (
        navRef.current &&
        !navRef.current.contains(event.target as Node)
      ) {
        setCollectionsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKey);
    document.addEventListener('mousedown', handlePointer);

    return () => {
      document.removeEventListener('keydown', handleKey);
      document.removeEventListener('mousedown', handlePointer);
    };
  }, [collectionsOpen]);

  return (
    <nav
      ref={navRef}
      className="main-navbar"
      aria-label="Main navigation"
    >
      <div className="main-navbar-inner">
        <div className="main-navbar-links">
          {navigation.map((item) => {
            // ── Collections dropdown ──────────────────────────
            if (item.dropdown) {
              const isAnyCollectionActive = item.dropdown.some((d) =>
                isLinkActive(d.href, pathname, searchParams)
              );

              return (
                <div
                  key={item.label}
                  className="navbar-dropdown"
                  onMouseEnter={() => setCollectionsOpen(true)}
                  onMouseLeave={() => setCollectionsOpen(false)}
                >
                  <button
                    type="button"
                    className={`navbar-link navbar-dropdown-trigger ${
                      isAnyCollectionActive ? 'navbar-link-active' : ''
                    }`}
                    aria-expanded={collectionsOpen}
                    onClick={() => setCollectionsOpen((prev) => !prev)}
                  >
                    <span>{item.label}</span>
                    <ChevronDown
                      size={14}
                      strokeWidth={2}
                      className={`navbar-chevron ${
                        collectionsOpen ? 'is-open' : ''
                      }`}
                      aria-hidden="true"
                    />
                  </button>

                  {collectionsOpen && (
                    <div className="navbar-dropdown-menu">
                      {item.dropdown.map((dropdownItem) => (
                        <Link
                          key={dropdownItem.label}
                          href={dropdownItem.href}
                          className={`navbar-dropdown-item ${
                            isLinkActive(
                              dropdownItem.href,
                              pathname,
                              searchParams
                            )
                              ? 'navbar-link-active'
                              : ''
                          }`}
                          onClick={() => setCollectionsOpen(false)}
                        >
                          {dropdownItem.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            // ── Regular links ─────────────────────────────────
            const isActive = isLinkActive(item.href, pathname, searchParams);

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`navbar-link ${
                  isActive ? 'navbar-link-active' : ''
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}