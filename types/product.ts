// types/product.ts

// Stock status types
export type StockStatus = 'in-stock' | 'low-stock' | 'out-of-stock';

export interface StockLocation {
  storeName: string;
  status: StockStatus;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  price: number;
  category: string;
  description: string;
  sizes: string[];
  images: string[];
  stockByStore: StockLocation[];
  isNew?: boolean;
  isTrending?: boolean;
  isPromo?: boolean;
  createdAt?: string;
}

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  size: string;
  image?: string;
  store?: string;
}

export interface Store {
  id: string;
  name: string;
  address: string;
  hours: string;
  phone: string;
  image?: string;
  mapUrl?: string;
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
}

export interface FAQItem {
  question: string;
  answer: string;
  category?: string;
}

export interface OrderDetails {
  customerName?: string;
  customerPhone?: string;
  deliveryMethod: 'pickup' | 'delivery';
  pickupStore?: string;
  deliveryAddress?: string;
  items: CartItem[];
  totalPrice: number;
}

export interface FilterOptions {
  category: string;
  priceRange: [number, number];
  sizes: string[];
  sortBy: 'newest' | 'price-low' | 'price-high' | 'popular';
  inStockOnly: boolean;
}