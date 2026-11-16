import { prisma } from '../config/prisma.js';
import { verifyAccessToken } from '../utils/token.js';
import { errorResponse } from '../utils/response.js';

/**
 * Authentication Middleware: Kiểm tra JWT Access Token từ Bearer Authorization header
 */
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, {
        status: 401,
        message: 'Yêu cầu đăng nhập để truy cập tài nguyên này'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user) {
      return errorResponse(res, {
        status: 401,
        message: 'Tài khoản người dùng không tồn tại'
      });
    }

    // Kiểm tra trạng thái khóa tài khoản
    if (user.status === 'LOCKED') {
      return errorResponse(res, {
        status: 403,
        message: 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.'
      });
    }

    // Gắn thông tin user vào request
    req.user = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      currency: user.currency,
      status: user.status
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return errorResponse(res, {
        status: 401,
        message: 'Phiên làm việc đã hết hạn. Vui lòng làm mới token.',
        errors: { code: 'TOKEN_EXPIRED' }
      });
    }
    return errorResponse(res, {
      status: 401,
      message: 'Token xác thực không hợp lệ',
      errors: { code: 'INVALID_TOKEN' }
    });
  }
};

/**
 * Role-based Authorization Middleware
 * @param  {...string} roles Danh sách vai trò được phép truy cập (VD: 'ADMIN')
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return errorResponse(res, {
        status: 403,
        message: 'Bạn không có quyền thực hiện hành động này'
      });
    }
    next();
  };
};
