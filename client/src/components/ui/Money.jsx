import React from 'react';
import { cn } from '@/utils/cn';

/**
 * Component hiển thị tiền tệ định dạng chuẩn Intl.NumberFormat
 * Type: income (xanh lá), expense (cam/san hô), neutral
 */
export const Money = ({
  amount = 0,
  currency = 'VND',
  type = 'neutral',
  showSign = false,
  className = ''
}) => {
  const numericAmount = Number(amount) || 0;

  const formatted = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: currency === 'VND' ? 0 : 2
  }).format(Math.abs(numericAmount));

  const sign = showSign && numericAmount > 0 ? '+' : showSign && numericAmount < 0 ? '-' : '';

  const colorClasses = {
    income: 'text-primary dark:text-lime',
    expense: 'text-tangerine dark:text-coral',
    neutral: 'text-ink-light dark:text-ink-dark'
  };

  return (
    <span className={cn('tabular-nums font-bold inline-flex items-baseline', colorClasses[type], className)}>
      {sign}
      {formatted}
    </span>
  );
};
