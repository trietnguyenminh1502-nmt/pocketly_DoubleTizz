import React from 'react';
import { cn } from '@/utils/cn';

const statusStyles = {
  safe: 'bg-success-bg text-success',
  warning: 'bg-warning-bg text-warning',
  danger: 'bg-danger-soft text-danger'
};

const defaultLabels = {
  safe: 'An toàn',
  warning: 'Cảnh báo',
  danger: 'Nguy hiểm'
};

export const StatusPill = ({ status = 'safe', children, className = '', ...props }) => {
  const normalizedStatus = statusStyles[status] ? status : 'safe';

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold',
        statusStyles[normalizedStatus],
        className
      )}
      {...props}
    >
      {children ?? defaultLabels[normalizedStatus]}
    </span>
  );
};
