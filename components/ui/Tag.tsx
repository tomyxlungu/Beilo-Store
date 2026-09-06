// components/ui/Tag.tsx
'use client';

import React from 'react';

type TagVariant = 'new' | 'trend' | 'promo' | 'stock' | 'sold';

interface TagProps {
  variant?: TagVariant;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const Tag: React.FC<TagProps> = ({ variant = 'new', children, className = '', style = {} }) => {
  const getVariantStyles = (): React.CSSProperties => {
    switch (variant) {
      case 'new':
        return {
          background: 'var(--charcoal-noir)',
          color: 'var(--canvas)',
        };
      case 'trend':
        return {
          background: 'var(--canvas)',
          color: 'var(--charcoal-noir)',
          border: '1.5px solid var(--charcoal-noir)',
        };
      case 'promo':
        return {
          background: 'var(--canvas)',
          color: 'var(--charcoal-noir)',
          border: '1.5px dashed var(--charcoal-noir)',
        };
      case 'stock':
        return {
          background: 'var(--canvas)',
          color: 'var(--ironclad-grey)',
          border: '1.5px solid var(--urban-fog)',
        };
      case 'sold':
        return {
          background: 'var(--moonlit-silver)',
          color: 'var(--canvas)',
        };
      default:
        return {};
    }
  };

  return (
    <span
      className={className}
      style={{
        fontSize: '12px',
        fontWeight: 600,
        padding: '7px 16px',
        borderRadius: '30px',
        display: 'inline-block',
        ...getVariantStyles(),
        ...style,
      }}
    >
      {children}
    </span>
  );
};

export default Tag;