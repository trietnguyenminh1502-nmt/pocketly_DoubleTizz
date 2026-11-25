import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/api/admin';
import {
  Card,
  CardHeader,
  Button,
  Input,
  Select,
  Badge,
  Modal,
  ConfirmDialog,
  Skeleton,
  EmptyState,
  useToast
} from '@/components/ui';
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
  Sparkles,
  ShieldCheck
} from 'lucide-react';

const ICON_MAP = {
  Utensils,
  Coffee,
  Bus,
  Home,
  GraduationCap,
  BookOpen,
  Gamepad2,
  ShoppingBag,
  HeartPulse,
  Briefcase,
  HandCoins,
  Laptop,
  Award,
  Sparkles
};

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

const COLOR_PALETTE = [
  '#FF6A2B', // Tangerine (Cam tươi)
  '#3B82F6', // Blue (Xanh dương)
  '#8B5CF6', // Purple (Tím Violet)
  '#06B6D4', // Cyan (Xanh lơ)
  '#10B981', // Emerald (Xanh ngọc lục bảo)
  '#F59E0B', // Amber (Vàng nghệ)
  '#EC4899', // Pink (Hồng cánh sen)
  '#123D2F', // Forest Green (Xanh rừng đậm)
  '#D4F05A', // Lime (Xanh chuối neon)
  '#14B8A6', // Teal (Xanh mòng két)
  '#E57373', // Red Coral (Đỏ san hô)
  '#64748B'  // Slate (Xám đá)
];

