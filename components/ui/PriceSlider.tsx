// components/ui/PriceSlider.tsx
'use client';

import React, { useState } from 'react';

interface PriceSliderProps {
  min?: number;
  max?: number;
  onChange?: (value: number) => void;
}

const PriceSlider: React.FC<PriceSliderProps> = ({ 
  min = 0, 
  max = 1000, 
  onChange 
}) => {
  const [value, setValue] = useState<number>(max * 0.38);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(e.target.value);
    setValue(newValue);
    onChange?.(newValue);
  };

  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="slider-wrap" style={{ width: '100%' }}>
      <div 
        className="slider-track"
        style={{
          height: '4px',
          background: 'var(--urban-fog)',
          borderRadius: '4px',
          position: 'relative',
          margin: '22px 0 12px',
        }}
      >
        <div 
          className="slider-fill" 
          style={{ 
            position: 'absolute',
            left: 0,
            top: 0,
            height: '100%',
            background: 'var(--charcoal-noir)',
            borderRadius: '4px',
            width: `${percentage}%`,
          }} 
        />
        <div 
          className="slider-thumb" 
          style={{ 
            position: 'absolute',
            top: '50%',
            left: `${percentage}%`,
            width: '24px', // Larger touch target
            height: '24px',
            background: 'var(--charcoal-noir)',
            border: '3px solid var(--canvas)',
            borderRadius: '50%',
            transform: 'translate(-50%, -50%)',
            boxShadow: '0 0 0 1.5px var(--charcoal-noir)',
            pointerEvents: 'none',
          }} 
        />
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={handleChange}
          style={{
            position: 'absolute',
            width: '100%',
            height: '44px', // Larger touch area
            top: '50%',
            left: 0,
            transform: 'translateY(-50%)',
            opacity: 0,
            cursor: 'pointer',
            margin: 0,
          }}
        />
      </div>
      <div 
        className="slider-labels"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '12px',
          fontWeight: 600,
          color: 'var(--ironclad-grey)',
        }}
      >
        <span>K{min}</span>
        <span style={{ color: 'var(--charcoal-noir)' }}>K{value}</span>
        <span>K{max}</span>
      </div>
    </div>
  );
};

export default PriceSlider;