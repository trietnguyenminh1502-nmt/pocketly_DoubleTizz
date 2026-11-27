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
  labelClassName = '',
  value,
  currency = 'VND',
  valueType = 'neutral',
  valueFormatter,
  valueClassName = '',
  showSign = false,
  icon: Icon,
  iconClassName = '',
  comparison,
  comparisonClassName = '',
  trend = 'neutral',
  className = ''
}) => {
  const TrendIcon = trendIcons[trend] || trendIcons.neutral;
  const trendClassName = trendStyles[trend] || trendStyles.neutral;

  return (
    <Card className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between gap-2">
        <p className={cn('text-sm font-medium text-secondary', labelClassName)}>{label}</p>
        {Icon && (
          <div className={cn('shrink-0 rounded-full p-2', iconClassName)}>
            <Icon className="h-4 w-4" aria-hidden="true" />
          </div>
        )}
      </div>
      {valueFormatter ? (
        <div className={cn('text-2xl font-bold tabular-nums', valueClassName)}>
          {valueFormatter(value)}
        </div>
      ) : (
        <Money
          amount={value}
          currency={currency}
          type={valueType}
          showSign={showSign}
          className={cn('text-2xl', valueClassName)}
        />
      )}
      {comparison && (
        <div className={cn('flex items-center gap-1.5 text-xs font-medium', trendClassName, comparisonClassName)}>
          <TrendIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{comparison}</span>
        </div>
      )}
    </Card>
  );
};
