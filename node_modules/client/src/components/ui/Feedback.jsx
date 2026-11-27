import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/utils/cn';

// Chuyển đổi đường dẫn ảnh đại diện thành URL tuyệt đối trỏ tới backend server
const resolveAvatarUrl = (src) => {
  if (!src) return null;
  if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('blob:') || src.startsWith('data:')) {
    return src;
  }
  const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';
  const serverOrigin = apiBase.replace(/\/api\/v1\/?$/, '');
  const cleanPath = src.startsWith('/') ? src : `/${src}`;
  return `${serverOrigin}${cleanPath}`;
};

export const Pagination = ({ currentPage = 1, totalPages = 1, onPageChange, className = '' }) => {
  if (totalPages <= 1) return null;

  return (
    <div className={cn('flex items-center justify-between gap-2 text-sm', className)}>
      <span className="text-xs text-secondary">
        Trang <strong className="text-primary">{currentPage}</strong> / {totalPages}
      </span>

      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="p-1.5 rounded-full border border-border text-primary hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-40"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="p-1.5 rounded-full border border-border text-primary hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-40"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export const ProgressBar = ({
  progress = 0,
  color = 'auto',
  threshold = 80,
  showThreshold,
  label = 'Tiến độ',
  className = ''
}) => {
  const numericProgress = Number(progress);
  const safeProgress = Number.isFinite(numericProgress) ? numericProgress : 0;
  const clamped = Math.min(100, Math.max(0, safeProgress));
  const numericThreshold = Number(threshold);
  const thresholdPosition = Number.isFinite(numericThreshold)
    ? Math.min(100, Math.max(0, numericThreshold))
    : 80;
  const automaticColor = safeProgress > 100
    ? 'danger'
    : safeProgress >= thresholdPosition
      ? 'warning'
      : 'safe';
  const selectedColor = color === 'auto' ? automaticColor : color;

  const colors = {
    safe: 'bg-success',
    warning: 'bg-warning',
    danger: 'bg-danger',
    primary: 'bg-primary dark:bg-lime',
    tangerine: 'bg-tangerine',
    coral: 'bg-coral',
    lime: 'bg-lime'
  };
  const markerIsVisible = showThreshold ?? color === 'auto';

  return (
    <div
      className={cn('relative w-full', className)}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={clamped}
    >
      <div className="w-full bg-border/60 rounded-full h-2.5 overflow-hidden">
        <div
          className={cn('h-full transition-all duration-300 rounded-full', colors[selectedColor] || colors[automaticColor])}
          style={{ width: `${clamped}%` }}
        />
      </div>
      {markerIsVisible && (
        <span
          aria-hidden="true"
          className="absolute top-[-2px] bottom-[-2px] z-10 w-0.5 -translate-x-1/2 rounded-full bg-white shadow-sm dark:bg-ink-light"
          style={{ left: `${thresholdPosition}%` }}
        />
      )}
    </div>
  );
};

export const Avatar = ({ src, alt = '', fallback = 'U', size = 'md', className = '' }) => {
  const [imgError, setImgError] = useState(false);
  const resolvedSrc = resolveAvatarUrl(src);

  useEffect(() => {
    setImgError(false);
  }, [src]);

  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-base'
  };

  const fallbackChar = (fallback || 'U').charAt(0).toUpperCase();

  return (
    <div
      className={cn(
        'rounded-full bg-sand dark:bg-surface-dark border border-border flex items-center justify-center font-bold text-primary overflow-hidden shrink-0 shadow-soft',
        sizes[size],
        className
      )}
    >
      {resolvedSrc && !imgError ? (
        <img
          src={resolvedSrc}
          alt={alt}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        <span>{fallbackChar}</span>
      )}
    </div>
  );
};

export const DatePicker = ({ label, value, onChange, error, className = '' }) => {
  return (
    <div className={cn('flex flex-col gap-1.5 w-full', className)}>
      {label && (
        <label className="text-xs font-semibold uppercase tracking-wider text-secondary dark:text-primary/70">
          {label}
        </label>
      )}
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-surface text-primary border border-border rounded-16 px-4 py-2.5 text-sm outline-none focus:border-primary dark:focus:border-lime"
      />
      {error && <span className="text-xs text-coral font-medium">{error}</span>}
    </div>
  );
};
