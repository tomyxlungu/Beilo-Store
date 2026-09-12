// app/(store)/stores/page.tsx
'use client';

import { useState } from 'react';
import { MapPin, Clock, Phone, Navigation, ChevronRight } from 'lucide-react';
import { stores } from '@/data/stores';
import Button from '@/components/ui/Button';
import Breadcrumb from '@/components/ui/Breadcrumb';

export default function StoresPage() {
  const [selectedStore, setSelectedStore] = useState<string | null>(null);

  const selectedStoreData = stores.find(s => s.id === selectedStore);

  return (
    <div style={{
      fontFamily: 'var(--font-family-base)',
      background: 'var(--canvas)',
      color: 'var(--charcoal-noir)',
      minHeight: '100vh',
    }}>
      <main className="wrap">
        <Breadcrumb items={[
          { label: 'Home', href: '/' },
          { label: 'Stores' },
        ]} />

        <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>
          Find Us in Lusaka
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--ironclad-grey)', marginBottom: '32px' }}>
          5 stores across Lusaka. Visit us for the latest streetwear.
        </p>

        <div className="grid" style={{ alignItems: 'start' }}>
          {/* Store List */}
          <div className="span-6">
            <div style={{
              borderTop: '1px solid var(--urban-fog)',
            }}>
              {stores.map(store => (
                <button
                  key={store.id}
                  onClick={() => setSelectedStore(store.id)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    padding: '20px 0',
                    borderBottom: '1px solid var(--urban-fog)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-family-base)',
                    textAlign: 'left',
                    transition: 'background 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--cloud-veil)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: selectedStore === store.id ? 'var(--charcoal-noir)' : 'var(--cloud-veil)',
                    color: selectedStore === store.id ? 'var(--canvas)' : 'var(--charcoal-noir)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    transition: 'all 0.2s ease',
                  }}>
                    <MapPin size={18} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{
                      fontSize: '15px',
                      fontWeight: 700,
                      marginBottom: '4px',
                      color: 'var(--charcoal-noir)',
                    }}>
                      {store.name}
                    </h3>
                    <p style={{
                      fontSize: '13px',
                      color: 'var(--ironclad-grey)',
                      marginBottom: '4px',
                    }}>
                      {store.address}
                    </p>
                    <div style={{
                      display: 'flex',
                      gap: '16px',
                      flexWrap: 'wrap',
                    }}>
                      <span style={{
                        fontSize: '12px',
                        color: 'var(--ironclad-grey)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}>
                        <Clock size={12} />
                        {store.hours}
                      </span>
                      <span style={{
                        fontSize: '12px',
                        color: 'var(--ironclad-grey)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}>
                        <Phone size={12} />
                        {store.phone}
                      </span>
                    </div>
                  </div>
                  <ChevronRight
                    size={18}
                    style={{
                      color: 'var(--urban-fog)',
                      flexShrink: 0,
                      marginTop: '8px',
                    }}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Store Details / Map */}
          <div className="span-6">
            <div style={{
              background: 'var(--cloud-veil)',
              border: '1.5px solid var(--urban-fog)',
              borderRadius: '22px',
              padding: '24px',
              position: 'sticky',
              top: '80px',
            }}>
              {selectedStoreData ? (
                <>
                  <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>
                    {selectedStoreData.name}
                  </h2>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                      <MapPin size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span style={{ fontSize: '13px' }}>{selectedStoreData.address}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                      <Clock size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span style={{ fontSize: '13px' }}>{selectedStoreData.hours}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                      <Phone size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span style={{ fontSize: '13px' }}>{selectedStoreData.phone}</span>
                    </div>
                  </div>

                  {/* Map Placeholder */}
                  <div style={{
                    height: '200px',
                    background: 'repeating-linear-gradient(45deg, var(--moonlit-silver), var(--moonlit-silver) 10px, var(--cloud-veil) 10px, var(--cloud-veil) 20px)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '16px',
                    fontSize: '12px',
                    color: 'var(--ironclad-grey)',
                  }}>
                    Map Placeholder
                  </div>

                  <Button
                    variant="primary"
                    fullWidth
                    icon={<Navigation size={16} />}
                    onClick={() => {
                      if (selectedStoreData.mapUrl) {
                        window.open(selectedStoreData.mapUrl, '_blank');
                      }
                    }}
                  >
                    Get Directions
                  </Button>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                  <MapPin size={48} style={{ color: 'var(--moonlit-silver)', marginBottom: '16px' }} />
                  <p style={{ fontSize: '14px', color: 'var(--ironclad-grey)' }}>
                    Select a store to see details
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Store Hours Summary */}
        <section style={{ marginTop: '48px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>
            Store Hours
          </h2>
          <div style={{
            borderTop: '1px solid var(--urban-fog)',
          }}>
            {stores.map(store => (
              <div
                key={store.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 0',
                  borderBottom: '1px solid var(--urban-fog)',
                  fontSize: '13px',
                  flexWrap: 'wrap',
                  gap: '8px',
                }}
              >
                <span style={{ fontWeight: 600 }}>{store.name}</span>
                <span style={{ color: 'var(--ironclad-grey)' }}>{store.hours}</span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}