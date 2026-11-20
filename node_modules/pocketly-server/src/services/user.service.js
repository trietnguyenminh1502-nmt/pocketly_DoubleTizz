import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { prisma } from '../config/prisma.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class UserService {
  /**
   * Lấy thông tin chi tiết user
   */
  static async getProfile(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        avatarUrl: true,
        role: true,
        status: true,
        currency: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      const err = new Error('Không tìm thấy người dùng');
      err.statusCode = 404;
      throw err;
    }

    return user;
  }

  /**
   * Cập nhật thông tin profile (họ tên, tiền tệ)
   */
  static async updateProfile(userId, { fullName, currency }) {
    const updateData = {};
    if (fullName) updateData.fullName = fullName.trim();
    if (currency) updateData.currency = currency.toUpperCase().trim();

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        fullName: true,
        email: true,
        avatarUrl: true,
        role: true,
        status: true,
        currency: true,
        emailVerified: true,
        updatedAt: true
      }
    });

    return updatedUser;
  }

  /**
   * Cập nhật ảnh đại diện
   */
  static async updateAvatar(userId, file) {
    if (!file) {
      const err = new Error('Vui lòng chọn file ảnh để tải lên');
      err.statusCode = 400;
      throw err;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { avatarUrl: true }
    });

    // Xóa file ảnh cũ nếu có
    if (user?.avatarUrl && user.avatarUrl.startsWith('/uploads/avatars/')) {
      const oldFilename = path.basename(user.avatarUrl);
      const oldPath = path.resolve(__dirname, '../../uploads/avatars', oldFilename);
      if (fs.existsSync(oldPath)) {
        try {
          fs.unlinkSync(oldPath);
        } catch {
          // Bỏ qua lỗi nếu file không tồn tại
        }
      }
    }

    const avatarUrl = `/uploads/avatars/${file.filename}`;

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { avatarUrl },
      select: {
        id: true,
        fullName: true,
        avatarUrl: true
      }
    });

    return updated;
  }

  /**
   * Đổi mật khẩu
   */
  static async changePassword(userId, { currentPassword, newPassword }) {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      const err = new Error('Người dùng không tồn tại');
      err.statusCode = 404;
      throw err;
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      const err = new Error('Mật khẩu hiện tại không chính xác');
      err.statusCode = 400;
      throw err;
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash }
    });

    // Thu hồi toàn bộ refresh token cũ để bảo vệ tài khoản
    await prisma.refreshToken.updateMany({
      where: { userId },
      data: { revoked: true }
    });

    return true;
  }

  /**
   * Xóa tài khoản người dùng (Cascade sẽ tự động dọn dẹp các bảng phụ thuộc)
   */
  static async deleteAccount(userId) {
    await prisma.user.delete({
      where: { id: userId }
    });
    return true;
  }
}
