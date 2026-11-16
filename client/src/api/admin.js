import { api } from './axios';

export const adminApi = {
  getDashboardStats: () => api.get('/admin/dashboard'),
  listUsers: (params) => api.get('/admin/users', { params }),
  getUserDetail: (id) => api.get(`/admin/users/${id}`),
  updateUserStatus: (id, status) => api.patch(`/admin/users/${id}/status`, { status }),
  updateUserRole: (id, role) => api.patch(`/admin/users/${id}/role`, { role }),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),

  listDefaultCategories: () => api.get('/admin/categories'),
  createDefaultCategory: (data) => api.post('/admin/categories', data),
  updateDefaultCategory: (id, data) => api.patch(`/admin/categories/${id}`, data),
  deleteDefaultCategory: (id) => api.delete(`/admin/categories/${id}`),

  getChatbotStats: (params) => api.get('/admin/chatbot/stats', { params }),
  listAuditLogs: (params) => api.get('/admin/audit-logs', { params }),
  broadcastNotification: (data) => api.post('/admin/broadcast', data)
};
