import { describe, expect, it } from 'vitest';
import { formatDate, formatPercent, formatVND } from '../../../shared/formatters.js';

describe('shared locale formatters', () => {
  it('formats VND with a space before the currency symbol', () => {
    expect(formatVND(3305000)).toBe('3.305.000 ₫');
  });

  it('formats dates as day/month/year', () => {
    expect(formatDate(new Date(2026, 10, 27, 12))).toBe('27/11/2026');
  });

  it('formats percentages with a decimal comma', () => {
    expect(formatPercent(41.7)).toBe('41,7%');
  });
});
