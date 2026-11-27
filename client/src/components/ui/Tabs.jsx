import React from 'react';
import { cn } from '@/utils/cn';

export const Tabs = ({ tabs = [], activeTab, onChange, className = '' }) => {
  return (
    <div
      className={cn(
        'inline-flex p-1 bg-border-light/40 dark:bg-surface-dark border border-border rounded-full',
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              'px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-200 flex items-center gap-1.5',
              isActive
                ? 'bg-primary text-white shadow-soft dark:bg-lime dark:text-ink-light'
                : 'text-secondary hover:text-ink-light dark:hover:text-ink-dark'
            )}
          >
            {tab.icon && <tab.icon className="w-3.5 h-3.5" />}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};
