// components/ui/Badge.tsx
'use client';

import React from 'react';
import { Sparkles, TrendingUp, Tag, Package, XCircle, type LucideIcon } from 'lucide-react';

type BadgeVariant = 'new' | 'trend' | 'promo' | 'stock' | 'sold';
type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
  variant: BadgeVariant;
  children?: React.ReactNode;
  icon?: boolean;
  size?: BadgeSize;
  className?: string;
  style?: React.CSSProperties;
  title?: string;
  ariaLabel?: string;
}

interface BadgeConfig {
  icon: LucideIcon;
  label: string;
  styles: React.CSSProperties;
}

const badgeConfigs: Record<BadgeVariant, BadgeConfig> = {
  new: {
    icon: Sparkles,
    label: 'New',
    styles: {
      background: 'var(--charcoal-noir)',
      color: 'var(--canvas)',
    },
  },
  trend: {
    icon: TrendingUp,
    label: 'Trending',
    styles: {
      background: 'var(--canvas)',
      color: 'var(--charcoal-noir)',
      border: '1.5px solid var(--charcoal-noir)',
    },
  },
  promo: {
    icon: Tag,
    label: 'Promo',
    styles: {
      background: 'var(--canvas)',
      color: 'var(--charcoal-noir)',
      border: '1.5px dashed var(--charcoal-noir)',
    },
  },
  stock: {
    icon: Package,
    label: 'In Stock',
    styles: {
      background: 'var(--canvas)',
      color: 'var(--ironclad-grey)',
      border: '1.5px solid var(--urban-fog)',
    },
  },
  sold: {
    icon: XCircle,
    label: 'Sold Out',
    styles: {
      background: 'var(--moonlit-silver)',
      color: 'var(--canvas)',
    },
  },
};

const sizeStyles: Record<BadgeSize, React.CSSProperties> = {
  sm: {
    fontSize: '10px',
    padding: '4px 10px',
    gap: '4px',
    height: '20px',
  },
  md: {
    fontSize: '11px',
    padding: '5px 12px',
    gap: '5px',
    height: '24px',
  },
  lg: {
    fontSize: '13px',
    padding: '6px 14px',
    gap: '6px',
    height: '28px',
  },
};

const iconSizes: Record<BadgeSize, number> = {
  sm: 10,
  md: 12,
  lg: 14,
};

const Badge: React.FC<BadgeProps> = ({ 
  variant, 
  children, 
  icon = true, 
  size = 'md',
  className = '',
  style,
  title,
  ariaLabel,
}) => {
  const config = badgeConfigs[variant];
  const IconComponent = config.icon;
  const label = children || config.label;

  return (
    <span
      className={`badge badge-${variant} ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 600,
        borderRadius: '999px',
        whiteSpace: 'nowrap',
        transition: 'all 0.2s ease-in-out',
        flexShrink: 0,
        verticalAlign: 'middle',
        boxSizing: 'border-box',
        ...config.styles,
        ...sizeStyles[size],
        ...style,
      }}
      title={title || (typeof label === 'string' ? label : undefined)}
      role="status"
      aria-label={ariaLabel || (typeof label === 'string' ? label : variant)}
    >
      {icon && (
        <IconComponent 
          size={iconSizes[size]} 
          aria-hidden="true"
          strokeWidth={2}
          style={{
            flexShrink: 0,
            display: 'block',
            lineHeight: 1,
            marginTop: '-1px', // Slight adjustment for optical alignment
          }}
        />
      )}
      <span style={{
        display: 'inline-block',
        lineHeight: 1,
        marginTop: '0px',
      }}>
        {label}
      </span>
    </span>
  );
};

// Export for use with other components
export type { BadgeVariant, BadgeSize };
export default Badge;