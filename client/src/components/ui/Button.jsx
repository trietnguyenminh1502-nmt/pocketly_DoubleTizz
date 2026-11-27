import React from 'react';
import { cn } from '@/utils/cn';

/**
 * Reusable Button Component (Pill buttons, không dùng default blue)
 */
export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  isLoading = false,
  icon: Icon,
  leftIcon,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-full transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100';

  const variants = {
    primary: 'bg-primary hover:bg-primary-hover text-white shadow-soft dark:bg-lime dark:text-ink-light dark:hover:bg-lime-hover',
    secondary: 'border border-border bg-transparent text-primary hover:bg-primary/5 dark:border-border-dark dark:text-ink-dark dark:hover:bg-white/5',
    outline: 'border border-border bg-transparent text-primary hover:bg-primary/5 dark:border-border-dark dark:text-ink-dark dark:hover:bg-white/5',
    ghost: 'text-primary hover:bg-black/5 dark:hover:bg-white/5',
    danger: 'bg-coral text-white hover:bg-coral-dark shadow-soft',
    lime: 'bg-lime text-ink-light hover:bg-lime-hover shadow-soft',
    auth: 'bg-auth-accent text-auth-ink hover:brightness-105 shadow-auth-button hover:shadow-auth-button-hover'
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
      ) : leftIcon ? (
        leftIcon
      ) : null}
      {children}
    </button>
  );
};
