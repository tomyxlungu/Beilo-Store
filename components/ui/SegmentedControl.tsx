// components/ui/SegmentedControl.tsx
'use client';

import React from 'react';

interface SegmentedOption {
  label: string;
  value: string;
}

interface SegmentedControlProps {
  options: SegmentedOption[];
  value: string;
  onChange: (value: string) => void;
}

const SegmentedControl: React.FC<SegmentedControlProps> = ({ 
  options, 
  value, 
  onChange 
}) => {
  return (
    <div 
      className="segment"
      style={{
        maxWidth: '100%',
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
      }}
    >
      <style>{`
        .segment::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      {options.map(option => (
        <button
          key={option.value}
          className={`opt ${value === option.value ? 'active' : ''}`}
          onClick={() => onChange(option.value)}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'var(--font-family-base)',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};

export default SegmentedControl;