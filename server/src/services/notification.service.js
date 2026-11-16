import { prisma } from '../config/prisma.js';

export class NotificationService {
  /**
   * Lấy danh sách thông báo của user + thông báo broadcast hệ thống (userId = null)
   */
  static async listNotifications(userId, { page = 1, limit = 20 } = {}) {
    const where = {
      OR: [
        { userId },
        { userId: null }
      ]
    };

    const skip = (page - 1) * limit;

    const [total, notifications, unreadCount] = await Promise.all([
      prisma.notification.count({ where }),
      prisma.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.notification.count({
        where: {
          ...where,
          isRead: false
        }
      })
    ]);

    return {
      notifications,
      meta: {
        total,
        unreadCount,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Đếm số lượng thông báo chưa đọc
   */
  static async getUnreadCount(userId) {
    const count = await prisma.notification.count({
      where: {
        OR: [{ userId }, { userId: null }],
        isRead: false
      }
    });

    return { unreadCount: count };
  }

  /**
   * Đánh dấu 1 thông báo là đã đọc
   */
  static async markAsRead(userId, notificationId) {
    const notification = await prisma.notification.findFirst({
      where: {
        id: notificationId,
        OR: [{ userId }, { userId: null }]
      }
    });

    if (!notification) {
      const err = new Error('Thông báo không tồn tại');
      err.statusCode = 404;
      throw err;
    }

    const updated = await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true }
    });

    return updated;
  }

  /**
   * Đánh dấu tất cả thông báo là đã đọc
   */
  static async markAllAsRead(userId) {
    const result = await prisma.notification.updateMany({
      where: {
        OR: [{ userId }, { userId: null }],
        isRead: false
      },
      data: { isRead: true }
    });

    return { updatedCount: result.count };
  }

  /**
   * Xóa 1 thông báo
   */
  static async deleteNotification(userId, notificationId) {
    const notification = await prisma.notification.findFirst({
      where: {
        id: notificationId,
        OR: [{ userId }, { userId: null }]
      }
    });

    if (!notification) {
      const err = new Error('Thông báo không tồn tại');
      err.statusCode = 404;
      throw err;
    }

    await prisma.notification.delete({
      where: { id: notificationId }
    });

    return true;
  }

  /**
   * Tạo thông báo cảnh báo ngân sách (chống trùng lặp trong cùng tháng)
   */
  static async createBudgetAlertIfNotExists({ userId, title, message, type = 'BUDGET_ALERT', month, year }) {
    // Kiểm tra xem trong tháng này đã gửi thông báo tương tự chưa để tránh spam
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59);

    const existing = await prisma.notification.findFirst({
      where: {
        userId,
        title,
        type,
        createdAt: {
          gte: startOfMonth,
          lte: endOfMonth
        }
      }
    });

    if (!existing) {
      await prisma.notification.create({
        data: {
          userId,
          title,
          message,
          type,
          isRead: false
        }
      });
      return true;
    }

    return false;
  }
}
