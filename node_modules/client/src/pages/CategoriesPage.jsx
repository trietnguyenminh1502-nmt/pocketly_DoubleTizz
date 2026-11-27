import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryApi } from '@/api/finance';
import {
  Card,
  CardHeader,
  Button,
  Input,
  Select,
  Badge,
  FormModal,
  ConfirmDialog,
  Skeleton,
  EmptyState,
  useToast
} from '@/components/ui';
import { CATEGORY_COLOR_OPTIONS, getCategoryColorInfo } from '@/utils/chartTheme';
import {
  Plus,
  Edit2,
  Trash2,
  Tag,
  Utensils,
  Bus,
  Home,
  GraduationCap,
  Gamepad2,
  ShoppingBag,
  HeartPulse,
  Briefcase,
  HandCoins,
  Laptop,
  Award,
  Coffee,
  BookOpen,
  Sparkles
} from 'lucide-react';
import { useCrudModal } from '@/hooks/useCrudModal';

const ICON_OPTIONS = [
  { name: 'Utensils', icon: Utensils, label: 'Ăn uống' },
  { name: 'Coffee', icon: Coffee, label: 'Cà phê' },
  { name: 'Bus', icon: Bus, label: 'Di chuyển' },
  { name: 'Home', icon: Home, label: 'Nhà trọ' },
  { name: 'GraduationCap', icon: GraduationCap, label: 'Học tập' },
  { name: 'BookOpen', icon: BookOpen, label: 'Sách vở' },
  { name: 'Gamepad2', icon: Gamepad2, label: 'Giải trí' },
  { name: 'ShoppingBag', icon: ShoppingBag, label: 'Mua sắm' },
  { name: 'HeartPulse', icon: HeartPulse, label: 'Y tế' },
  { name: 'Briefcase', icon: Briefcase, label: 'Công việc' },
  { name: 'HandCoins', icon: HandCoins, label: 'Trợ cấp' },
  { name: 'Laptop', icon: Laptop, label: 'Freelance' },
  { name: 'Award', icon: Award, label: 'Học bổng' },
  { name: 'Sparkles', icon: Sparkles, label: 'Khác' }
];

