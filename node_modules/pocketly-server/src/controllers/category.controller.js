import { CategoryService } from '../services/category.service.js';
import { successResponse } from '../utils/response.js';
import { createCategorySchema, updateCategorySchema } from '../validators/category.validator.js';

export class CategoryController {
  static async list(req, res, next) {
    try {
      const { type } = req.query;
      const categories = await CategoryService.listCategories(req.user.id, type);

      return successResponse(res, {
        message: 'Lấy danh sách danh mục thành công',
        data: { categories }
      });
    } catch (error) {
      next(error);
    }
  }

  static async create(req, res, next) {
    try {
      const validated = createCategorySchema.parse(req.body);
      const category = await CategoryService.createCategory(req.user.id, validated);

      return successResponse(res, {
        status: 201,
        message: 'Tạo danh mục mới thành công',
        data: { category }
      });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const validated = updateCategorySchema.parse(req.body);
      const category = await CategoryService.updateCategory(req.user.id, id, validated);

      return successResponse(res, {
        message: 'Cập nhật danh mục thành công',
        data: { category }
      });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      await CategoryService.deleteCategory(req.user.id, id);

      return successResponse(res, {
        message: 'Xóa danh mục thành công'
      });
    } catch (error) {
      next(error);
    }
  }
}
