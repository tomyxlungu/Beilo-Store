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
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

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
        <div className="admin-page-header"><h1>Homepage</h1></div>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
          <div className="spinner" />
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Homepage</h1>
          <p className="admin-page-subtitle">
            {blocks.length} block{blocks.length !== 1 ? 's' : ''} · {blocks.filter((b) => b.active).length} live on the store
          </p>
        </div>
        <Button variant="primary" onClick={openNew}>
          <Plus size={16} strokeWidth={2} />
          <span>Add block</span>
        </Button>
      </div>

      {error && <div className="admin-login-error">{error}</div>}

      {blocks.length === 0 && !showEditor ? (
        <div className="admin-section" style={{ padding: '48px 24px', textAlign: 'center' }}>
          <Megaphone size={32} strokeWidth={1.5} style={{ color: 'var(--moonlit-silver)', marginBottom: '12px' }} />
          <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px' }}>No homepage blocks yet</h2>
          <p style={{ fontSize: '13px', color: 'var(--ironclad-grey)', marginBottom: '20px' }}>
            The store shows default content until you add blocks. Create a hero banner,
            quick-link row, or top-bar announcement.
          </p>
          <Button variant="primary" onClick={openNew}>
            <Plus size={16} strokeWidth={2} />
            <span>Add your first block</span>
          </Button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[...blocks].sort((a, b) => a.sort_order - b.sort_order).map((block, idx, arr) => (
            <div key={block.id} className="admin-section" style={{ padding: '16px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <span className="admin-stock-badge" style={{
                  background: block.type === 'hero' ? '#dbeafe' : block.type === 'quick_link' ? '#ede9fe' : '#fef3c7',
                  color: block.type === 'hero' ? '#1d4ed8' : block.type === 'quick_link' ? '#6d28d9' : '#92400e',
                }}>
                  {TYPE_META[block.type]?.label || block.type}
                </span>
                <div style={{ flex: 1, minWidth: '160px' }}>
                  <div style={{ fontWeight: 600, fontSize: '14px' }}>{block.title}</div>
                  <div style={{ fontSize: '12px', color: 'var(--ironclad-grey)' }}>
                    {block.type === 'quick_link'
                      ? `${block.content?.items?.length || 0} links`
                      : block.content?.href || TYPE_META[block.type]?.hint}
                    {!block.active && ' · Hidden'}
                  </div>
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={block.active}
                    onChange={() => toggleActive(block)}
                    style={{ width: '16px', height: '16px', accentColor: 'var(--charcoal-noir)' }}
                  />
                  Live
                </label>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button
                    type="button"
                    onClick={() => move(block, -1)}
                    disabled={idx === 0}
                    className="admin-action-btn"
                    aria-label="Move up"
                    style={{ opacity: idx === 0 ? 0.3 : 1 }}
                  >
                    <ChevronUp size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(block, 1)}
                    disabled={idx === arr.length - 1}
                    className="admin-action-btn"
                    aria-label="Move down"
                    style={{ opacity: idx === arr.length - 1 ? 0.3 : 1 }}
                  >
                    <ChevronDown size={16} />
                  </button>
                  <button type="button" onClick={() => openEdit(block)} className="admin-action-btn" aria-label="Edit block">
                    <Pencil size={16} />
                  </button>
                  <button type="button" onClick={() => setDeleteId(block.id)} className="admin-action-btn danger" aria-label="Delete block">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showEditor && (
        <div className="admin-section" style={{ marginTop: '24px' }}>
          <div className="admin-section-header">
            <h2>{editingId ? 'Edit block' : 'New block'}</h2>
            <button type="button" onClick={() => setShowEditor(false)} className="admin-action-btn" aria-label="Close editor">
              <X size={16} />
            </button>
          </div>
          <form onSubmit={handleSave} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '640px' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Block type</label>
              <select
                value={form.type}
                onChange={(e) => updateForm({ type: e.target.value as BlockType })}
                className="admin-filter-select"
                style={{ width: '100%' }}
                disabled={!!editingId}
              >
                {(Object.keys(TYPE_META) as BlockType[]).map((t) => (
                  <option key={t} value={t}>{TYPE_META[t].label} — {TYPE_META[t].hint}</option>
                ))}
              </select>
            </div>

            <Input
              label={form.type === 'announcement' ? 'Message' : form.type === 'hero' ? 'Headline' : 'Block title'}
              required
              placeholder={form.type === 'announcement' ? 'e.g. Free delivery this weekend' : form.type === 'hero' ? 'e.g. New season just dropped' : 'e.g. Shop by category'}
              value={form.title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateForm({ title: e.target.value })}
            />

            {form.type === 'hero' && (
              <>
                <Input
                  label="Subheading"
                  placeholder="e.g. Fresh fits for every day in Zambia"
                  value={form.subtitle}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateForm({ subtitle: e.target.value })}
                />
                <Input
                  label="Background image URL"
                  placeholder="/products/beliloimg.avif or https://…"
                  value={form.image}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateForm({ image: e.target.value })}
                  hint="Use a path from your store images or a full URL"
                />
                {form.image && (
                  <img src={form.image} alt="" style={{ width: '100%', maxHeight: '180px', objectFit: 'cover', borderRadius: '12px' }} />
                )}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <Input
                    label="Button text"
                    placeholder="Shop now"
                    value={form.cta_text}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateForm({ cta_text: e.target.value })}
                  />
                  <Input
                    label="Button link"
                    placeholder="/shop"
                    value={form.href}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateForm({ href: e.target.value })}
                  />
                </div>
              </>
            )}

            {form.type === 'announcement' && (
              <Input
                label="Link (where the message goes)"
                placeholder="/shop"
                value={form.href}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateForm({ href: e.target.value })}
              />
            )}

            {form.type === 'quick_link' && (
              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Links</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {form.items.map((item, i) => (
                    <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        <Input
                          placeholder="Label (e.g. Hoodies)"
                          value={item.label}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateItem(i, { label: e.target.value })}
                        />
                        <Input
                          placeholder="Image URL"
                          value={item.image}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateItem(i, { image: e.target.value })}
                        />
                      </div>
                      <button type="button" onClick={() => removeItem(i)} className="admin-action-btn danger" aria-label="Remove link">
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addItem}
                    style={{ alignSelf: 'flex-start', background: 'none', border: '1px dashed var(--cloud-veil)', borderRadius: '8px', padding: '8px 14px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                  >
                    + Add link
                  </button>
                </div>
                <Input
                  label="Block link (where 'Shop now' goes)"
                  placeholder="/shop"
                  value={form.href}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateForm({ href: e.target.value })}
                />
              </div>
            )}

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => updateForm({ active: e.target.checked })}
                style={{ width: '16px', height: '16px', accentColor: 'var(--charcoal-noir)' }}
              />
              Show on store immediately
            </label>

            <div style={{ display: 'flex', gap: '12px' }}>
              <Button type="submit" variant="primary" loading={saving}>
                <span>{editingId ? 'Save changes' : 'Create block'}</span>
              </Button>
              <Button type="button" variant="secondary" onClick={() => setShowEditor(false)}>Cancel</Button>
            </div>
          </form>
        </div>
      )}

      {deleteId && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '16px' }}>
          <div className="admin-section" style={{ padding: '24px', maxWidth: '400px', width: '100%' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px' }}>Delete this block?</h2>
            <p style={{ fontSize: '13px', color: 'var(--ironclad-grey)', marginBottom: '20px' }}>
              It will disappear from the store immediately. This can&apos;t be undone.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <Button type="button" variant="secondary" onClick={() => setDeleteId(null)}>Cancel</Button>
              <Button type="button" variant="primary" onClick={handleDelete}>Delete</Button>
            </div>
          </div>
        </div>
      )}

      <p style={{ fontSize: '12px', color: 'var(--ironclad-grey)', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <Link2 size={13} /> Tip: use the arrows to reorder — the store shows blocks top to bottom in this order.
        <ImageIcon size={13} style={{ marginLeft: '8px' }} /> Images can be any store image path or full URL.
      </p>
    </div>
  );
}
