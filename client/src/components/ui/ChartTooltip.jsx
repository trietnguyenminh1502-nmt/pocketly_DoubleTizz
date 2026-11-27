import React from 'react';
import { formatVND } from '../../../../shared/formatters.js';
import { chartTheme } from '@/utils/chartTheme';

export const ChartTooltip = ({
  active,
  payload,
  label,
  valueFormatter = formatVND
}) => {
  if (!active || !payload?.length) return null;

  return (
    <div className={chartTheme.tooltip.containerClassName}>
      {label !== undefined && label !== null && label !== '' && (
        <p className={chartTheme.tooltip.labelClassName}>{label}</p>
      )}
      {payload.map((entry, index) => {
        const color = entry.color || entry.fill || entry.payload?.fill;
        return (
          <p key={`${entry.dataKey || entry.name || 'value'}-${index}`} className={chartTheme.tooltip.itemClassName}>
            {color && (
              <span
                className={chartTheme.tooltip.markerClassName}
                style={{ backgroundColor: color }}
                aria-hidden="true"
              />
            )}
            <span className="font-semibold">{entry.name || entry.dataKey}:</span>
            <span className="font-bold tabular-nums">{valueFormatter(entry.value)}</span>
          </p>
        );
      })}
    </div>
  );
};
