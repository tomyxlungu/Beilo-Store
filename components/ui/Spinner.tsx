// components/ui/Spinner.tsx
'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

const Spinner: React.FC<SpinnerProps> = ({ 
  size = 'md', 
  color = 'var(--charcoal-noir)' 
}) => {
  const sizeMap: Record<string, number> = {
    sm: 16,
    md: 24,
    lg: 32,
  };

  return (
    <div 
      style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        minHeight: '44px',
      }}
      role="status"
      aria-label="Loading"
    >
      <Loader2
        size={sizeMap[size]}
        color={color}
        style={{ 
          animation: 'spin 1s linear infinite',
        }}
      />
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
      <span style={{ 
        position: 'absolute',
        width: '1px',
        height: '1px',
        padding: 0,
        margin: '-1px',
        overflow: 'hidden',
        clip: 'rect(0, 0, 0, 0)',
        whiteSpace: 'nowrap',
        border: 0,
      }}>
        Loading...
      </span>
    </div>
  );
};

export default Spinner;