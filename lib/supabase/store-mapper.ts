// lib/supabase/store-mapper.ts
// Maps the new normalized schema to the old Product type
// so storefront client components don't need to change yet.

import type { Product, StockLocation } from '@/types/product';

interface RawProduct {
  id: string;
  slug: string;
  name: string;
  description: string;
  category_id: string;
  price_minor: number;
  sale_price_minor: number | null;
  images: string[];
  is_active: boolean;
  is_trending: boolean;
  is_new_arrival: boolean;
  low_stock_threshold: number;
  created_at: string;
  updated_at: string;
  categories?: { name: string } | null;
  variants?: {
    id: string;
    size: string;
    colour: string;
    stock_levels?: { quantity: number; store_id: string; stores?: { name: string } | null }[];
  }[];
}

export function mapProduct(raw: RawProduct): Product {
  const sizes = [...new Set((raw.variants ?? []).map(v => v.size).filter(Boolean))];

  const stockByStore: StockLocation[] = [];
  if (raw.variants) {
    const storeMap = new Map<string, { total: number; threshold: number }>();
    for (const variant of raw.variants) {
      for (const sl of variant.stock_levels ?? []) {
        const storeName = sl.stores?.name ?? 'Unknown';
        const existing = storeMap.get(storeName) ?? { total: 0, threshold: raw.low_stock_threshold };
        existing.total += sl.quantity;
        storeMap.set(storeName, existing);
      }
    }
    for (const [storeName, { total, threshold }] of storeMap) {
      let status: StockLocation['status'] = 'in-stock';
      if (total === 0) status = 'out-of-stock';
      else if (total <= threshold) status = 'low-stock';
      stockByStore.push({ storeName, status });
    }
  }

  const saleKwacha =
    raw.sale_price_minor != null ? Math.round(raw.sale_price_minor / 100) : null;
  const priceKwacha = Math.round(raw.price_minor / 100);

  return {
    id: raw.id,
    slug: raw.slug,
    name: raw.name,
    price: priceKwacha,
    salePrice: saleKwacha != null && saleKwacha > 0 && saleKwacha < priceKwacha ? saleKwacha : undefined,
    category: raw.categories?.name ?? 'Uncategorized',
    description: raw.description,
    sizes,
    images: raw.images ?? [],
    stockByStore,
    isNew: raw.is_new_arrival,
    isTrending: raw.is_trending,
    isPromo: false,
    createdAt: raw.created_at,
  };
}

export function mapProducts(raw: RawProduct[]): Product[] {
  return raw.map(mapProduct);
}

/**
 * Select clause that joins category name and variants with stock levels.
 * Use with: .select(PRODUCT_SELECT)
 */
export const PRODUCT_SELECT = `
  *,
  categories!inner(name),
  variants(
    id, size, colour,
    stock_levels(
      quantity, store_id,
      stores!inner(name)
    )
  )
`;

/**
 * Select clause for simple product lists (no variants/stock).
 */
export const PRODUCT_SELECT_SIMPLE = `
  *,
  categories!inner(name)
`;
