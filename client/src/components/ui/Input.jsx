import React from 'react';
import { cn } from '../../utils/cn';

export const Input = React.forwardRef(
  ({ label, error, helperText, icon: Icon, className = '', containerClassName = '', ...props }, ref) => {
    return (
      <div className={cn('flex flex-col gap-1.5 w-full', containerClassName)}>
        {label && (
          <label className="text-xs font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-dark/70">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {Icon && (
            <div className="absolute left-3.5 pointer-events-none text-ink-muted dark:text-ink-dark/50">
              <Icon className="w-4 h-4" />
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              'w-full bg-surface-light dark:bg-surface-dark text-ink-light dark:text-ink-dark border border-border-light dark:border-border-dark rounded-16 px-4 py-2.5 text-sm transition-all outline-none focus:border-primary dark:focus:border-lime focus:ring-2 focus:ring-primary/10 dark:focus:ring-lime/10 placeholder:text-ink-muted/50 disabled:opacity-50',
              Icon ? 'pl-10' : '',
              error ? 'border-coral focus:border-coral focus:ring-coral/10' : '',
              className
            )}
            {...props}
          />
        </div>
        {error && <span className="text-xs text-coral font-medium">{error}</span>}
        {!error && helperText && <span className="text-xs text-ink-muted">{helperText}</span>}
      </div>
    );
  }
);
Input.displayName = 'Input';

export const Select = React.forwardRef(
  ({ label, error, options = [], className = '', containerClassName = '', children, ...props }, ref) => {
    return (
      <div className={cn('flex flex-col gap-1.5 w-full', containerClassName)}>
        {label && (
          <label className="text-xs font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-dark/70">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={cn(
            'w-full bg-surface-light dark:bg-surface-dark text-ink-light dark:text-ink-dark border border-border-light dark:border-border-dark rounded-16 px-4 py-2.5 text-sm transition-all outline-none focus:border-primary dark:focus:border-lime focus:ring-2 focus:ring-primary/10 dark:focus:ring-lime/10',
            error ? 'border-coral' : '',
            className
          )}
          {...props}
        >
          {options.length > 0
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))
            : children}
        </select>
        {error && <span className="text-xs text-coral font-medium">{error}</span>}
      </div>
    );
  }
);
Select.displayName = 'Select';

export const Textarea = React.forwardRef(
  ({ label, error, helperText, className = '', containerClassName = '', rows = 3, ...props }, ref) => {
    return (
      <div className={cn('flex flex-col gap-1.5 w-full', containerClassName)}>
        {label && (
          <label className="text-xs font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-dark/70">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          rows={rows}
          className={cn(
            'w-full bg-surface-light dark:bg-surface-dark text-ink-light dark:text-ink-dark border border-border-light dark:border-border-dark rounded-16 px-4 py-2.5 text-sm transition-all outline-none focus:border-primary dark:focus:border-lime focus:ring-2 focus:ring-primary/10 dark:focus:ring-lime/10 placeholder:text-ink-muted/50 resize-y',
            error ? 'border-coral' : '',
            className
          )}
          {...props}
        />
        {error && <span className="text-xs text-coral font-medium">{error}</span>}
        {!error && helperText && <span className="text-xs text-ink-muted">{helperText}</span>}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';
