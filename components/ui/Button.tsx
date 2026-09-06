// components/ui/Button.tsx
'use client';

import React from 'react';
import { Loader2, type LucideIcon } from 'lucide-react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'disabled';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
  loadingText?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  href?: string;
  as?: 'button' | 'a';
  className?: string;
  children: React.ReactNode;
  disabled?: boolean;
  onClick?: (e?: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => void;
  style?: React.CSSProperties;
  target?: string;
  rel?: string;
  type?: 'button' | 'submit' | 'reset';
  ariaLabel?: string;
  title?: string;
}

interface VariantStyles {
  base: React.CSSProperties;
  hover: React.CSSProperties;
  active: React.CSSProperties;
  disabled: React.CSSProperties;
}

const variantConfigs: Record<ButtonVariant, VariantStyles> = {
  primary: {
    base: {
      background: 'var(--charcoal-noir)',
      color: 'var(--canvas)',
      border: '1.5px solid var(--charcoal-noir)',
    },
    hover: {
      background: 'var(--ironclad-grey)',
      borderColor: 'var(--ironclad-grey)',
      boxShadow: '0 4px 12px rgba(43, 43, 43, 0.2)',
      transform: 'scale(0.98)',
    },
    active: {
      transform: 'scale(0.95)',
      boxShadow: '0 2px 6px rgba(43, 43, 43, 0.15)',
    },
    disabled: {
      background: 'var(--moonlit-silver)',
      color: 'var(--cloud-veil)',
      borderColor: 'var(--moonlit-silver)',
      cursor: 'not-allowed',
    },
  },
  secondary: {
    base: {
      background: 'transparent',
      color: 'var(--charcoal-noir)',
      border: '1.5px solid var(--charcoal-noir)',
    },
    hover: {
      background: 'var(--charcoal-noir)',
      color: 'var(--canvas)',
      transform: 'scale(0.98)',
    },
    active: {
      transform: 'scale(0.95)',
    },
    disabled: {
      background: 'transparent',
      color: 'var(--moonlit-silver)',
      borderColor: 'var(--moonlit-silver)',
      cursor: 'not-allowed',
    },
  },
  ghost: {
    base: {
      background: 'transparent',
      color: 'var(--ironclad-grey)',
      border: '1.5px solid transparent',
      paddingLeft: '6px',
      paddingRight: '6px',
    },
    hover: {
      color: 'var(--charcoal-noir)',
      background: 'var(--cloud-veil)',
      transform: 'scale(0.98)',
    },
    active: {
      transform: 'scale(0.95)',
    },
    disabled: {
      color: 'var(--moonlit-silver)',
      cursor: 'not-allowed',
    },
  },
  disabled: {
    base: {
      background: 'var(--moonlit-silver)',
      color: 'var(--cloud-veil)',
      border: '1.5px solid var(--moonlit-silver)',
      cursor: 'not-allowed',
    },
    hover: {},
    active: {},
    disabled: {},
  },
};

const sizeConfigs: Record<ButtonSize, React.CSSProperties> = {
  sm: {
    padding: '8px 16px',
    fontSize: '11px',
    minHeight: '32px',
    gap: '4px',
  },
  md: {
    padding: '10px 20px',
    fontSize: '13px',
    minHeight: '40px',
    gap: '6px',
  },
  lg: {
    padding: '14px 28px',
    fontSize: '15px',
    minHeight: '48px',
    gap: '8px',
  },
};

const iconSizes: Record<ButtonSize, number> = {
  sm: 12,
  md: 14,
  lg: 16,
};

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  loadingText = 'Loading...',
  icon,
  iconPosition = 'left',
  href,
  as = 'button',
  className = '',
  children,
  disabled = false,
  onClick,
  style = {},
  target,
  rel,
  type = 'button',
  ariaLabel,
  title,
}) => {
  const [isHovered, setIsHovered] = React.useState(false);
  const [isActive, setIsActive] = React.useState(false);

  const actualVariant = disabled ? 'disabled' : variant;
  const config = variantConfigs[actualVariant];

  const baseStyles: React.CSSProperties = {
    fontFamily: "'Comfortaa', sans-serif",
    fontWeight: 600,
    borderRadius: '30px',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    whiteSpace: 'nowrap',
    userSelect: 'none',
    outline: 'none',
    transition: 'all 0.2s ease-in-out',
    width: fullWidth ? '100%' : 'auto',
    textDecoration: 'none',
    pointerEvents: disabled || loading ? 'none' : 'auto',
    lineHeight: 1,
    letterSpacing: '0.02em',
    flexShrink: 0,
    verticalAlign: 'middle',
    boxSizing: 'border-box',
    opacity: disabled ? 0.6 : 1,
    position: 'relative',
  };

  const combinedStyles: React.CSSProperties = {
    ...baseStyles,
    ...config.base,
    ...sizeConfigs[size],
    ...(isHovered && !disabled && !loading ? config.hover : {}),
    ...(isActive && !disabled && !loading ? config.active : {}),
    ...(disabled || loading ? config.disabled : {}),
    ...style,
  };

  const content = (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: sizeConfigs[size].gap,
      lineHeight: 1,
    }}>
      {loading ? (
        <Loader2 
          size={iconSizes[size]} 
          className="animate-spin"
          aria-hidden="true"
          style={{ flexShrink: 0 }}
        />
      ) : (
        icon && iconPosition === 'left' && (
          <span style={{ 
            display: 'inline-flex', 
            alignItems: 'center',
            flexShrink: 0,
          }}>
            {icon}
          </span>
        )
      )}
      <span style={{
        display: 'inline-block',
        lineHeight: 1,
      }}>
        {loading ? loadingText : children}
      </span>
      {!loading && icon && iconPosition === 'right' && (
        <span style={{ 
          display: 'inline-flex', 
          alignItems: 'center',
          flexShrink: 0,
        }}>
          {icon}
        </span>
      )}
    </span>
  );

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    setIsActive(false);
  };
  const handleMouseDown = () => setIsActive(true);
  const handleMouseUp = () => setIsActive(false);

  const commonProps = {
    className: `button button-${actualVariant} button-${size} ${className}`,
    style: combinedStyles,
    onClick: onClick,
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
    onMouseDown: handleMouseDown,
    onMouseUp: handleMouseUp,
    'aria-label': ariaLabel || (typeof children === 'string' ? children : undefined),
    title,
  };

  if (href && as === 'a') {
    return (
      <a
        href={href}
        target={target}
        rel={rel}
        aria-disabled={disabled || loading}
        {...commonProps}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      type={type}
      disabled={disabled || loading}
      {...commonProps}
    >
      {content}
    </button>
  );
};

// Export types
export type { ButtonVariant, ButtonSize, ButtonProps };
export default Button;