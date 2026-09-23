'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabaseBrowser as supabase } from '@/lib/supabase/client';
import {
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

const CATEGORIES = ['Men', 'Women', 'Footwear', 'Headwear', 'Denim', 'Promos'];
const ITEMS_PER_PAGE = 10;

function formatCurrency(ngwee: number): string {
  const kwacha = ngwee / 100;
  return 'K ' + kwacha.toLocaleString('en-ZM', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

interface ProductRow {
  id: string;
  slug: string;
  name: string;
  priceMinor: number;
  salePriceMinor: number | null;
  categoryName: string;
  description: string;
  images: string[];
  isActive: boolean;
  isTrending: boolean;
  isNewArrival: boolean;
  createdAt: string;
}

function mapProduct(p: any): ProductRow {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    priceMinor: p.price_minor ?? 0,
    salePriceMinor: p.sale_price_minor ?? null,
    categoryName: p.categories?.name ?? p.category_id ?? 'Unknown',
    description: p.description,
    images: p.images ?? [],
    isActive: p.is_active ?? true,
    isTrending: p.is_trending ?? false,
    isNewArrival: p.is_new_arrival ?? false,
    createdAt: p.created_at,
  };
}

export default function AdminProducts() {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [stockFilter, setStockFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, categories!inner(name)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      const mapped = (data || []).map(mapProduct);
      setProducts(mapped);
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    let filtered = [...products];
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.slug.toLowerCase().includes(q) ||
          p.categoryName.toLowerCase().includes(q)
      );
    }
    if (categoryFilter !== 'All') {
      filtered = filtered.filter((p) => p.categoryName === categoryFilter);
    }
    setFilteredProducts(filtered);
    setCurrentPage(1);
    setTotalPages(Math.ceil(filtered.length / ITEMS_PER_PAGE));
  }, [search, categoryFilter, products]);

  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  async function handleDelete(productId: string) {
    try {
      const { error } = await supabase.from('products').delete().eq('id', productId);
      if (error) throw error;
      setDeleteConfirm(null);
      fetchProducts();
    } catch {
      alert('Failed to delete product');
    }
  }

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-page-header">
          <h1>Products</h1>
          <Button variant="primary" as="a" href="/admin/products/new">
              <Plus size={16} strokeWidth={2} />
              <span>Add Product</span>
            </Button>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
          <div className="spinner" />
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>Products</h1>
        <p className="admin-page-subtitle">
          {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
        </p>
          <Button variant="primary" as="a" href="/admin/products/new">
              <Plus size={16} strokeWidth={2} />
              <span>Add Product</span>
            </Button>
      </div>

      <div className="admin-products-toolbar">
        <div className="admin-search-filter">
          <Input
            type="search"
            placeholder="Search products..."
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            icon={<Search size={16} />}
            clearable
            onClear={() => setSearch('')}
          />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="admin-filter-select"
          >
            <option value="All">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Product</th>
              <th>Category</th>
              <th>Price</th>
              <th>Sale Price</th>
              <th>New</th>
              <th>Trending</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedProducts.length === 0 ? (
              <tr>
                <td colSpan={8} className="admin-table-empty">No products found</td>
              </tr>
            ) : (
              paginatedProducts.map((product) => (
                <tr key={product.id}>
                  <td>
                    <img
                      src={product.images[0] || '/products/cozy.jpeg'}
                      alt={product.name}
                      className="admin-product-thumb"
                    />
                  </td>
                  <td>
                    <div className="admin-product-info">
                      <span className="admin-product-name">{product.name}</span>
                      <span className="admin-product-slug">{product.slug}</span>
                    </div>
                  </td>
                  <td>{product.categoryName}</td>
                  <td className="admin-product-price">{formatCurrency(product.priceMinor)}</td>
                  <td className="admin-product-price">
                    {product.salePriceMinor ? formatCurrency(product.salePriceMinor) : '—'}
                  </td>
                  <td>{product.isNewArrival ? 'Yes' : 'No'}</td>
                  <td>{product.isTrending ? 'Yes' : 'No'}</td>
                  <td>
                    <div className="admin-actions">
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="admin-action-btn"
                        aria-label="Edit product"
                      >
                        <Edit size={16} strokeWidth={2} />
                      </Link>
                      <button
                        onClick={() => setDeleteConfirm(product.id)}
                        className="admin-action-btn danger"
                        aria-label="Delete product"
                      >
                        <Trash2 size={16} strokeWidth={2} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {filteredProducts.length > ITEMS_PER_PAGE && (
        <div className="admin-pagination">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="admin-pagination-btn"
          >
            <ChevronLeft size={18} strokeWidth={2} />
          </button>
          <span className="admin-pagination-info">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="admin-pagination-btn"
          >
            <ChevronRight size={18} strokeWidth={2} />
          </button>
        </div>
      )}

      {deleteConfirm && (
        <div className="admin-modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Delete Product?</h3>
            <p>This action cannot be undone.</p>
            <div className="admin-modal-actions">
              <button onClick={() => setDeleteConfirm(null)} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteConfirm)} className="btn btn-primary danger">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
