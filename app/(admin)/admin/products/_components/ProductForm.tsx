'use client';

import { useState, useEffect, useRef } from 'react';
import { supabaseBrowser as supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Upload, X, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

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

  async function handleMultipleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError('');

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
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
      <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <Link href="/admin/products" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--ironclad-grey)', fontSize: '13px', fontWeight: 500, textDecoration: 'none', marginBottom: '8px' }}>
          <ArrowLeft size={16} /> Back to products
        </Link>
        <h1>{isEditing ? 'Edit Product' : 'Add Product'}</h1>
      </div>

      <form onSubmit={handleSubmit} style={{ maxWidth: '720px' }}>
        {error && (
          <div className="admin-login-error" style={{ marginBottom: '16px' }}>{error}</div>
        )}

        <div className="admin-section" style={{ marginBottom: '24px' }}>
          <div className="admin-section-header"><h2>Basic Info</h2></div>
          <div style={{ padding: '0 20px 20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Input
              label="Product Name"
              required
              placeholder="e.g. Classic Oversized Tee"
              value={form.name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateForm({ name: e.target.value })}
            />
            <Input
              label="Slug"
              placeholder="auto-generated"
              value={form.slug}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateForm({ slug: e.target.value })}
              hint="URL-friendly identifier"
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <Input
                label="Price (ZMW)"
                type="number"
                required
                min={0.01}
                step={0.01}
                placeholder="e.g. 250.00"
                value={form.priceDisplay}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateForm({ priceDisplay: e.target.value })}
              />
              <Input
                label="Sale Price (ZMW)"
                type="number"
                min={0}
                step={0.01}
                placeholder="Optional"
                value={form.salePriceDisplay}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateForm({ salePriceDisplay: e.target.value })}
              />
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ironclad-grey)', display: 'block', marginBottom: '6px' }}>Category</label>
              <select
                value={form.categoryId}
                onChange={(e) => updateForm({ categoryId: e.target.value })}
                className="admin-filter-select"
                style={{ width: '100%' }}
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <Input
              label="Low Stock Threshold"
              type="number"
              min={1}
              placeholder="5"
              value={form.lowStockThreshold}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateForm({ lowStockThreshold: e.target.value })}
              hint="Alert when stock falls below this number"
            />
            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ironclad-grey)', display: 'block', marginBottom: '6px' }}>Description</label>
              <textarea
                required
                rows={4}
                placeholder="Product description..."
                value={form.description}
                onChange={(e) => updateForm({ description: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 16px',
                  fontSize: '13px',
                  fontFamily: 'var(--font-family-base)',
                  borderRadius: '16px',
                  border: '1.5px solid var(--urban-fog)',
                  background: 'var(--canvas)',
                  color: 'var(--charcoal-noir)',
                  outline: 'none',
                  resize: 'vertical',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>
        </div>

        <div className="admin-section" style={{ marginBottom: '24px' }}>
          <div className="admin-section-header">
            <h2>Variants</h2>
            <button
              type="button"
              onClick={addVariant}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--charcoal-noir)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '13px',
                fontWeight: 600,
              }}
            >
              <Plus size={16} /> Add
            </button>
          </div>
          <div style={{ padding: '0 20px 20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {form.variants.length === 0 && (
              <p style={{ fontSize: '13px', color: 'var(--ironclad-grey)' }}>No variants yet. Add size/colour combinations above.</p>
            )}
            {form.variants.map((variant, idx) => (
              <div
                key={idx}
                style={{
                  border: '1px solid var(--cloud-veil)',
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600 }}>Variant {idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeVariant(idx)}
                    style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ironclad-grey)', display: 'block', marginBottom: '4px' }}>Size</label>
                    <select
                      value={variant.size}
                      onChange={(e) => updateVariant(idx, { size: e.target.value })}
                      className="admin-filter-select"
                      style={{ width: '100%' }}
                    >
                      {SIZE_OPTIONS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <Input
                    label="Colour"
                    placeholder="e.g. Black"
                    value={variant.colour}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateVariant(idx, { colour: e.target.value })}
                  />
                  <Input
                    label="SKU"
                    placeholder="Optional"
                    value={variant.sku}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateVariant(idx, { sku: e.target.value })}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '8px' }}>
                  {stores.map((store) => {
                    const stockEntry = variant.stock.find((s) => s.store_id === store.id);
                    return (
                      <div key={store.id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ flex: 1, fontSize: '12px', color: 'var(--ironclad-grey)' }}>{store.name}</span>
                        <input
                          type="number"
                          min={0}
                          value={stockEntry?.quantity ?? 0}
                          onChange={(e) => updateVariantStock(idx, store.id, store.name, Number(e.target.value) || 0)}
                          style={{
                            width: '60px',
                            padding: '6px 8px',
                            fontSize: '13px',
                            borderRadius: '8px',
                            border: '1px solid var(--cloud-veil)',
                            textAlign: 'center',
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="admin-section" style={{ marginBottom: '24px' }}>
          <div className="admin-section-header"><h2>Images</h2></div>
          <div style={{ padding: '0 20px 20px' }}>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple
              onChange={handleMultipleImageUpload}
              style={{ display: 'none' }}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              style={{
                width: '100%',
                padding: '32px',
                borderRadius: '12px',
                border: '2px dashed var(--cloud-veil)',
                background: uploading ? 'var(--cloud-veil)' : 'transparent',
                cursor: uploading ? 'wait' : 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                color: 'var(--ironclad-grey)',
                fontSize: '13px',
                fontWeight: 500,
                transition: 'all 0.2s',
              }}
            >
              {uploading ? (
                <>
                  <div className="spinner" style={{ width: 24, height: 24, borderWidth: 2 }} />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Upload size={24} strokeWidth={1.5} />
                  <span>Click to upload images</span>
                  <span style={{ fontSize: '11px', color: 'var(--moonlit-silver)' }}>
                    JPG, PNG, WebP or GIF (max 5MB each)
                  </span>
                </>
              )}
            </button>

            {form.images.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
                {form.images.map((img, i) => (
                  <div key={i} style={{ position: 'relative', width: '80px', height: '80px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--cloud-veil)' }}>
                    <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      style={{
                        position: 'absolute', top: '2px', right: '2px',
                        width: '20px', height: '20px', borderRadius: '50%',
                        background: 'rgba(0,0,0,0.6)', color: 'white',
                        border: 'none', cursor: 'pointer', fontSize: '12px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {form.images.length > 0 && (
              <p style={{ fontSize: '12px', color: 'var(--ironclad-grey)', marginTop: '8px' }}>
                {form.images.length} image{form.images.length !== 1 ? 's' : ''} uploaded
              </p>
            )}
          </div>
        </div>

        <div className="admin-section" style={{ marginBottom: '24px' }}>
          <div className="admin-section-header"><h2>Flags</h2></div>
          <div style={{ padding: '0 20px 20px', display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            {[
              { key: 'isActive' as const, label: 'Active (visible on store)' },
              { key: 'isNewArrival' as const, label: 'New Arrival' },
              { key: 'isTrending' as const, label: 'Trending' },
            ].map(({ key, label }) => (
              <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 500 }}>
                <input
                  type="checkbox"
                  checked={form[key]}
                  onChange={(e) => updateForm({ [key]: e.target.checked })}
                  style={{ width: '16px', height: '16px', accentColor: 'var(--charcoal-noir)' }}
                />
                {label}
              </label>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <Button type="submit" variant="primary" loading={loading}>
            <Save size={16} strokeWidth={2} />
            <span>{isEditing ? 'Save Changes' : 'Create Product'}</span>
          </Button>
          <Link href="/admin/products">
            <Button type="button" variant="secondary">Cancel</Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
