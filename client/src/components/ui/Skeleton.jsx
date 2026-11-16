import React from 'react';
import { cn } from '../../utils/cn';

export const Skeleton = ({ className = '', ...props }) => {
  return (
    <div
      className={cn(
        'animate-pulse rounded-16 bg-border-light/70 dark:bg-border-dark',
        className
      )}
      {...props}
    />
  );
};

export const EmptyState = ({
  title = 'Chưa có dữ liệu nào',
  description = 'Bắt đầu thêm các giao dịch hoặc mục tiêu mới để theo dõi tài chính nhé!',
  action,
  className = ''
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center p-8 border border-dashed border-border-light dark:border-border-dark rounded-24 bg-surface-light/40 dark:bg-surface-dark/40',
        className
      )}
    >
      {/* Inline SVG Friendly Illustration (Cây mầm tài chính) */}
      <div className="w-20 h-20 mb-4 p-4 rounded-full bg-sand/50 dark:bg-surface-dark flex items-center justify-center text-primary dark:text-lime">
        <svg
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-12 h-12"
        >
          <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="2.5" strokeDasharray="4 4" />
          <path
            d="M32 44V24M32 24C32 24 24 16 18 20C12 24 20 32 32 24ZM32 28C32 28 40 20 46 24C52 28 44 36 32 28Z"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="32" cy="48" r="3" fill="#FF6A2B" />
        </svg>
      </div>

      <h4 className="text-base font-bold text-ink-light dark:text-ink-dark mb-1">{title}</h4>
      <p className="text-xs text-ink-muted max-w-sm mb-5">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
};
