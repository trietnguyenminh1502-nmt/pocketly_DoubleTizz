import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { transactionApi } from '@/api/finance';
import { Modal, Button, Input, Select, Textarea, useToast } from '@/components/ui';
import { Plus, Edit2 } from 'lucide-react';

const transactionSchema = z.object({
  type: z.enum(['EXPENSE', 'INCOME']),
  amount: z.coerce.number().positive('Số tiền phải lớn hơn 0'),
  categoryId: z.string().min(1, 'Vui lòng chọn danh mục'),
  walletId: z.string().min(1, 'Vui lòng chọn ví thanh toán'),
  date: z.string().min(1, 'Vui lòng chọn ngày giao dịch'),
  note: z.string().max(255).optional().nullable()
});

export const TransactionFormModal = ({
  isOpen,
  onClose,
  initialData = null,
  categories = [],
  wallets = []
}) => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  const isEdit = !!initialData;

  const defaultValues = {
    type: initialData?.type || 'EXPENSE',
    amount: initialData ? Number(initialData.amount) : '',
    categoryId: initialData?.categoryId || (categories[0]?.id || ''),
    walletId: initialData?.walletId || (wallets[0]?.id || ''),
    date: initialData?.date
      ? new Date(initialData.date).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
    note: initialData?.note || ''
  };

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(transactionSchema),
    defaultValues
  });

  const selectedType = watch('type');

  useEffect(() => {
    if (initialData) {
      reset({
        type: initialData.type,
        amount: Number(initialData.amount),
        categoryId: initialData.categoryId,
        walletId: initialData.walletId,
        date: new Date(initialData.date).toISOString().split('T')[0],
        note: initialData.note || ''
      });
    } else {
      reset({
        type: 'EXPENSE',
        amount: '',
        categoryId: categories.find((c) => c.type === 'EXPENSE')?.id || categories[0]?.id || '',
        walletId: wallets[0]?.id || '',
        date: new Date().toISOString().split('T')[0],
        note: ''
      });
    }
  }, [initialData, categories, wallets, reset, isOpen]);

  // Lọc danh mục theo loại Thu/Chi
  const filteredCategories = categories.filter((c) => c.type === selectedType);

  const mutation = useMutation({
    mutationFn: (data) => {
      if (isEdit) {
        return transactionApi.update(initialData.id, data);
      }
      return transactionApi.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['reportSummary'] });
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['categorySpending'] });
      queryClient.invalidateQueries({ queryKey: ['trends'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });

      addToast({
        message: `${isEdit ? 'Cập nhật' : 'Thêm'} giao dịch thành công! 🌿`,
        type: 'success'
      });
      onClose();
    },
    onError: (err) => {
      addToast({
        message: err.message || 'Không thể lưu giao dịch. Vui lòng kiểm tra lại!',
        type: 'error'
      });
    }
  });

  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Chỉnh Sửa Giao Dịch' : 'Thêm Giao Dịch Mới'}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Toggle Loại giao dịch: Chi tiêu / Thu nhập */}
        <div className="grid grid-cols-2 p-1 rounded-full bg-border-light/40 dark:bg-surface-dark border border-border-light dark:border-border-dark">
          <button
            type="button"
            onClick={() => {
              setValue('type', 'EXPENSE');
              const firstExp = categories.find((c) => c.type === 'EXPENSE');
              if (firstExp) setValue('categoryId', firstExp.id);
            }}
            className={`py-2 rounded-full text-xs font-bold transition-all ${
              selectedType === 'EXPENSE'
                ? 'bg-tangerine text-white shadow-soft'
                : 'text-ink-muted hover:text-ink-light dark:hover:text-ink-dark'
            }`}
          >
            Chi tiêu (Expense)
          </button>
          <button
            type="button"
            onClick={() => {
              setValue('type', 'INCOME');
              const firstInc = categories.find((c) => c.type === 'INCOME');
              if (firstInc) setValue('categoryId', firstInc.id);
            }}
            className={`py-2 rounded-full text-xs font-bold transition-all ${
              selectedType === 'INCOME'
                ? 'bg-primary text-white dark:bg-lime dark:text-ink-light shadow-soft'
                : 'text-ink-muted hover:text-ink-light dark:hover:text-ink-dark'
            }`}
          >
            Thu nhập (Income)
          </button>
        </div>

        {/* Số tiền */}
        <Input
          label="Số tiền (VND) (*)"
          type="number"
          step="1000"
          placeholder="VD: 50.000"
          error={errors.amount?.message}
          {...register('amount')}
          required
        />

        {/* Chọn Danh mục */}
        <Select
          label="Danh mục (*)"
          error={errors.categoryId?.message}
          {...register('categoryId')}
        >
          {filteredCategories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </Select>

        {/* Chọn Ví thanh toán */}
        <Select
          label="Ví thanh toán (*)"
          error={errors.walletId?.message}
          {...register('walletId')}
        >
          {wallets.map((w) => (
            <option key={w.id} value={w.id}>
              {w.name} (Số dư: {Number(w.balance).toLocaleString('vi-VN')}₫)
            </option>
          ))}
        </Select>

        {/* Ngày giao dịch */}
        <div className="flex flex-col gap-1.5 w-full">
          <label className="text-xs font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-dark/70">
            Ngày giao dịch (*)
          </label>
          <input
            type="date"
            className="w-full bg-surface-light dark:bg-surface-dark text-ink-light dark:text-ink-dark border border-border-light dark:border-border-dark rounded-16 px-4 py-2.5 text-sm outline-none focus:border-primary dark:focus:border-lime"
            {...register('date')}
            required
          />
          {errors.date?.message && (
            <span className="text-xs text-coral font-medium">{errors.date.message}</span>
          )}
        </div>

        {/* Ghi chú */}
        <Textarea
          label="Ghi chú chi tiết"
          placeholder="VD: Cơm trưa với bạn bè, tiền mua giáo trình..."
          rows={2}
          error={errors.note?.message}
          {...register('note')}
        />

        {/* Nút hành động */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border-light dark:border-border-dark">
          <Button type="button" variant="secondary" size="sm" onClick={onClose} disabled={mutation.isPending}>
            Hủy
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={mutation.isPending}
            icon={isEdit ? Edit2 : Plus}
          >
            {isEdit ? 'Lưu thay đổi' : 'Tạo giao dịch'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
