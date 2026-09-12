// data/categories.ts
import type { Category } from '@/types/product';

export const categories: Category[] = [
  { id: 'all', name: 'All', icon: '🛍️' },
  { id: 'men', name: 'Men', icon: '👔' },
  { id: 'women', name: 'Women', icon: '👗' },
  { id: 'footwear', name: 'Footwear', icon: '👟' },
  { id: 'headwear', name: 'Headwear', icon: '🧢' },
  { id: 'denim', name: 'Denim', icon: '👖' },
  { id: 'promos', name: 'Promos', icon: '🏷️' },
];