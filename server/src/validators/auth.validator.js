import { z } from 'zod';

export const registerSchema = z.object({
  fullName: z.string().min(2, 'Họ tên phải có ít nhất 2 ký tự').max(100, 'Họ tên tối đa 100 ký tự'),
  email: z.string().email('Email không đúng định dạng').toLowerCase().trim(),
  password: z
    .string()
    .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
    .max(50, 'Mật khẩu tối đa 50 ký tự'),
  currency: z.string().default('VND').optional()
});

export const loginSchema = z.object({
  email: z.string().email('Email không đúng định dạng').toLowerCase().trim(),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu')
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Email không đúng định dạng').toLowerCase().trim()
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token đặt lại mật khẩu là bắt buộc'),
  password: z
    .string()
    .min(6, 'Mật khẩu mới phải có ít nhất 6 ký tự')
    .max(50, 'Mật khẩu tối đa 50 ký tự')
});

export const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Token xác thực email là bắt buộc')
});

export const updateProfileSchema = z.object({
  fullName: z.string().min(2, 'Họ tên phải có ít nhất 2 ký tự').max(100).optional(),
  currency: z.string().min(3).max(5).optional()
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Vui lòng nhập mật khẩu hiện tại'),
  newPassword: z.string().min(6, 'Mật khẩu mới phải có ít nhất 6 ký tự').max(50)
});
