import React from 'react';
import { cn } from '@/utils/cn';
import { Card, CardHeader } from './Card';

export const ChartCard = ({
  title,
  description,
  actions,
  children,
  className = '',
  chartClassName = ''
}) => {
  return (
    <Card className={cn('min-w-0', className)}>
      <CardHeader title={title} subtitle={description} action={actions} />
      <div className={cn('min-w-0', chartClassName)}>{children}</div>
    </Card>
  );
};
