// ============================================
// BEILO Store — Database Types
// ============================================
// Maps to the schema in supabase/migrations/004_rebuild_schema.sql
// Prices are in ngwee (integer minor units). K1,250.00 = 125000.
// ============================================

// ---- Enums ----

export type UserRole = 'OWNER' | 'STORE_STAFF';

export type OrderStatus =
  | 'NEW'
  | 'CONFIRMED'
  | 'READY_FOR_PICKUP'
  | 'COMPLETED'
  | 'CANCELLED';

export type EventType =
  | 'page_view'
  | 'product_view'
  | 'add_to_bag'
  | 'whatsapp_checkout';

export type HomepageBlockType = 'hero' | 'quick_link' | 'announcement';

// ---- Tables ----

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  storeId: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Store {
  id: string;
  name: string;
  address: string;
  phone: string;
  whatsappNumber: string | null;
  hours: string;
  image: string | null;
  mapUrl: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  categoryId: string;
  priceMinor: number;
  salePriceMinor: number | null;
  images: string[];
  isActive: boolean;
  isTrending: boolean;
  isNewArrival: boolean;
  lowStockThreshold: number;
  createdAt: string;
  updatedAt: string;

  // Joined fields (not in DB, populated by queries)
  category?: Category;
  variants?: Variant[];
}

export interface Variant {
  id: string;
  productId: string;
  size: string;
  colour: string;
  sku: string;
  createdAt: string;

  // Joined fields
  stockLevels?: StockLevel[];
}

export interface StockLevel {
  variantId: string;
  storeId: string;
  quantity: number;
  updatedAt: string;

  // Joined fields
  variant?: Variant;
  store?: Store;
}

export interface StockAdjustment {
  id: string;
  variantId: string;
  storeId: string;
  delta: number;
  reason: string;
  userId: string | null;
  createdAt: string;

  // Joined fields
  variant?: Variant;
  store?: Store;
  user?: User;
}

export interface Customer {
  id: string;
  name: string;
  phone: string | null;
  createdAt: string;
}

export interface Order {
  id: string;
  code: string;
  customerId: string | null;
  customerName: string;
  customerPhone: string | null;
  pickupStoreId: string;
  status: OrderStatus;
  totalMinor: number;
  cancelReason: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;

  // Joined fields
  customer?: Customer;
  pickupStore?: Store;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  orderId: string;
  variantId: string | null;
  productName: string;
  unitPriceMinor: number;
  quantity: number;
  createdAt: string;

  // Joined fields
  variant?: Variant;
}

export interface Event {
  id: string;
  type: EventType;
  sessionId: string;
  productId: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface HomepageBlock {
  id: string;
  type: HomepageBlockType;
  title: string;
  content: Record<string, unknown>;
  sortOrder: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Setting {
  key: string;
  value: unknown;
  updatedAt: string;
}

export interface Faq {
  id: string;
  question: string;
  answer: string;
  category: string | null;
  createdAt: string;
}

// ---- API types ----

export interface OverviewParams {
  from: string;
  to: string;
  store?: string;
}

export interface OverviewData {
  revenue: {
    total: number;
    delta: number;
    sparkline: { date: string; value: number }[];
  };
  orders: {
    total: number;
    delta: number;
    breakdown: { status: string; count: number }[];
  };
  customers: {
    total: number;
    delta: number;
  };
  whatsappRate: {
    rate: number;
    delta: number;
  };
  salesChart: { date: string; revenue: number; orders: number }[];
  inventoryAlerts: (Variant & {
    productName: string;
    productImage: string;
    storeName: string;
    quantity: number;
    threshold: number;
  })[];
  recentOrders: Order[];
  customerSegments: {
    new: number;
    returning: number;
    loyal: number;
    unlinked: number;
    total: number;
  };
  topProducts: {
    id: string;
    name: string;
    image: string;
    unitsSold: number;
    revenue: number;
  }[];
}

// ---- Format helpers ----

export function formatPrice(minorUnits: number): string {
  return 'K ' + (minorUnits / 100).toLocaleString('en-ZM', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function parsePriceToMinor(input: string): number {
  const num = parseFloat(input);
  if (isNaN(num) || num <= 0) return 0;
  return Math.round(num * 100);
}

export function minorToDisplay(minor: number): string {
  return (minor / 100).toFixed(2);
}

export function displayToMinor(display: string): number {
  const num = parseFloat(display);
  if (isNaN(num) || num <= 0) return 0;
  return Math.round(num * 100);
}
