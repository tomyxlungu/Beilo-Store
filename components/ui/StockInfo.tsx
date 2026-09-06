// components/ui/StockInfo.tsx
'use client';

import React from 'react';
import { MapPin, CheckCircle2, XCircle, Store } from 'lucide-react';
import type { StockLocation } from '../../types/product';

interface StockInfoProps {
  stockByStore?: StockLocation[];
  showAll?: boolean;
  compact?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onStoreClick?: (storeName: string) => void;
  ariaLabel?: string;
}

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

  // Filter stores with stock (quantity > 0 means in stock)
  const storesWithStock = stockByStore.filter(store => store.quantity > 0);
  const storesOutOfStock = stockByStore.filter(store => store.quantity === 0);

  // Determine display stores
  const displayStores = isExpanded 
    ? stockByStore 
    : storesWithStock.slice(0, compact ? 1 : 2);
  
  const remainingStores = storesWithStock.length - (compact ? 1 : 2);

  if (stockByStore.length === 0) {
    return null;
  }

  // If completely out of stock
  if (storesWithStock.length === 0) {
    return (
      <div 
        className={`stock-info stock-info-out ${className}`}
        style={{
          marginTop: compact ? '4px' : '8px',
          fontSize: compact ? '11px' : '12px',
          color: 'var(--ironclad-grey)',
          ...style,
        }}
        role="status"
        aria-label={ariaLabel}
      >
        <span style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          gap: '4px',
          flexWrap: 'wrap',
        }}>
          <XCircle size={compact ? 11 : 12} style={{ color: 'var(--moonlit-silver)' }} />
          <span style={{ fontWeight: 600 }}>Out of Stock</span>
        </span>
      </div>
    );
  }

  return (
    <div 
      className={`stock-info ${className}`}
      style={{
        marginTop: compact ? '4px' : '8px',
        fontSize: compact ? '11px' : '12px',
        color: 'var(--ironclad-grey)',
        ...style,
      }}
      role="status"
      aria-label={ariaLabel}
    >
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
          <span style={{ 
            fontSize: compact ? '10px' : '11px',
            color: 'var(--urban-fog)',
            fontWeight: 400,
          }}>
            ({storesWithStock.length} of {stockByStore.length} stores)
          </span>
        )}
      </div>

      {/* Store list */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: compact ? '3px' : '4px' 
      }}>
        {displayStores.map((store: StockLocation) => {
          const isInStock = store.quantity > 0;
          const isClickable = !!onStoreClick && isInStock;
          
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
                color: isInStock ? 'var(--ironclad-grey)' : 'var(--moonlit-silver)',
                fontFamily: "'Comfortaa', sans-serif",
                textAlign: 'left',
                width: '100%',
                transition: 'opacity 0.2s ease',
                textDecoration: isInStock ? 'none' : 'line-through',
              }}
              onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                if (isClickable) {
                  e.currentTarget.style.opacity = '0.7';
                }
              }}
              onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                if (isClickable) {
                  e.currentTarget.style.opacity = '1';
                }
              }}
            >
              {isInStock ? (
                <CheckCircle2 size={compact ? 10 : 11} style={{ color: '#00cc66', flexShrink: 0 }} />
              ) : (
                <XCircle size={compact ? 10 : 11} style={{ color: 'var(--moonlit-silver)', flexShrink: 0 }} />
              )}
              <MapPin size={compact ? 10 : 11} style={{ flexShrink: 0 }} />
              <span style={{ 
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {store.storeName}
              </span>
              {!isInStock && (
                <span style={{ 
                  fontSize: compact ? '9px' : '10px',
                  whiteSpace: 'nowrap',
                  fontWeight: 500,
                }}>
                  (Out)
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
            display: 'inline-flex',
            alignItems: 'center',
            gap: '2px',
            transition: 'color 0.2s ease',
          }}
          onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
            e.currentTarget.style.color = 'var(--charcoal-noir)';
          }}
          onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
            e.currentTarget.style.color = 'var(--urban-fog)';
          }}
          aria-expanded={isExpanded}
        >
          {isExpanded ? 'Show less' : `+${remainingStores} more stores`}
        </button>
      )}
    </div>
  );
};

// Export types
export type { StockInfoProps };
export default StockInfo;