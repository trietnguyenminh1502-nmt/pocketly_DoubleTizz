import { z } from 'zod';

const emptyToUndefined = (val) => (typeof val === 'string' && val.trim() === '' ? undefined : val);

export const userFilterSchema = z.object({
  search: z.preprocess(emptyToUndefined, z.string().optional()),
  role: z.preprocess(emptyToUndefined, z.enum(['USER', 'ADMIN']).optional()),
  status: z.preprocess(emptyToUndefined, z.enum(['ACTIVE', 'LOCKED']).optional()),
  page: z.preprocess(emptyToUndefined, z.coerce.number().int().positive().default(1).optional()),
  limit: z.preprocess(emptyToUndefined, z.coerce.number().int().positive().max(100).default(20).optional())
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
