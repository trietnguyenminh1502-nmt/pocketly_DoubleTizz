import { z } from 'zod';

export const createTransactionSchema = z.object({
  walletId: z.string().uuid('Mã ví không hợp lệ'),
  categoryId: z.string().uuid('Mã danh mục không hợp lệ'),
  type: z.enum(['INCOME', 'EXPENSE'], {
    errorMap: () => ({ message: 'Loại giao dịch phải là INCOME hoặc EXPENSE' })
  }),
  amount: z.number().positive('Số tiền giao dịch phải lớn hơn 0'),
  note: z.string().max(500).optional().nullable(),
  date: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)).optional()
});

export const updateTransactionSchema = createTransactionSchema.partial();

export const bulkDeleteTransactionSchema = z.object({
  ids: z.array(z.string().uuid()).min(1, 'Danh sách mã giao dịch không được để trống')
});

export const transactionFilterSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  categoryId: z.string().uuid().optional(),
  type: z.enum(['INCOME', 'EXPENSE']).optional(),
  walletId: z.string().uuid().optional(),
  minAmount: z.coerce.number().optional(),
  maxAmount: z.coerce.number().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['date', 'amount', 'createdAt']).default('date').optional(),
  order: z.enum(['asc', 'desc']).default('desc').optional(),
  page: z.coerce.number().int().positive().default(1).optional(),
  limit: z.coerce.number().int().positive().max(100).default(20).optional()
});
