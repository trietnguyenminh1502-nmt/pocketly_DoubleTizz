import { prisma } from '../config/prisma.js';

export class CategoryService {
  /**
   * Danh sách danh mục: hệ thống (isDefault=true hoặc userId=null) + của riêng user
   */
  static async listCategories(userId, type) {
    const where = {
      OR: [
        { userId: null },
        { isDefault: true },
        { userId }
      ]
    };

    if (type) {
      where.type = type;
    }

    const categories = await prisma.category.findMany({
      where,
      orderBy: [
        { isDefault: 'desc' },
        { name: 'asc' }
      ]
    });

    return categories;
  }

  /**
   * Tạo danh mục tùy chỉnh của riêng user
   */
  static async createCategory(userId, data) {
    const existing = await prisma.category.findFirst({
      where: {
        name: { equals: data.name.trim(), mode: 'insensitive' },
        type: data.type,
        OR: [{ userId: null }, { userId }]
      }
    });

    if (existing) {
      const err = new Error(`Danh mục "${data.name}" đã tồn tại`);
      err.statusCode = 409;
      throw err;
    }

    const newCategory = await prisma.category.create({
      data: {
        name: data.name.trim(),
        icon: data.icon,
        color: data.color,
        type: data.type,
        isDefault: false,
        userId
      }
    });

    return newCategory;
  }

  /**
   * Cập nhật danh mục của riêng user (không được sửa danh mục hệ thống)
   */
  static async updateCategory(userId, categoryId, data) {
    const category = await prisma.category.findUnique({
      where: { id: categoryId }
    });

    if (!category) {
      const err = new Error('Danh mục không tồn tại');
      err.statusCode = 404;
      throw err;
    }

    if (category.isDefault || category.userId !== userId) {
      const err = new Error('Bạn chỉ có thể chỉnh sửa các danh mục do chính bạn tạo');
      err.statusCode = 403;
      throw err;
    }

    const updated = await prisma.category.update({
      where: { id: categoryId },
      data: {
        ...(data.name && { name: data.name.trim() }),
        ...(data.icon && { icon: data.icon }),
        ...(data.color && { color: data.color }),
        ...(data.type && { type: data.type })
      }
    });

    return updated;
  }

  /**
   * Xóa danh mục của riêng user
   */
  static async deleteCategory(userId, categoryId) {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        _count: {
          select: { transactions: true }
        }
      }
    });

    if (!category) {
      const err = new Error('Danh mục không tồn tại');
      err.statusCode = 404;
      throw err;
    }

    if (category.isDefault || category.userId !== userId) {
      const err = new Error('Không thể xóa danh mục mặc định của hệ thống');
      err.statusCode = 403;
      throw err;
    }

    if (category._count.transactions > 0) {
      const err = new Error(
        `Không thể xóa danh mục này vì đang có ${category._count.transactions} giao dịch liên kết`
      );
      err.statusCode = 400;
      throw err;
    }

    await prisma.category.delete({
      where: { id: categoryId }
    });

    return true;
  }
}
