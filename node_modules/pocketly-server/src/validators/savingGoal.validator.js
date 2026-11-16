import { z } from 'zod';

export const createSavingGoalSchema = z.object({
  title: z.string().min(1, 'Tiêu đề mục tiêu là bắt buộc').max(100),
  targetAmount: z.number().positive('Mục tiêu số tiền phải lớn hơn 0'),
  currentAmount: z.number().min(0).default(0).optional(),
  deadline: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)).nullable().optional()
});

export const updateSavingGoalSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  targetAmount: z.number().positive().optional(),
  deadline: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)).nullable().optional()
});

export const contributeGoalSchema = z.object({
  amount: z.number().positive('Số tiền tích lũy thêm phải lớn hơn 0'),
  walletId: z.string().uuid().optional() // Nếu truyền walletId thì trừ tiền từ ví tương ứng
});
