import React from 'react';
import { cn } from '@/utils/cn';

export const PageHeader = ({ title, description, actions, className = '', ...props }) => {
  return (
    <header
      className={cn(
        'flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between',
        className
      )}
      {...props}
    >
      <div className="min-w-0">
        <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-primary">{title}</h1>
        {description && <p className="mt-1 text-sm text-secondary">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
};
