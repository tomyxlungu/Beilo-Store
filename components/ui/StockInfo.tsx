// components/ui/StockInfo.tsx
'use client';

import React from 'react';
import { MapPin, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import type { StockLocation, StockStatus } from '../../types/product';

interface StockInfoProps {
  stockByStore?: StockLocation[];
  showAll?: boolean;
  compact?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onStoreClick?: (storeName: string) => void;
  ariaLabel?: string;
}

const statusConfig: Record<StockStatus, { icon: React.ReactNode; color: string; label: string }> = {
  'in-stock': {
    icon: <CheckCircle2 size={12} />,
    color: '#00cc66',
    label: 'In Stock',
  },
  'low-stock': {
    icon: <AlertTriangle size={12} />,
    color: '#ff8800',
    label: 'Low Stock',
  },
  'out-of-stock': {
    icon: <XCircle size={12} />,
    color: 'var(--moonlit-silver)',
    label: 'Out of Stock',
  },
};

const StockInfo: React.FC<StockInfoProps> = ({ 
  stockByStore = [],
  showAll = false,
  compact = false,
  className = '',
  style,
  onStoreClick,
  ariaLabel = 'Stock availability',
}) => {
  const [isExpanded, setIsExpanded] = React.useState<boolean>(showAll);

  const storesWithStock = stockByStore.filter(store => store.status !== 'out-of-stock');
  const storesLowStock = stockByStore.filter(store => store.status === 'low-stock');
  const storesOutOfStock = stockByStore.filter(store => store.status === 'out-of-stock');

  const displayStores = isExpanded ? stockByStore : storesWithStock.slice(0, compact ? 1 : 2);
  const remainingStores = storesWithStock.length - (compact ? 1 : 2);

  if (stockByStore.length === 0) return null;

  if (storesWithStock.length === 0) {
    return (
      <div className={`stock-info stock-info-out ${className}`} style={{
        marginTop: compact ? '4px' : '8px',
        fontSize: compact ? '11px' : '12px',
        color: 'var(--ironclad-grey)',
        ...style,
      }} role="status" aria-label={ariaLabel}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
          <XCircle size={compact ? 11 : 12} style={{ color: 'var(--moonlit-silver)' }} />
          <span style={{ fontWeight: 600 }}>Out of Stock</span>
        </span>
      </div>
    );
  }

  return (
    <div className={`stock-info ${className}`} style={{
      marginTop: compact ? '4px' : '8px',
      fontSize: compact ? '11px' : '12px',
      color: 'var(--ironclad-grey)',
      ...style,
    }} role="status" aria-label={ariaLabel}>
      {/* Quick summary */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        marginBottom: compact ? '4px' : '6px',
        fontWeight: 600,
        color: 'var(--charcoal-noir)',
      }}>
        <CheckCircle2 size={compact ? 11 : 12} style={{ color: '#00cc66' }} />
        <span>In Stock</span>
        {storesOutOfStock.length > 0 && (
          <span style={{ fontSize: compact ? '10px' : '11px', color: 'var(--urban-fog)', fontWeight: 400 }}>
            ({storesWithStock.length} of {stockByStore.length} stores)
          </span>
        )}
      </div>

      {/* Store list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? '3px' : '4px' }}>
        {displayStores.map((store) => {
          const config = statusConfig[store.status];
          const isClickable = !!onStoreClick && store.status !== 'out-of-stock';
          
          return (
            <button
              key={store.storeName}
              onClick={() => isClickable && onStoreClick?.(store.storeName)}
              disabled={!isClickable}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                flexWrap: 'wrap',
                fontSize: compact ? '10px' : '11px',
                background: 'none',
                border: 'none',
                padding: 0,
                cursor: isClickable ? 'pointer' : 'default',
                color: store.status === 'out-of-stock' ? 'var(--moonlit-silver)' : 'var(--ironclad-grey)',
                fontFamily: "'Comfortaa', sans-serif",
                textAlign: 'left',
                width: '100%',
                textDecoration: store.status === 'out-of-stock' ? 'line-through' : 'none',
              }}
            >
              <span style={{
                width: compact ? '6px' : '8px',
                height: compact ? '6px' : '8px',
                borderRadius: '50%',
                display: 'inline-block',
                flexShrink: 0,
                background: config.color,
              }} />
              <MapPin size={compact ? 10 : 11} style={{ flexShrink: 0 }} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {store.storeName}
              </span>
              {store.status === 'low-stock' && (
                <span style={{ fontSize: compact ? '9px' : '10px', color: '#ff8800', whiteSpace: 'nowrap', fontWeight: 600 }}>
                  Low
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Expand/Collapse */}
      {storesWithStock.length > (compact ? 1 : 2) && !showAll && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            marginTop: compact ? '3px' : '4px',
            cursor: 'pointer',
            fontFamily: "'Comfortaa', sans-serif",
            fontSize: compact ? '10px' : '11px',
            color: 'var(--urban-fog)',
          }}
          aria-expanded={isExpanded}
        >
          {isExpanded ? 'Show less' : `+${remainingStores} more stores`}
        </button>
      )}

      {/* Low stock warning */}
      {storesLowStock.length > 0 && (
        <div style={{
          marginTop: compact ? '3px' : '4px',
          fontSize: compact ? '9px' : '10px',
          color: '#ff8800',
          display: 'flex',
          alignItems: 'center',
          gap: '3px',
        }}>
          <AlertTriangle size={compact ? 9 : 10} />
          <span>Low stock in {storesLowStock.length} store{storesLowStock.length > 1 ? 's' : ''}</span>
        </div>
      )}
    </div>
  );
};

export default StockInfo;