import { BudgetService } from '../services/budget.service.js';
import { successResponse } from '../utils/response.js';
import {
  createBudgetSchema,
  updateBudgetSchema,
  budgetQuerySchema
} from '../validators/budget.validator.js';

export class BudgetController {
  static async listStatus(req, res, next) {
    try {
      const query = budgetQuerySchema.parse(req.query);
      const data = await BudgetService.listBudgetsWithStatus(req.user.id, query);

      return successResponse(res, {
        message: 'Lấy trạng thái ngân sách thành công',
        data
      });
    } catch (error) {
      next(error);
    }
  }

  static async create(req, res, next) {
    try {
      const validated = createBudgetSchema.parse(req.body);
      const budget = await BudgetService.createBudget(req.user.id, validated);

      return successResponse(res, {
        status: 201,
        message: 'Thiết lập ngân sách mới thành công',
        data: { budget }
      });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const validated = updateBudgetSchema.parse(req.body);
      const budget = await BudgetService.updateBudget(req.user.id, id, validated);

      return successResponse(res, {
        message: 'Cập nhật ngân sách thành công',
        data: { budget }
      });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      await BudgetService.deleteBudget(req.user.id, id);

      return successResponse(res, {
        message: 'Xóa ngân sách thành công'
      });
    } catch (error) {
      next(error);
    }
  }
}
