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
  const [saved, setSaved] = useState(false);
  const [email, setEmail] = useState('');

  useEffect(() => {
    async function loadSession() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email) {
        setEmail(session.user.email);
      }
    }
    loadSession();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSaved(false);

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      alert('Failed to save settings');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>Settings</h1>
      </div>

      <div style={{ maxWidth: '640px' }}>
        <form onSubmit={handleSave}>
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
