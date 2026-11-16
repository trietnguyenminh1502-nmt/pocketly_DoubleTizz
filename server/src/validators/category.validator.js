import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(1, 'Tên danh mục không được để trống').max(50),
  icon: z.string().min(1, 'Icon danh mục là bắt buộc'),
  color: z.string().min(1, 'Mã màu danh mục là bắt buộc'),
  type: z.enum(['INCOME', 'EXPENSE'], {
    errorMap: () => ({ message: 'Loại danh mục phải là INCOME hoặc EXPENSE' })
  })
});

export const updateCategorySchema = createCategorySchema.partial();
