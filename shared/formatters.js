const currencyFormatters = new Map();

const getCurrencyFormatter = (currency) => {
  if (!currencyFormatters.has(currency)) {
    currencyFormatters.set(
      currency,
      new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency,
        maximumFractionDigits: currency === 'VND' ? 0 : 2
      })
    );
  }

  return currencyFormatters.get(currency);
};

const normalizeCurrencySpacing = (value) => value.replace(/[\u00a0\u202f]/g, ' ');

export const formatCurrency = (amount, currency = 'VND') => {
  const numericAmount = Number(amount) || 0;
  return normalizeCurrencySpacing(getCurrencyFormatter(currency).format(numericAmount));
};

const dateFormatter = new Intl.DateTimeFormat('vi-VN', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric'
});
const dateTimeFormatter = new Intl.DateTimeFormat('vi-VN', {
  dateStyle: 'short',
  timeStyle: 'medium'
});
const percentFormatter = new Intl.NumberFormat('vi-VN', {
  maximumFractionDigits: 1
});
const compactMillionFormatter = new Intl.NumberFormat('vi-VN', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1
});

export const formatVND = (amount) => formatCurrency(amount, 'VND');
export const formatCompactVND = (amount) =>
  `${compactMillionFormatter.format((Number(amount) || 0) / 1_000_000)}M`;

const toDate = (value) => {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  return value instanceof Date ? value : new Date(value);
};

export const formatDate = (value) => {
  const date = toDate(value);
  return date ? dateFormatter.format(date) : '';
};

export const formatDateTime = (value) => {
  const date = toDate(value);
  return date ? dateTimeFormatter.format(date) : '';
};

export const formatPercent = (value) => {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    throw new TypeError('formatPercent expects a finite number');
  }

  return `${percentFormatter.format(numericValue)}%`;
};
