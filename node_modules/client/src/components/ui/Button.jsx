import React from 'react';
import { cn } from '../../utils/cn';

/**
 * Reusable Button Component (Pill buttons, không dùng default blue)
 */
export const Button = ({
  children,
  variant = 'primary', // primary, secondary, outline, ghost, danger, lime
  size = 'md', // sm, md, lg
  className = '',
  disabled = false,
  isLoading = false,
  icon: Icon,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-full transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100';

  const variants = {
    primary: 'bg-primary hover:bg-primary-hover text-white shadow-soft dark:bg-lime dark:text-ink-light dark:hover:bg-lime-hover',
    secondary: 'bg-sand hover:bg-sand-light text-ink-light border border-border-light dark:bg-surface-dark dark:text-ink-dark dark:border-border-dark',
    outline: 'border border-border-light dark:border-border-dark text-ink-light dark:text-ink-dark hover:bg-black/5 dark:hover:bg-white/5',
    ghost: 'text-ink-light dark:text-ink-dark hover:bg-black/5 dark:hover:bg-white/5',
    danger: 'bg-coral text-white hover:bg-coral-dark shadow-soft',
    lime: 'bg-lime text-ink-light hover:bg-lime-hover shadow-soft'
  };

  const sizes = {
    sm: 'text-xs px-3.5 py-1.5 gap-1.5',
    md: 'text-sm px-5 py-2.5 gap-2',
    lg: 'text-base px-6 py-3 gap-2.5'
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : Icon ? (
        <Icon className="w-4 h-4 shrink-0" />
      ) : null}
      {children}
    </button>
  );
};
