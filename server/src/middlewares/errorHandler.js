import { ZodError } from 'zod';
import { errorResponse } from '../utils/response.js';

export const errorHandler = (err, req, res, next) => {
  console.error(`[Error] ${req.method} ${req.originalUrl}:`, err);

  // Handle Zod Validation Errors
  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message
    }));

    return errorResponse(res, {
      status: 400,
      message: 'Dữ liệu không hợp lệ',
      errors: formattedErrors
    });
  }

  // Handle Custom API Errors with status code
  if (err.statusCode || err.status) {
    return errorResponse(res, {
      status: err.statusCode || err.status,
      message: err.message || 'Yêu cầu không thể thực hiện',
      errors: err.errors || null
    });
  }

  // Handle Prisma Known Request Errors
  if (err.code && typeof err.code === 'string' && err.code.startsWith('P')) {
    if (err.code === 'P2002') {
      return errorResponse(res, {
        status: 409,
        message: 'Dữ liệu đã tồn tại trong hệ thống (Duplicate Key)',
        errors: err.meta || null
      });
    }
    if (err.code === 'P2025') {
      return errorResponse(res, {
        status: 404,
        message: 'Bản ghi không tồn tại hoặc đã bị xóa',
        errors: null
      });
    }
  }

  // Default Internal Server Error
  return errorResponse(res, {
    status: 500,
    message: process.env.NODE_ENV === 'production' ? 'Đã xảy ra lỗi hệ thống' : err.message,
    errors: process.env.NODE_ENV === 'production' ? null : err.stack
  });
};
