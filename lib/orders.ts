'use client';

const STORAGE_KEY = 'beilo-orders';

export interface SavedOrder {
  id: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  customerName: string;
  deliveryMethod: 'pickup' | 'delivery';
  pickupStore?: string;
  deliveryAddress?: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  size?: string;
  image?: string;
}

function load(): SavedOrder[] {
  if (typeof window === 'undefined') return [];

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function save(orders: SavedOrder[]) {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  } catch {
    /* storage unavailable */
  }
}

export async function saveOrder(order: Omit<SavedOrder, 'id' | 'createdAt' | 'status'>) {
  const newOrder: SavedOrder = {
    ...order,
    id: crypto.randomUUID(),
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  const existing = load();
  save([newOrder, ...existing]);

  try {
    await fetch('/api/orders/public', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer_name: order.customerName,
        pickup_store_id: order.pickupStore || null,
        items: order.items.map((item) => ({
          product_name: item.name,
          unit_price_minor: Math.round(item.price * 100),
          quantity: item.quantity,
        })),
        notes: order.deliveryMethod === 'delivery' ? order.deliveryAddress : null,
      }),
    });
  } catch (err) {
    console.warn('Failed to save order to Supabase:', err);
  }

  return newOrder;
}

export function getOrders(): SavedOrder[] {
  return load();
}

export function clearOrders() {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* storage unavailable */
  }
}
