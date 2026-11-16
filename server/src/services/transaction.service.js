import ExcelJS from 'exceljs';
import { prisma } from '../config/prisma.js';
import { BudgetService } from './budget.service.js';

export class TransactionService {
  /**
   * Tạo giao dịch mới & cập nhật số dư ví tự động
   */
  static async createTransaction(userId, data) {
    const transaction = await prisma.$transaction(async (tx) => {
      // 1. Kiểm tra ví thuộc về user
      const wallet = await tx.wallet.findFirst({
        where: { id: data.walletId, userId }
      });
      if (!wallet) {
        const err = new Error('Ví không tồn tại');
        err.statusCode = 404;
        throw err;
      }

      // 2. Kiểm tra danh mục
      const category = await tx.category.findFirst({
        where: {
          id: data.categoryId,
          OR: [{ userId: null }, { isDefault: true }, { userId }]
        }
      });
      if (!category) {
        const err = new Error('Danh mục không tồn tại');
        err.statusCode = 404;
        throw err;
      }

      // 3. Tạo bản ghi giao dịch
      const newTx = await tx.transaction.create({
        data: {
          userId,
          walletId: data.walletId,
          categoryId: data.categoryId,
          type: data.type,
          amount: data.amount,
          note: data.note ? data.note.trim() : null,
          date: data.date ? new Date(data.date) : new Date()
        },
        include: {
          category: {
            select: { id: true, name: true, icon: true, color: true, type: true }
          },
          wallet: {
            select: { id: true, name: true, icon: true }
          }
        }
      });

      // 4. Cập nhật số dư ví: Thu nhập thì cộng thêm, Chi tiêu thì trừ bớt
      const balanceChange = data.type === 'INCOME' ? data.amount : -data.amount;
      await tx.wallet.update({
        where: { id: data.walletId },
        data: {
          balance: { increment: balanceChange }
        }
      });

      return newTx;
    });

    // 5. Kiểm tra ngân sách nếu là chi tiêu (chạy bất đồng bộ an toàn sau khi commit transaction)
    if (transaction.type === 'EXPENSE') {
      BudgetService.checkBudgetAlerts(userId, transaction).catch((err) => {
        console.error('Lỗi khi kiểm tra ngân sách tự động:', err);
      });
    }

    return transaction;
  }

