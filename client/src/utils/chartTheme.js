const categoryPalette = [
  {
    key: 'tangerine',
    value: '#FF6A2B',
    color: 'rgb(var(--color-chart-category-tangerine))'
  },
  {
    key: 'blue',
    value: '#3B82F6',
    color: 'rgb(var(--color-chart-category-blue))'
  },
  {
    key: 'purple',
    value: '#8B5CF6',
    color: 'rgb(var(--color-chart-category-purple))'
  },
  {
    key: 'cyan',
    value: '#06B6D4',
    color: 'rgb(var(--color-chart-category-cyan))'
  },
  {
    key: 'emerald',
    value: '#10B981',
    color: 'rgb(var(--color-chart-category-emerald))'
  },
  {
    key: 'amber',
    value: '#F59E0B',
    color: 'rgb(var(--color-chart-category-amber))'
  },
  {
    key: 'pink',
    value: '#EC4899',
    color: 'rgb(var(--color-chart-category-pink))'
  },
  {
    key: 'forest',
    value: '#123D2F',
    color: 'rgb(var(--color-chart-category-forest))'
  },
  {
    key: 'lime',
    value: '#D4F05A',
    color: 'rgb(var(--color-chart-category-lime))'
  },
  {
    key: 'teal',
    value: '#14B8A6',
    color: 'rgb(var(--color-chart-category-teal))'
  },
  {
    key: 'coral',
    value: '#E57373',
    color: 'rgb(var(--color-chart-category-coral))'
  },
  {
    key: 'slate',
    value: '#64748B',
    color: 'rgb(var(--color-chart-category-slate))'
  },
  {
    key: 'orange',
    value: '#F97316',
    color: 'rgb(var(--color-chart-category-orange))'
  },
  {
    key: 'indigo',
    value: '#6366F1',
    color: 'rgb(var(--color-chart-category-indigo))'
  }
].map((category) => ({
  ...category,
  className: `bg-chart-category-${category.key}`,
  softClassName: `bg-chart-category-${category.key}/15`,
  textClassName: `text-chart-category-${category.key}`
}));

const chartCategoryByName = {
  'tiền thuê trọ': 'blue',
  'mua sắm cá nhân': 'purple',
  'ăn uống': 'orange',
  'di chuyển': 'cyan',
  'học tập & giáo trình': 'emerald',
  'giải trí & phim ảnh': 'amber',
  'sức khỏe & y tế': 'pink',
  'du lịch': 'teal'
};

const fallbackPalette = ['blue', 'purple', 'orange', 'cyan', 'emerald', 'amber', 'pink', 'teal', 'indigo']
  .map((key) => categoryPalette.find((category) => category.key === key));

export const CATEGORY_COLOR_OPTIONS = categoryPalette.slice(0, 12);

export const chartTheme = {
  colors: {
    primary: 'rgb(var(--color-chart-primary))',
    expense: 'rgb(var(--color-chart-expense))',
    danger: 'rgb(var(--color-coral))',
    warning: 'rgb(var(--color-tangerine))',
    accent: 'rgb(var(--color-accent))'
  },
  axis: {
    xTick: { fontSize: 11, fill: 'rgb(var(--color-chart-secondary))' },
    yTick: { fontSize: 10, fill: 'rgb(var(--color-chart-secondary))' },
    tickLine: false,
    axisLine: false
  },
  grid: {
    strokeDasharray: '3 3',
    vertical: false,
    stroke: 'rgb(var(--color-chart-border))',
    opacity: 0.5
  },
  legend: {
    wrapperStyle: { fontSize: 11, paddingBottom: 10 }
  },
  tooltip: {
    containerClassName: 'bg-surface border border-border p-3 rounded-16 shadow-modal text-xs',
    labelClassName: 'font-bold text-primary mb-1',
    itemClassName: 'flex items-center gap-2',
    markerClassName: 'w-2 h-2 rounded-full shrink-0'
  },
  categoryPalette,
  chartCategoryByName
};

export const getCategoryColorInfo = (category, fallbackIndex = 0) => {
  const rawColor = category?.color;
  const selectedColor = typeof rawColor === 'string'
    ? categoryPalette.find((item) => item.value.toLowerCase() === rawColor.toLowerCase())
    : undefined;
  const name = typeof category?.name === 'string' ? category.name.trim().toLowerCase() : '';
  const namedColorKey = chartCategoryByName[name];
  const namedColor = categoryPalette.find((item) => item.key === namedColorKey);
  const identity = category?.categoryId ?? category?.id ?? name;
  const stableKey = identity ? String(identity) : String(fallbackIndex);
  const hash = Array.from(stableKey).reduce((total, character) => total + character.charCodeAt(0), 0);
  const fallbackColor = identity
    ? fallbackPalette[hash % fallbackPalette.length]
    : categoryPalette[0];
  const resolvedColor = selectedColor || namedColor || fallbackColor;

  return {
    ...resolvedColor,
    color: rawColor && !selectedColor ? rawColor : resolvedColor.color,
    hasCustomColor: Boolean(rawColor && !selectedColor)
  };
};

export const formatChartCount = (value) =>
  new Intl.NumberFormat('vi-VN').format(Number(value) || 0);
