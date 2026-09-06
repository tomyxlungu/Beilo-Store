// components/ui/ProductCard.tsx
'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ShoppingBag, Heart, Eye, Check } from 'lucide-react';
import Button from './Button';
import Badge from './Badge';
import StockInfo from './StockInfo';
import type { Product } from '../../types/product';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  onSaveForLater?: (product: Product) => void;
  onQuickView?: (product: Product) => void;
  onProductClick?: (product: Product) => void;
  showActions?: boolean;
  showStockInfo?: boolean;
  showBadges?: boolean;
  showQuickView?: boolean;
  compact?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onAddToCart,
  onSaveForLater,
  onQuickView,
  onProductClick,
  showActions = true,
  showStockInfo = true,
  showBadges = true,
  showQuickView = false,
  compact = false,
  className = '',
  style,
}) => {
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [isAdded, setIsAdded] = useState<boolean>(false);
  const [imageError, setImageError] = useState<boolean>(false);

  const totalStock = product.stockByStore?.reduce(
    (sum: number, store: { quantity: number }) => sum + store.quantity, 
    0
  ) ?? 0;
  
  const isOutOfStock = totalStock === 0;

  const handleAddToCart = () => {
    onAddToCart?.(product);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleSaveForLater = () => {
    setIsSaved(!isSaved);
    onSaveForLater?.(product);
  };

  const handleQuickView = () => {
    onQuickView?.(product);
  };

  const handleProductClick = () => {
    onProductClick?.(product);
  };

  return (
    <div 
      className={`cell product-card ${className}`}
      style={{ 
        position: 'relative', 
        transition: 'all 0.2s ease-in-out',
        width: '100%',
        cursor: onProductClick ? 'pointer' : 'default',
        ...(isHovered && {
          boxShadow: '0 8px 24px rgba(43, 43, 43, 0.12)',
          transform: 'translateY(-4px)',
        }),
        ...style,
      }}
      onClick={handleProductClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role={onProductClick ? 'button' : undefined}
      tabIndex={onProductClick ? 0 : undefined}
      onKeyDown={(e: React.KeyboardEvent) => {
        if (onProductClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          handleProductClick();
        }
      }}
    >
      {/* Badges */}
      {showBadges && (
        <div style={{ 
          position: 'absolute', 
          top: compact ? '6px' : '8px', 
          left: compact ? '6px' : '8px', 
          zIndex: 1, 
          display: 'flex', 
          gap: '4px',
          flexWrap: 'wrap',
          pointerEvents: 'none',
        }}>
          {product.isNew && <Badge variant="new" size={compact ? 'sm' : 'md'} />}
          {product.isTrending && <Badge variant="trend" size={compact ? 'sm' : 'md'} />}
          {isOutOfStock && <Badge variant="sold" size={compact ? 'sm' : 'md'} />}
        </div>
      )}

      {/* Quick View Button */}
      {showQuickView && !isOutOfStock && (
        <button
          type="button"
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation();
            handleQuickView();
          }}
          style={{
            position: 'absolute',
            top: compact ? '6px' : '8px',
            right: compact ? '6px' : '8px',
            zIndex: 1,
            width: compact ? '28px' : '32px',
            height: compact ? '28px' : '32px',
            borderRadius: '50%',
            background: 'var(--canvas)',
            border: '1.5px solid var(--urban-fog)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            opacity: isHovered ? 1 : 0.8,
            transition: 'all 0.2s ease',
            color: 'var(--charcoal-noir)',
          }}
          aria-label={`Quick view ${product.name}`}
        >
          <Eye size={compact ? 13 : 14} />
        </button>
      )}

      {/* Product Image */}
      <div 
        className="cell-photo" 
        style={{ 
          height: compact ? '120px' : '180px',
          position: 'relative',
          background: imageError ? 'var(--cloud-veil)' : undefined,
        }}
      >
        {product.images?.[0] && !imageError ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            style={{ 
              objectFit: 'cover',
              ...(isOutOfStock && { filter: 'grayscale(0.5)' }),
            }}
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
            onError={() => setImageError(true)}
          />
        ) : (
          <span style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: 'var(--ironclad-grey)',
            fontSize: compact ? '11px' : '12px',
          }}>
            {isOutOfStock ? 'Product Image' : 'No Image'}
          </span>
        )}
        
        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(255, 255, 255, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Badge variant="sold" size={compact ? 'sm' : 'md'} />
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="cell-body" style={{ padding: compact ? '10px' : '16px' }}>
        <div 
          className="pname" 
          style={{ 
            fontSize: compact ? '12px' : '14px',
            fontWeight: 600, 
            marginBottom: '4px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {product.name}
        </div>
        <div className="pmeta">
          <span style={{ fontSize: compact ? '11px' : '12px' }}>{product.category}</span>
          <span className="price" style={{ fontSize: compact ? '13px' : '14px' }}>
            K{product.price.toFixed(2)}
          </span>
        </div>

        {/* Stock Info */}
        {showStockInfo && !isOutOfStock && (
          <StockInfo 
            stockByStore={product.stockByStore} 
            compact={compact}
          />
        )}

        {/* Actions */}
        {showActions && (
          <div style={{ 
            marginTop: compact ? '8px' : '12px', 
            display: 'flex', 
            gap: '8px',
            flexDirection: compact ? 'row' : 'column',
          }}>
            <Button
              variant={isOutOfStock ? 'disabled' : 'primary'}
              size="sm"
              fullWidth
              disabled={isOutOfStock}
              onClick={handleAddToCart}
              icon={isAdded ? <Check size={14} /> : <ShoppingBag size={14} />}
              iconPosition="left"
            >
              {isAdded ? 'Added!' : isOutOfStock ? 'Sold Out' : 'Add to Bag'}
            </Button>
            
            <Button
              variant={isSaved ? 'primary' : 'secondary'}
              size="sm"
              onClick={handleSaveForLater}
              icon={<Heart size={14} fill={isSaved ? 'currentColor' : 'none'} />}
              aria-label={isSaved ? 'Remove from saved' : 'Save for later'}
            >
              {compact ? '' : isSaved ? 'Saved' : 'Save'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

// Export types
export type { ProductCardProps };
export default ProductCard;