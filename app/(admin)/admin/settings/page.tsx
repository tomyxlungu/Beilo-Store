'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Save, Store, Globe, Bell } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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
      <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>Settings</h1>
      </div>

      <div style={{ maxWidth: '640px' }}>
        <form onSubmit={handleSave}>
          {error && (
            <div className="admin-login-error" style={{ marginBottom: '16px' }}>{error}</div>
          )}
          <div className="admin-section" style={{ marginBottom: '24px' }}>
            <div className="admin-section-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Store size={18} strokeWidth={2} />
                <h2>Store</h2>
              </div>
            </div>
            <div style={{ padding: '0 20px 20px' }}>
              <div style={{ marginBottom: '16px' }}>
                <Input
                  label="Store Name"
                  value={storeName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStoreName(e.target.value)}
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ironclad-grey)', display: 'block', marginBottom: '6px' }}>
                  Description
                </label>
                <textarea
                  value={storeDescription}
                  onChange={(e) => setStoreDescription(e.target.value)}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '10px 16px',
                    fontSize: '13px',
                    fontFamily: 'var(--font-family-base)',
                    borderRadius: '30px',
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Globe size={18} strokeWidth={2} />
                <h2>Contact</h2>
              </div>
            </div>
            <div style={{ padding: '0 20px 20px' }}>
              <div style={{ marginBottom: '16px' }}>
                <Input
                  label="WhatsApp Number"
                  placeholder="+260 XXX XXX XXX"
                  value={whatsappNumber}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setWhatsappNumber(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="admin-section" style={{ marginBottom: '24px' }}>
            <div className="admin-section-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Bell size={18} strokeWidth={2} />
                <h2>Account</h2>
              </div>
            </div>
            <div style={{ padding: '0 20px 20px' }}>
              <div style={{ marginBottom: '16px' }}>
                <Input
                  label="Admin Email"
                  value={email}
                  disabled
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <Button type="submit" variant="primary" loading={loading}>
              <Save size={16} strokeWidth={2} />
              <span>Save Settings</span>
            </Button>
            {saved && (
              <span style={{ fontSize: '13px', color: '#10b981', fontWeight: 500 }}>
                Settings saved!
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
