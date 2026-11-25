import { api } from '@/api/axios';

const cleanParams = (params) => {
  if (!params) return {};
  const cleaned = {};
  Object.entries(params).forEach(([key, value]) => {
    if (value !== '' && value !== null && value !== undefined) {
      cleaned[key] = value;
    }
  });
  return cleaned;
};

export const transactionApi = {
  list: (params) => api.get('/transactions', { params: cleanParams(params) }),
  getById: (id) => api.get(`/transactions/${id}`),
  create: (data) => api.post('/transactions', data),
  update: (id, data) => api.patch(`/transactions/${id}`, data),
  delete: (id) => api.delete(`/transactions/${id}`),
  bulkDelete: (ids) => api.post('/transactions/bulk-delete', { ids }),
  exportExcel: (params) =>
    api.get('/transactions/export/excel', { params: cleanParams(params), responseType: 'blob' }),
  exportCSV: (params) =>
    api.get('/transactions/export/csv', { params: cleanParams(params), responseType: 'blob' })
};

export const categoryApi = {
  list: (type) => api.get('/categories', { params: type ? { type } : {} }),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.patch(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`)
};

export const walletApi = {
  list: () => api.get('/wallets'),
  getById: (id) => api.get(`/wallets/${id}`),
  create: (data) => api.post('/wallets', data),
  update: (id, data) => api.patch(`/wallets/${id}`, data),
  delete: (id) => api.delete(`/wallets/${id}`),
  transfer: (data) => api.post('/wallets/transfer', data)
};

export const budgetApi = {
  list: (params) => api.get('/budgets', { params }),
  create: (data) => api.post('/budgets', data),
  update: (id, data) => api.patch(`/budgets/${id}`, data),
  delete: (id) => api.delete(`/budgets/${id}`)
};

export const savingGoalApi = {
  list: () => api.get('/saving-goals'),
  getById: (id) => api.get(`/saving-goals/${id}`),
  create: (data) => api.post('/saving-goals', data),
  update: (id, data) => api.patch(`/saving-goals/${id}`, data),
  delete: (id, refundWalletId) =>
    api.delete(`/saving-goals/${id}`, {
      params: refundWalletId ? { refundWalletId } : {},
      data: refundWalletId ? { refundWalletId } : {}
    }),
  contribute: (id, data) => api.post(`/saving-goals/${id}/contribute`, data)
};

export const reportApi = {
  getSummary: () => api.get('/reports/summary'),
  getSpendingByCategory: (params) => api.get('/reports/category-spending', { params }),
  getTrends: (params) => api.get('/reports/trends', { params }),
  getTopCategories: (params) => api.get('/reports/top-categories', { params }),
  exportReportExcel: (params) =>
    api.get('/reports/export/excel', { params, responseType: 'blob' })
};
