'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';

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
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window === 'undefined') {
      return [];
    }

    try {
      const savedCart = window.localStorage.getItem('cart');

      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      console.error(
        'Failed to parse cart from localStorage:',
        error
      );

      return [];
    }
  });

  const isHydrated = typeof window !== 'undefined';

  useEffect(() => {
    if (typeof window === 'undefined') {
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
  }, [items]);

  const addItem = (
    item: AddItemData,
    quantity = 1
  ) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find(
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
