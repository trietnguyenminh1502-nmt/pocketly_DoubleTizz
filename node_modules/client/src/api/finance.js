import { api } from './axios';

export const transactionApi = {
  list: (params) => api.get('/transactions', { params }),
  getById: (id) => api.get(`/transactions/${id}`),
  create: (data) => api.post('/transactions', data),
  update: (id, data) => api.patch(`/transactions/${id}`, data),
  delete: (id) => api.delete(`/transactions/${id}`),
  bulkDelete: (ids) => api.post('/transactions/bulk-delete', { ids }),
  exportExcel: (params) =>
    api.get('/transactions/export/excel', { params, responseType: 'blob' }),
  exportCSV: (params) =>
    api.get('/transactions/export/csv', { params, responseType: 'blob' })
};

export const categoryApi = {
  list: (type) => api.get('/categories', { params: type ? { type } : {} })
};

export const walletApi = {
  list: () => api.get('/wallets'),
  getById: (id) => api.get(`/wallets/${id}`)
};

export const budgetApi = {
  list: (params) => api.get('/budgets', { params })
};

export const savingGoalApi = {
  list: () => api.get('/saving-goals')
};

export const reportApi = {
  getSummary: () => api.get('/reports/summary'),
  getSpendingByCategory: (params) => api.get('/reports/category-spending', { params }),
  getTrends: (params) => api.get('/reports/trends', { params }),
  getTopCategories: (params) => api.get('/reports/top-categories', { params })
};
