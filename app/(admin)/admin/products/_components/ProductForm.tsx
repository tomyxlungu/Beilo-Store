'use client';

import { useState, useEffect, useRef } from 'react';
import { supabaseBrowser as supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Save,
  Upload,
  X,
  Plus,
  Trash2,
  Check,
  Minus,
  ImagePlus,
  Tag,
  Layers,
  Eye,
} from 'lucide-react';
import Link from 'next/link';

const SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

interface Category {
  id: string;
  name: string;
}

interface Store {
  id: string;
  name: string;
}

interface Variant {
  id?: string;
  size: string;
  colour: string;
  sku: string;
  price_override_minor: number | null;
  is_active: boolean;
  stock: { store_id: string; store_name: string; quantity: number }[];
}

interface ProductFormData {
  name: string;
  slug: string;
  description: string;
  priceDisplay: string;
  salePriceDisplay: string;
  categoryId: string;
  images: string[];
  lowStockThreshold: string;
  isActive: boolean;
  isTrending: boolean;
  isNewArrival: boolean;
  variants: Variant[];
}

interface ProductFormProps {
  productId?: string;
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function displayToNgwee(display: string): number {
  const num = parseFloat(display);
  if (isNaN(num) || num <= 0) return 0;
  return Math.round(num * 100);
}

function StockStepper({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) {
  return (
    <span className="m3-stepper">
      <button type="button" onClick={() => onChange(Math.max(0, value - 1))} aria-label={`Decrease ${label}`}>
        <Minus size={16} />
      </button>
      <input
        type="number"
        min={0}
        value={value}
        onChange={(e) => onChange(Math.max(0, Number(e.target.value) || 0))}
        aria-label={label}
      />
      <button type="button" onClick={() => onChange(value + 1)} aria-label={`Increase ${label}`}>
        <Plus size={16} />
      </button>
    </span>
  );
}

export default function ProductForm({ productId }: ProductFormProps) {
  const router = useRouter();
  const isEditing = !!productId;

  const [form, setForm] = useState<ProductFormData>({
    name: '',
    slug: '',
    description: '',
    priceDisplay: '',
    salePriceDisplay: '',
    categoryId: '',
    images: [],
    lowStockThreshold: '5',
    isActive: true,
    isTrending: false,
    isNewArrival: false,
    variants: [],
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fetching, setFetching] = useState(isEditing);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    if (error && errorRef.current) {
      errorRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [error]);

  useEffect(() => {
    async function load() {
      const { data: catData } = await supabase.from('categories').select('id, name').order('name');
      if (catData) setCategories(catData);

      const { data: storeData } = await supabase.from('stores').select('id, name').order('name');
      if (storeData) setStores(storeData);

      if (isEditing && productId) {
        const { data: product } = await supabase
          .from('products')
          .select('*, categories!inner(id, name), variants(id, size, colour, sku, price_override_minor, is_active)')
          .eq('id', productId)
          .single();
        if (product) {
          const variants: Variant[] = (product.variants ?? []).map((v: any) => ({
            id: v.id,
            size: v.size,
            colour: v.colour,
            sku: v.sku ?? '',
            price_override_minor: v.price_override_minor,
            is_active: v.is_active,
            stock: [],
          }));

          for (const variant of variants) {
            if (variant.id) {
              const { data: stockData } = await supabase
                .from('stock_levels')
                .select('store_id, quantity, stores!inner(id, name)')
                .eq('variant_id', variant.id);
              variant.stock = (stockData ?? []).map((s: any) => ({
                store_id: s.store_id,
                store_name: s.stores?.name ?? 'Unknown',
                quantity: s.quantity,
              }));
            }
          }

          setForm({
            name: product.name,
            slug: product.slug,
            description: product.description ?? '',
            priceDisplay: product.price_minor ? String(product.price_minor / 100) : '',
            salePriceDisplay: product.sale_price_minor ? String(product.sale_price_minor / 100) : '',
            categoryId: product.categories?.id ?? product.category_id ?? '',
            images: product.images ?? [],
            lowStockThreshold: String(product.low_stock_threshold ?? 5),
            isActive: product.is_active ?? true,
            isTrending: product.is_trending ?? false,
            isNewArrival: product.is_new_arrival ?? false,
            variants,
          });
        }
        setFetching(false);
      }
    }
    load();
  }, [productId, isEditing]);

  function updateForm(updates: Partial<ProductFormData>) {
    setForm((prev) => {
      const next = { ...prev, ...updates };
      if (updates.name && !isEditing) {
        next.slug = generateSlug(updates.name);
      }
      return next;
    });
  }

  function updateVariant(index: number, updates: Partial<Variant>) {
    setForm((prev) => {
      const updated = [...prev.variants];
      updated[index] = { ...updated[index], ...updates };
      return { ...prev, variants: updated };
    });
  }

  function addVariant() {
    setForm((prev) => ({
      ...prev,
      variants: [
        ...prev.variants,
        { size: 'M', colour: '', sku: '', price_override_minor: null, is_active: true, stock: [] },
      ],
    }));
  }

  function removeVariant(index: number) {
    setForm((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
    }));
  }

  function updateVariantStock(variantIndex: number, storeId: string, storeName: string, quantity: number) {
    setForm((prev) => {
      const updated = [...prev.variants];
      const variant = { ...updated[variantIndex] };
      const existing = variant.stock.findIndex((s) => s.store_id === storeId);
      if (existing >= 0) {
        variant.stock = [...variant.stock];
        variant.stock[existing] = { store_id: storeId, store_name: storeName, quantity };
      } else {
        variant.stock = [...variant.stock, { store_id: storeId, store_name: storeName, quantity }];
      }
      updated[variantIndex] = variant;
      return { ...prev, variants: updated };
    });
  }

  async function handleFiles(files: FileList | File[]) {
    const list = Array.from(files);
    if (list.length === 0) return;

    setUploading(true);
    setError('');

    try {
      const uploadPromises = list.map(async (file) => {
        const fileExt = file.name.split('.').pop();
        const filePath = `products/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('product-images').upload(filePath, file);
        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from('product-images').getPublicUrl(filePath);
        return data.publicUrl;
      });
      const urls = await Promise.all(uploadPromises);
      updateForm({ images: [...form.images, ...urls] });
    } catch (err: any) {
      setError('Image upload failed: ' + err.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  async function handleMultipleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) await handleFiles(e.target.files);
  }

  function removeImage(index: number) {
    updateForm({ images: form.images.filter((_, i) => i !== index) });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!form.name.trim()) throw new Error('Product name is required');
      if (!form.priceDisplay || Number(form.priceDisplay) <= 0) throw new Error('Valid price is required');
      if (!form.description.trim()) throw new Error('Description is required');
      if (!form.categoryId) throw new Error('Category is required');

      const priceMinor = displayToNgwee(form.priceDisplay);
      const salePriceMinor = form.salePriceDisplay ? displayToNgwee(form.salePriceDisplay) : null;

      const productPayload = {
        slug: form.slug || generateSlug(form.name),
        name: form.name.trim(),
        description: form.description.trim(),
        price_minor: priceMinor,
        sale_price_minor: salePriceMinor,
        category_id: form.categoryId,
        images: form.images,
        low_stock_threshold: Number(form.lowStockThreshold) || 5,
        is_active: form.isActive,
        is_trending: form.isTrending,
        is_new_arrival: form.isNewArrival,
      };

      let productIdResult: string;

      if (isEditing) {
        const { error } = await supabase.from('products').update(productPayload).eq('id', productId);
        if (error) throw error;
        productIdResult = productId!;

        const existingVariantIds = form.variants.filter((v) => v.id).map((v) => v.id!);
        const { data: dbVariants } = await supabase.from('variants').select('id').eq('product_id', productId);
        const dbVariantIds = (dbVariants ?? []).map((v) => v.id);
        const toDelete = dbVariantIds.filter((id) => !existingVariantIds.includes(id));
        if (toDelete.length > 0) {
          await supabase.from('stock_levels').delete().in('variant_id', toDelete);
          await supabase.from('variants').delete().in('id', toDelete);
        }
      } else {
        const { data, error } = await supabase.from('products').insert(productPayload).select('id').single();
        if (error) throw error;
        productIdResult = data.id;
      }

      for (const variant of form.variants) {
        const variantPayload = {
          product_id: productIdResult,
          size: variant.size,
          colour: variant.colour,
          sku: variant.sku || null,
          price_override_minor: variant.price_override_minor,
          is_active: variant.is_active,
        };

        let variantId: string;
        if (variant.id) {
          const { error } = await supabase.from('variants').update(variantPayload).eq('id', variant.id);
          if (error) throw error;
          variantId = variant.id;
        } else {
          const { data, error } = await supabase.from('variants').insert(variantPayload).select('id').single();
          if (error) throw error;
          variantId = data.id;
        }

        for (const stock of variant.stock) {
          await supabase.from('stock_levels').upsert({
            variant_id: variantId,
            store_id: stock.store_id,
            quantity: stock.quantity,
          }, { onConflict: 'variant_id,store_id' });
        }
      }

      router.push('/admin/products');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (fetching) {
    return (
      <div className="admin-page">
        <div className="m3-loading" role="status" aria-label="Loading product">
          <div className="m3-progress"><span /></div>
          <p className="m3-body-medium m3-on-surface-variant">Loading product…</p>
        </div>
      </div>
    );
  }

  const flagRows = [
    { key: 'isActive' as const, title: 'Active', desc: 'Visible on the store and searchable' },
    { key: 'isNewArrival' as const, title: 'New arrival', desc: 'Badged as new across the store' },
    { key: 'isTrending' as const, title: 'Trending', desc: 'Surfaced in trending rails' },
  ];

  return (
    <div className="admin-page">
      <div className="m3-page-head m3-form-head">
        <div>
          <Link href="/admin/products" className="m3-back-link">
            <ArrowLeft size={16} /> Back to products
          </Link>
          <h1 className="m3-headline-medium">{isEditing ? 'Edit product' : 'Add product'}</h1>
          <p className="m3-body-medium m3-on-surface-variant">
            {isEditing ? 'Update details, variants, stock and images.' : 'Fill in the details — variants and stock come next.'}
          </p>
        </div>
      </div>

      <form id="product-form" onSubmit={handleSubmit} style={{ maxWidth: '720px' }}>
        {error && (
          <div ref={errorRef} className="m3-error-block" role="alert" style={{ marginBottom: '16px' }}>{error}</div>
        )}

        <div className="admin-section" style={{ marginBottom: '16px' }}>
          <div className="admin-section-header">
            <span className="admin-section-icon"><Tag size={20} strokeWidth={2} /></span>
            <div>
              <h2>Details</h2>
              <p className="m3-body-small m3-on-surface-variant">Name, pricing, category and description.</p>
            </div>
          </div>
          <div className="admin-section-body">
            <div className="m3-field">
              <label htmlFor="pf-name">Product name</label>
              <input
                id="pf-name"
                required
                placeholder="e.g. Classic Oversized Tee"
                value={form.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateForm({ name: e.target.value })}
              />
            </div>
            <div className="m3-field">
              <label htmlFor="pf-slug">Slug</label>
              <input
                id="pf-slug"
                placeholder="auto-generated"
                value={form.slug}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateForm({ slug: e.target.value })}
              />
              <span className="m3-field-hint">Auto-generated from the name — editable. Used in the product URL.</span>
            </div>
            <div className="m3-field-row">
              <div className="m3-field">
                <label htmlFor="pf-price">Price (ZMW)</label>
                <input
                  id="pf-price"
                  type="number"
                  required
                  min={0.01}
                  step={0.01}
                  inputMode="decimal"
                  placeholder="e.g. 250.00"
                  value={form.priceDisplay}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateForm({ priceDisplay: e.target.value })}
                />
              </div>
              <div className="m3-field">
                <label htmlFor="pf-sale">Sale price (ZMW)</label>
                <input
                  id="pf-sale"
                  type="number"
                  min={0}
                  step={0.01}
                  inputMode="decimal"
                  placeholder="Optional"
                  value={form.salePriceDisplay}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateForm({ salePriceDisplay: e.target.value })}
                />
              </div>
            </div>
            <div className="m3-field">
              <label htmlFor="pf-category">Category</label>
              <select
                id="pf-category"
                value={form.categoryId}
                onChange={(e) => updateForm({ categoryId: e.target.value })}
                required
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="m3-field">
              <label htmlFor="pf-threshold">Low stock threshold</label>
              <input
                id="pf-threshold"
                type="number"
                min={1}
                inputMode="numeric"
                placeholder="5"
                value={form.lowStockThreshold}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateForm({ lowStockThreshold: e.target.value })}
              />
              <span className="m3-field-hint">You get an inventory alert when stock falls below this number.</span>
            </div>
            <div className="m3-field">
              <label htmlFor="pf-desc">Description</label>
              <textarea
                id="pf-desc"
                required
                rows={4}
                placeholder="Fabric, fit, care — what should shoppers know?"
                value={form.description}
                onChange={(e) => updateForm({ description: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="admin-section" style={{ marginBottom: '16px' }}>
          <div className="admin-section-header">
            <span className="admin-section-icon"><Layers size={20} strokeWidth={2} /></span>
            <div style={{ flex: 1 }}>
              <h2>Variants &amp; stock</h2>
              <p className="m3-body-small m3-on-surface-variant">Size/colour combinations with per-store quantities.</p>
            </div>
            <button type="button" onClick={addVariant} className="m3-btn m3-btn-tonal" style={{ height: '36px' }}>
              <Plus size={16} /> Add
            </button>
          </div>
          <div className="admin-section-body">
            {form.variants.length === 0 && (
              <p className="m3-body-medium m3-on-surface-variant">No variants yet — add size/colour combinations. Products without variants sell as a single item.</p>
            )}
            {form.variants.map((variant, idx) => (
              <div key={idx} className="m3-variant-card">
                <div className="m3-variant-head">
                  <span className="m3-title-small">
                    Variant {idx + 1}
                    <span className="m3-body-small m3-on-surface-variant"> · {variant.size}{variant.colour ? ` · ${variant.colour}` : ''}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => removeVariant(idx)}
                    className="admin-action-btn danger"
                    aria-label={`Remove variant ${idx + 1}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div>
                  <span className="m3-field-label" id={`size-label-${idx}`}>Size</span>
                  <div className="m3-chip-row" role="group" aria-labelledby={`size-label-${idx}`} style={{ marginTop: '8px' }}>
                    {SIZE_OPTIONS.map((s) => {
                      const selected = variant.size === s;
                      return (
                        <button
                          key={s}
                          type="button"
                          className={`m3-filter-chip${selected ? ' is-selected' : ''}`}
                          aria-pressed={selected}
                          onClick={() => updateVariant(idx, { size: s })}
                        >
                          {selected && <Check size={14} aria-hidden="true" />}
                          {s}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="m3-field-row">
                  <div className="m3-field">
                    <label htmlFor={`colour-${idx}`}>Colour</label>
                    <input
                      id={`colour-${idx}`}
                      placeholder="e.g. Black"
                      value={variant.colour}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateVariant(idx, { colour: e.target.value })}
                    />
                  </div>
                  <div className="m3-field">
                    <label htmlFor={`sku-${idx}`}>SKU</label>
                    <input
                      id={`sku-${idx}`}
                      placeholder="Optional"
                      value={variant.sku}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateVariant(idx, { sku: e.target.value })}
                    />
                  </div>
                </div>
                <div className="m3-field">
                  <label htmlFor={`override-${idx}`}>Variant price (ZMW)</label>
                  <input
                    id={`override-${idx}`}
                    type="number"
                    min={0}
                    step={0.01}
                    inputMode="decimal"
                    placeholder="Same as product price"
                    value={variant.price_override_minor == null ? '' : String(variant.price_override_minor / 100)}
                    onChange={(e) => {
                      const v = e.target.value.trim();
                      updateVariant(idx, { price_override_minor: v === '' ? null : displayToNgwee(v) });
                    }}
                  />
                  <span className="m3-field-hint">Leave empty to use the product price.</span>
                </div>
                <div>
                  <span className="m3-field-label">Stock per store</span>
                  {stores.length === 0 && (
                    <p className="m3-body-small m3-on-surface-variant" style={{ marginTop: '4px' }}>No stores found — stock can be added later.</p>
                  )}
                  {stores.map((store) => {
                    const stockEntry = variant.stock.find((s) => s.store_id === store.id);
                    return (
                      <div key={store.id} className="m3-stock-row">
                        <span className="m3-stock-name">{store.name}</span>
                        <StockStepper
                          value={stockEntry?.quantity ?? 0}
                          onChange={(q) => updateVariantStock(idx, store.id, store.name, q)}
                          label={`${store.name} stock for variant ${idx + 1}`}
                        />
                      </div>
                    );
                  })}
                </div>
                <span className="m3-switch-label">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={variant.is_active}
                    aria-label={`Variant ${idx + 1} active`}
                    className="m3-switch"
                    onClick={() => updateVariant(idx, { is_active: !variant.is_active })}
                  />
                  <span className="m3-body-medium">Available for sale</span>
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="admin-section" style={{ marginBottom: '16px' }}>
          <div className="admin-section-header">
            <span className="admin-section-icon"><ImagePlus size={20} strokeWidth={2} /></span>
            <div>
              <h2>Images</h2>
              <p className="m3-body-small m3-on-surface-variant">First image is the cover. Drag &amp; drop or browse.</p>
            </div>
          </div>
          <div className="admin-section-body">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple
              onChange={handleMultipleImageUpload}
              style={{ display: 'none' }}
              aria-hidden="true"
              tabIndex={-1}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={(e) => { e.preventDefault(); setDragActive(false); handleFiles(e.dataTransfer.files); }}
              disabled={uploading}
              className={`m3-dropzone${dragActive ? ' is-dragging' : ''}`}
            >
              <span className="m3-dropzone-icon"><Upload size={24} strokeWidth={1.5} /></span>
              {uploading ? (
                <>
                  <span>Uploading…</span>
                  <span className="m3-progress" style={{ maxWidth: '240px' }}><span /></span>
                </>
              ) : (
                <>
                  <span>{dragActive ? 'Drop images here' : 'Click to upload or drag images here'}</span>
                  <span className="m3-body-small m3-on-surface-variant">JPG, PNG, WebP or GIF</span>
                </>
              )}
            </button>

            {form.images.length > 0 && (
              <>
                <div className="m3-thumbs">
                  {form.images.map((img, i) => (
                    <div key={i} className="m3-thumb">
                      <img src={img} alt={`Product image ${i + 1}`} />
                      {i === 0 && <span className="m3-thumb-cover">Cover</span>}
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="m3-thumb-remove"
                        aria-label={`Remove image ${i + 1}`}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
                <p className="m3-body-small m3-on-surface-variant">
                  {form.images.length} image{form.images.length !== 1 ? 's' : ''} uploaded
                </p>
              </>
            )}
          </div>
        </div>

        <div className="admin-section" style={{ marginBottom: '24px' }}>
          <div className="admin-section-header">
            <span className="admin-section-icon"><Eye size={20} strokeWidth={2} /></span>
            <div>
              <h2>Visibility</h2>
              <p className="m3-body-small m3-on-surface-variant">Where and how this product appears.</p>
            </div>
          </div>
          <div className="admin-section-body" style={{ paddingTop: '8px', paddingBottom: '8px' }}>
            {flagRows.map(({ key, title, desc }) => (
              <div key={key} className="m3-check-row">
                <div className="m3-check-text">
                  <strong>{title}</strong>
                  <span>{desc}</span>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={form[key]}
                  aria-label={title}
                  className="m3-switch"
                  onClick={() => updateForm({ [key]: !form[key] })}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="m3-sticky-bar">
          <span className="m3-sticky-hint">
            {uploading ? 'Uploading images…' : `${form.images.length} image${form.images.length !== 1 ? 's' : ''} · ${form.variants.length} variant${form.variants.length !== 1 ? 's' : ''}`}
          </span>
          <Link href="/admin/products" className="m3-btn m3-btn-text">Cancel</Link>
          <button type="submit" className="m3-btn m3-btn-filled" disabled={loading || uploading}>
            <Save size={18} strokeWidth={2} />
            <span>{loading ? 'Saving…' : isEditing ? 'Save changes' : 'Create product'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