export const AdminCategoriesPage = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('ALL'); // ALL, EXPENSE, INCOME
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    type: 'EXPENSE',
    icon: 'Utensils',
    color: '#FF6A2B'
  });

  // 1. Fetch danh mục hệ thống
  const { data: categoriesRes, isLoading } = useQuery({
    queryKey: ['adminDefaultCategories'],
    queryFn: () => adminApi.listDefaultCategories()
  });

  const categories = categoriesRes?.data?.categories || [];

  // Lọc theo loại
  const filteredCategories = categories.filter((cat) => {
    if (activeTab === 'ALL') return true;
    return cat.type === activeTab;
  });

  // 2. Mutations
  const createMutation = useMutation({
    mutationFn: (data) => adminApi.createDefaultCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['adminDefaultCategories']);
      addToast({ message: 'Tạo danh mục hệ thống thành công! ✨', type: 'success' });
      setIsModalOpen(false);
      resetForm();
    },
    onError: (err) => {
      addToast({
        message: err.response?.data?.message || 'Không thể tạo danh mục hệ thống',
        type: 'error'
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => adminApi.updateDefaultCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['adminDefaultCategories']);
      addToast({ message: 'Cập nhật danh mục hệ thống thành công! 🎯', type: 'success' });
      setIsModalOpen(false);
      resetForm();
    },
    onError: (err) => {
      addToast({
        message: err.response?.data?.message || 'Không thể cập nhật danh mục hệ thống',
        type: 'error'
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => adminApi.deleteDefaultCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['adminDefaultCategories']);
      addToast({ message: 'Đã xóa danh mục hệ thống!', type: 'success' });
      setIsDeleteDialogOpen(false);
      setDeletingId(null);
    },
    onError: (err) => {
      addToast({
        message: err.response?.data?.message || 'Không thể xóa danh mục này',
        type: 'error'
      });
    }
  });

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'EXPENSE',
      icon: 'Utensils',
      color: '#FF6A2B'
    });
    setEditingCategory(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      type: category.type,
      icon: category.icon,
      color: category.color
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      addToast({ message: 'Vui lòng nhập tên danh mục', type: 'warning' });
      return;
    }

    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDeletePrompt = (id) => {
    setDeletingId(id);
    setIsDeleteDialogOpen(true);
  };

  const renderIcon = (iconName, color, className = 'w-5 h-5') => {
    const IconComponent = ICON_MAP[iconName] || Tag;
    return <IconComponent className={className} style={{ color }} />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-heading font-extrabold text-ink-light dark:text-ink-dark flex items-center gap-2.5">
            <span>🏷️</span> Quản lý Danh mục Hệ thống
          </h1>
          <p className="text-sm text-ink-muted mt-1">
            Các danh mục mặc định dùng chung được cung cấp sẵn cho sinh viên khi đăng ký Pocketly.
          </p>
        </div>

        <Button
          onClick={handleOpenCreate}
          variant="primary"
          size="md"
          icon={Plus}
          className="shadow-soft self-start sm:self-auto font-semibold text-sm"
        >
          Thêm danh mục mới
        </Button>
      </div>

      {/* Tabs Filter */}
      <div className="flex items-center gap-2 border-b border-border-light dark:border-border-dark pb-3">
        <button
          onClick={() => setActiveTab('ALL')}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
            activeTab === 'ALL'
              ? 'bg-tangerine text-white shadow-soft'
              : 'text-ink-muted hover:text-ink-light dark:hover:text-ink-dark hover:bg-sand/30 dark:hover:bg-white/5'
          }`}
        >
          Tất cả ({categories.length})
        </button>
        <button
          onClick={() => setActiveTab('EXPENSE')}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
            activeTab === 'EXPENSE'
              ? 'bg-coral text-white shadow-soft'
              : 'text-ink-muted hover:text-ink-light dark:hover:text-ink-dark hover:bg-sand/30 dark:hover:bg-white/5'
          }`}
        >
          Chi tiêu ({categories.filter((c) => c.type === 'EXPENSE').length})
        </button>
        <button
          onClick={() => setActiveTab('INCOME')}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
            activeTab === 'INCOME'
              ? 'bg-primary dark:bg-lime text-white dark:text-forest shadow-soft'
              : 'text-ink-muted hover:text-ink-light dark:hover:text-ink-dark hover:bg-sand/30 dark:hover:bg-white/5'
          }`}
        >
          Thu nhập ({categories.filter((c) => c.type === 'INCOME').length})
        </button>
      </div>

      {/* Content Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <Skeleton key={n} className="h-28 rounded-24" />
          ))}
        </div>
      ) : filteredCategories.length === 0 ? (
        <EmptyState
          icon={Tag}
          title="Chưa có danh mục hệ thống nào"
          description="Hãy tạo các danh mục mặc định mẫu cho học sinh, sinh viên như Ăn uống, Tiền trọ, Học phí..."
          action={
            <Button onClick={handleOpenCreate} variant="primary" size="md" icon={Plus} className="font-semibold text-sm">
              Tạo danh mục đầu tiên
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredCategories.map((cat) => (
            <Card
              key={cat.id}
              className="p-4 flex flex-col justify-between hover:shadow-hover transition-all duration-200 border-border-light dark:border-border-dark group"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-20 flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${cat.color}20` }}
                  >
                    {renderIcon(cat.icon, cat.color, 'w-6 h-6')}
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-base text-ink-light dark:text-ink-dark line-clamp-1">
                      {cat.name}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Badge
                        variant={cat.type === 'EXPENSE' ? 'coral' : 'lime'}
                        size="sm"
                      >
                        {cat.type === 'EXPENSE' ? 'Chi tiêu' : 'Thu nhập'}
                      </Badge>
                      <Badge variant="neutral" size="sm" className="flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-tangerine" />
                        Mặc định
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-1.5 pt-3 mt-3 border-t border-border-light/60 dark:border-border-dark/60">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleOpenEdit(cat)}
                  leftIcon={<Edit2 className="w-3.5 h-3.5 text-ink-muted group-hover:text-tangerine" />}
                  className="text-xs text-ink-muted hover:text-ink-light dark:hover:text-ink-dark"
                >
                  Sửa
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDeletePrompt(cat.id)}
                  leftIcon={<Trash2 className="w-3.5 h-3.5 text-coral" />}
                  className="text-xs text-coral hover:bg-coral/10"
                >
                  Xóa
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal Thêm / Chỉnh sửa Danh mục Hệ thống */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? 'Chỉnh sửa Danh mục Hệ thống' : 'Thêm Danh mục Mặc định Mới'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Tên danh mục"
            placeholder="Ví dụ: Tiền ăn hàng tháng, Học phí..."
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <Select
            label="Loại danh mục"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            options={[
              { label: 'Khoản chi tiêu (EXPENSE)', value: 'EXPENSE' },
              { label: 'Khoản thu nhập (INCOME)', value: 'INCOME' }
            ]}
          />

          {/* Chọn Icon */}
          <div>
            <label className="block text-xs font-bold text-ink-muted mb-2">
              Biểu tượng đại diện ({formData.icon})
            </label>
            <div className="grid grid-cols-7 gap-2 max-h-36 overflow-y-auto p-2 bg-sand/20 dark:bg-white/5 rounded-20 border border-border-light dark:border-border-dark">
              {ICON_OPTIONS.map((item) => {
                const isSelected = formData.icon === item.name;
                const IconCmp = item.icon;
                return (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => setFormData({ ...formData, icon: item.name })}
                    title={item.label}
                    className={`h-10 rounded-16 flex items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-tangerine text-white shadow-soft scale-105'
                        : 'text-ink-muted hover:bg-white/80 dark:hover:bg-white/10 hover:text-ink-light dark:hover:text-ink-dark'
                    }`}
                  >
                    <IconCmp className="w-5 h-5" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Chọn Màu Sắc */}
          <div>
            <label className="block text-xs font-bold text-ink-muted mb-2">
              Mã màu hiển thị
            </label>
            <div className="flex flex-wrap gap-2.5 items-center">
              {COLOR_PALETTE.map((c) => {
                const isSelected = formData.color.toLowerCase() === c.toLowerCase();
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setFormData({ ...formData, color: c })}
                    className={`w-7 h-7 rounded-full transition-transform ${
                      isSelected ? 'ring-2 ring-tangerine ring-offset-2 scale-110' : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                );
              })}
            </div>
          </div>

          {/* Xem trước */}
          <div className="p-3 bg-sand/30 dark:bg-white/5 rounded-20 border border-border-light dark:border-border-dark flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-16 flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${formData.color}20` }}
            >
              {renderIcon(formData.icon, formData.color, 'w-5 h-5')}
            </div>
            <div>
              <p className="text-xs text-ink-muted font-bold">Xem trước hiển thị:</p>
              <p className="text-sm font-heading font-extrabold text-ink-light dark:text-ink-dark">
                {formData.name || 'Tên danh mục mẫu'}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border-light dark:border-border-dark">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Hủy bỏ
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={createMutation.isPending || updateMutation.isPending}
            >
              {editingCategory ? 'Lưu thay đổi' : 'Tạo danh mục'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirm Dialog Xóa */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={() => deleteMutation.mutate(deletingId)}
        title="Xóa danh mục hệ thống?"
        message="Hành động này sẽ xóa danh mục mặc định này khỏi hệ thống. Các giao dịch hiện có đã liên kết với danh mục này có thể bị ảnh hưởng. Bạn có chắc chắn muốn xóa?"
        confirmText="Xác nhận xóa"
        isDanger={true}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};
