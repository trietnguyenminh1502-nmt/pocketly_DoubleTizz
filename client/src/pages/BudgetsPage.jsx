import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { budgetApi, categoryApi } from '@/api/finance';
import {
  Card,
  CardHeader,
  Button,
  Input,
  Select,
  Money,
  ProgressBar,
  Badge,
  Modal,
  ConfirmDialog,
  Skeleton,
  EmptyState,
  useToast
} from '@/components/ui';
import {
  PiggyBank,
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  BellRing
} from 'lucide-react';

export const BudgetsPage = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [formData, setFormData] = useState({
    categoryId: '',
    amount: '',
    alertThreshold: 80,
    month: now.getMonth() + 1,
    year: now.getFullYear()
  });

  // 1. Fetch Danh sách Ngân sách
  const { data: res, isLoading } = useQuery({
    queryKey: ['budgets', { month: selectedMonth, year: selectedYear }],
    queryFn: () => budgetApi.list({ month: selectedMonth, year: selectedYear })
  });

  // 2. Fetch Categories (loại EXPENSE)
  const { data: catRes } = useQuery({
    queryKey: ['categories', 'EXPENSE'],
    queryFn: () => categoryApi.list('EXPENSE')
  });

  const budgets = res?.data?.budgets || [];
  const expenseCategories = catRes?.data?.categories || [];

  const saveMutation = useMutation({
    mutationFn: (data) => {
      if (editingBudget) {
        return budgetApi.update(editingBudget.id, {
          amount: data.amount,
          alertThreshold: data.alertThreshold
        });
      }
      return budgetApi.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      addToast({
        message: `${editingBudget ? 'Cập nhật' : 'Thiết lập'} ngân sách thành công! 🌿`,
        type: 'success'
      });
      setIsModalOpen(false);
      setEditingBudget(null);
    },
    onError: (err) => {
      addToast({ message: err.message || 'Lỗi khi lưu ngân sách', type: 'error' });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => budgetApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      addToast({ message: 'Đã xóa ngân sách thành công!', type: 'success' });
      setIsDeleteDialogOpen(false);
      setDeletingId(null);
    },
    onError: (err) => {
      addToast({ message: err.message || 'Không thể xóa ngân sách', type: 'error' });
    }
  });

  const openCreateModal = () => {
    setEditingBudget(null);
    setFormData({
      categoryId: '',
      amount: '',
      alertThreshold: 80,
      month: selectedMonth,
      year: selectedYear
    });
    setIsModalOpen(true);
  };

  const openEditModal = (b) => {
    setEditingBudget(b);
    setFormData({
      categoryId: b.categoryId || '',
      amount: b.limit,
      alertThreshold: b.alertThreshold || 80,
      month: b.month,
      year: b.year
    });
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Month Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-ink-light dark:text-ink-dark">
            Ngân Sách Chi Tiêu 📊
          </h1>
          <p className="text-xs sm:text-sm text-ink-muted mt-1">
            Đặt hạn mức chi tiêu hàng tháng và tự động nhận cảnh báo trước khi hết tiền
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value, 10))}
            className="w-32 py-2"
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                Tháng {i + 1}
              </option>
            ))}
          </Select>

          <Button variant="primary" size="sm" icon={Plus} onClick={openCreateModal}>
            Thiết lập ngân sách
          </Button>
        </div>
      </div>

      {/* 2. Budget Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <Skeleton className="h-52" />
          <Skeleton className="h-52" />
          <Skeleton className="h-52" />
        </div>
      ) : budgets.length === 0 ? (
        <EmptyState
          title={`Chưa có ngân sách cho Tháng ${selectedMonth}/${selectedYear}`}
          description="Bắt đầu thiết lập ngân sách tổng hoặc cho từng mục như Ăn uống, Giải trí..."
          action={
            <Button variant="primary" size="sm" icon={Plus} onClick={openCreateModal}>
              Tạo ngân sách đầu tiên
            </Button>
          }
          className="py-16"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {budgets.map((b) => {
            const isExceeded = b.status === 'EXCEEDED';
            const isWarning = b.status === 'WARNING';
            const progressColor = isExceeded ? 'coral' : isWarning ? 'tangerine' : 'primary';

            return (
              <Card key={b.id} className="p-6 flex flex-col justify-between space-y-4" hover>
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-base font-bold text-ink-light dark:text-ink-dark">
                        {b.category?.name || 'Ngân sách tổng toàn tháng'}
                      </h3>
                      <p className="text-xs text-ink-muted mt-0.5">
                        Tháng {b.month}/{b.year} • Ngưỡng báo: {b.alertThreshold}%
                      </p>
                    </div>

                    <Badge variant={isExceeded ? 'coral' : isWarning ? 'tangerine' : 'primary'}>
                      {isExceeded ? 'Vượt mức ⚠️' : isWarning ? 'Cảnh báo 🔔' : 'An toàn ✅'}
                    </Badge>
                  </div>

                  {/* Số liệu Đã chi vs Giới hạn */}
                  <div className="mt-4 flex items-baseline justify-between">
                    <div>
                      <span className="text-[11px] text-ink-muted block">Đã chi tiêu</span>
                      <Money amount={b.spent} type={isExceeded ? 'expense' : 'neutral'} className="text-xl font-bold" />
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] text-ink-muted block">Hạn mức</span>
                      <Money amount={b.limit} type="neutral" className="text-sm font-semibold text-ink-muted" />
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-3 space-y-1">
                    <ProgressBar progress={b.percentage} color={progressColor} />
                    <div className="flex justify-between text-[11px] text-ink-muted pt-1">
                      <span>Đã dùng: <strong>{b.percentage}%</strong></span>
                      <span>
                        Còn lại: <strong>{Number(b.remaining).toLocaleString('vi-VN')}₫</strong>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Action Buttons */}
                <div className="flex items-center justify-between pt-3 border-t border-border-light/60 dark:border-border-dark/60 text-xs">
                  <div className="flex items-center gap-1.5 text-ink-muted">
                    {isExceeded ? (
                      <AlertTriangle className="w-3.5 h-3.5 text-coral" />
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary dark:text-lime" />
                    )}
                    <span>{isExceeded ? 'Đã chi vượt hạn mức' : 'Trong tầm kiểm soát'}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(b)}
                      className="p-1.5 rounded-full hover:bg-sand/60 dark:hover:bg-white/10 text-ink-muted hover:text-ink-light transition-colors"
                      title="Sửa ngân sách"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        setDeletingId(b.id);
                        setIsDeleteDialogOpen(true);
                      }}
                      className="p-1.5 rounded-full hover:bg-coral/15 text-ink-muted hover:text-coral transition-colors"
                      title="Xóa ngân sách"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal Thiết Lập / Sửa Ngân Sách */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingBudget ? 'Chỉnh Sửa Ngân Sách' : 'Thiết Lập Ngân Sách Mới'}
        maxWidth="max-w-md"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            saveMutation.mutate({
              ...formData,
              amount: parseFloat(formData.amount),
              alertThreshold: parseInt(formData.alertThreshold, 10),
              categoryId: formData.categoryId || null
            });
          }}
          className="space-y-4"
        >
          {!editingBudget && (
            <Select
              label="Hạng mục áp dụng (*)"
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
            >
              <option value="">Ngân sách tổng toàn tháng (Tất cả chi tiêu)</option>
              {expenseCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          )}

          <Input
            label="Hạn mức số tiền (VND) (*)"
            type="number"
            step="10000"
            placeholder="VD: 2.000.000"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            required
          />

          <Input
            label="Ngưỡng cảnh báo sớm (%)"
            type="number"
            min="10"
            max="100"
            value={formData.alertThreshold}
            onChange={(e) => setFormData({ ...formData, alertThreshold: e.target.value })}
            helperText="Pocketly sẽ tự động gửi thông báo khi chi tiêu chạm ngưỡng này (VD: 80%)"
            required
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-border-light dark:border-border-dark">
            <Button type="button" variant="secondary" size="sm" onClick={() => setIsModalOpen(false)}>
              Hủy
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={saveMutation.isPending}>
              {editingBudget ? 'Lưu thay đổi' : 'Lưu ngân sách'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirm Dialog Xóa Ngân Sách */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={() => deleteMutation.mutate(deletingId)}
        title="Xóa ngân sách"
        message="Bạn có chắc chắn muốn xóa ngân sách này? Dữ liệu các giao dịch thực tế sẽ không bị ảnh hưởng."
        confirmText="Xóa ngân sách"
        isDanger
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};
