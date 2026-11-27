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
  FormModal,
  ConfirmDialog,
  Skeleton,
  EmptyState,
  useToast
} from '@/components/ui';
import { formatPercent } from '../../../shared/formatters.js';
import {
  PiggyBank,
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  BellRing
} from 'lucide-react';
import { useCrudModal } from '@/hooks/useCrudModal';

export const BudgetsPage = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const crudModal = useCrudModal({
    initialFormData: () => ({
      categoryId: '',
      amount: '',
      alertThreshold: 80,
      month: selectedMonth,
      year: selectedYear
    }),
    mapRecordToForm: (budget) => ({
      categoryId: budget.categoryId || '',
      amount: budget.limit,
      alertThreshold: budget.alertThreshold || 80,
      month: budget.month,
      year: budget.year
    })
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
    mutationFn: ({ data, record, mode }) => {
      if (mode === 'edit') {
        return budgetApi.update(record.id, {
          amount: data.amount,
          alertThreshold: data.alertThreshold
        });
      }
      return budgetApi.create(data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      addToast({
        message: `${variables.mode === 'edit' ? 'Cập nhật' : 'Thiết lập'} ngân sách thành công! 🌿`,
        type: 'success'
      });
      crudModal.close();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => budgetApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      addToast({ message: 'Đã xóa ngân sách thành công!', type: 'success' });
      crudModal.cancelDelete();
    },
    onError: (err) => {
      addToast({ message: err.message || 'Không thể xóa ngân sách', type: 'error' });
    }
  });

  const handleSave = async (event) => {
    event.preventDefault();
    const data = {
      ...crudModal.formData,
      amount: parseFloat(crudModal.formData.amount),
      alertThreshold: parseInt(crudModal.formData.alertThreshold, 10),
      categoryId: crudModal.formData.categoryId || null
    };

    try {
      await crudModal.submit((_, record, mode) =>
        saveMutation.mutateAsync({ data, record, mode })
      );
    } catch (error) {
      addToast({ message: error.message || 'Lỗi khi lưu ngân sách', type: 'error' });
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Month Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-primary">
            Ngân Sách Chi Tiêu 📊
          </h1>
          <p className="text-xs sm:text-sm text-secondary mt-1">
            Đặt hạn mức chi tiêu hàng tháng và tự động nhận cảnh báo trước khi hết tiền
          </p>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <Select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value, 10))}
            containerClassName="w-32 sm:w-36"
            className="py-2 text-xs sm:text-sm"
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                Tháng {i + 1}
              </option>
            ))}
          </Select>

          <Button variant="primary" size="md" icon={Plus} onClick={() => crudModal.openCreate()} className="whitespace-nowrap font-semibold text-sm">
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
            <Button variant="primary" size="md" icon={Plus} onClick={() => crudModal.openCreate()} className="font-semibold text-sm">
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
                      <h3 className="text-base font-bold text-primary">
                        {b.category?.name || 'Ngân sách tổng toàn tháng'}
                      </h3>
                      <p className="text-xs text-secondary mt-0.5">
                        Tháng {b.month}/{b.year} • Ngưỡng báo: {formatPercent(b.alertThreshold ?? 0)}
                      </p>
                    </div>

                    <Badge variant={isExceeded ? 'coral' : isWarning ? 'tangerine' : 'primary'}>
                      {isExceeded ? 'Vượt mức ⚠️' : isWarning ? 'Cảnh báo 🔔' : 'An toàn ✅'}
                    </Badge>
                  </div>

                  {/* Số liệu Đã chi vs Giới hạn */}
                  <div className="mt-4 flex items-baseline justify-between">
                    <div>
                      <span className="text-[11px] text-secondary block">Đã chi tiêu</span>
                      <Money amount={b.spent} type={isExceeded ? 'expense' : 'neutral'} className="text-xl font-bold" />
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] text-secondary block">Hạn mức</span>
                      <Money amount={b.limit} type="neutral" className="text-sm font-semibold text-secondary" />
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-3 space-y-1">
                    <ProgressBar progress={b.percentage} color={progressColor} />
                    <div className="flex justify-between text-[11px] text-secondary pt-1">
                      <span>Đã dùng: <strong>{formatPercent(b.percentage ?? 0)}</strong></span>
                      <span>
                        Còn lại: <Money amount={b.remaining} type="neutral" className="font-bold" />
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Action Buttons */}
                <div className="flex items-center justify-between pt-3 border-t border-border/60 text-xs">
                  <div className="flex items-center gap-1.5 text-secondary">
                    {isExceeded ? (
                      <AlertTriangle className="w-3.5 h-3.5 text-coral" />
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5 text-brand dark:text-lime" />
                    )}
                    <span>{isExceeded ? 'Đã chi vượt hạn mức' : 'Trong tầm kiểm soát'}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => crudModal.openEdit(b)}
                      className="p-1.5 rounded-full hover:bg-sand/60 dark:hover:bg-white/10 text-secondary hover:text-ink-light transition-colors"
                      title="Sửa ngân sách"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        crudModal.requestDelete(b.id);
                      }}
                      className="p-1.5 rounded-full hover:bg-coral/15 text-secondary hover:text-coral transition-colors"
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
      <FormModal
        isOpen={crudModal.isOpen}
        onClose={crudModal.close}
        onSubmit={handleSave}
        title={crudModal.mode === 'edit' ? 'Chỉnh Sửa Ngân Sách' : 'Thiết Lập Ngân Sách Mới'}
        maxWidth="max-w-md"
        isSubmitting={crudModal.isSubmitting}
        submitText={crudModal.mode === 'edit' ? 'Lưu thay đổi' : 'Lưu ngân sách'}
      >
          {crudModal.mode === 'create' && (
            <Select
              label="Hạng mục áp dụng (*)"
              value={crudModal.formData.categoryId}
              onChange={(e) => crudModal.setField('categoryId', e.target.value)}
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
            value={crudModal.formData.amount}
            onChange={(e) => crudModal.setField('amount', e.target.value)}
            required
          />

          <Input
            label="Ngưỡng cảnh báo sớm (%)"
            type="number"
            min="10"
            max="100"
            value={crudModal.formData.alertThreshold}
            onChange={(e) => crudModal.setField('alertThreshold', e.target.value)}
            helperText="Pocketly sẽ tự động gửi thông báo khi chi tiêu chạm ngưỡng này (VD: 80%)"
            required
          />

      </FormModal>

      {/* Confirm Dialog Xóa Ngân Sách */}
      <ConfirmDialog
        isOpen={crudModal.isDeleteConfirmationOpen}
        onClose={crudModal.cancelDelete}
        onConfirm={() => deleteMutation.mutate(crudModal.deleteTarget)}
        title="Xóa ngân sách"
        message="Bạn có chắc chắn muốn xóa ngân sách này? Dữ liệu các giao dịch thực tế sẽ không bị ảnh hưởng."
        confirmText="Xóa ngân sách"
        isDanger
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};
