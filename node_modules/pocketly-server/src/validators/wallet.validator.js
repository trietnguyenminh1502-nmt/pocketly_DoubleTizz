import { z } from 'zod';

export const createWalletSchema = z.object({
  name: z.string().min(1, 'Tên ví không được để trống').max(50),
  balance: z.number().optional().default(0),
  icon: z.string().optional().default('Wallet')
});

export const updateWalletSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  icon: z.string().optional()
});

export const transferWalletSchema = z.object({
  fromWalletId: z.string().uuid('Mã ví nguồn không hợp lệ'),
  toWalletId: z.string().uuid('Mã ví đích không hợp lệ'),
  amount: z.number().positive('Số tiền chuyển khoản phải lớn hơn 0'),
  note: z.string().max(255).optional()
});
