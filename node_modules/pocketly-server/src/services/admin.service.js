import { prisma } from '../config/prisma.js';

export class AdminService {
  /**
   * Tự động ghi lại nhật ký hành động của Admin (Audit Log)
   */
  static async recordAuditLog(adminId, action, targetId = null) {
    try {
      await prisma.auditLog.create({
        data: {
          adminId,
          action,
          targetId: targetId ? String(targetId) : null
        }
      });
    } catch (err) {
      console.error('Lỗi khi ghi Audit Log:', err);
    }
  }

  /**
   * 1. Thống kê Dashboard cho Admin
   */
  static async getDashboardStats() {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      newUsersPastWeek,
      activeUsers,
      lockedUsers,
      totalTransactions,
      totalChatbotMessages,
      totalChatSessions
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { createdAt: { gte: oneWeekAgo } } }),
      prisma.user.count({ where: { status: 'ACTIVE' } }),
      prisma.user.count({ where: { status: 'LOCKED' } }),
      prisma.transaction.count(),
      prisma.chatMessage.count(),
      prisma.chatSession.count()
    ]);

    // Thống kê số lượng người dùng có hoạt động giao dịch trong 30 ngày qua
    const activeTransactingUsersCount = (
      await prisma.transaction.groupBy({
        by: ['userId'],
        where: { createdAt: { gte: thirtyDaysAgo } }
      })
    ).length;

    return {
      users: {
        total: totalUsers,
        newThisWeek: newUsersPastWeek,
        active: activeUsers,
        locked: lockedUsers,
        transactingPast30Days: activeTransactingUsersCount
      },
      transactions: {
        total: totalTransactions
      },
      chatbot: {
        totalSessions: totalChatSessions,
        totalMessages: totalChatbotMessages
      }
    };
  }

  /**
   * 2. Quản lý người dùng: Danh sách (Filter/Search/Pagination)
   */
  static async listUsers(filters) {
    const { search, role, status, page = 1, limit = 20 } = filters;
    const where = {};

    if (role) where.role = role;
    if (status) where.status = status;

    if (search && search.trim() !== '') {
      where.OR = [
        { fullName: { contains: search.trim(), mode: 'insensitive' } },
        { email: { contains: search.trim(), mode: 'insensitive' } }
      ];
    }

    const skip = (page - 1) * limit;

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
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
          _count: {
            select: {
              transactions: true,
              wallets: true,
              chatSessions: true
            }
          }
        }
      })
    ]);

    return {
      users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Chi tiết người dùng
   */
  static async getUserDetail(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        wallets: true,
        savingGoals: true,
        _count: {
          select: {
            transactions: true,
            chatSessions: true,
            budgets: true
          }
        }
      }
    });

    if (!user) {
      const err = new Error('Người dùng không tồn tại');
      err.statusCode = 404;
      throw err;
    }

    const { passwordHash: _, ...safeUser } = user;
    return safeUser;
  }

  /**
   * Khóa / Mở khóa người dùng
   */
  static async updateUserStatus(adminId, userId, status) {
    if (adminId === userId) {
      const err = new Error('Không thể tự khóa tài khoản Admin của chính mình');
      err.statusCode = 400;
      throw err;
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { status }
    });

    // Nếu khóa user, lập tức thu hồi toàn bộ refresh token
    if (status === 'LOCKED') {
      await prisma.refreshToken.updateMany({
        where: { userId },
        data: { revoked: true }
      });
    }

    await this.recordAuditLog(adminId, `USER_${status}`, userId);
    return updated;
  }

  /**
   * Đổi quyền hạn (USER | ADMIN)
   */
  static async updateUserRole(adminId, userId, role) {
    const updated = await prisma.user.update({
      where: { id: userId },
      data: { role }
    });

    await this.recordAuditLog(adminId, `CHANGE_ROLE_TO_${role}`, userId);
    return updated;
  }

  /**
   * Xóa người dùng
   */
  static async deleteUser(adminId, userId) {
    if (adminId === userId) {
      const err = new Error('Không thể xóa tài khoản của chính mình');
      err.statusCode = 400;
      throw err;
    }

    await prisma.user.delete({
      where: { id: userId }
    });

    await this.recordAuditLog(adminId, 'DELETE_USER', userId);
    return true;
  }

  /**
   * 3. Quản lý Danh mục mặc định hệ thống (Default Category CRUD)
   */
  static async listDefaultCategories() {
    return await prisma.category.findMany({
      where: { isDefault: true },
      orderBy: [{ type: 'asc' }, { name: 'asc' }],
      include: {
        _count: { select: { transactions: true } }
      }
    });
  }

  static async createDefaultCategory(adminId, data) {
    const category = await prisma.category.create({
      data: {
        name: data.name.trim(),
        icon: data.icon,
        color: data.color,
        type: data.type,
        isDefault: true,
        userId: null
      }
    });

    await this.recordAuditLog(adminId, 'CREATE_DEFAULT_CATEGORY', category.id);
    return category;
  }

  static async updateDefaultCategory(adminId, categoryId, data) {
    const updated = await prisma.category.update({
      where: { id: categoryId },
      data: {
        ...(data.name && { name: data.name.trim() }),
        ...(data.icon && { icon: data.icon }),
        ...(data.color && { color: data.color }),
        ...(data.type && { type: data.type })
      }
    });

    await this.recordAuditLog(adminId, 'UPDATE_DEFAULT_CATEGORY', categoryId);
    return updated;
  }

  static async deleteDefaultCategory(adminId, categoryId) {
    await prisma.category.delete({
      where: { id: categoryId }
    });

    await this.recordAuditLog(adminId, 'DELETE_DEFAULT_CATEGORY', categoryId);
    return true;
  }

  /**
   * 4. Chatbot Logs và Thống kê sử dụng
   */
  static async getChatbotStats({ page = 1, limit = 20 } = {}) {
    const skip = (page - 1) * limit;

    const [totalMessages, totalSessions, recentLogs] = await Promise.all([
      prisma.chatMessage.count(),
      prisma.chatSession.count(),
      prisma.chatMessage.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          session: {
            include: {
              user: {
                select: { id: true, fullName: true, email: true }
              }
            }
          }
        }
      })
    ]);

    return {
      stats: {
        totalMessages,
        totalSessions,
        averageMessagesPerSession: totalSessions > 0 ? (totalMessages / totalSessions).toFixed(1) : 0
      },
      recentLogs,
      meta: {
        page,
        limit,
        totalPages: Math.ceil(totalMessages / limit)
      }
    };
  }

  /**
   * 5. Audit Log: Danh sách nhật ký kiểm tra
   */
  static async listAuditLogs({ page = 1, limit = 20 } = {}) {
    const skip = (page - 1) * limit;

    const [total, logs] = await Promise.all([
      prisma.auditLog.count(),
      prisma.auditLog.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          admin: {
            select: { id: true, fullName: true, email: true }
          }
        }
      })
    ]);

    return {
      logs,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * 6. Phát thông báo phát sóng (Broadcast Notification) cho toàn bộ user
   */
  static async broadcastNotification(adminId, { title, message, type = 'SYSTEM' }) {
    const notification = await prisma.notification.create({
      data: {
        userId: null, // Broadcast tới tất cả mọi người
        title: title.trim(),
        message: message.trim(),
        type,
        isRead: false
      }
    });

    await this.recordAuditLog(adminId, 'BROADCAST_NOTIFICATION', notification.id);
    return notification;
  }
}
