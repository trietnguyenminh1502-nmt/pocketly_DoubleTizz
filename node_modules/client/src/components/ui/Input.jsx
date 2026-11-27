import React, { useId } from 'react';
import { cn } from '@/utils/cn';

export const Input = React.forwardRef(
  ({ id, label, error, helperText, icon: Icon, className = '', containerClassName = '', ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || (label ? `input-${generatedId}` : undefined);

    return (
      <div className={cn('flex flex-col gap-1.5 w-full', containerClassName)}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-semibold uppercase tracking-wider text-secondary dark:text-primary/70"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {Icon && (
            <div className="absolute left-3.5 pointer-events-none text-secondary dark:text-ink-dark/50">
              <Icon className="w-4 h-4" />
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={cn(
              'w-full bg-surface text-primary border border-border rounded-16 px-4 py-2.5 text-sm transition-all outline-none focus:border-primary dark:focus:border-lime focus:ring-2 focus:ring-primary/10 dark:focus:ring-lime/10 placeholder:text-secondary/50 disabled:opacity-50',
              Icon ? 'pl-10' : '',
              error ? 'border-coral focus:border-coral focus:ring-coral/10' : '',
              className
            )}
            {...props}
          />
        </div>
        {error && <span className="text-xs text-coral font-medium">{error}</span>}
        {!error && helperText && <span className="text-xs text-secondary">{helperText}</span>}
      </div>
    );
  }
);
Input.displayName = 'Input';

export const Select = React.forwardRef(
  ({ id, label, error, options = [], className = '', containerClassName = '', children, ...props }, ref) => {
    const generatedId = useId();
    const selectId = id || (label ? `select-${generatedId}` : undefined);

    return (
      <div className={cn('flex flex-col gap-1.5 w-full', containerClassName)}>
        {label && (
          <label
            htmlFor={selectId}
            className="text-xs font-semibold uppercase tracking-wider text-secondary dark:text-primary/70"
          >
            {label}
          </label>
        )}
        <select
          id={selectId}
          ref={ref}
          className={cn(
            'w-full bg-surface text-primary border border-border rounded-16 px-4 py-2.5 text-sm transition-all outline-none focus:border-primary dark:focus:border-lime focus:ring-2 focus:ring-primary/10 dark:focus:ring-lime/10',
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
  ({ id, label, error, helperText, className = '', containerClassName = '', rows = 3, ...props }, ref) => {
    const generatedId = useId();
    const textareaId = id || (label ? `textarea-${generatedId}` : undefined);

    return (
      <div className={cn('flex flex-col gap-1.5 w-full', containerClassName)}>
        {label && (
          <label
            htmlFor={textareaId}
            className="text-xs font-semibold uppercase tracking-wider text-secondary dark:text-primary/70"
          >
            {label}
          </label>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          rows={rows}
          className={cn(
            'w-full bg-surface text-primary border border-border rounded-16 px-4 py-2.5 text-sm transition-all outline-none focus:border-primary dark:focus:border-lime focus:ring-2 focus:ring-primary/10 dark:focus:ring-lime/10 placeholder:text-secondary/50 resize-y',
            error ? 'border-coral' : '',
            className
          )}
          {...props}
        />
        {error && <span className="text-xs text-coral font-medium">{error}</span>}
        {!error && helperText && <span className="text-xs text-secondary">{helperText}</span>}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';
