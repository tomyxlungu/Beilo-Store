'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';

const STORAGE_KEY = 'beilo-wishlist';

interface WishlistContextType {
  ids: string[];
  totalItems: number;
  isHydrated: boolean;
  has: (id: string) => boolean;
  toggle: (id: string) => void;
  clear: () => void;
}

const WishlistContext = createContext<
  WishlistContextType | undefined
>(undefined);

function load(): string[] {
  if (typeof window === 'undefined') return [];

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    const parsed = saved ? JSON.parse(saved) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function WishlistProvider({
  children,
}: {
  children: ReactNode;
}) {
  // Start empty so the first client render matches the
  // server HTML, then hydrate from localStorage in an
  // effect to avoid a hydration mismatch.
  const [ids, setIds] = useState<string[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Sync from external store post-mount so hydration matches.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIds(load());
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(ids)
      );
    } catch {
      /* storage unavailable — wishlist stays in memory */
    }
  }, [ids, isHydrated]);

  const has = (id: string) => ids.includes(id);

  const toggle = (id: string) => {
    setIds((prev) =>
      prev.includes(id)
        ? prev.filter((saved) => saved !== id)
        : [...prev, id]
    );
  };

  const clear = () => setIds([]);

  return (
    <WishlistContext.Provider
      value={{
        ids,
        totalItems: ids.length,
        isHydrated,
        has,
        toggle,
        clear,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);

  if (context === undefined) {
    throw new Error(
      'useWishlist must be used within a WishlistProvider'
    );
  }

  return context;
}
