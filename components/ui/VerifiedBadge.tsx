// components/ui/VerifiedBadge.tsx
'use client';

import React from 'react';
import { BadgeCheck, Star, Users, Store, Clock, Shield, Truck, type LucideIcon } from 'lucide-react';

type BadgeVariant = 'verified' | 'rating' | 'followers' | 'stores' | 'ready' | 'secure' | 'delivery';
type BadgeSize = 'sm' | 'md' | 'lg';

interface VerifiedBadgeProps {
  text: string;
  subtext?: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: React.ReactNode;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
  ariaLabel?: string;
  title?: string;
}

interface BadgeConfig {
  icon: LucideIcon;
  background: string;
  color: string;
  description: string;
}

const badgeConfigs: Record<BadgeVariant, BadgeConfig> = {
  verified: {
    icon: BadgeCheck,
    background: 'var(--charcoal-noir)',
    color: 'var(--canvas)',
    description: 'Verified',
  },
  rating: {
    icon: Star,
    background: '#FFD700',
    color: 'var(--charcoal-noir)',
    description: 'Rating',
  },
  followers: {
    icon: Users,
    background: 'var(--ironclad-grey)',
    color: 'var(--canvas)',
    description: 'Followers',
  },
  stores: {
    icon: Store,
    background: 'var(--charcoal-noir)',
    color: 'var(--canvas)',
    description: 'Store locations',
  },
  ready: {
    icon: Clock,
    background: 'var(--cloud-veil)',
    color: 'var(--charcoal-noir)',
    description: 'Ready time',
  },
  secure: {
    icon: Shield,
    background: '#00cc66',
    color: 'var(--canvas)',
    description: 'Secure',
  },
  delivery: {
    icon: Truck,
    background: 'var(--ironclad-grey)',
    color: 'var(--canvas)',
    description: 'Delivery',
  },
};

const sizeConfigs: Record<BadgeSize, {
  badgeSize: number;
  iconSize: number;
  titleSize: string;
  subtitleSize: string;
  gap: string;
}> = {
  sm: {
    badgeSize: 28,
    iconSize: 14,
    titleSize: '11px',
    subtitleSize: '10px',
    gap: '8px',
  },
  md: {
    badgeSize: 34,
    iconSize: 18,
    titleSize: '13px',
    subtitleSize: '12px',
    gap: '10px',
  },
  lg: {
    badgeSize: 44,
    iconSize: 22,
    titleSize: '15px',
    subtitleSize: '13px',
    gap: '12px',
  },
};

const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({ 
  text,
  subtext,
  variant = 'verified',
  size = 'md',
  icon,
  onClick,
  className = '',
  style,
  ariaLabel,
  title,
}) => {
  const config = badgeConfigs[variant];
  const IconComponent = config.icon;
  const sizeConfig = sizeConfigs[size];
  
  const accessibleLabel = ariaLabel || `${config.description}: ${text}${subtext ? ` - ${subtext}` : ''}`;

  const containerStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: sizeConfig.gap,
    minHeight: '44px',
    cursor: onClick ? 'pointer' : 'default',
    transition: 'all 0.2s ease-in-out',
    width: '100%',
    ...style,
  };

  const badgeStyles: React.CSSProperties = {
    width: `${sizeConfig.badgeSize}px`,
    height: `${sizeConfig.badgeSize}px`,
    borderRadius: '50%',
    background: config.background,
    color: config.color,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    flexShrink: 0,
    transition: 'all 0.2s ease-in-out',
    position: 'relative',
  };

  const content = (
    <>
      <div className="badge" style={badgeStyles}>
        {icon || <IconComponent size={sizeConfig.iconSize} />}
      </div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div 
          className="txt"
          style={{
            fontSize: sizeConfig.titleSize,
            fontWeight: 600,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            lineHeight: 1.2,
            marginBottom: subtext ? '2px' : 0,
          }}
        >
          {text}
        </div>
        {subtext && (
          <div 
            className="sub"
            style={{
              fontSize: sizeConfig.subtitleSize,
              fontWeight: 400,
              color: 'var(--ironclad-grey)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              lineHeight: 1.2,
            }}
          >
            {subtext}
          </div>
        )}
      </div>
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        className={`verified-badge verified-badge-${variant} verified-badge-${size} ${className}`}
        style={{
          ...containerStyles,
          background: 'none',
          border: 'none',
          padding: 0,
          textAlign: 'left',
          fontFamily: "'Comfortaa', sans-serif",
          color: 'var(--charcoal-noir)',
        }}
        onClick={onClick}
        aria-label={accessibleLabel}
        title={title || accessibleLabel}
      >
        {content}
      </button>
    );
  }

  return (
    <div 
      className={`verified-badge verified-badge-${variant} verified-badge-${size} ${className}`}
      style={containerStyles}
      role="status"
      aria-label={accessibleLabel}
      title={title || accessibleLabel}
    >
      {content}
    </div>
  );
};

// Export types
export type { BadgeVariant, BadgeSize, VerifiedBadgeProps };
export default VerifiedBadge;