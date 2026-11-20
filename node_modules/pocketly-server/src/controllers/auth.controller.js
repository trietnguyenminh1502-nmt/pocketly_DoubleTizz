import { AuthService } from '../services/auth.service.js';
import { confirmResetToken, checkConfirmedResetToken } from '../services/auth.service.js';
import { successResponse } from '../utils/response.js';
import { hashToken } from '../utils/token.js';
import { prisma } from '../config/prisma.js';
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
          accessToken,
          refreshToken
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
        data: {
          accessToken,
          refreshToken: newRefreshToken
        }
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

  /**
   * [GET /api/v1/auth/confirm-reset?token=xxx]
   * Điện thoại bấm link này → xác nhận token → trả về HTML thông báo
   */
  static async confirmReset(req, res, next) {
    try {
      const { token } = req.query;
      if (!token) return res.status(400).send('<h2>Link không hợp lệ</h2>');

      const tokenHash = hashToken(token);
      const record = await prisma.passwordResetToken.findUnique({
        where: { tokenHash },
        include: { user: true }
      });

      if (!record || record.used || record.expiresAt < new Date()) {
        return res.status(400).send(`
          <html><body style="font-family:sans-serif;text-align:center;padding:60px">
            <h2 style="color:#e74c3c">❌ Link đã hết hạn hoặc không hợp lệ</h2>
            <p>Vui lòng gửi lại yêu cầu trên máy tính.</p>
          </body></html>
        `);
      }

      // Lưu token đã xác nhận vào memory
      confirmResetToken(token, record.user.email);

      return res.send(`
        <html><body style="font-family:sans-serif;text-align:center;padding:60px;background:#F6F2EA">
          <div style="max-width:400px;margin:0 auto;padding:32px;background:#fff;border-radius:16px;border:1px solid #E8E2D6">
            <div style="font-size:48px">✅</div>
            <h2 style="color:#123D2F;margin-top:16px">Xác nhận thành công!</h2>
            <p style="color:#555;font-size:15px">
              Quay lại <strong>máy tính</strong> để tạo mật khẩu mới.<br/>
              Trang sẽ tự động mở trong vài giây.
            </p>
            <p style="color:#aaa;font-size:12px;margin-top:24px">Bạn có thể đóng tab này.</p>
          </div>
        </body></html>
      `);
    } catch (error) {
      next(error);
    }
  }

  /**
   * [POST /api/v1/auth/check-reset-status]
   * Máy tính polling để biết email đã xác nhận chưa
   */
  static async checkResetStatus(req, res, next) {
    try {
      const { email } = req.body;
      if (!email) return res.status(400).json({ confirmed: false });

      const token = checkConfirmedResetToken(email);
      if (token) {
        return successResponse(res, { data: { confirmed: true, token } });
      }
      return successResponse(res, { data: { confirmed: false } });
    } catch (error) {
      next(error);
    }
  }
}
