import { UserService } from '../services/user.service.js';
import { successResponse } from '../utils/response.js';
import { updateProfileSchema, changePasswordSchema } from '../validators/auth.validator.js';

export class UserController {
  static async getProfile(req, res, next) {
    try {
      const user = await UserService.getProfile(req.user.id);
      return successResponse(res, {
        message: 'Lấy thông tin profile thành công',
        data: { user }
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(req, res, next) {
    try {
      const validated = updateProfileSchema.parse(req.body);
      const updatedUser = await UserService.updateProfile(req.user.id, validated);

      return successResponse(res, {
        message: 'Cập nhật thông tin cá nhân thành công',
        data: { user: updatedUser }
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateAvatar(req, res, next) {
    try {
      const updatedUser = await UserService.updateAvatar(req.user.id, req.file);
      return successResponse(res, {
        message: 'Cập nhật ảnh đại diện thành công',
        data: { user: updatedUser }
      });
    } catch (error) {
      next(error);
    }
  }

  static async changePassword(req, res, next) {
    try {
      const validated = changePasswordSchema.parse(req.body);
      await UserService.changePassword(req.user.id, validated);

      res.clearCookie('pocketly_refresh_token');

      return successResponse(res, {
        message: 'Đổi mật khẩu thành công. Vui lòng đăng nhập lại với mật khẩu mới.'
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteAccount(req, res, next) {
    try {
      await UserService.deleteAccount(req.user.id);
      res.clearCookie('pocketly_refresh_token');

      return successResponse(res, {
        message: 'Tài khoản của bạn đã được xóa hoàn toàn khỏi hệ thống.'
      });
    } catch (error) {
      next(error);
    }
  }
}
