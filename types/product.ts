// types/product.ts
export interface StockLocation {
  storeName: string;
  quantity: number;
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
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  size?: string;
  image?: string;
}

export interface Store {
  id: string;
  name: string;
  address: string;
  hours: string;
  phone?: string;
  image?: string;
}