export const CategoriesPage = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('ALL'); // ALL, EXPENSE, INCOME
  const crudModal = useCrudModal({
    initialFormData: {
      name: '',
      type: 'EXPENSE',
      icon: 'Utensils',
      color: CATEGORY_COLOR_OPTIONS[0].value
    },
    mapRecordToForm: (category) => ({
      name: category.name,
      type: category.type,
      icon: category.icon,
      color: category.color
    })
  });

  const { data: res, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryApi.list()
  });

  const categories = res?.data?.categories || [];

  const filteredCategories = categories.filter((c) => {
    if (activeTab === 'ALL') return true;
    return c.type === activeTab;
  });

  const saveMutation = useMutation({
    mutationFn: ({ data, record, mode }) => {
      if (mode === 'edit') {
        return categoryApi.update(record.id, data);
      }
      return categoryApi.create(data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      addToast({
        message: `${variables.mode === 'edit' ? 'Cập nhật' : 'Tạo mới'} danh mục thành công! 🌿`,
        type: 'success'
      });
      crudModal.close();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => categoryApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      addToast({ message: 'Đã xóa danh mục thành công!', type: 'success' });
      crudModal.cancelDelete();
    },
    onError: (err) => {
      addToast({ message: err.message || 'Không thể xóa danh mục này', type: 'error' });
    }
  });

  const handleSave = async (event) => {
    event.preventDefault();
    try {
      await crudModal.submit((data, record, mode) =>
        saveMutation.mutateAsync({ data, record, mode })
      );
    } catch (error) {
      addToast({ message: error.message || 'Lỗi khi lưu danh mục', type: 'error' });
    }
  };

  const getIconComponent = (iconName) => {
    const item = ICON_OPTIONS.find((i) => i.name === iconName);
    return item ? item.icon : Tag;
  };

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-primary">
          Danh Mục Tài Chính 🏷️
        </h1>
        <p className="text-xs sm:text-sm text-secondary mt-1">
          Quản lý danh mục thu chi mặc định của hệ thống và tạo danh mục riêng của bạn
        </p>
      </div>

      {/* 2. Filter Tabs & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex gap-2 p-1 rounded-full bg-border-light/40 dark:bg-surface-dark border border-border w-fit">
          {[
            { id: 'ALL', label: 'Tất cả' },
            { id: 'EXPENSE', label: 'Chi tiêu (Expense)' },
            { id: 'INCOME', label: 'Thu nhập (Income)' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-primary text-white dark:bg-lime dark:text-ink-light shadow-soft'
                  : 'text-secondary hover:text-ink-light dark:hover:text-ink-dark'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Button variant="primary" size="md" icon={Plus} className="font-semibold text-sm" onClick={() => crudModal.openCreate()}>
            Thêm danh mục mới
          </Button>
        </div>
      </div>

      {/* 3. Category Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
      ) : filteredCategories.length === 0 ? (
        <EmptyState title="Không có danh mục nào" className="py-16" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredCategories.map((cat) => {
            const IconComp = getIconComponent(cat.icon);
            const color = getCategoryColorInfo(cat);
            return (
              <Card key={cat.id} className="p-4 flex flex-col justify-between" hover>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-11 h-11 rounded-20 flex items-center justify-center shrink-0 shadow-soft ${color.softClassName} ${color.textClassName}`}
                      style={color.hasCustomColor
                        ? { backgroundColor: `${color.color}25`, color: color.color }
                        : undefined}
                    >
                      <IconComp className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-primary">{cat.name}</h4>
                      <Badge variant={cat.type === 'INCOME' ? 'primary' : 'coral'} className="mt-1">
                        {cat.type === 'INCOME' ? 'Thu nhập' : 'Chi tiêu'}
                      </Badge>
                    </div>
                  </div>

                  {cat.isDefault && (
                    <Badge variant="sand" className="text-[10px]">
                      Mặc định
                    </Badge>
                  )}
                </div>

                {/* Nút hành động (chỉ cho phép sửa/xóa với danh mục tùy chỉnh của user) */}
                {!cat.isDefault && (
                  <div className="flex items-center justify-end gap-1 pt-3 mt-3 border-t border-border/60">
                    <button
                      onClick={() => crudModal.openEdit(cat)}
                      className="p-1.5 rounded-full hover:bg-sand/60 dark:hover:bg-white/10 text-secondary hover:text-ink-light transition-colors"
                      title="Sửa danh mục"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        crudModal.requestDelete(cat.id);
                      }}
                      className="p-1.5 rounded-full hover:bg-coral/15 text-secondary hover:text-coral transition-colors"
                      title="Xóa danh mục"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal Tạo / Sửa Danh mục */}
      <FormModal
        isOpen={crudModal.isOpen}
        onClose={crudModal.close}
        onSubmit={handleSave}
        title={crudModal.mode === 'edit' ? 'Chỉnh Sửa Danh Mục' : 'Tạo Danh Mục Mới'}
        maxWidth="max-w-md"
        isSubmitting={crudModal.isSubmitting}
        submitText={crudModal.mode === 'edit' ? 'Lưu thay đổi' : 'Tạo ngay'}
      >
          <Input
            label="Tên danh mục (*)"
            placeholder="VD: Cà phê sáng, Săn sale Shopee..."
            value={crudModal.formData.name}
            onChange={(e) => crudModal.setField('name', e.target.value)}
            required
          />

          <Select
            label="Loại danh mục (*)"
            value={crudModal.formData.type}
            onChange={(e) => crudModal.setField('type', e.target.value)}
          >
            <option value="EXPENSE">Chi tiêu (Expense)</option>
            <option value="INCOME">Thu nhập (Income)</option>
          </Select>

          {/* Chọn Icon */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-secondary">
              Biểu tượng đại diện (Icon)
            </label>
            <div className="grid grid-cols-7 gap-2 p-3 rounded-20 bg-sand/20 dark:bg-surface-dark border border-border max-h-36 overflow-y-auto">
              {ICON_OPTIONS.map((item) => {
                const Icon = item.icon;
                const isSelected = crudModal.formData.icon === item.name;
                return (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => crudModal.setField('icon', item.name)}
                    className={`p-2.5 rounded-16 flex items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-primary text-white dark:bg-lime dark:text-ink-light shadow-soft scale-105'
                        : 'text-secondary hover:bg-black/5 dark:hover:bg-white/5'
                    }`}
                    title={item.label}
                  >
                    <Icon className="w-4 h-4" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Chọn Mã màu Color Picker */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-secondary">
              Bảng màu thương hiệu Pocketly
            </label>
            <div className="flex flex-wrap gap-2.5 p-3 rounded-20 bg-sand/20 dark:bg-surface-dark border border-border">
              {CATEGORY_COLOR_OPTIONS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => crudModal.setField('color', color.value)}
                  className={`w-7 h-7 rounded-full transition-transform ${
                    crudModal.formData.color === color.value ? 'scale-125 ring-2 ring-primary dark:ring-lime' : 'hover:scale-110'
                  } ${color.className}`}
                />
              ))}
            </div>
          </div>

      </FormModal>

      {/* Confirm Xóa danh mục */}
      <ConfirmDialog
        isOpen={crudModal.isDeleteConfirmationOpen}
        onClose={crudModal.cancelDelete}
        onConfirm={() => deleteMutation.mutate(crudModal.deleteTarget)}
        title="Xóa danh mục"
        message="Hệ thống chỉ cho phép xóa nếu danh mục này chưa có giao dịch nào liên kết. Bạn có muốn tiếp tục không?"
        confirmText="Xóa danh mục"
        isDanger
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};
