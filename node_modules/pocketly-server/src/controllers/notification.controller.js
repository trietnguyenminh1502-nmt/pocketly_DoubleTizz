import { NotificationService } from '../services/notification.service.js';
import { successResponse } from '../utils/response.js';

export class NotificationController {
  static async list(req, res, next) {
    try {
      const page = req.query.page ? parseInt(req.query.page, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit, 10) : 20;

      const data = await NotificationService.listNotifications(req.user.id, { page, limit });

      return successResponse(res, {
        message: 'Lấy danh sách thông báo thành công',
        data
      });
    } catch (error) {
      next(error);
    }
  }

  static async getUnreadCount(req, res, next) {
    try {
      const data = await NotificationService.getUnreadCount(req.user.id);
      return successResponse(res, {
        message: 'Lấy số lượng thông báo chưa đọc thành công',
        data
      });
    } catch (error) {
      next(error);
    }
  }

  static async markAsRead(req, res, next) {
    try {
      const { id } = req.params;
      const notification = await NotificationService.markAsRead(req.user.id, id);

      return successResponse(res, {
        message: 'Đã đánh dấu thông báo là đã đọc',
        data: { notification }
      });
    } catch (error) {
      next(error);
    }
  }

  static async markAllAsRead(req, res, next) {
    try {
      const result = await NotificationService.markAllAsRead(req.user.id);
      return successResponse(res, {
        message: 'Đã đánh dấu tất cả thông báo là đã đọc',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      await NotificationService.deleteNotification(req.user.id, id);

      return successResponse(res, {
        message: 'Xóa thông báo thành công'
      });
    } catch (error) {
      next(error);
    }
  }
}
