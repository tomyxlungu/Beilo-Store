// components/ui/BagSummary.tsx
'use client';

import React from 'react';
import { ShoppingBag, Trash2, Plus, Minus, Package, Store } from 'lucide-react';
import Button from './Button';

interface BagItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  size?: string;
  image?: string;
  store?: string;
}

interface BagSummaryProps {
  items: BagItem[];
  onCheckout?: () => void;
  onUpdateQuantity?: (itemId: string, newQuantity: number) => void;
  onRemoveItem?: (itemId: string) => void;
  showControls?: boolean;
  showImages?: boolean;
  compact?: boolean;
  className?: string;
  style?: React.CSSProperties;
  emptyMessage?: string;
}

const BagSummary: React.FC<BagSummaryProps> = ({ 
  items,
  onCheckout,
  onUpdateQuantity,
  onRemoveItem,
  showControls = false,
  showImages = false,
  compact = false,
  className = '',
  style,
  emptyMessage = 'Your bag is empty',
}) => {
  const subtotal = items.reduce((sum: number, item) => sum + item.price * item.quantity, 0);
  const itemCount = items.reduce((sum: number, item) => sum + item.quantity, 0);
  const uniqueItemCount = items.length;

  // Empty state
  if (items.length === 0) {
    return (
      <div className={`bag-summary bag-summary-empty ${className}`} style={{
        textAlign: 'center',
        padding: compact ? '24px 16px' : '40px 20px',
        ...style,
      }}>
        <ShoppingBag 
          size={compact ? 32 : 48} 
          style={{ 
            color: 'var(--moonlit-silver)', 
            marginBottom: compact ? '12px' : '16px',
          }} 
        />
        <p style={{ 
          fontSize: compact ? '13px' : '14px', 
          color: 'var(--ironclad-grey)', 
          marginBottom: compact ? '12px' : '16px',
        }}>
          {emptyMessage}
        </p>
        <Button variant="primary" size={compact ? 'sm' : 'md'}>
          Start Shopping
        </Button>
      </div>
    );
  }

  return (
    <div className={`bag-summary ${className}`} style={style}>
      {/* Items List */}
      <div style={{ 
        marginBottom: compact ? '12px' : '16px',
        maxHeight: compact ? '300px' : '400px',
        overflowY: 'auto',
      }}>
        {items.map((item) => (
          <div 
            key={item.id} 
            className="bag-row"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: compact ? '8px 0' : '12px 0',
              borderBottom: '1px solid var(--urban-fog)',
              fontSize: compact ? '12px' : '13px',
              gap: '12px',
            }}
          >
            {/* Item Image (optional) */}
            {showImages && item.image && (
              <div style={{
                width: compact ? '40px' : '50px',
                height: compact ? '40px' : '50px',
                borderRadius: '8px',
                background: 'var(--cloud-veil)',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
              }}>
                <Package size={compact ? 16 : 20} style={{ color: 'var(--urban-fog)' }} />
              </div>
            )}

            {/* Item Details */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ 
                fontWeight: 600,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                marginBottom: '2px',
              }}>
                {item.name}
              </div>
              <div style={{ 
                fontSize: compact ? '10px' : '11px', 
                color: 'var(--ironclad-grey)',
                display: 'flex',
                gap: '8px',
                flexWrap: 'wrap',
              }}>
                {item.size && <span>Size: {item.size}</span>}
                <span>K{item.price.toFixed(2)} each</span>
                {item.store && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                    <Store size={compact ? 9 : 10} />
                    {item.store}
                  </span>
                )}
              </div>
            </div>

            {/* Quantity Controls */}
            {showControls ? (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '6px',
                flexShrink: 0,
              }}>
                <button
                  type="button"
                  onClick={() => onUpdateQuantity?.(item.id, Math.max(1, item.quantity - 1))}
                  style={{
                    width: compact ? '24px' : '28px',
                    height: compact ? '24px' : '28px',
                    borderRadius: '50%',
                    border: '1.5px solid var(--urban-fog)',
                    background: 'var(--canvas)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: 'var(--charcoal-noir)',
                    padding: 0,
                  }}
                  aria-label={`Decrease quantity of ${item.name}`}
                >
                  <Minus size={compact ? 10 : 12} />
                </button>
                <span style={{ 
                  minWidth: '20px', 
                  textAlign: 'center',
                  fontWeight: 600,
                }}>
                  {item.quantity}
                </span>
                <button
                  type="button"
                  onClick={() => onUpdateQuantity?.(item.id, item.quantity + 1)}
                  style={{
                    width: compact ? '24px' : '28px',
                    height: compact ? '24px' : '28px',
                    borderRadius: '50%',
                    border: '1.5px solid var(--urban-fog)',
                    background: 'var(--canvas)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: 'var(--charcoal-noir)',
                    padding: 0,
                  }}
                  aria-label={`Increase quantity of ${item.name}`}
                >
                  <Plus size={compact ? 10 : 12} />
                </button>
              </div>
            ) : (
              <div style={{ 
                fontSize: compact ? '11px' : '12px',
                color: 'var(--ironclad-grey)',
                flexShrink: 0,
              }}>
                × {item.quantity}
              </div>
            )}

            {/* Item Total */}
            <div style={{ 
              fontWeight: 600, 
              whiteSpace: 'nowrap',
              fontSize: compact ? '12px' : '13px',
              minWidth: '60px',
              textAlign: 'right',
            }}>
              K{(item.price * item.quantity).toFixed(2)}
            </div>

            {/* Remove Button */}
            {onRemoveItem && (
              <button
                type="button"
                onClick={() => onRemoveItem(item.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--urban-fog)',
                  padding: '4px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.currentTarget.style.color = '#ff4444';
                  e.currentTarget.style.background = 'var(--cloud-veil)';
                }}
                onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.currentTarget.style.color = 'var(--urban-fog)';
                  e.currentTarget.style.background = 'none';
                }}
                aria-label={`Remove ${item.name} from bag`}
              >
                <Trash2 size={compact ? 12 : 14} />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Summary */}
      <div style={{
        borderTop: '2px solid var(--charcoal-noir)',
        paddingTop: compact ? '12px' : '16px',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '4px',
          fontSize: compact ? '11px' : '12px',
          color: 'var(--ironclad-grey)',
        }}>
          <span>Items ({uniqueItemCount} unique)</span>
          <span>{itemCount} total</span>
        </div>
        
        <div 
          className="bag-total"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: compact ? '15px' : '16px',
            fontWeight: 700,
            marginBottom: compact ? '12px' : '16px',
          }}
        >
          <span>Total</span>
          <span>K{subtotal.toFixed(2)}</span>
        </div>

        {/* Checkout Button */}
        {onCheckout && (
          <Button
            variant="primary"
            fullWidth
            size={compact ? 'sm' : 'md'}
            onClick={onCheckout}
            icon={<ShoppingBag size={compact ? 14 : 16} />}
            iconPosition="left"
          >
            Send My Order ({itemCount} {itemCount === 1 ? 'item' : 'items'})
          </Button>
        )}

        {/* Additional Info */}
        {onCheckout && (
          <p style={{
            fontSize: '10px',
            color: 'var(--urban-fog)',
            textAlign: 'center',
            marginTop: '8px',
          }}>
            You&apos;ll review your order before sending
          </p>
        )}
      </div>
    </div>
  );
};

// Export types
export type { BagItem, BagSummaryProps };
export default BagSummary;