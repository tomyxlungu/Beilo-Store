'use client';

import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'beilo-recent-searches';
const MAX_SAVED = 6;

function load(): string[] {
  if (typeof window === 'undefined') return [];

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    const parsed = saved ? JSON.parse(saved) : [];
    return Array.isArray(parsed)
      ? parsed.filter((term): term is string => typeof term === 'string')
      : [];
  } catch {
    return [];
  }
}

/**
 * New isolated logic (homepage refactor): remembers recent search
 * terms in localStorage. Nothing else in the app depends on this —
 * submitting a search still just routes to /shop?search=… exactly
 * like the header search always has.
 */
export function useRecentSearches() {
  // Start empty so the first client render matches the server
  // HTML, then hydrate from localStorage post-mount.
  const [terms, setTerms] = useState<string[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTerms(load());
    setIsHydrated(true);
  }, []);

  const record = useCallback((raw: string) => {
    const term = raw.trim();
    if (!term) return;

    setTerms((prev) => {
      const lowered = term.toLowerCase();
      const next = [
        term,
        ...prev.filter((saved) => saved.toLowerCase() !== lowered),
      ].slice(0, MAX_SAVED);

      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* storage unavailable — list stays in memory */
      }

      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setTerms([]);

    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* storage unavailable */
    }
  }, []);

  return { terms, isHydrated, record, clear };
}
