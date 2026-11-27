import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ChartTooltip, StatCard } from '@/components/ui';
import { formatChartCount } from '@/utils/chartTheme';

describe('shared chart components', () => {
  it('formats tooltip currency with the shared VND formatter', () => {
    render(
      <ChartTooltip
        active
        label="Tháng này"
        payload={[{ name: 'Thu nhập', value: 3305000 }]}
      />
    );

    expect(screen.getByText('3.305.000 ₫')).toBeInTheDocument();
  });

  it('allows the statistic card to show localized counts without a currency suffix', () => {
    render(
      <StatCard
        label="Tổng người dùng"
        value={12500}
        valueFormatter={formatChartCount}
      />
    );

    expect(screen.getByText('12.500')).toBeInTheDocument();
    expect(screen.queryByText(/₫/)).not.toBeInTheDocument();
  });
});
