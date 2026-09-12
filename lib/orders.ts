// lib/orders.ts

export interface SavedOrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  size?: string;
  image?: string;
}

export interface SavedOrder {
  id: string;
  date: string;
  items: SavedOrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  customerName: string;
  deliveryMethod: 'pickup' | 'delivery';
  pickupStore?: string;
  deliveryAddress?: string;
  status: 'Received' | 'Confirmed' | 'Ready' | 'Delivered';
}

const STORAGE_KEY = 'beilo-orders';

export function getOrders(): SavedOrder[] {
  if (typeof window === 'undefined') return [];

  try {
    const saved =
      window.localStorage.getItem(STORAGE_KEY);
    const parsed = saved ? JSON.parse(saved) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveOrder(
  order: Omit<SavedOrder, 'id' | 'date' | 'status'>
): SavedOrder {
  const saved: SavedOrder = {
    ...order,
    id: `BEILO-${Date.now().toString(36).toUpperCase()}`,
    date: new Date().toISOString(),
    status: 'Received',
  };

  try {
    const previous = getOrders();
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([saved, ...previous])
    );
  } catch {
    /* storage unavailable — order is not persisted */
  }

  return saved;
}

export function clearOrders() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
