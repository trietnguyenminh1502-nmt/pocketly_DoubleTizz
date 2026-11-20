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

export const supportApi = {
  // Public: Gửi yêu cầu hỗ trợ từ form người dùng
  createTicket: (data) => api.post('/support', data),

  // Admin: Lấy danh sách các yêu cầu
  listTickets: (params) => api.get('/support/admin', { params: cleanParams(params) }),

  // Admin: Cập nhật trạng thái hoặc ghi chú
  updateTicket: (id, data) => api.patch(`/support/admin/${id}`, data),

  // Public: Gửi email hỗ trợ thực tế
  sendEmail: (data) => api.post('/support/email', data),
  deleteTicket: (id) => api.delete(`/support/admin/${id}`)
};
