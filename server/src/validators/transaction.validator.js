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

const emptyToUndefined = (val) => (typeof val === 'string' && val.trim() === '' ? undefined : val);

export const transactionFilterSchema = z.object({
  startDate: z.preprocess(emptyToUndefined, z.string().optional()),
  endDate: z.preprocess(emptyToUndefined, z.string().optional()),
  categoryId: z.preprocess(emptyToUndefined, z.string().uuid().optional()),
  type: z.preprocess(emptyToUndefined, z.enum(['INCOME', 'EXPENSE']).optional()),
  walletId: z.preprocess(emptyToUndefined, z.string().uuid().optional()),
  minAmount: z.preprocess(emptyToUndefined, z.coerce.number().optional()),
  maxAmount: z.preprocess(emptyToUndefined, z.coerce.number().optional()),
  search: z.preprocess(emptyToUndefined, z.string().optional()),
  sortBy: z.preprocess(emptyToUndefined, z.enum(['date', 'amount', 'createdAt']).default('date').optional()),
  order: z.preprocess(emptyToUndefined, z.enum(['asc', 'desc']).default('desc').optional()),
  page: z.preprocess(emptyToUndefined, z.coerce.number().int().positive().default(1).optional()),
  limit: z.preprocess(emptyToUndefined, z.coerce.number().int().positive().max(100).default(20).optional())
});
