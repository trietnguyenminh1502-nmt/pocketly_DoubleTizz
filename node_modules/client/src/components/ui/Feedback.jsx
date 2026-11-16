import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../utils/cn';

export const Pagination = ({ currentPage = 1, totalPages = 1, onPageChange, className = '' }) => {
  if (totalPages <= 1) return null;

  return (
    <div className={cn('flex items-center justify-between gap-2 text-sm', className)}>
      <span className="text-xs text-ink-muted">
        Trang <strong className="text-ink-light dark:text-ink-dark">{currentPage}</strong> / {totalPages}
      </span>

      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="p-1.5 rounded-full border border-border-light dark:border-border-dark text-ink-light dark:text-ink-dark hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-40"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="p-1.5 rounded-full border border-border-light dark:border-border-dark text-ink-light dark:text-ink-dark hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-40"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export const ProgressBar = ({ progress = 0, color = 'primary', className = '' }) => {
  const clamped = Math.min(100, Math.max(0, progress));

  const colors = {
    primary: 'bg-primary dark:bg-lime',
    tangerine: 'bg-tangerine',
    coral: 'bg-coral',
    lime: 'bg-lime'
  };

  return (
    <div className={cn('w-full bg-border-light/60 dark:bg-border-dark rounded-full h-2.5 overflow-hidden', className)}>
      <div
        className={cn('h-full transition-all duration-300 rounded-full', colors[color] || colors.primary)}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
};

export const Avatar = ({ src, alt = '', fallback = 'U', size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-base'
  };

  return (
    <div
      className={cn(
        'rounded-full bg-sand dark:bg-surface-dark border border-border-light dark:border-border-dark flex items-center justify-center font-bold text-ink-light dark:text-ink-dark overflow-hidden shrink-0 shadow-soft',
        sizes[size],
        className
      )}
    >
      {src ? (
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      ) : (
        <span>{fallback.toUpperCase()}</span>
      )}
    </div>
  );
};

export const DatePicker = ({ label, value, onChange, error, className = '' }) => {
  return (
    <div className={cn('flex flex-col gap-1.5 w-full', className)}>
      {label && (
        <label className="text-xs font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-dark/70">
          {label}
        </label>
      )}
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-surface-light dark:bg-surface-dark text-ink-light dark:text-ink-dark border border-border-light dark:border-border-dark rounded-16 px-4 py-2.5 text-sm outline-none focus:border-primary dark:focus:border-lime"
      />
      {error && <span className="text-xs text-coral font-medium">{error}</span>}
    </div>
  );
};
