// components/ui/Breadcrumb.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home, MoreHorizontal, type LucideIcon } from 'lucide-react';

interface CrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

interface BreadcrumbProps {
  items: CrumbItem[];
  showHome?: boolean;
  separator?: React.ReactNode;
  maxItems?: number;
  className?: string;
  style?: React.CSSProperties;
  onItemClick?: (item: CrumbItem) => void;
  ariaLabel?: string;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ 
  items,
  showHome = true,
  separator = <ChevronRight size={14} />,
  maxItems,
  className = '',
  style,
  onItemClick,
  ariaLabel = 'Breadcrumb',
}) => {
  const [isExpanded, setIsExpanded] = React.useState(false);

  // Handle max items logic
  let displayItems = items;
  let collapsedItems: CrumbItem[] = [];

  if (maxItems && items.length > maxItems && !isExpanded) {
    const visibleCount = maxItems - 1; // Reserve space for ellipsis
    displayItems = items.slice(-visibleCount);
    collapsedItems = items.slice(0, -visibleCount);
  }

  const handleItemClick = (item: CrumbItem) => {
    if (onItemClick && item.href) {
      onItemClick(item);
    }
  };

  const linkStyles: React.CSSProperties = {
    color: 'var(--ironclad-grey)',
    textDecoration: 'none',
    whiteSpace: 'nowrap',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    transition: 'color 0.2s ease',
    minHeight: '32px',
    fontSize: '13px',
    fontWeight: 500,
  };

  const currentStyles: React.CSSProperties = {
    color: 'var(--charcoal-noir)',
    fontWeight: 600,
    whiteSpace: 'nowrap',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    minHeight: '32px',
    fontSize: '13px',
  };

  return (
    <nav 
      className={`crumb ${className}`}
      aria-label={ariaLabel}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        fontSize: '13px',
        fontWeight: 500,
        color: 'var(--ironclad-grey)',
        flexWrap: 'wrap',
        marginBottom: '16px',
        ...style,
      }}
    >
      {/* Home Link */}
      {showHome && (
        <>
          <Link 
            href="/" 
            style={{ 
              ...linkStyles,
              color: 'var(--ironclad-grey)',
              minWidth: '32px',
              justifyContent: 'center',
            }}
            onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => {
              e.currentTarget.style.color = 'var(--charcoal-noir)';
            }}
            onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => {
              e.currentTarget.style.color = 'var(--ironclad-grey)';
            }}
            aria-label="Home"
          >
            <Home size={16} />
          </Link>
        </>
      )}

      {/* Collapsed Items (Ellipsis) */}
      {collapsedItems.length > 0 && (
        <>
          <span style={{ flexShrink: 0, color: 'var(--urban-fog)' }}>
            {separator}
          </span>
          <button
            type="button"
            onClick={() => setIsExpanded(true)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--ironclad-grey)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: '32px',
              minHeight: '32px',
              borderRadius: '50%',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.currentTarget.style.background = 'var(--cloud-veil)';
            }}
            onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.currentTarget.style.background = 'none';
            }}
            aria-label={`Show ${collapsedItems.length} more breadcrumbs`}
            title={`Show ${collapsedItems.length} more`}
          >
            <MoreHorizontal size={16} />
          </button>
        </>
      )}

      {/* Display Items */}
      {displayItems.map((item: CrumbItem, index: number) => {
        const isLast = index === displayItems.length - 1;
        
        return (
          <React.Fragment key={`${item.label}-${index}`}>
            <span style={{ flexShrink: 0, color: 'var(--urban-fog)' }}>
              {separator}
            </span>
            
            {item.href && !isLast ? (
              <Link 
                href={item.href}
                style={linkStyles}
                onClick={() => handleItemClick(item)}
                onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => {
                  e.currentTarget.style.color = 'var(--charcoal-noir)';
                }}
                onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => {
                  e.currentTarget.style.color = 'var(--ironclad-grey)';
                }}
              >
                {item.icon && <span style={{ display: 'inline-flex' }}>{item.icon}</span>}
                {item.label}
              </Link>
            ) : (
              <span 
                className="current"
                style={currentStyles}
                aria-current="page"
              >
                {item.icon && <span style={{ display: 'inline-flex' }}>{item.icon}</span>}
                {item.label}
              </span>
            )}
          </React.Fragment>
        );
      })}

      {/* Expand Button for Collapsed Items */}
      {isExpanded && collapsedItems.length > 0 && (
        <button
          type="button"
          onClick={() => setIsExpanded(false)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--ironclad-grey)',
            fontSize: '11px',
            textDecoration: 'underline',
            padding: '4px',
          }}
          aria-label="Show less breadcrumbs"
        >
          Show less
        </button>
      )}
    </nav>
  );
};

// Export types
export type { CrumbItem, BreadcrumbProps };
export default Breadcrumb;