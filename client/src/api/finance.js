import { api } from '@/api/axios';

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
  delete: (id) => api.delete(`/saving-goals/${id}`),
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
