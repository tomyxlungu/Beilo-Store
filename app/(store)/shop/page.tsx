// app/(store)/shop/page.tsx
'use client';

import {
  useState,
  useMemo,
  useEffect,
  Suspense,
  useCallback,
} from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Search,
  SlidersHorizontal,
  X,
  ChevronDown,
  Check,
  Truck,
  Shield,
  RotateCcw,
  MapPin,
} from 'lucide-react';
import { products } from '@/data/products';
import { useCart } from '@/lib/cart-context';
import type { Product } from '@/types/product';
import ProductCard from '@/components/ui/ProductCard';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Spinner from '@/components/ui/Spinner';

const CATEGORIES = [
  'All',
  'Men',
  'Women',
  'Footwear',
  'Headwear',
  'Denim',
  'Promos',
];

const ALL_SIZES = [
  'XS',
  'S',
  'M',
  'L',
  'XL',
  'XXL',
  '28',
  '30',
  '32',
  '34',
  '36',
  '38',
  '40',
  '42',
  '44',
  '45',
  'One Size',
];

const PRICE_RANGES = [
  { label: 'Under K 100', max: 100, min: 0 },
  { label: 'K 100 – K 200', max: 200, min: 100 },
  { label: 'K 200 – K 350', max: 350, min: 200 },
  { label: 'K 350 and above', max: Infinity, min: 350 },
];

const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'newest', label: 'Newest' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'popular', label: 'Popular' },
];

function normalizeSort(value: string | null): string {
  if (value === 'trending') return 'popular';
  if (SORT_OPTIONS.some((option) => option.value === value)) {
    return value as string;
  }
  return 'featured';
}

function ShopContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addItem } = useCart();

  const paramsCategory = searchParams.get('category');
  const paramsSearch = searchParams.get('search') ?? '';
  const paramsNew = searchParams.get('new') === 'true';
  const paramsMaxPrice = searchParams.get('maxPrice');
  const paramsSort = normalizeSort(searchParams.get('sort'));

  const [searchQuery, setSearchQuery] = useState(paramsSearch);
  const [selectedCategory, setSelectedCategory] = useState(
    paramsCategory && CATEGORIES.includes(paramsCategory)
      ? paramsCategory
      : 'All'
  );
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState<
    number | null
  >(null);
  const [maxPrice, setMaxPrice] = useState<number | null>(() => {
    const parsed = paramsMaxPrice ? Number(paramsMaxPrice) : NaN;
    return Number.isFinite(parsed) ? parsed : null;
  });
  const [sortBy, setSortBy] = useState(paramsSort);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] =
    useState(false);
  const [isOnSale, setIsOnSale] = useState(false);
  const [isNewArrival, setIsNewArrival] = useState(paramsNew);

  /*
   * Keep the URL in sync so category pills, search
   * and sorting survive refreshes and the back button.
   */
  const syncUrl = useCallback(
    (updates: {
      category?: string;
      search?: string;
      sort?: string;
    }) => {
      const next = new URLSearchParams(
        searchParams.toString()
      );

      if (updates.category !== undefined) {
        if (updates.category === 'All') {
          next.delete('category');
        } else {
          next.set('category', updates.category);
        }
      }

      if (updates.search !== undefined) {
        if (updates.search.trim()) {
          next.set('search', updates.search.trim());
        } else {
          next.delete('search');
        }
      }

      if (updates.sort !== undefined) {
        if (updates.sort === 'featured') {
          next.delete('sort');
        } else {
          next.set('sort', updates.sort);
        }
      }

      const query = next.toString();
      router.replace(query ? `/shop?${query}` : '/shop', {
        scroll: false,
      });
    },
    [router, searchParams]
  );

  /* Lock body scroll + close on Escape while drawer is open */
  useEffect(() => {
    if (!isFilterDrawerOpen) return;

    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsFilterDrawerOpen(false);
    };
    document.addEventListener('keydown', handleKey);

    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener('keydown', handleKey);
    };
  }, [isFilterDrawerOpen]);

  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    if (selectedCategory === 'Promos') {
      filtered = filtered.filter((p) => p.isPromo);
    } else if (selectedCategory !== 'All') {
      filtered = filtered.filter(
        (p) => p.category === selectedCategory
      );
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query)
      );
    }

    if (selectedSizes.length > 0) {
      filtered = filtered.filter((p) =>
        p.sizes.some((size) => selectedSizes.includes(size))
      );
    }

    if (selectedPriceRange !== null) {
      const range = PRICE_RANGES[selectedPriceRange];
      filtered = filtered.filter(
        (p) => p.price >= range.min && p.price < range.max
      );
    }

    if (maxPrice !== null) {
      filtered = filtered.filter((p) => p.price <= maxPrice);
    }

    if (isOnSale) {
      filtered = filtered.filter((p) => p.isPromo);
    }

    if (isNewArrival) {
      filtered = filtered.filter((p) => p.isNew);
    }

    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        filtered.sort((a, b) => {
          const dateA = a.createdAt
            ? new Date(a.createdAt).getTime()
            : 0;
          const dateB = b.createdAt
            ? new Date(b.createdAt).getTime()
            : 0;
          return dateB - dateA;
        });
        break;
      case 'popular':
        filtered.sort(
          (a, b) =>
            (b.isTrending ? 1 : 0) - (a.isTrending ? 1 : 0)
        );
        break;
      default:
        filtered.sort((a, b) => {
          const scoreA =
            (a.isTrending ? 2 : 0) + (a.isNew ? 1 : 0);
          const scoreB =
            (b.isTrending ? 2 : 0) + (b.isNew ? 1 : 0);
          return scoreB - scoreA;
        });
    }

    return filtered;
  }, [
    searchQuery,
    selectedCategory,
    selectedSizes,
    selectedPriceRange,
    maxPrice,
    sortBy,
    isOnSale,
    isNewArrival,
  ]);

  const activeFilterCount =
    selectedSizes.length +
    (selectedPriceRange !== null ? 1 : 0) +
    (maxPrice !== null ? 1 : 0) +
    (isOnSale ? 1 : 0) +
    (isNewArrival ? 1 : 0);

  const handleClearAll = () => {
    setSearchQuery('');
    setSelectedSizes([]);
    setSelectedPriceRange(null);
    setMaxPrice(null);
    setSelectedCategory('All');
    setIsOnSale(false);
    setIsNewArrival(false);
    router.replace('/shop', { scroll: false });
  };

  const handleCategory = useCallback(
    (category: string) => {
      setSelectedCategory(category);
      syncUrl({ category });
    },
    [syncUrl]
  );

  const handleSearchSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      syncUrl({ search: searchQuery });
    },
    [searchQuery, syncUrl]
  );

  const handleSort = useCallback(
    (value: string) => {
      setSortBy(value);
      syncUrl({ sort: value });
    },
    [syncUrl]
  );

  const handleAddToCart = useCallback(
    (product: Product) => {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images[0],
      });
    },
    [addItem]
  );

  const toggleSize = useCallback((size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size)
        ? prev.filter((s) => s !== size)
        : [...prev, size]
    );
  }, []);

  const pageTitle =
    selectedCategory === 'All' ? 'All Products' : selectedCategory;

  return (
    <div className="shop-page">
      {/* Page header */}
      <div className="shop-header">
        <div>
          <h1 className="shop-title">{pageTitle}</h1>
          <p className="shop-count">
            {filteredProducts.length} product
            {filteredProducts.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Category pills */}
      <div
        className="shop-pills"
        role="tablist"
        aria-label="Categories"
      >
        {CATEGORIES.map((category) => (
          <button
            key={category}
            type="button"
            role="tab"
            aria-selected={selectedCategory === category}
            className={`shop-pill ${
              selectedCategory === category
                ? 'shop-pill-active'
                : ''
            }`}
            onClick={() => handleCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Search + sort + filters */}
      <div className="shop-toolbar">
        <form
          onSubmit={handleSearchSubmit}
          className="shop-search"
          role="search"
        >
          <Input
            type="search"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(event) =>
              setSearchQuery(event.target.value)
            }
            icon={<Search size={16} />}
            size="md"
            variant="default"
            clearable
            onClear={() => {
              setSearchQuery('');
              syncUrl({ search: '' });
            }}
            aria-label="Search products"
          />
        </form>

        <div className="shop-sort-wrap">
          <select
            value={sortBy}
            onChange={(event) =>
              handleSort(event.target.value)
            }
            className="shop-sort"
            aria-label="Sort products"
          >
            {SORT_OPTIONS.map((option) => (
              <option
                key={option.value}
                value={option.value}
              >
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown
            size={16}
            className="shop-sort-icon"
            aria-hidden="true"
          />
        </div>

        <button
          type="button"
          onClick={() => setIsFilterDrawerOpen(true)}
          className={`shop-filter-btn ${
            activeFilterCount > 0
              ? 'shop-filter-btn-active'
              : ''
          }`}
          aria-haspopup="dialog"
        >
          <SlidersHorizontal size={16} />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span className="shop-filter-count">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Active filter chips */}
      {activeFilterCount > 0 && (
        <div className="shop-chips">
          {selectedSizes.map((size) => (
            <span key={size} className="shop-chip">
              Size: {size}
              <button
                type="button"
                onClick={() => toggleSize(size)}
                aria-label={`Remove size ${size} filter`}
              >
                <X size={13} />
              </button>
            </span>
          ))}

          {selectedPriceRange !== null && (
            <span className="shop-chip">
              {PRICE_RANGES[selectedPriceRange].label}
              <button
                type="button"
                onClick={() =>
                  setSelectedPriceRange(null)
                }
                aria-label="Remove price filter"
              >
                <X size={13} />
              </button>
            </span>
          )}

          {maxPrice !== null && (
            <span className="shop-chip">
              Under K {maxPrice.toLocaleString()}
              <button
                type="button"
                onClick={() => setMaxPrice(null)}
                aria-label="Remove max price filter"
              >
                <X size={13} />
              </button>
            </span>
          )}

          {isOnSale && (
            <span className="shop-chip">
              On Sale
              <button
                type="button"
                onClick={() => setIsOnSale(false)}
                aria-label="Remove on sale filter"
              >
                <X size={13} />
              </button>
            </span>
          )}

          {isNewArrival && (
            <span className="shop-chip">
              New Arrivals
              <button
                type="button"
                onClick={() => setIsNewArrival(false)}
                aria-label="Remove new arrivals filter"
              >
                <X size={13} />
              </button>
            </span>
          )}

          <button
            type="button"
            className="shop-chips-clear"
            onClick={handleClearAll}
          >
            Clear all
          </button>
        </div>
      )}

      {/* Trust badges */}
      <div className="shop-trust hide-mobile">
        <span className="shop-trust-item">
          <Shield size={14} /> Secure checkout
        </span>
        <span className="shop-trust-item">
          <RotateCcw size={14} /> 7-Day Returns
        </span>
        <span className="shop-trust-item">
          <Truck size={14} /> Fast delivery
        </span>
        <span className="shop-trust-item">
          <MapPin size={14} /> 5 Stores
        </span>
      </div>

      {/* Results */}
      {filteredProducts.length === 0 ? (
        <div className="shop-empty">
          <Search
            size={44}
            className="shop-empty-icon"
            aria-hidden="true"
          />
          <h3 className="shop-empty-title">
            No products found
          </h3>
          <p className="shop-empty-text">
            Try a different search or clear your filters.
          </p>
          <Button variant="primary" onClick={handleClearAll}>
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="product-grid">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>
      )}

      {/* Filter drawer */}
      <div
        className={`shop-drawer-overlay ${
          isFilterDrawerOpen ? 'is-open' : ''
        }`}
        onClick={() => setIsFilterDrawerOpen(false)}
        aria-hidden="true"
      />

      <div
        className={`shop-drawer ${
          isFilterDrawerOpen ? 'is-open' : ''
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Filters"
        aria-hidden={!isFilterDrawerOpen}
      >
        <div className="shop-drawer-header">
          <h2 className="shop-drawer-heading">Filters</h2>
          <button
            type="button"
            className="icon-button"
            aria-label="Close filters"
            onClick={() => setIsFilterDrawerOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <div className="shop-drawer-body">
          {/* Categories */}
          <section className="shop-drawer-section">
            <h3 className="shop-drawer-title">Category</h3>
            <div className="shop-category-list">
              {CATEGORIES.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => handleCategory(category)}
                  className={`shop-category-item ${
                    selectedCategory === category
                      ? 'is-active'
                      : ''
                  }`}
                >
                  <span>{category}</span>
                  {selectedCategory === category && (
                    <Check size={14} aria-hidden="true" />
                  )}
                </button>
              ))}
            </div>
          </section>

          {/* Quick filters */}
          <section className="shop-drawer-section">
            <h3 className="shop-drawer-title">
              Quick Filters
            </h3>
            <label className="shop-check">
              <input
                type="checkbox"
                checked={isOnSale}
                onChange={(event) =>
                  setIsOnSale(event.target.checked)
                }
              />
              <span>On Sale</span>
            </label>
            <label className="shop-check">
              <input
                type="checkbox"
                checked={isNewArrival}
                onChange={(event) =>
                  setIsNewArrival(event.target.checked)
                }
              />
              <span>New Arrivals</span>
            </label>
          </section>

          {/* Sizes */}
          <section className="shop-drawer-section">
            <h3 className="shop-drawer-title">Size</h3>
            <div className="shop-sizes">
              {ALL_SIZES.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => toggleSize(size)}
                  aria-pressed={selectedSizes.includes(
                    size
                  )}
                  className={`shop-size ${
                    selectedSizes.includes(size)
                      ? 'is-active'
                      : ''
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </section>

          {/* Price */}
          <section className="shop-drawer-section shop-drawer-section-last">
            <h3 className="shop-drawer-title">Price</h3>
            <div className="shop-price-list">
              {PRICE_RANGES.map((range, index) => (
                <button
                  key={range.label}
                  type="button"
                  onClick={() =>
                    setSelectedPriceRange(
                      selectedPriceRange === index
                        ? null
                        : index
                    )
                  }
                  className={`shop-price-item ${
                    selectedPriceRange === index
                      ? 'is-active'
                      : ''
                  }`}
                >
                  <span>{range.label}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Footer actions */}
          <div className="shop-drawer-footer">
            <button
              type="button"
              className="btn btn-primary shop-apply"
              onClick={() =>
                setIsFilterDrawerOpen(false)
              }
            >
              Apply Filters
              <span className="shop-apply-count">
                ({filteredProducts.length} results)
              </span>
            </button>

            {activeFilterCount > 0 && (
              <button
                type="button"
                className="btn btn-secondary shop-apply"
                onClick={handleClearAll}
              >
                <X size={14} />
                <span>Clear All Filters</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="shop-loading">
          <Spinner />
        </div>
      }
    >
      <ShopContent />
    </Suspense>
  );
}
