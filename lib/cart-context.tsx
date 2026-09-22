'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
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

  useEffect(() => {
    try {
      const savedCart = window.localStorage.getItem('cart');

      if (savedCart) {
        // Sync from external store post-mount so hydration matches.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setItems(JSON.parse(savedCart));
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
        'cart',
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
    setItems((prevItems) => {      const existingItem = prevItems.find(
        (existing) =>
          existing.id === item.id &&
          existing.size === item.size
      );

      if (existingItem) {
        return prevItems.map((existing) =>
          existing.id === item.id &&
          existing.size === item.size
            ? {
                ...existing,
                quantity: existing.quantity + quantity,
              }
            : existing
        );
      }

      return [
        ...prevItems,
        {
          ...item,
          quantity,
        },
      ];
    });

    try {
      trackEvent('add_to_bag', {
        product_id: item.id,
        metadata: { name: item.name, size: item.size, price: item.price, quantity },
      });
    } catch {
      /* analytics must never break the cart */
    }
  };

  const removeItem = (
    id: string,
    size?: string
  ) => {
    setItems((prevItems) =>
      prevItems.filter(
        (item) =>
          !(
            item.id === id &&
            item.size === size
          )
      )
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

    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id &&
        item.size === size
          ? {
              ...item,
              quantity,
            }
          : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
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