  /**
   * Lấy danh sách giao dịch có bộ lọc, tìm kiếm, sắp xếp và phân trang
   */
  static async listTransactions(userId, filters) {
    const {
      startDate,
      endDate,
      categoryId,
      type,
      walletId,
      minAmount,
      maxAmount,
      search,
      sortBy = 'date',
      order = 'desc',
      page = 1,
      limit = 20
    } = filters;

    const where = { userId };

    // Lọc theo ngày
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    // Lọc theo danh mục, loại, ví
    if (categoryId) where.categoryId = categoryId;
    if (type) where.type = type;
    if (walletId) where.walletId = walletId;

    // Lọc theo khoảng tiền
    if (minAmount !== undefined || maxAmount !== undefined) {
      where.amount = {};
      if (minAmount !== undefined) where.amount.gte = minAmount;
      if (maxAmount !== undefined) where.amount.lte = maxAmount;
    }

    // Tìm kiếm theo ghi chú
    if (search && search.trim() !== '') {
      where.note = {
        contains: search.trim(),
        mode: 'insensitive'
      };
    }

    const skip = (page - 1) * limit;

    const [total, transactions, summary] = await Promise.all([
      prisma.transaction.count({ where }),
      prisma.transaction.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: order },
        include: {
          category: {
            select: { id: true, name: true, icon: true, color: true, type: true }
          },
          wallet: {
            select: { id: true, name: true, icon: true }
          }
        }
      }),
      // Thống kê tổng thu nhập và tổng chi tiêu theo bộ lọc
      prisma.transaction.groupBy({
        by: ['type'],
        where,
        _sum: { amount: true }
      })
    ]);

    let totalIncome = 0;
    let totalExpense = 0;

    summary.forEach((item) => {
      if (item.type === 'INCOME') totalIncome = Number(item._sum.amount || 0);
      if (item.type === 'EXPENSE') totalExpense = Number(item._sum.amount || 0);
    });

    return {
      transactions,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        totalIncome,
        totalExpense
      }
    };
  }

  /**
   * Lấy chi tiết 1 giao dịch
   */
  static async getTransactionById(userId, transactionId) {
    const transaction = await prisma.transaction.findFirst({
      where: { id: transactionId, userId },
      include: {
        category: true,
        wallet: true
      }
    });

    if (!transaction) {
      const err = new Error('Giao dịch không tồn tại');
      err.statusCode = 404;
      throw err;
    }

    return transaction;
  }

  /**
   * Cập nhật giao dịch & điều chỉnh lại số dư ví tự động
   */
  static async updateTransaction(userId, transactionId, data) {
    return await prisma.$transaction(async (tx) => {
      // 1. Kiểm tra giao dịch cũ
      const oldTx = await tx.transaction.findFirst({
        where: { id: transactionId, userId }
      });

      if (!oldTx) {
        const err = new Error('Giao dịch không tồn tại');
        err.statusCode = 404;
        throw err;
      }

      // 2. Hoàn lại số dư ví cũ trước khi cập nhật
      const oldRevertDelta = oldTx.type === 'INCOME' ? -Number(oldTx.amount) : Number(oldTx.amount);
      await tx.wallet.update({
        where: { id: oldTx.walletId },
        data: {
          balance: { increment: oldRevertDelta }
        }
      });

      // 3. Xác định thông tin mới
      const targetWalletId = data.walletId || oldTx.walletId;
      const targetType = data.type || oldTx.type;
      const targetAmount = data.amount !== undefined ? data.amount : Number(oldTx.amount);

      // Kiểm tra ví mới nếu có thay đổi
      if (data.walletId && data.walletId !== oldTx.walletId) {
        const validWallet = await tx.wallet.findFirst({
          where: { id: data.walletId, userId }
        });
        if (!validWallet) {
          const err = new Error('Ví chỉ định không tồn tại');
          err.statusCode = 404;
          throw err;
        }
      }

      // 4. Áp dụng số dư mới vào ví mới
      const newDelta = targetType === 'INCOME' ? targetAmount : -targetAmount;
      await tx.wallet.update({
        where: { id: targetWalletId },
        data: {
          balance: { increment: newDelta }
        }
      });

      // 5. Cập nhật bản ghi giao dịch
      const updated = await tx.transaction.update({
        where: { id: transactionId },
        data: {
          ...(data.walletId && { walletId: data.walletId }),
          ...(data.categoryId && { categoryId: data.categoryId }),
          ...(data.type && { type: data.type }),
          ...(data.amount !== undefined && { amount: data.amount }),
          ...(data.note !== undefined && { note: data.note ? data.note.trim() : null }),
          ...(data.date && { date: new Date(data.date) })
        },
        include: {
          category: {
            select: { id: true, name: true, icon: true, color: true, type: true }
          },
          wallet: {
            select: { id: true, name: true, icon: true }
          }
        }
      });

      return updated;
    });
  }

  /**
   * Xóa 1 giao dịch & hoàn lại số dư ví tự động
   */
  static async deleteTransaction(userId, transactionId) {
    return await prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.findFirst({
        where: { id: transactionId, userId }
      });

      if (!transaction) {
        const err = new Error('Giao dịch không tồn tại');
        err.statusCode = 404;
        throw err;
      }

      // Hoàn lại tiền vào ví
      const revertDelta = transaction.type === 'INCOME' ? -Number(transaction.amount) : Number(transaction.amount);
      await tx.wallet.update({
        where: { id: transactionId },
        where: { id: transaction.walletId },
        data: {
          balance: { increment: revertDelta }
        }
      });

      await tx.transaction.delete({
        where: { id: transactionId }
      });

      return true;
    });
  }

  /**
   * Xóa hàng loạt giao dịch (Bulk Delete) & hoàn trả số dư chính xác
   */
  static async bulkDeleteTransactions(userId, ids) {
    return await prisma.$transaction(async (tx) => {
      const transactions = await tx.transaction.findMany({
        where: {
          id: { in: ids },
          userId
        }
      });

      if (transactions.length === 0) {
        return { deletedCount: 0 };
      }

      // Nhóm hoàn trả số dư theo từng ví
      const walletAdjustments = {};
      transactions.forEach((t) => {
        const delta = t.type === 'INCOME' ? -Number(t.amount) : Number(t.amount);
        walletAdjustments[t.walletId] = (walletAdjustments[t.walletId] || 0) + delta;
      });

      // Cập nhật từng ví
      for (const [wId, adj] of Object.entries(walletAdjustments)) {
        await tx.wallet.update({
          where: { id: wId },
          data: { balance: { increment: adj } }
        });
      }

      // Xóa tất cả các giao dịch đã chọn
      const result = await tx.transaction.deleteMany({
        where: {
          id: { in: transactions.map((t) => t.id) },
          userId
        }
      });

      return { deletedCount: result.count };
    });
  }

  /**
   * Xuất danh sách giao dịch ra Excel (ExcelJS)
   */
  static async exportToExcel(userId, filters) {
    // Lấy toàn bộ giao dịch thỏa mãn điều kiện lọc
    const { transactions } = await this.listTransactions(userId, { ...filters, limit: 10000, page: 1 });

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Pocketly 🌿';
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet('Giao Dịch Pocketly');

    // Thiết lập cột
    worksheet.columns = [
      { header: 'Mã GD', key: 'id', width: 36 },
      { header: 'Ngày', key: 'date', width: 14 },
      { header: 'Loại', key: 'type', width: 12 },
      { header: 'Danh Mục', key: 'category', width: 22 },
      { header: 'Ví', key: 'wallet', width: 18 },
      { header: 'Số Tiền (VND)', key: 'amount', width: 18 },
      { header: 'Ghi Chú', key: 'note', width: 32 }
    ];

    // Style Header
    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF123D2F' } // Primary Forest Green
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });

    transactions.forEach((tx) => {
      const row = worksheet.addRow({
        id: tx.id,
        date: new Date(tx.date).toLocaleDateString('vi-VN'),
        type: tx.type === 'INCOME' ? 'Thu nhập' : 'Chi tiêu',
        category: tx.category?.name || 'Chưa phân loại',
        wallet: tx.wallet?.name || '',
        amount: Number(tx.amount),
        note: tx.note || ''
      });

      // Format số tiền
      const amountCell = row.getCell('amount');
      amountCell.numFmt = '#,##0 "₫"';
      amountCell.font = {
        color: { argb: tx.type === 'INCOME' ? 'FF123D2F' : 'FFFF6A2B' },
        bold: true
      };
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  }

  /**
   * Xuất danh sách giao dịch ra CSV
   */
  static async exportToCSV(userId, filters) {
    const { transactions } = await this.listTransactions(userId, { ...filters, limit: 10000, page: 1 });

    const headers = ['Mã GD', 'Ngày', 'Loại', 'Danh Mục', 'Ví', 'Số Tiền', 'Ghi Chú'];
    const rows = transactions.map((tx) => [
      `"${tx.id}"`,
      `"${new Date(tx.date).toLocaleDateString('vi-VN')}"`,
      `"${tx.type === 'INCOME' ? 'Thu nhập' : 'Chi tiêu'}"`,
      `"${tx.category?.name || ''}"`,
      `"${tx.wallet?.name || ''}"`,
      tx.amount,
      `"${(tx.note || '').replace(/"/g, '""')}"`
    ]);

    // BOM (\uFEFF) giúp Excel mở file CSV tiếng Việt không bị lỗi font
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    return Buffer.from(csvContent, 'utf-8');
  }
}
