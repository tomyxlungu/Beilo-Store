'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  ReactNode,
} from 'react';
import { trackEvent } from '@/lib/analytics';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  size?: string;
}

interface AddItemData {
  id: string;
  name: string;
  price: number;
  image?: string;
  size?: string;
}

interface CartContextType {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  isHydrated: boolean;
  addItem: (item: AddItemData, quantity?: number) => void;
  removeItem: (id: string, size?: string) => void;
  updateQuantity: (
    id: string,
    quantity: number,
    size?: string
  ) => void;
  clearCart: () => void;
}

const CART_KEY = 'cart';
const MAX_QTY = 99;

/**
 * Treat missing/empty sizes as the same "one size" line so that
 * legacy entries (size: '' or null) still match current updates.
 */
function normalizeSize(size?: string | null): string | undefined {
  return size ? size : undefined;
}

function sameLine(
  a: { id: string; size?: string | null },
  b: { id: string; size?: string | null }
): boolean {
  return a.id === b.id && normalizeSize(a.size) === normalizeSize(b.size);
}

/**
 * Drop malformed entries left by older builds (the "items I didn't
 * pick") and coerce the rest into a valid shape. Duplicates merge.
 */
function sanitizeItems(raw: unknown): CartItem[] {
  if (!Array.isArray(raw)) return [];
  const clean: CartItem[] = [];
  for (const entry of raw) {
    if (!entry || typeof entry !== 'object') continue;
    const e = entry as Record<string, unknown>;
    const id = e.id;
    const name = e.name;
    const price = Number(e.price);
    const quantity = Math.floor(Number(e.quantity));
    if (typeof id !== 'string' || !id) continue;
    if (typeof name !== 'string' || !name) continue;
    if (!Number.isFinite(price) || price < 0) continue;
    if (!Number.isFinite(quantity) || quantity < 1) continue;
    const image = typeof e.image === 'string' && e.image ? e.image : undefined;
    const item: CartItem = {
      id,
      name,
      price,
      quantity: Math.min(quantity, MAX_QTY),
      image,
      size: normalizeSize(typeof e.size === 'string' ? e.size : undefined),
    };
    const existing = clean.find((c) => sameLine(c, item));
    if (existing) {
      existing.quantity = Math.min(MAX_QTY, existing.quantity + item.quantity);
    } else {
      clean.push(item);
    }
  }
  return clean;
}

const CartContext = createContext<CartContextType | undefined>(
  undefined
);

export function CartProvider({
  children,
}: {
  children: ReactNode;
}) {
  // Start empty so the first client render matches the
  // server HTML, then hydrate from localStorage in an
  // effect to avoid a hydration mismatch.
  const [items, setItems] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const hydratedRef = useRef(false);

  useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;
    try {
      const savedCart = window.localStorage.getItem(CART_KEY);

      if (savedCart) {
        const stored = sanitizeItems(JSON.parse(savedCart));
        // Merge instead of overwriting: an add made before this
        // effect ran must not be wiped by stale storage.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setItems((prev) => {
          if (prev.length === 0) return stored;
          const merged = prev.map((m) => ({ ...m }));
          for (const s of stored) {
            const existing = merged.find((m) => sameLine(m, s));
            if (existing) {
              existing.quantity = Math.min(MAX_QTY, existing.quantity + s.quantity);
            } else {
              merged.push(s);
            }
          }
          return merged;
        });
      }
    } catch (error) {
      console.error(
        'Failed to parse cart from localStorage:',
        error
      );
    } finally {
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    try {
      window.localStorage.setItem(
        CART_KEY,
        JSON.stringify(items)
      );
    } catch (error) {
      console.error(
        'Failed to save cart to localStorage:',
        error
      );
    }
  }, [items, isHydrated]);

  const addItem = (
    item: AddItemData,
    quantity = 1
  ) => {
    const qty = Math.max(1, Math.min(MAX_QTY, Math.floor(quantity) || 1));
    const line: CartItem = {
      ...item,
      size: normalizeSize(item.size),
      quantity: qty,
    };
    setItems((prevItems) => {
      const existingItem = prevItems.find((existing) =>
        sameLine(existing, line)
      );

      if (existingItem) {
        return prevItems.map((existing) =>
          sameLine(existing, line)
            ? {
                ...existing,
                quantity: Math.min(MAX_QTY, existing.quantity + qty),
              }
            : existing
        );
      }

      return [...prevItems, line];
    });

    try {
      trackEvent('add_to_bag', {
        product_id: item.id,
        metadata: { name: item.name, size: line.size, price: item.price, quantity: qty },
      });
    } catch {
      /* analytics must never break the cart */
    }
  };

  const removeItem = (
    id: string,
    size?: string
  ) => {
    const target = { id, size };
    setItems((prevItems) =>
      prevItems.filter((item) => !sameLine(item, target))
    );
  };

  const updateQuantity = (
    id: string,
    quantity: number,
    size?: string
  ) => {
    if (quantity <= 0) {
      removeItem(id, size);
      return;
    }

    const target = { id, size };
    setItems((prevItems) =>
      prevItems.map((item) =>
        sameLine(item, target)
          ? {
              ...item,
              quantity: Math.min(MAX_QTY, Math.floor(quantity)),
            }
          : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    try {
      window.localStorage.removeItem(CART_KEY);
    } catch {
      /* storage unavailable */
    }
  };

  const totalItems = items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const totalPrice = items.reduce(
    (sum, item) =>
      sum + item.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        totalItems,
        totalPrice,
        isHydrated,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (context === undefined) {
    throw new Error(
      'useCart must be used within a CartProvider'
    );
  }

  return context;
}
