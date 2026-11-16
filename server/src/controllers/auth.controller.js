import { AuthService } from '../services/auth.service.js';
import { successResponse } from '../utils/response.js';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema
} from '../validators/auth.validator.js';

const REFRESH_COOKIE_NAME = 'pocketly_refresh_token';

const setRefreshTokenCookie = (res, token) => {
  res.cookie(REFRESH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 ngày
  });
};

const clearRefreshTokenCookie = (res) => {
  res.clearCookie(REFRESH_COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  });
};

export class AuthController {
  static async register(req, res, next) {
    try {
      const validated = registerSchema.parse(req.body);
      const user = await AuthService.register(validated);

      return successResponse(res, {
        status: 201,
        message: 'Đăng ký tài khoản thành công! Vui lòng kiểm tra email để xác thực.',
        data: { user }
      });
    } catch (error) {
      next(error);
    }
  }

  static async login(req, res, next) {
    try {
      const validated = loginSchema.parse(req.body);
      const { user, accessToken, refreshToken } = await AuthService.login(validated);

      setRefreshTokenCookie(res, refreshToken);

      return successResponse(res, {
        message: 'Đăng nhập thành công',
        data: {
          user,
          accessToken
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async refreshToken(req, res, next) {
    try {
      const token = req.cookies[REFRESH_COOKIE_NAME] || req.body.refreshToken;
      const { accessToken, refreshToken: newRefreshToken } = await AuthService.refreshToken(token);

      setRefreshTokenCookie(res, newRefreshToken);

      return successResponse(res, {
        message: 'Làm mới token thành công',
        data: { accessToken }
      });
    } catch (error) {
      clearRefreshTokenCookie(res);
      next(error);
    }
  }

  static async logout(req, res, next) {
    try {
      const token = req.cookies[REFRESH_COOKIE_NAME] || req.body.refreshToken;
      await AuthService.logout(token);
      clearRefreshTokenCookie(res);

      return successResponse(res, {
        message: 'Đăng xuất thành công'
      });
    } catch (error) {
      next(error);
    }
  }

  static async forgotPassword(req, res, next) {
    try {
      const { email } = forgotPasswordSchema.parse(req.body);
      await AuthService.forgotPassword(email);

      return successResponse(res, {
        message: 'Nếu email tồn tại trong hệ thống, hướng dẫn đặt lại mật khẩu đã được gửi.'
      });
    } catch (error) {
      next(error);
    }
  }

  static async resetPassword(req, res, next) {
    try {
      const validated = resetPasswordSchema.parse(req.body);
      await AuthService.resetPassword(validated);
      clearRefreshTokenCookie(res);

      return successResponse(res, {
        message: 'Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại.'
      });
    } catch (error) {
      next(error);
    }
  }

  static async verifyEmail(req, res, next) {
    try {
      const { token } = verifyEmailSchema.parse(req.body);
      await AuthService.verifyEmail(token);

      return successResponse(res, {
        message: 'Xác thực địa chỉ email thành công'
      });
    } catch (error) {
      next(error);
    }
  }

  static async getMe(req, res, next) {
    try {
      return successResponse(res, {
        message: 'Lấy thông tin người dùng hiện tại thành công',
        data: { user: req.user }
      });
    } catch (error) {
      next(error);
    }
  }
}
