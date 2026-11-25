import { prisma } from '../config/prisma.js';

export class SavingGoalService {
  /**
   * Tính toán tiến độ (%) và ngày dự kiến hoàn thành
   */
  static computeGoalMetrics(goal) {
    const current = Number(goal.currentAmount);
    const target = Number(goal.targetAmount);
    const progress = target > 0 ? Math.min(100, Math.round((current / target) * 100 * 10) / 10) : 0;
    const remaining = Math.max(0, target - current);

    // Tính tốc độ tích lũy trung bình mỗi ngày kể từ lúc tạo
    const createdDate = new Date(goal.createdAt);
    const now = new Date();
    const daysSinceCreation = Math.max(1, Math.ceil((now - createdDate) / (1000 * 60 * 60 * 24)));
    const dailyRate = current / daysSinceCreation;

    let projectedCompletionDate = null;
    if (remaining === 0) {
      projectedCompletionDate = 'COMPLETED';
    } else if (dailyRate > 0) {
      const daysNeeded = Math.ceil(remaining / dailyRate);
      const projected = new Date(now.getTime() + daysNeeded * 24 * 60 * 60 * 1000);
      projectedCompletionDate = projected.toISOString().split('T')[0];
    }

    return {
      ...goal,
      currentAmount: current,
      targetAmount: target,
      remainingAmount: remaining,
      progress,
      isCompleted: current >= target,
      projectedCompletionDate
    };
  }

  /**
   * Lấy danh sách mục tiêu tiết kiệm
   */
  static async listGoals(userId) {
    const goals = await prisma.savingGoal.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    return goals.map((g) => this.computeGoalMetrics(g));
  }

  /**
   * Lấy chi tiết 1 mục tiêu
   */
  static async getGoalById(userId, goalId) {
    const goal = await prisma.savingGoal.findFirst({
      where: { id: goalId, userId }
    });

    if (!goal) {
      const err = new Error('Mục tiêu tiết kiệm không tồn tại');
      err.statusCode = 404;
      throw err;
    }

    return this.computeGoalMetrics(goal);
  }

  /**
   * Tạo mục tiêu mới
   */
  static async createGoal(userId, data) {
    const goal = await prisma.savingGoal.create({
      data: {
        userId,
        title: data.title.trim(),
        targetAmount: data.targetAmount,
        currentAmount: data.currentAmount || 0,
        deadline: data.deadline ? new Date(data.deadline) : null
      }
    });

    return this.computeGoalMetrics(goal);
  }

  /**
   * Cập nhật mục tiêu
   */
  static async updateGoal(userId, goalId, data) {
    const goal = await prisma.savingGoal.findFirst({
      where: { id: goalId, userId }
    });

    if (!goal) {
      const err = new Error('Mục tiêu tiết kiệm không tồn tại');
      err.statusCode = 404;
      throw err;
    }

    const updated = await prisma.savingGoal.update({
      where: { id: goalId },
      data: {
        ...(data.title && { title: data.title.trim() }),
        ...(data.targetAmount !== undefined && { targetAmount: data.targetAmount }),
        ...(data.deadline !== undefined && {
          deadline: data.deadline ? new Date(data.deadline) : null
        })
      }
    });

    return this.computeGoalMetrics(updated);
  }

  /**
   * Thêm đóng góp tiền vào mục tiêu tiết kiệm (Add Contribution)
   * Có thể trừ tiền từ ví nếu user chọn ví
   */
  static async addContribution(userId, goalId, { amount, walletId }) {
    return await prisma.$transaction(async (tx) => {
      const goal = await tx.savingGoal.findFirst({
        where: { id: goalId, userId }
      });

      if (!goal) {
        const err = new Error('Mục tiêu tiết kiệm không tồn tại');
        err.statusCode = 404;
        throw err;
      }

      // Nếu user chọn ví để đóng góp, kiểm tra số dư và trừ tiền ví
      if (walletId) {
        const wallet = await tx.wallet.findFirst({
          where: { id: walletId, userId }
        });

        if (!wallet) {
          const err = new Error('Ví chỉ định không tồn tại');
          err.statusCode = 404;
          throw err;
        }

        if (Number(wallet.balance) < amount) {
          const err = new Error('Số dư ví không đủ để trích vào quỹ tiết kiệm');
          err.statusCode = 400;
          throw err;
        }

        await tx.wallet.update({
          where: { id: walletId },
          data: {
            balance: { decrement: amount }
          }
        });
      }

      // Tăng số tiền hiện có của mục tiêu
      const updatedGoal = await tx.savingGoal.update({
        where: { id: goalId },
        data: {
          currentAmount: { increment: amount }
        }
      });

      return this.computeGoalMetrics(updatedGoal);
    });
  }

  /**
   * Xóa mục tiêu tiết kiệm
   * Nếu có tiền tích lũy và người dùng chọn ví hoàn tiền, hoàn trả tiền về ví
   */
  static async deleteGoal(userId, goalId, refundWalletId = null) {
    return await prisma.$transaction(async (tx) => {
      const goal = await tx.savingGoal.findFirst({
        where: { id: goalId, userId }
      });

      if (!goal) {
        const err = new Error('Mục tiêu tiết kiệm không tồn tại');
        err.statusCode = 404;
        throw err;
      }

      const currentAmount = Number(goal.currentAmount) || 0;

      // Nếu có tiền tích lũy và user chọn ví nhận hoàn tiền
      if (currentAmount > 0 && refundWalletId) {
        const wallet = await tx.wallet.findFirst({
          where: { id: refundWalletId, userId }
        });

        if (!wallet) {
          const err = new Error('Ví nhận tiền hoàn trả không tồn tại');
          err.statusCode = 404;
          throw err;
        }

        await tx.wallet.update({
          where: { id: refundWalletId },
          data: {
            balance: { increment: currentAmount }
          }
        });
      }

      await tx.savingGoal.delete({
        where: { id: goalId }
      });

      return {
        refundedAmount: refundWalletId ? currentAmount : 0,
        refundWalletId
      };
    });
  }
}
