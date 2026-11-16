import { z } from 'zod';

export const createSessionSchema = z.object({
  title: z.string().max(100).optional().default('Phiên tư vấn mới')
});

export const sendMessageSchema = z.object({
  content: z.string().min(1, 'Nội dung tin nhắn không được để trống').max(2000, 'Tin nhắn tối đa 2000 ký tự')
});
