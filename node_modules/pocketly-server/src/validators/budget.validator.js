import { z } from 'zod';

export const createBudgetSchema = z.object({
  categoryId: z.string().uuid().nullable().optional(),
  amount: z.number().positive('Số tiền ngân sách phải lớn hơn 0'),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2020).max(2100),
  alertThreshold: z.number().int().min(1).max(100).default(80).optional()
});

export const updateBudgetSchema = z.object({
  amount: z.number().positive('Số tiền ngân sách phải lớn hơn 0').optional(),
  alertThreshold: z.number().int().min(1).max(100).optional()
});

export const budgetQuerySchema = z.object({
  month: z.coerce.number().int().min(1).max(12).optional(),
  year: z.coerce.number().int().min(2020).max(2100).optional()
});
