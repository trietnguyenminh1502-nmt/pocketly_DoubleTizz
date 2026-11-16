import { TransactionService } from '../services/transaction.service.js';
import { successResponse } from '../utils/response.js';
import {
  createTransactionSchema,
  updateTransactionSchema,
  bulkDeleteTransactionSchema,
  transactionFilterSchema
} from '../validators/transaction.validator.js';

export class TransactionController {
  static async list(req, res, next) {
    try {
      const filters = transactionFilterSchema.parse(req.query);
      const data = await TransactionService.listTransactions(req.user.id, filters);

      return successResponse(res, {
        message: 'Lấy danh sách giao dịch thành công',
        data
      });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const transaction = await TransactionService.getTransactionById(req.user.id, id);

      return successResponse(res, {
        message: 'Lấy chi tiết giao dịch thành công',
        data: { transaction }
      });
    } catch (error) {
      next(error);
    }
  }

  static async create(req, res, next) {
    try {
      const validated = createTransactionSchema.parse(req.body);
      const transaction = await TransactionService.createTransaction(req.user.id, validated);

      return successResponse(res, {
        status: 201,
        message: 'Thêm giao dịch mới thành công',
        data: { transaction }
      });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const validated = updateTransactionSchema.parse(req.body);
      const transaction = await TransactionService.updateTransaction(req.user.id, id, validated);

      return successResponse(res, {
        message: 'Cập nhật giao dịch thành công',
        data: { transaction }
      });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      await TransactionService.deleteTransaction(req.user.id, id);

      return successResponse(res, {
        message: 'Xóa giao dịch thành công'
      });
    } catch (error) {
      next(error);
    }
  }

  static async bulkDelete(req, res, next) {
    try {
      const { ids } = bulkDeleteTransactionSchema.parse(req.body);
      const result = await TransactionService.bulkDeleteTransactions(req.user.id, ids);

      return successResponse(res, {
        message: `Đã xóa thành công ${result.deletedCount} giao dịch`,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  static async exportExcel(req, res, next) {
    try {
      const filters = transactionFilterSchema.parse(req.query);
      const buffer = await TransactionService.exportToExcel(req.user.id, filters);

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=pocketly-transactions-${Date.now()}.xlsx`
      );

      return res.send(buffer);
    } catch (error) {
      next(error);
    }
  }

  static async exportCSV(req, res, next) {
    try {
      const filters = transactionFilterSchema.parse(req.query);
      const buffer = await TransactionService.exportToCSV(req.user.id, filters);

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=pocketly-transactions-${Date.now()}.csv`
      );

      return res.send(buffer);
    } catch (error) {
      next(error);
    }
  }
}
