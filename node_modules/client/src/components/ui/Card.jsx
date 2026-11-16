import React from 'react';
import { cn } from '../../utils/cn';

export const Card = ({ children, className = '', hover = false, ...props }) => {
  return (
    <div
      className={cn(
        'bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-24 p-6 shadow-soft transition-all duration-200',
        hover ? 'hover:-translate-y-1 hover:shadow-card' : '',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ title, subtitle, action, className = '' }) => {
  return (
    <div className={cn('flex items-center justify-between pb-4 border-b border-border-light/60 dark:border-border-dark/60 mb-5', className)}>
      <div>
        <h3 className="text-lg font-bold text-ink-light dark:text-ink-dark">{title}</h3>
        {subtitle && <p className="text-xs text-ink-muted mt-0.5">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
};

export const Badge = ({ children, variant = 'neutral', className = '' }) => {
  const variants = {
    primary: 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-lime',
    tangerine: 'bg-tangerine/10 text-tangerine',
    lime: 'bg-lime/20 text-lime-dark dark:text-lime',
    coral: 'bg-coral/15 text-coral dark:text-coral',
    sand: 'bg-sand text-ink-light',
    neutral: 'bg-border-light/60 dark:bg-border-dark text-ink-muted dark:text-ink-dark/80'
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
};
