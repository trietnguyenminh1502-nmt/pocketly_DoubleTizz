import { prisma } from '../config/prisma.js';
import { NotificationService } from './notification.service.js';
import { formatPercent, formatVND } from '../../../shared/formatters.js';

export class BudgetService {
  /**
   * Lấy danh sách ngân sách kèm số tiền đã chi (spent), giới hạn (limit), và tỷ lệ %
   */
  static async listBudgetsWithStatus(userId, { month, year }) {
    const now = new Date();
    const targetMonth = month || now.getMonth() + 1;
    const targetYear = year || now.getFullYear();

    const startOfMonth = new Date(targetYear, targetMonth - 1, 1);
    const endOfMonth = new Date(targetYear, targetMonth, 0, 23, 59, 59, 999);

    // 1. Lấy danh sách ngân sách đã thiết lập trong tháng
    const budgets = await prisma.budget.findMany({
      where: {
        userId,
        month: targetMonth,
        year: targetYear
      },
      include: {
        category: {
          select: { id: true, name: true, icon: true, color: true }
        }
      }
    });

    // 2. Tính toán chi tiêu thực tế trong tháng đó
    const expenses = await prisma.transaction.findMany({
      where: {
        userId,
        type: 'EXPENSE',
        date: {
          gte: startOfMonth,
          lte: endOfMonth
        }
      },
      select: {
        categoryId: true,
        amount: true
      }
    });

    // Tổng chi tiêu toàn tháng
    const totalSpentOverall = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

    // Tổng chi tiêu theo từng danh mục
    const spentByCategory = {};
    expenses.forEach((e) => {
      spentByCategory[e.categoryId] = (spentByCategory[e.categoryId] || 0) + Number(e.amount);
    });

    // 3. Ghép nối dữ liệu tính % và trạng thái
    const budgetStatusList = budgets.map((b) => {
      const limit = Number(b.amount);
      const spent = b.categoryId ? spentByCategory[b.categoryId] || 0 : totalSpentOverall;
      const percentage = limit > 0 ? Math.round((spent / limit) * 100 * 10) / 10 : 0;
      const remaining = Math.max(0, limit - spent);
      const isOverBudget = spent > limit;
      const isNearThreshold = percentage >= b.alertThreshold && !isOverBudget;

      return {
        id: b.id,
        categoryId: b.categoryId,
        category: b.category,
        month: b.month,
        year: b.year,
        limit,
        spent,
        remaining,
        percentage,
        alertThreshold: b.alertThreshold,
        status: isOverBudget ? 'EXCEEDED' : isNearThreshold ? 'WARNING' : 'HEALTHY'
      };
    });

    return {
      month: targetMonth,
      year: targetYear,
      budgets: budgetStatusList
    };
  }

  /**
   * Tạo ngân sách mới
   */
  static async createBudget(userId, data) {
    const existing = await prisma.budget.findFirst({
      where: {
        userId,
        categoryId: data.categoryId || null,
        month: data.month,
        year: data.year
      }
    });

    if (existing) {
      const err = new Error(
        `Ngân sách cho ${data.categoryId ? 'danh mục này' : 'toàn tháng'} trong tháng ${data.month}/${data.year} đã tồn tại`
      );
      err.statusCode = 409;
      throw err;
    }

    const budget = await prisma.budget.create({
      data: {
        userId,
        categoryId: data.categoryId || null,
        amount: data.amount,
        month: data.month,
        year: data.year,
        alertThreshold: data.alertThreshold || 80
      },
      include: {
        category: true
      }
    });

    return budget;
  }

  /**
   * Cập nhật ngân sách
   */
  static async updateBudget(userId, budgetId, data) {
    const budget = await prisma.budget.findFirst({
      where: { id: budgetId, userId }
    });

    if (!budget) {
      const err = new Error('Ngân sách không tồn tại');
      err.statusCode = 404;
      throw err;
    }

    const updated = await prisma.budget.update({
      where: { id: budgetId },
      data: {
        ...(data.amount !== undefined && { amount: data.amount }),
        ...(data.alertThreshold !== undefined && { alertThreshold: data.alertThreshold })
      },
      include: {
        category: true
      }
    });

    return updated;
  }

  /**
   * Xóa ngân sách
   */
  static async deleteBudget(userId, budgetId) {
    const budget = await prisma.budget.findFirst({
      where: { id: budgetId, userId }
    });

    if (!budget) {
      const err = new Error('Ngân sách không tồn tại');
      err.statusCode = 404;
      throw err;
    }

    await prisma.budget.delete({
      where: { id: budgetId }
    });

    return true;
  }

  /**
   * Kiểm tra ngân sách sau khi tạo giao dịch chi tiêu & gửi thông báo nếu vượt ngưỡng
   */
  static async checkBudgetAlerts(userId, transaction) {
    if (transaction.type !== 'EXPENSE') return;

    const txDate = new Date(transaction.date);
    const month = txDate.getMonth() + 1;
    const year = txDate.getFullYear();

    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

    // Tìm các ngân sách có thể bị ảnh hưởng (ngân sách danh mục này hoặc ngân sách tổng)
    const budgets = await prisma.budget.findMany({
      where: {
        userId,
        month,
        year,
        OR: [
          { categoryId: transaction.categoryId },
          { categoryId: null }
        ]
      },
      include: { category: true }
    });

    if (budgets.length === 0) return;

    for (const b of budgets) {
      // Tính toán lại tổng chi tiêu thực tế của danh mục hoặc tổng thể
      let spent = 0;
      if (b.categoryId) {
        const catExpense = await prisma.transaction.aggregate({
          where: {
            userId,
            categoryId: b.categoryId,
            type: 'EXPENSE',
            date: { gte: startOfMonth, lte: endOfMonth }
          },
          _sum: { amount: true }
        });
        spent = Number(catExpense._sum.amount || 0);
      } else {
        const overallExpense = await prisma.transaction.aggregate({
          where: {
            userId,
            type: 'EXPENSE',
            date: { gte: startOfMonth, lte: endOfMonth }
          },
          _sum: { amount: true }
        });
        spent = Number(overallExpense._sum.amount || 0);
      }

      const limit = Number(b.amount);
      const percentage = (spent / limit) * 100;
      const budgetName = b.category ? `mục "${b.category.name}"` : 'toàn tháng';

      if (percentage >= 100) {
        // Cảnh báo vượt ngân sách
        await NotificationService.createBudgetAlertIfNotExists({
          userId,
          title: `⚠️ Vượt ngân sách ${budgetName}!`,
          message: `Bạn đã chi ${formatVND(spent)} / ${formatVND(limit)} (${formatPercent(Math.round(percentage))}) ngân sách ${budgetName} tháng ${month}/${year}.`,
          type: 'BUDGET_ALERT',
          month,
          year
        });
      } else if (percentage >= b.alertThreshold) {
        // Cảnh báo chạm ngưỡng
        await NotificationService.createBudgetAlertIfNotExists({
          userId,
          title: `🔔 Cảnh báo ngân sách ${budgetName}`,
          message: `Chi tiêu ${budgetName} đã đạt ${formatPercent(Math.round(percentage))} hạn mức (${formatVND(spent)} / ${formatVND(limit)}). Hãy cân nhắc chi tiêu nhé!`,
          type: 'BUDGET_ALERT',
          month,
          year
        });
      }
    }
  }
}
