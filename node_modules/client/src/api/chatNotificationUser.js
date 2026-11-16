import { api } from '@/api/axios';

export const chatApi = {
  listSessions: () => api.get('/chat/sessions'),
  createSession: (data) => api.post('/chat/sessions', data),
  getMessages: (sessionId) => api.get(`/chat/sessions/${sessionId}/messages`),
  sendMessage: (sessionId, content) => api.post(`/chat/sessions/${sessionId}/messages`, { content }),
  clearSession: (sessionId) => api.delete(`/chat/sessions/${sessionId}/messages`),
  deleteSession: (sessionId) => api.delete(`/chat/sessions/${sessionId}`)
};

export const notificationApi = {
  list: (params) => api.get('/notifications', { params }),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/mark-all-read'),
  delete: (id) => api.delete(`/notifications/${id}`)
};

export const userApi = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.patch('/users/profile', data),
  updateAvatar: (formData) =>
    api.post('/users/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  changePassword: (data) => api.post('/users/change-password', data),
  deleteAccount: () => api.delete('/users/account')
};
