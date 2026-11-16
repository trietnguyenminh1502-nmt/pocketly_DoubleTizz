import { AdminService } from '../services/admin.service.js';
import { successResponse } from '../utils/response.js';
import {
  userFilterSchema,
  updateStatusSchema,
  updateRoleSchema,
  createSystemCategorySchema,
  updateSystemCategorySchema,
  broadcastNotificationSchema
} from '../validators/admin.validator.js';

export class AdminController {
  static async getDashboardStats(req, res, next) {
    try {
      const stats = await AdminService.getDashboardStats();
      return successResponse(res, {
        message: 'Lấy dữ liệu thống kê quản trị thành công',
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }

  static async listUsers(req, res, next) {
    try {
      const filters = userFilterSchema.parse(req.query);
      const data = await AdminService.listUsers(filters);

      return successResponse(res, {
        message: 'Lấy danh sách người dùng thành công',
        data
      });
    } catch (error) {
      next(error);
    }
  }

  static async getUserDetail(req, res, next) {
    try {
      const { id } = req.params;
      const user = await AdminService.getUserDetail(id);

      return successResponse(res, {
        message: 'Lấy chi tiết người dùng thành công',
        data: { user }
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateUserStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = updateStatusSchema.parse(req.body);
      const user = await AdminService.updateUserStatus(req.user.id, id, status);

      return successResponse(res, {
        message: `Đã ${status === 'LOCKED' ? 'khóa' : 'mở khóa'} tài khoản người dùng thành công`,
        data: { user }
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateUserRole(req, res, next) {
    try {
      const { id } = req.params;
      const { role } = updateRoleSchema.parse(req.body);
      const user = await AdminService.updateUserRole(req.user.id, id, role);

      return successResponse(res, {
        message: `Đã cập nhật vai trò người dùng thành ${role}`,
        data: { user }
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteUser(req, res, next) {
    try {
      const { id } = req.params;
      await AdminService.deleteUser(req.user.id, id);

      return successResponse(res, {
        message: 'Đã xóa người dùng thành công'
      });
    } catch (error) {
      next(error);
    }
  }

  static async listDefaultCategories(req, res, next) {
    try {
      const categories = await AdminService.listDefaultCategories();
      return successResponse(res, {
        message: 'Lấy danh sách danh mục hệ thống thành công',
        data: { categories }
      });
    } catch (error) {
      next(error);
    }
  }

  static async createDefaultCategory(req, res, next) {
    try {
      const validated = createSystemCategorySchema.parse(req.body);
      const category = await AdminService.createDefaultCategory(req.user.id, validated);

      return successResponse(res, {
        status: 201,
        message: 'Tạo danh mục hệ thống thành công',
        data: { category }
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateDefaultCategory(req, res, next) {
    try {
      const { id } = req.params;
      const validated = updateSystemCategorySchema.parse(req.body);
      const category = await AdminService.updateDefaultCategory(req.user.id, id, validated);

      return successResponse(res, {
        message: 'Cập nhật danh mục hệ thống thành công',
        data: { category }
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteDefaultCategory(req, res, next) {
    try {
      const { id } = req.params;
      await AdminService.deleteDefaultCategory(req.user.id, id);

      return successResponse(res, {
        message: 'Xóa danh mục hệ thống thành công'
      });
    } catch (error) {
      next(error);
    }
  }

  static async getChatbotStats(req, res, next) {
    try {
      const page = req.query.page ? parseInt(req.query.page, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit, 10) : 20;

      const data = await AdminService.getChatbotStats({ page, limit });
      return successResponse(res, {
        message: 'Lấy thống kê sử dụng AI Chatbot thành công',
        data
      });
    } catch (error) {
      next(error);
    }
  }

  static async listAuditLogs(req, res, next) {
    try {
      const page = req.query.page ? parseInt(req.query.page, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit, 10) : 20;

      const data = await AdminService.listAuditLogs({ page, limit });
      return successResponse(res, {
        message: 'Lấy danh sách Audit Log thành công',
        data
      });
    } catch (error) {
      next(error);
    }
  }

  static async broadcastNotification(req, res, next) {
    try {
      const validated = broadcastNotificationSchema.parse(req.body);
      const notification = await AdminService.broadcastNotification(req.user.id, validated);

      return successResponse(res, {
        status: 201,
        message: 'Đã phát sóng thông báo tới toàn thể người dùng hệ thống',
        data: { notification }
      });
    } catch (error) {
      next(error);
    }
  }
}
