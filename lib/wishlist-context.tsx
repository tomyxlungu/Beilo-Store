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
  const [ids, setIds] = useState<string[]>(load);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(ids)
      );
    } catch {
      /* storage unavailable — wishlist stays in memory */
    }
  }, [ids]);

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
