import { WalletService } from '../services/wallet.service.js';
import { successResponse } from '../utils/response.js';
import {
  createWalletSchema,
  updateWalletSchema,
  transferWalletSchema
} from '../validators/wallet.validator.js';

export class WalletController {
  static async list(req, res, next) {
    try {
      const data = await WalletService.listWallets(req.user.id);
      return successResponse(res, {
        message: 'Lấy danh sách ví thành công',
        data
      });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const wallet = await WalletService.getWalletById(req.user.id, id);

      return successResponse(res, {
        message: 'Lấy thông tin ví thành công',
        data: { wallet }
      });
    } catch (error) {
      next(error);
    }
  }

  static async create(req, res, next) {
    try {
      const validated = createWalletSchema.parse(req.body);
      const wallet = await WalletService.createWallet(req.user.id, validated);

      return successResponse(res, {
        status: 201,
        message: 'Tạo ví mới thành công',
        data: { wallet }
      });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const validated = updateWalletSchema.parse(req.body);
      const wallet = await WalletService.updateWallet(req.user.id, id, validated);

      return successResponse(res, {
        message: 'Cập nhật ví thành công',
        data: { wallet }
      });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      await WalletService.deleteWallet(req.user.id, id);

      return successResponse(res, {
        message: 'Xóa ví thành công'
      });
    } catch (error) {
      next(error);
    }
  }

  static async transfer(req, res, next) {
    try {
      const validated = transferWalletSchema.parse(req.body);
      const result = await WalletService.transferMoney(req.user.id, validated);

      return successResponse(res, {
        message: 'Chuyển tiền giữa các ví thành công',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
}
