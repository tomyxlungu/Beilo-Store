'use client';

const STORAGE_KEY = 'beilo-orders';

export interface SavedOrder {
  id: string;
  code?: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  customerName: string;
  customerPhone?: string;
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

export interface SaveOrderInput {
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  customerName: string;
  customerPhone?: string;
  deliveryMethod: 'pickup' | 'delivery';
  /** Human-readable store name for the WhatsApp message. */
  pickupStore?: string;
  /** Store UUID — required, this is what the database stores. */
  pickupStoreId: string;
  deliveryAddress?: string;
}

export interface SavedOrderResult {
  local: SavedOrder;
  code: string;
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

/**
 * Persist an order to the database via /api/orders/public.
 * Throws with a human-readable message when the save fails so the
 * checkout UI can show the error instead of a fake success.
 */
export async function saveOrder(order: SaveOrderInput): Promise<SavedOrderResult> {
  if (!order.items || order.items.length === 0) {
    throw new Error('Your bag is empty.');
  }
  if (!order.pickupStoreId) {
    throw new Error('Please choose a store first.');
  }
  for (const item of order.items) {
    if (!Number.isFinite(item.price) || item.price < 0 || !Number.isFinite(item.quantity) || item.quantity < 1) {
      throw new Error(`Invalid item in your bag: ${item.name || 'unknown'}. Please re-add it.`);
    }
  }

  const res = await fetch('/api/orders/public', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customer_name: order.customerName,
      customer_phone: order.customerPhone || null,
      pickup_store_id: order.pickupStoreId,
      delivery_fee_minor: Math.round((order.deliveryFee || 0) * 100),
      items: order.items.map((item) => ({
        product_name: item.name,
        unit_price_minor: Math.round(item.price * 100),
        quantity: item.quantity,
      })),
      notes: order.deliveryMethod === 'delivery' ? order.deliveryAddress : null,
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.order) {
    throw new Error(data.error || 'Could not save your order. Please try again.');
  }

  const newOrder: SavedOrder = {
    ...order,
    id: data.order.id,
    code: data.order.code,
    status: 'pending',
    createdAt: data.order.created_at || new Date().toISOString(),
  };

  const existing = load();
  save([newOrder, ...existing]);

  return { local: newOrder, code: data.order.code };
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
