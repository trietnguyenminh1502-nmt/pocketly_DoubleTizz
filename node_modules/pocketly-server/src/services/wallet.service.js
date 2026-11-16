import { prisma } from '../config/prisma.js';

export class WalletService {
  /**
   * Lấy danh sách ví của user
   */
  static async listWallets(userId) {
    const wallets = await prisma.wallet.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
      include: {
        _count: {
          select: { transactions: true }
        }
      }
    });

    const totalBalance = wallets.reduce((acc, w) => acc + Number(w.balance), 0);

    return {
      wallets,
      totalBalance
    };
  }

  /**
   * Lấy chi tiết ví
   */
  static async getWalletById(userId, walletId) {
    const wallet = await prisma.wallet.findFirst({
      where: { id: walletId, userId }
    });

    if (!wallet) {
      const err = new Error('Ví không tồn tại');
      err.statusCode = 404;
      throw err;
    }

    return wallet;
  }

  /**
   * Tạo ví mới
   */
  static async createWallet(userId, { name, balance = 0, icon = 'Wallet' }) {
    const newWallet = await prisma.wallet.create({
      data: {
        userId,
        name: name.trim(),
        balance,
        icon
      }
    });

    return newWallet;
  }

  /**
   * Cập nhật ví (tên, icon)
   */
  static async updateWallet(userId, walletId, { name, icon }) {
    const wallet = await prisma.wallet.findFirst({
      where: { id: walletId, userId }
    });

    if (!wallet) {
      const err = new Error('Ví không tồn tại');
      err.statusCode = 404;
      throw err;
    }

    const updated = await prisma.wallet.update({
      where: { id: walletId },
      data: {
        ...(name && { name: name.trim() }),
        ...(icon && { icon })
      }
    });

    return updated;
  }

  /**
   * Xóa ví
   */
  static async deleteWallet(userId, walletId) {
    const wallet = await prisma.wallet.findFirst({
      where: { id: walletId, userId },
      include: {
        _count: { select: { transactions: true } }
      }
    });

    if (!wallet) {
      const err = new Error('Ví không tồn tại');
      err.statusCode = 404;
      throw err;
    }

    // Đảm bảo user giữ ít nhất 1 ví
    const walletCount = await prisma.wallet.count({ where: { userId } });
    if (walletCount <= 1) {
      const err = new Error('Bạn cần giữ lại ít nhất 1 ví trong hệ thống');
      err.statusCode = 400;
      throw err;
    }

    // Xóa ví
    await prisma.wallet.delete({
      where: { id: walletId }
    });

    return true;
  }

  /**
   * Chuyển tiền giữa 2 ví bằng Prisma $transaction
   */
  static async transferMoney(userId, { fromWalletId, toWalletId, amount, note }) {
    if (fromWalletId === toWalletId) {
      const err = new Error('Không thể chuyển tiền đến cùng một ví');
      err.statusCode = 400;
      throw err;
    }

    return await prisma.$transaction(async (tx) => {
      // 1. Kiểm tra ví nguồn
      const fromWallet = await tx.wallet.findFirst({
        where: { id: fromWalletId, userId }
      });

      if (!fromWallet) {
        const err = new Error('Ví nguồn không tồn tại');
        err.statusCode = 404;
        throw err;
      }

      if (Number(fromWallet.balance) < amount) {
        const err = new Error('Số dư ví nguồn không đủ để thực hiện chuyển tiền');
        err.statusCode = 400;
        throw err;
      }

      // 2. Kiểm tra ví đích
      const toWallet = await tx.wallet.findFirst({
        where: { id: toWalletId, userId }
      });

      if (!toWallet) {
        const err = new Error('Ví đích không tồn tại');
        err.statusCode = 404;
        throw err;
      }

      // 3. Cập nhật số dư 2 ví đồng thời
      const updatedFrom = await tx.wallet.update({
        where: { id: fromWalletId },
        data: {
          balance: { decrement: amount }
        }
      });

      const updatedTo = await tx.wallet.update({
        where: { id: toWalletId },
        data: {
          balance: { increment: amount }
        }
      });

      return {
        fromWallet: updatedFrom,
        toWallet: updatedTo,
        transferredAmount: amount,
        note: note || `Chuyển tiền từ ${fromWallet.name} sang ${toWallet.name}`
      };
    });
  }
}
