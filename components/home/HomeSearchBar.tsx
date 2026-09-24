'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Clock, Search, SlidersHorizontal } from 'lucide-react';
import Input from '@/components/ui/Input';
import { useRecentSearches } from '@/lib/recent-searches';

/**
 * Homepage top search bar (mobile-first refactor, section 1).
 * Same submit behavior as the header search — routes to
 * /shop?search=… — plus a filter shortcut and a recent-searches
 * dropdown. No cart/wishlist/routing logic was changed.
 */
export default function HomeSearchBar() {
  const router = useRouter();
  const { terms, record, clear } = useRecentSearches();

  const [value, setValue] = useState('');
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // Close the dropdown on outside click, like the header dropdowns.
  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (
        rootRef.current &&
        !rootRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
    };
  }, [open]);

  const submit = (raw: string) => {
    const query = raw.trim();
    if (!query) return;

    record(query);
    setOpen(false);
    router.push(`/shop?search=${encodeURIComponent(query)}`);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submit(value);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') setOpen(false);
  };

  return (
    <div ref={rootRef} className="home-searchbar">
      <div className="home-searchbar-row">
        <form
          onSubmit={handleSubmit}
          className="home-searchbar-form"
          role="search"
        >
          <Input
            type="search"
            placeholder="Search for products, brands…"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            onFocus={() => setOpen(true)}
            onKeyDown={handleKeyDown}
            icon={<Search size={18} />}
            size="md"
            variant="default"
            clearable
            onClear={() => setValue('')}
            aria-label="Search for products, brands"
            aria-expanded={open && terms.length > 0}
            aria-controls="home-recent-searches"
          />
        </form>

        <Link
          href="/shop"
          className="home-filter-btn"
          aria-label="Open shop filters"
        >
          <SlidersHorizontal size={20} strokeWidth={2} />
        </Link>
      </div>

      {open && terms.length > 0 && (
        <div className="recent-searches" role="dialog" aria-label="Recent searches">
          <div className="recent-searches-header">
            <span className="recent-searches-title">Recent searches</span>
            <button
              type="button"
              className="recent-searches-clear"
              onClick={clear}
              aria-label="Clear recent searches"
            >
              Clear
            </button>
          </div>

          <ul id="home-recent-searches" className="recent-searches-list" role="listbox" aria-label="Recent searches">
            {terms.map((term) => (
              <li key={term.toLowerCase()} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected="false"
                  className="recent-searches-item"
                  // Prevent the input blur from closing the
                  // dropdown before the click registers.
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    setValue(term);
                    submit(term);
                  }}
                >
                  <Clock size={15} strokeWidth={2} aria-hidden="true" />
                  <span className="recent-searches-term">{term}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {open && terms.length === 0 && (
        <p className="recent-searches-empty" role="status">
          No recent searches yet — try “denim” or “hoodie”.
        </p>
      )}
    </div>
  );
}
