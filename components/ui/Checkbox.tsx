// components/ui/Checkbox.tsx
'use client';

import React, { forwardRef } from 'react';
import { Check, Minus } from 'lucide-react';

type CheckboxSize = 'sm' | 'md' | 'lg';
type CheckboxVariant = 'default' | 'filled' | 'outlined';

interface CheckboxProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  label?: React.ReactNode;
  disabled?: boolean;
  size?: CheckboxSize;
  variant?: CheckboxVariant;
  error?: string;
  hint?: string;
  required?: boolean;
  indeterminate?: boolean;
  className?: string;
  style?: React.CSSProperties;
  ariaLabel?: string;
  id?: string;
  name?: string;
}

const sizeConfigs: Record<CheckboxSize, React.CSSProperties> = {
  sm: {
    width: '16px',
    height: '16px',
    borderRadius: '4px',
    fontSize: '12px',
  },
  md: {
    width: '20px',
    height: '20px',
    borderRadius: '6px',
    fontSize: '13px',
  },
  lg: {
    width: '24px',
    height: '24px',
    borderRadius: '8px',
    fontSize: '14px',
  },
};

const iconSizes: Record<CheckboxSize, number> = {
  sm: 10,
  md: 12,
  lg: 14,
};

const variantConfigs: Record<CheckboxVariant, React.CSSProperties> = {
  default: {
    background: 'var(--canvas)',
    border: '1.5px solid var(--urban-fog)',
  },
  filled: {
    background: 'var(--cloud-veil)',
    border: '1.5px solid var(--urban-fog)',
  },
  outlined: {
    background: 'transparent',
    border: '2px solid var(--charcoal-noir)',
  },
};

const Checkbox = forwardRef<HTMLButtonElement, CheckboxProps>(({ 
  checked,
  defaultChecked = false,
  onChange,
  label,
  disabled = false,
  size = 'md',
  variant = 'default',
  error,
  hint,
  required = false,
  indeterminate = false,
  className = '',
  style,
  ariaLabel,
  id,
  name,
}, ref) => {
  const [isChecked, setIsChecked] = React.useState<boolean>(checked ?? defaultChecked);
  const [isFocused, setIsFocused] = React.useState<boolean>(false);
  const [isHovered, setIsHovered] = React.useState<boolean>(false);
  
  const generatedId = React.useId();
  const checkboxId = id || generatedId;

  // Sync with external checked prop
  React.useEffect(() => {
    if (checked !== undefined) {
      setIsChecked(checked);
    }
  }, [checked]);

  const handleToggle = () => {
    if (disabled) return;
    
    const newChecked = !isChecked;
    setIsChecked(newChecked);
    onChange?.(newChecked);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    
    switch (e.key) {
      case ' ':
      case 'Enter':
        e.preventDefault();
        handleToggle();
        break;
      default:
        break;
    }
  };

  const checkboxStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: disabled ? 'not-allowed' : 'pointer',
    flexShrink: 0,
    transition: 'all 0.2s ease-in-out',
    boxSizing: 'border-box',
    position: 'relative',
    ...sizeConfigs[size],
    ...variantConfigs[variant],
    ...(isChecked || indeterminate ? {
      background: 'var(--charcoal-noir)',
      borderColor: 'var(--charcoal-noir)',
      color: 'var(--canvas)',
    } : {}),
    ...(disabled ? {
      opacity: 0.5,
      cursor: 'not-allowed',
    } : {}),
    ...(isFocused ? {
      boxShadow: '0 0 0 2px var(--charcoal-noir)',
    } : {}),
    ...(isHovered && !disabled && !isChecked ? {
      borderColor: 'var(--charcoal-noir)',
    } : {}),
    ...(error ? {
      borderColor: '#ff4444',
      boxShadow: '0 0 0 2px rgba(255, 68, 68, 0.2)',
    } : {}),
  };

  const containerStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '12px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    minHeight: '44px',
    padding: '4px 0',
    userSelect: 'none',
    width: '100%',
    ...style,
  };

  return (
    <div className={`checkbox-container ${className}`} style={{ width: '100%' }}>
      <label
        htmlFor={checkboxId}
        className="check-item"
        style={containerStyles}
        onClick={(e) => {
          e.preventDefault();
          handleToggle();
        }}
      >
        <button
          ref={ref}
          id={checkboxId}
          role="checkbox"
          aria-checked={indeterminate ? 'mixed' : isChecked}
          aria-label={ariaLabel || (typeof label === 'string' ? label : undefined)}
          aria-required={required}
          disabled={disabled}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{
            ...checkboxStyles,
            border: 'none',
            padding: 0,
            outline: 'none',
          }}
          name={name}
        >
          {indeterminate ? (
            <Minus size={iconSizes[size]} strokeWidth={3} />
          ) : (
            isChecked && <Check size={iconSizes[size]} strokeWidth={3} />
          )}
        </button>

        {label && (
          <span style={{ 
            fontSize: sizeConfigs[size].fontSize,
            lineHeight: 1.2,
            color: disabled ? 'var(--moonlit-silver)' : 'var(--charcoal-noir)',
            flex: 1,
            minWidth: 0,
          }}>
            {label}
            {required && (
              <span style={{ color: '#ff4444', marginLeft: '2px' }} aria-hidden="true">*</span>
            )}
          </span>
        )}
      </label>

      {error && (
        <div style={{
          fontSize: '11px',
          color: '#ff4444',
          marginTop: '4px',
          marginLeft: '32px',
        }} role="alert">
          {error}
        </div>
      )}

      {hint && !error && (
        <div style={{
          fontSize: '11px',
          color: 'var(--ironclad-grey)',
          marginTop: '4px',
          marginLeft: '32px',
        }}>
          {hint}
        </div>
      )}
    </div>
  );
});

Checkbox.displayName = 'Checkbox';

// Export types
export type { CheckboxSize, CheckboxVariant, CheckboxProps };
export default Checkbox;