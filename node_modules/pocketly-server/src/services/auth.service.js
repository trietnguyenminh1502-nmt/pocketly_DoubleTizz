import bcrypt from 'bcryptjs';
import { prisma } from '../config/prisma.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  hashToken,
  generateRandomToken
} from '../utils/token.js';
import { sendVerificationEmail, sendPasswordResetEmail, sendOtpEmail } from '../utils/mailer.js';

// ─── In-memory store: lưu mã OTP xác thực email (10 phút) ────────────────────
// Map: email -> { otp, expiresAt, attempts }
const emailOtpStore = new Map();

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

// ─── In-memory store: lưu token đã được xác nhận qua email ───────────────────
// Map: rawToken → { email, confirmedAt }
const confirmedResetTokens = new Map();

export const confirmResetToken = (rawToken, email) => {
  confirmedResetTokens.set(rawToken, { email, confirmedAt: Date.now() });
};

export const checkConfirmedResetToken = (email) => {
  for (const [token, data] of confirmedResetTokens.entries()) {
    if (data.email === email) {
      // Token hết hạn sau 10 phút kể từ lúc xác nhận
      if (Date.now() - data.confirmedAt < 10 * 60 * 1000) {
        return token;
      }
      confirmedResetTokens.delete(token);
    }
  }
  return null;
};

export const removeConfirmedResetToken = (rawToken) => {
  confirmedResetTokens.delete(rawToken);
};

export class AuthService {
  /**
   * Đăng ký tài khoản người dùng mới
   */
  static async register({ fullName, email, password, currency = 'VND' }) {
    const cleanEmail = (email || '').trim().toLowerCase();

    const existing = await prisma.user.findUnique({
      where: { email: cleanEmail }
    });

    const passwordHash = await bcrypt.hash(password, 10);
    let user;

    if (existing) {
      // Nếu email đã được xác minh hoàn tất -> Chặn đăng ký trùng
      if (existing.emailVerified) {
        const err = new Error('Email này đã được đăng ký');
        err.statusCode = 409;
        throw err;
      }

      // Nếu tài khoản trước đó CHƯA xác minh email -> Cập nhật thông tin và cấp mã OTP mới
      user = await prisma.user.update({
        where: { id: existing.id },
        data: {
          fullName: fullName.trim(),
          passwordHash,
          currency
        },
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
          currency: true,
          emailVerified: true,
          createdAt: true
        }
      });
    } else {
      // Tạo người dùng mới
      user = await prisma.user.create({
        data: {
          fullName: fullName.trim(),
          email: cleanEmail,
          passwordHash,
          currency,
          emailVerified: false
        },
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
          currency: true,
          emailVerified: true,
          createdAt: true
        }
      });

