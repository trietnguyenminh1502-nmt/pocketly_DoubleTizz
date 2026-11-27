import React from 'react';
import { cn } from '@/utils/cn';
import { formatCurrency, formatVND } from '../../../../shared/formatters.js';

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

  const absoluteAmount = Math.abs(numericAmount);
  const formatted = currency === 'VND'
    ? formatVND(absoluteAmount)
    : formatCurrency(absoluteAmount, currency);

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
    <span className={cn('tabular-nums font-bold inline-flex items-baseline', colorClasses[type] || colorClasses.neutral, className)}>
      {sign}
      {formatted}
    </span>
  );
};
