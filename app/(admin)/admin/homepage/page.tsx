'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabaseBrowser as supabase } from '@/lib/supabase/client';
import {
  Plus,
  Pencil,
  Trash2,
  ChevronUp,
  ChevronDown,
  Megaphone,
  Image as ImageIcon,
  Link2,
  X,
  Check,
} from 'lucide-react';
import ImageUpload from '@/components/ui/ImageUpload';

type BlockType = 'hero' | 'quick_link' | 'announcement';

interface LinkItem {
  label: string;
  image: string;
}

interface Block {
  id: string;
  type: BlockType;
  title: string;
  content: {
    subtitle?: string;
    image?: string;
    cta_text?: string;
    href?: string;
    offer?: string;
    items?: LinkItem[];
  };
  sort_order: number;
  active: boolean;
}

const TYPE_META: Record<BlockType, { label: string; hint: string }> = {
  hero: { label: 'Hero banner', hint: 'Big headline banner at the top of the home page.' },
  quick_link: { label: 'Quick links', hint: 'A "shop by" card row on the home page.' },
  announcement: { label: 'Announcement', hint: 'Rotating message in the top bar.' },
};

async function authHeaders(): Promise<HeadersInit> {
  const { data: { session } } = await supabase.auth.getSession();
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${session?.access_token || ''}`,
  };
}

const EMPTY_FORM = {
  type: 'announcement' as BlockType,
  title: '',
  subtitle: '',
  image: '',
  cta_text: '',
  href: '',
  offer: '',
  items: [] as LinkItem[],
  active: true,
};

export default function AdminHomepage() {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const fetchBlocks = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/homepage-blocks', { headers: await authHeaders() });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load blocks');
      setBlocks(data.blocks || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBlocks(); }, [fetchBlocks]);

  function openNew() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowEditor(true);
    setError('');
  }

  function openEdit(block: Block) {
    setEditingId(block.id);
    setForm({
      type: block.type,
      title: block.title,
      subtitle: block.content?.subtitle || '',
      image: block.content?.image || '',
      cta_text: block.content?.cta_text || '',
      href: block.content?.href || '',
      offer: block.content?.offer || '',
      items: block.content?.items ? [...block.content.items] : [],
      active: block.active,
    });
    setShowEditor(true);
    setError('');
  }

  function updateForm(updates: Partial<typeof EMPTY_FORM>) {
    setForm((prev) => ({ ...prev, ...updates }));
  }

  function updateItem(index: number, updates: Partial<LinkItem>) {
    setForm((prev) => {
      const items = [...prev.items];
      items[index] = { ...items[index], ...updates };
      return { ...prev, items };
    });
  }

  function addItem() {
    setForm((prev) => ({ ...prev, items: [...prev.items, { label: '', image: '' }] }));
  }

  function removeItem(index: number) {
    setForm((prev) => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (!form.title.trim()) throw new Error('Title is required');
      if (form.type === 'quick_link' && form.items.some((i) => !i.label.trim())) {
        throw new Error('Every link item needs a label');
      }

      const content: Record<string, any> = {};
      if (form.subtitle.trim()) content.subtitle = form.subtitle.trim();
      if (form.image.trim()) content.image = form.image.trim();
      if (form.cta_text.trim()) content.cta_text = form.cta_text.trim();
      if (form.href.trim()) content.href = form.href.trim();
      if (form.offer.trim()) content.offer = form.offer.trim();
      if (form.type === 'quick_link') {
        content.items = form.items
          .filter((i) => i.label.trim())
          .map((i) => ({ label: i.label.trim(), image: i.image.trim() }));
      }

      const payload: any = {
        type: form.type,
        title: form.title.trim(),
        content,
        active: form.active,
      };

      let res;
      if (editingId) {
        payload.id = editingId;
        res = await fetch('/api/admin/homepage-blocks', {
          method: 'PUT',
          headers: await authHeaders(),
          body: JSON.stringify(payload),
        });
      } else {
        payload.sort_order = blocks.length;
        res = await fetch('/api/admin/homepage-blocks', {
          method: 'POST',
          headers: await authHeaders(),
          body: JSON.stringify(payload),
        });
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save block');

      setShowEditor(false);
      fetchBlocks();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    try {
      const res = await fetch('/api/admin/homepage-blocks', {
        method: 'DELETE',
        headers: await authHeaders(),
        body: JSON.stringify({ id: deleteId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete');
      setDeleteId(null);
      fetchBlocks();
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function toggleActive(block: Block) {
    try {
      const res = await fetch('/api/admin/homepage-blocks', {
        method: 'PUT',
        headers: await authHeaders(),
        body: JSON.stringify({ id: block.id, active: !block.active }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update');
      fetchBlocks();
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function move(block: Block, dir: -1 | 1) {
    const sorted = [...blocks].sort((a, b) => a.sort_order - b.sort_order);
    const idx = sorted.findIndex((b) => b.id === block.id);
    const other = sorted[idx + dir];
    if (!other) return;
    try {
      const headers = await authHeaders();
      const [r1, r2] = await Promise.all([
        fetch('/api/admin/homepage-blocks', {
          method: 'PUT', headers, body: JSON.stringify({ id: block.id, sort_order: other.sort_order }),
        }),
        fetch('/api/admin/homepage-blocks', {
          method: 'PUT', headers, body: JSON.stringify({ id: other.id, sort_order: block.sort_order }),
        }),
      ]);
      if (!r1.ok || !r2.ok) throw new Error('Failed to reorder');
      fetchBlocks();
    } catch (err: any) {
      setError(err.message);
    }
  }

  if (loading) {
    return (
      <div className="admin-page">
        <div className="m3-page-head">
          <div>
            <h1 className="m3-headline-medium">Homepage</h1>
          </div>
        </div>
        <div className="m3-loading" role="status" aria-label="Loading homepage blocks">
          <div className="m3-progress"><span /></div>
          <p className="m3-body-medium m3-on-surface-variant">Loading homepage blocks…</p>
        </div>
      </div>
    );
  }

  const typeIcon = (type: BlockType) =>
    type === 'hero' ? ImageIcon : type === 'quick_link' ? Link2 : Megaphone;
  const typeTint = (type: BlockType) =>
    type === 'hero'
      ? { background: 'var(--m3-secondary-container)', color: 'var(--m3-on-secondary-container)' }
      : type === 'quick_link'
        ? { background: 'var(--m3-tertiary-container)', color: 'var(--m3-on-tertiary-container)' }
        : { background: 'var(--m3-primary-container)', color: 'var(--m3-on-primary-container)' };

  return (
    <div className="admin-page">
      <div className="m3-page-head">
        <div>
          <h1 className="m3-headline-medium">Homepage</h1>
          <p className="m3-body-medium m3-on-surface-variant">
            {blocks.length} block{blocks.length !== 1 ? 's' : ''} · {blocks.filter((b) => b.active).length} live on the store
          </p>
        </div>
        <div className="m3-page-actions">
          <button type="button" className="m3-btn m3-btn-filled" onClick={openNew}>
            <Plus size={16} strokeWidth={2} />
            <span>Add block</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="m3-error-block" role="alert">
          {error}
        </div>
      )}

      {blocks.length === 0 && !showEditor ? (
        <div className="admin-card">
          <div className="m3-empty">
            <span className="m3-empty-icon"><Megaphone size={28} strokeWidth={1.5} aria-hidden="true" /></span>
            <p className="m3-title-medium">No homepage blocks yet</p>
            <p className="m3-body-medium m3-on-surface-variant" style={{ maxWidth: '420px' }}>
              The store shows default content until you add blocks. Create a hero banner,
              quick-link row, or top-bar announcement.
            </p>
            <button type="button" className="m3-btn m3-btn-filled" onClick={openNew} style={{ marginTop: '8px' }}>
              <Plus size={16} strokeWidth={2} />
              <span>Add your first block</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="m3-block-list">
          {[...blocks].sort((a, b) => a.sort_order - b.sort_order).map((block, idx, arr) => {
            const Leading = typeIcon(block.type);
            return (
            <div key={block.id} className="admin-card" style={{ padding: '16px 12px 16px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <span className="m3-block-leading" style={typeTint(block.type)}>
                  <Leading size={22} aria-hidden="true" />
                </span>
                <div style={{ flex: 1, minWidth: '160px' }}>
                  <div className="m3-title-medium">{block.title}</div>
                  <div className="m3-body-small m3-on-surface-variant">
                    {TYPE_META[block.type]?.label}
                    {block.type === 'quick_link'
                      ? ` · ${block.content?.items?.length || 0} links`
                      : block.content?.href
                        ? ` · ${block.content.href}`
                        : ''}
                    {!block.active && ' · Hidden'}
                  </div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={block.active}
                  aria-label={`Show “${block.title}” on store`}
                  className="m3-switch"
                  onClick={() => toggleActive(block)}
                />
                <div className="m3-block-actions">
                  <button
                    type="button"
                    onClick={() => move(block, -1)}
                    disabled={idx === 0}
                    className="admin-action-btn"
                    aria-label="Move up"
                  >
                    <ChevronUp size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(block, 1)}
                    disabled={idx === arr.length - 1}
                    className="admin-action-btn"
                    aria-label="Move down"
                  >
                    <ChevronDown size={18} />
                  </button>
                  <button type="button" onClick={() => openEdit(block)} className="admin-action-btn" aria-label={`Edit ${block.title}`}>
                    <Pencil size={18} />
                  </button>
                  <button type="button" onClick={() => setDeleteId(block.id)} className="admin-action-btn danger" aria-label={`Delete ${block.title}`}>
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
            );
          })}
        </div>
      )}

      {showEditor && (
        <div className="admin-card" style={{ marginTop: '8px', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '16px' }}>
            <h2 className="m3-title-large">{editingId ? 'Edit block' : 'New block'}</h2>
            <button type="button" onClick={() => setShowEditor(false)} className="admin-action-btn" aria-label="Close editor">
              <X size={18} />
            </button>
          </div>
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '640px' }}>
            <div>
              <span className="m3-field-label" id="block-type-label">Block type</span>
              <div className="m3-chip-row" role="group" aria-labelledby="block-type-label" style={{ marginTop: '8px' }}>
                {(Object.keys(TYPE_META) as BlockType[]).map((t) => {
                  const selected = form.type === t;
                  return (
                    <button
                      key={t}
                      type="button"
                      className={`m3-filter-chip${selected ? ' is-selected' : ''}`}
                      aria-pressed={selected}
                      disabled={!!editingId}
                      title={TYPE_META[t].hint}
                      onClick={() => updateForm({ type: t })}
                    >
                      {selected && <Check size={14} aria-hidden="true" />}
                      {TYPE_META[t].label}
                    </button>
                  );
                })}
              </div>
              <span className="m3-field-hint">{TYPE_META[form.type].hint}</span>
            </div>

            <div className="m3-field">
              <label htmlFor="block-title">{form.type === 'announcement' ? 'Message' : form.type === 'hero' ? 'Headline' : 'Block title'}</label>
              <input
                id="block-title"
                required
                placeholder={form.type === 'announcement' ? 'e.g. Free delivery this weekend' : form.type === 'hero' ? 'e.g. New season just dropped' : 'e.g. Shop by category'}
                value={form.title}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateForm({ title: e.target.value })}
              />
            </div>

            {form.type === 'hero' && (
              <>
                <div className="m3-field">
                  <label htmlFor="block-subtitle">Subheading</label>
                  <input
                    id="block-subtitle"
                    placeholder="e.g. Fresh fits for every day in Zambia"
                    value={form.subtitle}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateForm({ subtitle: e.target.value })}
                  />
                </div>
                <ImageUpload
                  label="Background image"
                  value={form.image}
                  onChange={(url) => updateForm({ image: url })}
                  pathPrefix="homepage"
                  hint="Upload from your machine — shows on the store hero"
                />
                <div className="m3-field-row">
                  <div className="m3-field">
                    <label htmlFor="block-cta">Button text</label>
                    <input
                      id="block-cta"
                      placeholder="Shop now"
                      value={form.cta_text}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateForm({ cta_text: e.target.value })}
                    />
                  </div>
                  <div className="m3-field">
                    <label htmlFor="block-href">Button link</label>
                    <input
                      id="block-href"
                      placeholder="/shop"
                      value={form.href}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateForm({ href: e.target.value })}
                    />
                  </div>
                </div>
                <div className="m3-field">
                  <label htmlFor="block-offer">Offer line (optional)</label>
                  <input
                    id="block-offer"
                    placeholder="e.g. Up to 30% off this week"
                    value={form.offer}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateForm({ offer: e.target.value })}
                  />
                  <span className="m3-field-hint">Small promo line under the button on the store.</span>
                </div>
              </>
            )}

            {form.type === 'announcement' && (
              <div className="m3-field">
                <label htmlFor="block-link">Link (where the message goes)</label>
                <input
                  id="block-link"
                  placeholder="/shop"
                  value={form.href}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateForm({ href: e.target.value })}
                />
              </div>
            )}

            {form.type === 'quick_link' && (
              <div>
                <span className="m3-field-label">Links</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                  {form.items.map((item, i) => (
                    <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <div style={{ flex: 1 }}>
                        <div className="m3-field">
                          <input
                            placeholder="Label (e.g. Hoodies)"
                            value={item.label}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateItem(i, { label: e.target.value })}
                            aria-label={`Link ${i + 1} label`}
                          />
                        </div>
                      </div>
                      <ImageUpload
                        compact
                        label={`Upload image for link ${i + 1}`}
                        value={item.image}
                        onChange={(url) => updateItem(i, { image: url })}
                        pathPrefix="homepage"
                      />
                      <button type="button" onClick={() => removeItem(i)} className="admin-action-btn danger" aria-label="Remove link">
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addItem}
                    className="m3-add-link"
                  >
                    <Plus size={14} aria-hidden="true" /> Add link
                  </button>
                </div>
                <div className="m3-field" style={{ marginTop: '12px' }}>
                  <label htmlFor="block-quick-href">Block link (where &lsquo;Shop now&rsquo; goes)</label>
                  <input
                    id="block-quick-href"
                    placeholder="/shop"
                    value={form.href}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateForm({ href: e.target.value })}
                  />
                </div>
              </div>
            )}

            <span className="m3-switch-label">
              <button
                type="button"
                role="switch"
                aria-checked={form.active}
                aria-label="Show on store immediately"
                className="m3-switch"
                onClick={() => updateForm({ active: !form.active })}
              />
              Show on store immediately
            </span>

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button type="button" className="m3-btn m3-btn-text" onClick={() => setShowEditor(false)}>Cancel</button>
              <button type="submit" className="m3-btn m3-btn-filled" disabled={saving}>
                {saving ? 'Saving…' : editingId ? 'Save changes' : 'Create block'}
              </button>
            </div>
          </form>
        </div>
      )}

      {deleteId && (
        <div className="admin-modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="admin-modal" role="alertdialog" aria-modal="true" aria-labelledby="delete-block-title" onClick={(e) => e.stopPropagation()}>
            <h3 id="delete-block-title">Delete this block?</h3>
            <p>It will disappear from the store immediately. This can&apos;t be undone.</p>
            <div className="admin-modal-actions">
              <button type="button" className="m3-btn m3-btn-text" onClick={() => setDeleteId(null)}>Cancel</button>
              <button type="button" className="m3-btn m3-btn-text is-danger" onClick={handleDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}

      <p className="m3-tip">
        <Link2 size={13} aria-hidden="true" /> Tip: use the arrows to reorder — the store shows blocks top to bottom in this order.
        <ImageIcon size={13} aria-hidden="true" style={{ marginLeft: '8px' }} /> Images can be any store image path or full URL.
      </p>
    </div>
  );
}
