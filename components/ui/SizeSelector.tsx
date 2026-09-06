// components/ui/SizeSelector.tsx
'use client';

import React from 'react';
import { Check, Ruler } from 'lucide-react';

type SizeSelectorVariant = 'pill' | 'box';
type SizeSelectorSize = 'sm' | 'md' | 'lg';

interface SizeOption {
  value: string;
  label?: string;
  disabled?: boolean;
  stockCount?: number;
}

interface SizeSelectorProps {
  sizes: string[] | SizeOption[];
  selectedSize?: string;
  onSelect?: (size: string) => void;
  variant?: SizeSelectorVariant;
  size?: SizeSelectorSize;
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  disabled?: boolean;
  showSelected?: boolean;
  showStockCount?: boolean;
  className?: string;
  style?: React.CSSProperties;
  ariaLabel?: string;
}

const sizeConfigs: Record<SizeSelectorSize, React.CSSProperties> = {
  sm: {
    minWidth: '32px',
    height: '32px',
    fontSize: '11px',
    padding: '0 10px',
    gap: '6px',
  },
  md: {
    minWidth: '40px',
    height: '40px',
    fontSize: '12px',
    padding: '0 12px',
    gap: '8px',
  },
  lg: {
    minWidth: '48px',
    height: '48px',
    fontSize: '14px',
    padding: '0 16px',
    gap: '10px',
  },
};

const SizeSelector: React.FC<SizeSelectorProps> = ({ 
  sizes,
  selectedSize,
  onSelect,
  variant = 'pill',
  size = 'md',
  label = 'Select Size',
  error,
  hint,
  required = false,
  disabled = false,
  showSelected = true,
  showStockCount = false,
  className = '',
  style,
  ariaLabel,
}) => {
  const [internalSelected, setInternalSelected] = React.useState<string>('');
  const [focusedIndex, setFocusedIndex] = React.useState<number>(-1);

  // Use controlled or uncontrolled pattern
  const selected = selectedSize !== undefined ? selectedSize : internalSelected;

  // Normalize sizes to SizeOption[]
  const normalizedSizes: SizeOption[] = sizes.map(size => {
    if (typeof size === 'string') {
      return { value: size, label: size };
    }
    return size;
  });

  const handleSelect = (size: string) => {
    if (disabled) return;
    
    if (selectedSize === undefined) {
      // Uncontrolled mode
      setInternalSelected(size);
    }
    onSelect?.(size);
  };

  const handleKeyDown = (e: React.KeyboardEvent, size: string, index: number) => {
    if (disabled) return;
    
    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        handleSelect(size);
        break;
      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault();
        const nextIndex = (index + 1) % normalizedSizes.length;
        setFocusedIndex(nextIndex);
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault();
        const prevIndex = (index - 1 + normalizedSizes.length) % normalizedSizes.length;
        setFocusedIndex(prevIndex);
        break;
      default:
        break;
    }
  };

  const getButtonStyles = (sizeOption: SizeOption, isSelected: boolean): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      fontFamily: "'Comfortaa', sans-serif",
      cursor: disabled || sizeOption.disabled ? 'not-allowed' : 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 600,
      border: '1.5px solid var(--urban-fog)',
      color: 'var(--charcoal-noir)',
      background: 'var(--canvas)',
      transition: 'all 0.2s ease-in-out',
      flexShrink: 0,
      whiteSpace: 'nowrap',
      lineHeight: 1,
      opacity: sizeOption.disabled || disabled ? 0.5 : 1,
      boxSizing: 'border-box',
      position: 'relative',
      ...sizeConfigs[size],
    };

    if (variant === 'pill') {
      baseStyles.borderRadius = '50%';
    } else if (variant === 'box') {
      baseStyles.borderRadius = '8px';
    }

    if (isSelected) {
      baseStyles.background = 'var(--charcoal-noir)';
      baseStyles.color = 'var(--canvas)';
      baseStyles.borderColor = 'var(--charcoal-noir)';
      baseStyles.boxShadow = '0 2px 8px rgba(43, 43, 43, 0.2)';
    }

    return baseStyles;
  };

  return (
    <div 
      className={`size-selector size-selector-${variant} ${className}`}
      style={{
        width: '100%',
        ...style,
      }}
    >
      {label && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          marginBottom: '12px',
        }}>
          <Ruler size={14} style={{ color: 'var(--ironclad-grey)' }} />
          <span style={{
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--ironclad-grey)',
          }}>
            {label}
            {required && (
              <span style={{ color: '#ff4444', marginLeft: '2px' }} aria-hidden="true">*</span>
            )}
          </span>
        </div>
      )}
      
      <div 
        className="pill-row"
        role="radiogroup"
        aria-label={ariaLabel || label}
        aria-required={required}
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: sizeConfigs[size].gap || '8px',
        }}
      >
        {normalizedSizes.map((sizeOption, index) => {
          const isSelected = selected === sizeOption.value;
          const isDisabled = disabled || sizeOption.disabled;
          
          return (
            <button
              key={sizeOption.value}
              role="radio"
              aria-checked={isSelected}
              aria-label={`Size ${sizeOption.label}${sizeOption.stockCount !== undefined ? ` (${sizeOption.stockCount} available)` : ''}`}
              disabled={isDisabled}
              onClick={() => handleSelect(sizeOption.value)}
              onKeyDown={(e) => handleKeyDown(e, sizeOption.value, index)}
              tabIndex={isSelected ? 0 : -1}
              ref={(el) => {
                if (focusedIndex === index && el) {
                  el.focus();
                }
              }}
              style={getButtonStyles(sizeOption, isSelected)}
              onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                if (!isSelected && !isDisabled) {
                  e.currentTarget.style.borderColor = 'var(--charcoal-noir)';
                }
              }}
              onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                if (!isSelected && !isDisabled) {
                  e.currentTarget.style.borderColor = 'var(--urban-fog)';
                }
              }}
            >
              {isSelected && variant === 'box' && (
                <Check size={size === 'sm' ? 10 : size === 'md' ? 12 : 14} style={{ flexShrink: 0 }} />
              )}
              <span>{sizeOption.label}</span>
              {showStockCount && sizeOption.stockCount !== undefined && (
                <span style={{
                  fontSize: '10px',
                  opacity: 0.7,
                  marginLeft: '2px',
                }}>
                  ({sizeOption.stockCount})
                </span>
              )}
            </button>
          );
        })}
      </div>
      
      {error && (
        <div style={{
          marginTop: '8px',
          fontSize: '11px',
          color: '#ff4444',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
        }} role="alert">
          {error}
        </div>
      )}
      
      {hint && !error && (
        <div style={{
          marginTop: '8px',
          fontSize: '11px',
          color: 'var(--ironclad-grey)',
        }}>
          {hint}
        </div>
      )}
      
      {showSelected && selected && !error && (
        <div style={{ 
          marginTop: '8px', 
          fontSize: '12px', 
          color: 'var(--ironclad-grey)',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
        }}>
          <Check size={12} style={{ color: 'var(--charcoal-noir)' }} />
          Selected: <strong style={{ color: 'var(--charcoal-noir)' }}>{selected}</strong>
        </div>
      )}
    </div>
  );
};

// Export types
export type { SizeOption, SizeSelectorVariant, SizeSelectorSize };
export default SizeSelector;