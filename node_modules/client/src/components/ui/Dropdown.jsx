import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/utils/cn';

export const Dropdown = ({ trigger, items = [], align = 'right', className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>

      {isOpen && (
        <div
          className={cn(
            'absolute z-30 mt-2 min-w-[160px] rounded-20 border border-border bg-surface p-1.5 shadow-modal animate-in fade-in zoom-in-95 duration-150',
            align === 'right' ? 'right-0' : 'left-0',
            className
          )}
        >
          {items.map((item, index) => (
            <button
              key={index}
              type="button"
              onClick={() => {
                item.onClick?.();
                setIsOpen(false);
              }}
              className={cn(
                'w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-16 transition-colors text-left',
                item.danger
                  ? 'text-coral hover:bg-coral/10'
                  : 'text-primary hover:bg-black/5 dark:hover:bg-white/5'
              )}
            >
              {item.icon && <item.icon className="w-4 h-4 shrink-0" />}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
