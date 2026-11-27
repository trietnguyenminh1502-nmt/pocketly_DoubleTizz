import React from 'react';
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Card } from './Card';
import { Money } from './Money';

const trendIcons = {
  up: ArrowUpRight,
  down: ArrowDownRight,
  neutral: Minus
};

const trendStyles = {
  up: 'text-success',
  down: 'text-danger',
  neutral: 'text-secondary'
};

export const StatCard = ({
  label,
  value,
  currency = 'VND',
  valueType = 'neutral',
  comparison,
  trend = 'neutral',
  className = ''
}) => {
  const TrendIcon = trendIcons[trend] || trendIcons.neutral;
  const trendClassName = trendStyles[trend] || trendStyles.neutral;

  return (
    <Card className={cn('space-y-3', className)}>
      <p className="text-sm font-medium text-secondary">{label}</p>
      <Money amount={value} currency={currency} type={valueType} className="text-2xl" />
      {comparison && (
        <div className={cn('flex items-center gap-1.5 text-xs font-medium', trendClassName)}>
          <TrendIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{comparison}</span>
        </div>
      )}
    </Card>
  );
};
