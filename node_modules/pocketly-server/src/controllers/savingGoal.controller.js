import { SavingGoalService } from '../services/savingGoal.service.js';
import { successResponse } from '../utils/response.js';
import {
  createSavingGoalSchema,
  updateSavingGoalSchema,
  contributeGoalSchema
} from '../validators/savingGoal.validator.js';

export class SavingGoalController {
  static async list(req, res, next) {
    try {
      const goals = await SavingGoalService.listGoals(req.user.id);
      return successResponse(res, {
        message: 'Lấy danh sách mục tiêu tiết kiệm thành công',
        data: { goals }
      });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const goal = await SavingGoalService.getGoalById(req.user.id, id);

      return successResponse(res, {
        message: 'Lấy thông tin mục tiêu tiết kiệm thành công',
        data: { goal }
      });
    } catch (error) {
      next(error);
    }
  }

  static async create(req, res, next) {
    try {
      const validated = createSavingGoalSchema.parse(req.body);
      const goal = await SavingGoalService.createGoal(req.user.id, validated);

      return successResponse(res, {
        status: 201,
        message: 'Tạo mục tiêu tiết kiệm mới thành công',
        data: { goal }
      });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const validated = updateSavingGoalSchema.parse(req.body);
      const goal = await SavingGoalService.updateGoal(req.user.id, id, validated);

      return successResponse(res, {
        message: 'Cập nhật mục tiêu thành công',
        data: { goal }
      });
    } catch (error) {
      next(error);
    }
  }

  static async contribute(req, res, next) {
    try {
      const { id } = req.params;
      const validated = contributeGoalSchema.parse(req.body);
      const goal = await SavingGoalService.addContribution(req.user.id, id, validated);

      return successResponse(res, {
        message: 'Tích lũy thêm vào mục tiêu thành công 🎯',
        data: { goal }
      });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const refundWalletId = req.body?.refundWalletId || req.query?.refundWalletId || null;
      const result = await SavingGoalService.deleteGoal(req.user.id, id, refundWalletId);

      return successResponse(res, {
        message: result.refundedAmount > 0
          ? `Đã xóa mục tiêu và hoàn trả ${result.refundedAmount.toLocaleString('vi-VN')}₫ về ví thành công!`
          : 'Xóa mục tiêu tiết kiệm thành công',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
}