      // Tự động tạo 1 ví mặc định cho người dùng mới
      await prisma.wallet.create({
        data: {
          userId: user.id,
          name: 'Tiền mặt',
          balance: 0,
          icon: 'Wallet'
        }
      });
    }

    // Tạo mã OTP 6 số và gửi trực tiếp tới email của người dùng
    const otp = generateOtp();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 phút
    emailOtpStore.set(cleanEmail, { otp, expiresAt, attempts: 0 });

    try {
      await sendOtpEmail({
        to: user.email,
        fullName: user.fullName,
        otp
      });
    } catch (mailErr) {
      console.warn('⚠️ Lỗi gửi OTP qua email khi đăng ký:', mailErr.message);
    }

    return user;
  }

  /**
   * Đăng nhập người dùng
   */
  static async login({ email, password }) {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      const err = new Error('Email hoặc mật khẩu không chính xác');
      err.statusCode = 401;
      throw err;
    }

    // Kiểm tra trạng thái khóa
    if (user.status === 'LOCKED') {
      const err = new Error('Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.');
      err.statusCode = 403;
      throw err;
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      const err = new Error('Email hoặc mật khẩu không chính xác');
      err.statusCode = 401;
      throw err;
    }

    // Tạo JWT Access Token & Refresh Token
    const payload = { userId: user.id, role: user.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Lưu hash của refresh token vào DB
    const tokenHash = hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 ngày

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt
      }
    });

    const userData = {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      avatarUrl: user.avatarUrl,
      role: user.role,
      status: user.status,
      currency: user.currency,
      emailVerified: user.emailVerified
    };

    return { user: userData, accessToken, refreshToken };
  }

  /**
   * Làm mới Access Token thông qua Refresh Token
   */
  static async refreshToken(oldRefreshToken) {
    if (!oldRefreshToken) {
      const err = new Error('Refresh token không tồn tại');
      err.statusCode = 401;
      throw err;
    }

    let decoded;
    try {
      decoded = verifyRefreshToken(oldRefreshToken);
    } catch {
      const err = new Error('Refresh token không hợp lệ hoặc đã hết hạn');
      err.statusCode = 401;
      throw err;
    }

    const oldHash = hashToken(oldRefreshToken);
    const savedToken = await prisma.refreshToken.findUnique({
      where: { tokenHash: oldHash },
      include: { user: true }
    });

    if (!savedToken || savedToken.revoked || savedToken.expiresAt < new Date()) {
      const err = new Error('Refresh token không hợp lệ hoặc đã bị thu hồi');
      err.statusCode = 401;
      throw err;
    }

    if (savedToken.user.status === 'LOCKED') {
      const err = new Error('Tài khoản đã bị khóa');
      err.statusCode = 403;
      throw err;
    }

    // Thu hồi token cũ (Token Rotation)
    await prisma.refreshToken.update({
      where: { id: savedToken.id },
      data: { revoked: true }
    });

    // Cấp cặp token mới
    const payload = { userId: savedToken.user.id, role: savedToken.user.role };
    const newAccessToken = generateAccessToken(payload);
    const newRefreshToken = generateRefreshToken(payload);

    await prisma.refreshToken.create({
      data: {
        userId: savedToken.user.id,
        tokenHash: hashToken(newRefreshToken),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    });

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  /**
   * Đăng xuất & thu hồi Refresh Token
   */
  static async logout(refreshToken) {
    if (refreshToken) {
      const tokenHash = hashToken(refreshToken);
      await prisma.refreshToken.updateMany({
        where: { tokenHash },
        data: { revoked: true }
      });
    }
    return true;
  }

  /**
   * Yêu cầu đặt lại mật khẩu (Forgot Password)
   */
  static async forgotPassword(email) {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    // Luôn trả về thành công để tránh tấn công dò tìm email (User Enumeration)
    if (!user || user.status === 'LOCKED') {
      return true;
    }

    const resetToken = generateRandomToken();
    const tokenHash = hashToken(resetToken);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 giờ

    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt
      }
    });

    sendPasswordResetEmail({
      to: user.email,
      fullName: user.fullName,
      token: resetToken
    });

    return true;
  }

  /**
   * Đặt lại mật khẩu với Token
   */
  static async resetPassword({ token, password }) {
    const tokenHash = hashToken(token);
    const resetRecord = await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      include: { user: true }
    });

    if (!resetRecord || resetRecord.used || resetRecord.expiresAt < new Date()) {
      const err = new Error('Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn');
      err.statusCode = 400;
      throw err;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // Cập nhật mật khẩu mới & đánh dấu token đã dùng
    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetRecord.userId },
        data: { passwordHash }
      }),
      prisma.passwordResetToken.update({
        where: { id: resetRecord.id },
        data: { used: true }
      }),
      // Thu hồi toàn bộ refresh token cũ để buộc đăng nhập lại
      prisma.refreshToken.updateMany({
        where: { userId: resetRecord.userId },
        data: { revoked: true }
      })
    ]);

    return true;
  }

  /**
   * Xác thực tài khoản email
   */
  static async verifyEmail(token) {
    // Với mock Ethereal, ta cập nhật trạng thái emailVerified cho user
    // Khi nhận token hợp lệ, tìm user và update
    return true;
  }

  /**
   * Xác minh mã OTP 6 số và kích hoạt tài khoản, đồng thời cấp JWT đăng nhập
   */
  static async verifyOtp({ email, otp }) {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanOtp = (otp || '').trim();

    const record = emailOtpStore.get(cleanEmail);
    if (!record) {
      const err = new Error('Mã xác nhận không tồn tại hoặc đã hết hạn. Vui lòng yêu cầu gửi lại mã.');
      err.statusCode = 400;
      throw err;
    }

    if (Date.now() > record.expiresAt) {
      emailOtpStore.delete(cleanEmail);
      const err = new Error('Mã xác nhận đã hết hạn. Vui lòng yêu cầu mã mới.');
      err.statusCode = 400;
      throw err;
    }

    if (record.otp !== cleanOtp) {
      record.attempts = (record.attempts || 0) + 1;
      if (record.attempts >= 5) {
        emailOtpStore.delete(cleanEmail);
        const err = new Error('Bạn đã nhập sai quá 5 lần. Vui lòng yêu cầu gửi lại mã mới.');
        err.statusCode = 400;
        throw err;
      }
      const err = new Error('Mã xác nhận không chính xác. Vui lòng kiểm tra lại email.');
      err.statusCode = 400;
      throw err;
    }

    // OTP hợp lệ! Xóa khỏi store
    emailOtpStore.delete(cleanEmail);

    // Cập nhật emailVerified = true cho user
    const user = await prisma.user.update({
      where: { email: cleanEmail },
      data: { emailVerified: true },
      select: {
        id: true,
        fullName: true,
        email: true,
        avatarUrl: true,
        role: true,
        status: true,
        currency: true,
        emailVerified: true
      }
    });

    // Tự động đăng nhập: tạo Access Token & Refresh Token
    const payload = { userId: user.id, role: user.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    const tokenHash = hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt
      }
    });

    return { user, accessToken, refreshToken };
  }

  /**
   * Gửi lại mã OTP qua email
   */
  static async resendOtp({ email }) {
    const cleanEmail = (email || '').trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail }
    });

    if (!user) {
      const err = new Error('Không tìm thấy tài khoản với email này.');
      err.statusCode = 404;
      throw err;
    }

    const otp = generateOtp();
    const expiresAt = Date.now() + 10 * 60 * 1000;
    emailOtpStore.set(cleanEmail, { otp, expiresAt, attempts: 0 });

    await sendOtpEmail({
      to: user.email,
      fullName: user.fullName,
      otp
    });

    return { message: 'Đã gửi lại mã xác thực thành công' };
  }
}
