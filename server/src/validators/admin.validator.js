import { z } from 'zod';

export const userFilterSchema = z.object({
  search: z.string().optional(),
  role: z.enum(['USER', 'ADMIN']).optional(),
  status: z.enum(['ACTIVE', 'LOCKED']).optional(),
  page: z.coerce.number().int().positive().default(1).optional(),
  limit: z.coerce.number().int().positive().max(100).default(20).optional()
});

export const updateStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'LOCKED'])
});

export const updateRoleSchema = z.object({
  role: z.enum(['USER', 'ADMIN'])
});

export const createSystemCategorySchema = z.object({
  name: z.string().min(1, 'Tên danh mục là bắt buộc').max(50),
  icon: z.string().min(1, 'Icon danh mục là bắt buộc'),
  color: z.string().min(1, 'Màu danh mục là bắt buộc'),
  type: z.enum(['INCOME', 'EXPENSE'])
});

export const updateSystemCategorySchema = createSystemCategorySchema.partial();

export const broadcastNotificationSchema = z.object({
  title: z.string().min(1, 'Tiêu đề thông báo là bắt buộc').max(150),
  message: z.string().min(1, 'Nội dung thông báo là bắt buộc').max(1000),
  type: z.enum(['INFO', 'WARNING', 'SYSTEM', 'UPDATE']).default('SYSTEM').optional()
});
