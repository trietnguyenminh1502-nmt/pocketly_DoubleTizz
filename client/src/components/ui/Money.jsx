import React from 'react';
import { cn } from '@/utils/cn';

/**
 * Component hiển thị tiền tệ định dạng chuẩn Intl.NumberFormat
 * Type: income (xanh lá), expense (đỏ), neutral
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

  let sign = '';
  if (showSign) {
    if (type === 'expense') {
      sign = '-';
    } else if (type === 'income') {
      sign = '+';
    } else {
      sign = numericAmount > 0 ? '+' : numericAmount < 0 ? '-' : '';
    }
  } else if (numericAmount < 0) {
    sign = '-';
  }

  const colorClasses = {
    income: 'text-success dark:text-lime',
    expense: 'text-danger dark:text-danger-soft',
    neutral: 'text-primary'
  };

  return (
    <span className={cn('tabular-nums font-bold inline-flex items-baseline', colorClasses[type], className)}>
      {sign}
      {formatted}
    </span>
  );
};
