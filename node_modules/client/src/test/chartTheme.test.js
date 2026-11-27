import { describe, expect, it } from 'vitest';
import { getCategoryColorInfo } from '@/utils/chartTheme';

describe('shared chart theme', () => {
  it('uses the saved category palette color consistently for chart and transaction data', () => {
    const reportCategory = {
      categoryId: 'category-1',
      name: 'Ăn uống',
      color: '#FF6A2B'
    };
    const transactionCategory = {
      id: 'category-1',
      name: 'Ăn uống',
      color: '#FF6A2B'
    };

    expect(getCategoryColorInfo(reportCategory).color)
      .toBe(getCategoryColorInfo(transactionCategory).color);
  });

  it('uses a stable fallback color for the same category regardless of list order', () => {
    const first = getCategoryColorInfo({ id: 'custom-1', name: 'Khác' }, 0);
    const later = getCategoryColorInfo({ id: 'custom-1', name: 'Khác' }, 4);

    expect(first.color).toBe(later.color);
  });

  it('uses the shared named palette when category data has no saved color', () => {
    expect(getCategoryColorInfo({ name: 'Tiền thuê trọ' }).key).toBe('blue');
  });
});
