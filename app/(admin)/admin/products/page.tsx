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
  Check,
  X,
  PackageSearch,
} from 'lucide-react';
import Link from 'next/link';

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
        <div className="m3-page-head">
          <div>
            <h1 className="m3-headline-medium">Products</h1>
          </div>
        </div>
        <div className="m3-loading" role="status" aria-label="Loading products">
          <div className="m3-progress"><span /></div>
          <p className="m3-body-medium m3-on-surface-variant">Loading products…</p>
        </div>
      </div>
    );
  }

  const categories = ['All', ...CATEGORIES];

  return (
    <div className="admin-page">
      <div className="m3-page-head">
        <div>
          <h1 className="m3-headline-medium">Products</h1>
          <p className="m3-body-medium m3-on-surface-variant">
            {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} in the catalogue
          </p>
        </div>
        <div className="m3-page-actions">
          <Link href="/admin/products/new" className="m3-btn m3-btn-filled">
            <Plus size={16} strokeWidth={2} />
            <span>Add product</span>
          </Link>
        </div>
      </div>

      <div className="admin-products-toolbar">
        <div className="m3-search" role="search">
          <Search size={20} aria-hidden="true" />
          <input
            type="search"
            placeholder="Search products…"
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            aria-label="Search products"
          />
          {search && (
            <button type="button" className="m3-icon-button" onClick={() => setSearch('')} aria-label="Clear search">
              <X size={18} />
            </button>
          )}
        </div>
        <div className="m3-chip-row" role="group" aria-label="Filter by category">
          {categories.map((c) => {
            const selected = categoryFilter === c;
            return (
              <button
                key={c}
                type="button"
                className={`m3-filter-chip${selected ? ' is-selected' : ''}`}
                aria-pressed={selected}
                onClick={() => setCategoryFilter(c)}
              >
                {selected && <Check size={14} aria-hidden="true" />}
                {c === 'All' ? 'All categories' : c}
              </button>
            );
          })}
        </div>
      </div>

      <div className="admin-card hide-mobile">
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Product</th>
              <th>Category</th>
              <th>Price</th>
              <th>Sale price</th>
              <th>New</th>
              <th>Trending</th>
              <th><span className="m3-body-small">Actions</span></th>
            </tr>
          </thead>
          <tbody>
            {paginatedProducts.length === 0 ? (
              <tr>
                <td colSpan={8} className="admin-table-empty">
                  <div className="m3-empty">
                    <span className="m3-empty-icon"><PackageSearch size={28} aria-hidden="true" /></span>
                    <p className="m3-title-medium">No products found</p>
                    <p className="m3-body-medium m3-on-surface-variant">Try a different search or category.</p>
                  </div>
                </td>
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
                  <td>
                    <span className="m3-chip-status" style={{ background: 'var(--m3-secondary-container)', color: 'var(--m3-on-secondary-container)' }}>
                      {product.categoryName}
                    </span>
                  </td>
                  <td className="admin-product-price">{formatCurrency(product.priceMinor)}</td>
                  <td className="admin-product-price">
                    {product.salePriceMinor ? formatCurrency(product.salePriceMinor) : '—'}
                  </td>
                  <td>{product.isNewArrival ? <span className="m3-chip-status" style={{ background: 'var(--m3-tertiary-container)', color: 'var(--m3-on-tertiary-container)' }}>New</span> : <span className="m3-body-small m3-on-surface-variant">—</span>}</td>
                  <td>{product.isTrending ? <span className="m3-chip-status" style={{ background: 'var(--m3-primary-container)', color: 'var(--m3-on-primary-container)' }}>Hot</span> : <span className="m3-body-small m3-on-surface-variant">—</span>}</td>
                  <td>
                    <div className="admin-actions">
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="admin-action-btn"
                        aria-label={`Edit ${product.name}`}
                      >
                        <Edit size={18} strokeWidth={2} />
                      </Link>
                      <button
                        onClick={() => setDeleteConfirm(product.id)}
                        className="admin-action-btn danger"
                        aria-label={`Delete ${product.name}`}
                      >
                        <Trash2 size={18} strokeWidth={2} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      </div>

      {filteredProducts.length > ITEMS_PER_PAGE && (
        <div className="admin-pagination">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="admin-pagination-btn"
            aria-label="Previous page"
          >
            <ChevronLeft size={20} strokeWidth={2} />
          </button>
          <span className="admin-pagination-info">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="admin-pagination-btn"
            aria-label="Next page"
          >
            <ChevronRight size={20} strokeWidth={2} />
          </button>
        </div>
      )}

      <div className="m3-cards-list show-mobile">
        {paginatedProducts.length === 0 ? (
          <div className="admin-card">
            <div className="m3-empty">
              <span className="m3-empty-icon"><PackageSearch size={28} aria-hidden="true" /></span>
              <p className="m3-title-medium">No products found</p>
              <p className="m3-body-medium m3-on-surface-variant">Try a different search or category.</p>
            </div>
          </div>
        ) : (
          paginatedProducts.map((product) => (
            <div key={product.id} className="m3-row-card">
              <img
                src={product.images[0] || '/products/cozy.jpeg'}
                alt=""
                className="m3-row-thumb"
              />
              <div className="m3-row-main">
                <span className="m3-row-title">{product.name}</span>
                <span className="m3-row-sub">{product.categoryName} · {formatCurrency(product.salePriceMinor ?? product.priceMinor)}</span>
                <span className="m3-row-chips">
                  {product.salePriceMinor && (
                    <span className="m3-chip-status" style={{ background: 'var(--m3-error-container)', color: 'var(--m3-on-error-container)' }}>Sale</span>
                  )}
                  {product.isNewArrival && (
                    <span className="m3-chip-status" style={{ background: 'var(--m3-tertiary-container)', color: 'var(--m3-on-tertiary-container)' }}>New</span>
                  )}
                  {product.isTrending && (
                    <span className="m3-chip-status" style={{ background: 'var(--m3-primary-container)', color: 'var(--m3-on-primary-container)' }}>Hot</span>
                  )}
                </span>
              </div>
              <div className="m3-row-actions">
                <Link
                  href={`/admin/products/${product.id}/edit`}
                  className="admin-action-btn"
                  aria-label={`Edit ${product.name}`}
                >
                  <Edit size={18} strokeWidth={2} />
                </Link>
                <button
                  onClick={() => setDeleteConfirm(product.id)}
                  className="admin-action-btn danger"
                  aria-label={`Delete ${product.name}`}
                >
                  <Trash2 size={18} strokeWidth={2} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {deleteConfirm && (
        <div className="admin-modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="admin-modal" role="alertdialog" aria-modal="true" aria-labelledby="delete-product-title" onClick={(e) => e.stopPropagation()}>
            <h3 id="delete-product-title">Delete product?</h3>
            <p>This action cannot be undone. The product will disappear from the store immediately.</p>
            <div className="admin-modal-actions">
              <button onClick={() => setDeleteConfirm(null)} className="m3-btn m3-btn-text">
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteConfirm)} className="m3-btn m3-btn-text is-danger">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
