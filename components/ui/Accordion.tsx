// components/ui/Accordion.tsx
'use client';

import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

interface AccordionItem {
  question: string;
  answer: string;
}

interface AccordionProps {
  items: AccordionItem[];
  allowMultiple?: boolean;
}

const Accordion: React.FC<AccordionProps> = ({ items, allowMultiple = false }) => {
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    if (allowMultiple) {
      setOpenItems(prev =>
        prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
      );
    } else {
      setOpenItems(prev => (prev.includes(index) ? [] : [index]));
    }
  };

  return (
    <div>
      {items.map((item, index) => {
        const isOpen = openItems.includes(index);
        return (
          <div 
            key={index} 
            className="acc-item"
            style={{
              borderBottom: '1px solid var(--urban-fog)',
              padding: '16px 0',
            }}
          >
            <button
              className="acc-q"
              onClick={() => toggleItem(index)}
              style={{
                background: 'transparent',
                border: 'none',
                width: '100%',
                cursor: 'pointer',
                fontFamily: "'Comfortaa', sans-serif",
                color: 'var(--charcoal-noir)',
                padding: '8px 0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '12px',
                fontSize: '14px',
                fontWeight: 600,
                textAlign: 'left',
                minHeight: '44px',
              }}
            >
              <span style={{ flex: 1 }}>{item.question}</span>
              <span 
                className="acc-icon"
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  border: '1.5px solid var(--charcoal-noir)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '13px',
                  flexShrink: 0,
                }}
              >
                {isOpen ? <Minus size={12} /> : <Plus size={12} />}
              </span>
            </button>
            {isOpen && (
              <div 
                className="acc-a"
                style={{
                  fontSize: '13px',
                  fontWeight: 400,
                  color: 'var(--ironclad-grey)',
                  marginTop: '10px',
                  lineHeight: 1.5,
                  paddingRight: '36px',
                }}
              >
                {item.answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default Accordion;