'use client';

import { useState, useEffect } from 'react';
import { supabaseBrowser as supabase } from '@/lib/supabase/client';
import { Save, Store, Globe, Bell, CheckCircle2, AlertCircle } from 'lucide-react';

export default function AdminSettings() {
  const [storeName, setStoreName] = useState('BEILO');
  const [storeDescription, setStoreDescription] = useState('Zambia\'s online fashion destination');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email) {
        setEmail(session.user.email);
      }
      if (!session) {
        setFetching(false);
        return;
      }
      try {
        const res = await fetch('/api/admin/settings', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (res.ok) {
          const data = await res.json();
          const s = data.settings || {};
          if (s.store_name) setStoreName(typeof s.store_name === 'string' ? s.store_name : s.store_name.value ?? 'BEILO');
          if (s.store_description) setStoreDescription(typeof s.store_description === 'string' ? s.store_description : s.store_description.value ?? '');
          if (s.whatsapp_number) setWhatsappNumber(typeof s.whatsapp_number === 'string' ? s.whatsapp_number : s.whatsapp_number.value ?? '');
        }
      } catch (err) {
        console.error('Failed to load settings:', err);
      } finally {
        setFetching(false);
      }
    }
    load();
  }, []);

  async function saveSetting(key: string, value: string) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');
    const res = await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ key, value }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Failed to save');
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSaved(false);
    setError('');

    try {
      await saveSetting('store_name', storeName);
      await saveSetting('store_description', storeDescription);
      await saveSetting('whatsapp_number', whatsappNumber);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save settings');
    } finally {
      setLoading(false);
    }
  }

  if (fetching) {
    return (
      <div className="admin-page">
        <div className="m3-loading" role="status" aria-label="Loading settings">
          <div className="m3-progress"><span /></div>
          <p className="m3-body-medium m3-on-surface-variant">Loading settings…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="m3-page-head">
        <div>
          <h1 className="m3-headline-medium">Settings</h1>
          <p className="m3-body-medium m3-on-surface-variant">Store identity, contact channel, and your account.</p>
        </div>
      </div>

      <div style={{ maxWidth: '640px' }}>
        <form onSubmit={handleSave}>
          {error && (
            <div className="m3-error-block" role="alert" style={{ marginBottom: '16px' }}>
              <AlertCircle size={16} aria-hidden="true" />
              {error}
            </div>
          )}
          <div className="admin-section" style={{ marginBottom: '16px' }}>
            <div className="admin-section-header">
              <span className="admin-section-icon"><Store size={20} strokeWidth={2} /></span>
              <h2>Store</h2>
            </div>
            <div style={{ padding: '0 20px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="m3-field">
                <label htmlFor="settings-store-name">Store name</label>
                <input
                  id="settings-store-name"
                  value={storeName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStoreName(e.target.value)}
                />
              </div>
              <div className="m3-field">
                <label htmlFor="settings-store-desc">Description</label>
                <textarea
                  id="settings-store-desc"
                  value={storeDescription}
                  onChange={(e) => setStoreDescription(e.target.value)}
                  rows={3}
                />
                <span className="m3-field-hint">Shown on the storefront and receipts.</span>
              </div>
            </div>
          </div>

          <div className="admin-section" style={{ marginBottom: '16px' }}>
            <div className="admin-section-header">
              <span className="admin-section-icon"><Globe size={20} strokeWidth={2} /></span>
              <h2>Contact</h2>
            </div>
            <div style={{ padding: '0 20px 20px' }}>
              <div className="m3-field">
                <label htmlFor="settings-whatsapp">WhatsApp number</label>
                <input
                  id="settings-whatsapp"
                  placeholder="+260 XXX XXX XXX"
                  value={whatsappNumber}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setWhatsappNumber(e.target.value)}
                />
                <span className="m3-field-hint">Customers check out through this number.</span>
              </div>
            </div>
          </div>

          <div className="admin-section" style={{ marginBottom: '24px' }}>
            <div className="admin-section-header">
              <span className="admin-section-icon"><Bell size={20} strokeWidth={2} /></span>
              <h2>Account</h2>
            </div>
            <div style={{ padding: '0 20px 20px' }}>
              <div className="m3-field">
                <label htmlFor="settings-email">Admin email</label>
                <input
                  id="settings-email"
                  value={email}
                  disabled
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button type="submit" className="m3-btn m3-btn-filled" disabled={loading}>
              <Save size={16} strokeWidth={2} />
              <span>{loading ? 'Saving…' : 'Save settings'}</span>
            </button>
            {saved && (
              <span className="m3-chip-status" style={{ background: 'var(--m3-success-container)', color: 'var(--m3-on-success-container)' }}>
                <CheckCircle2 size={14} aria-hidden="true" />
                Settings saved
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
