import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { savingGoalApi, walletApi } from '@/api/finance';
import {
  Card,
  CardHeader,
  Button,
  Input,
  Select,
  Money,
  Badge,
  Modal,
  FormModal,
  ConfirmDialog,
  Skeleton,
  EmptyState,
  useToast
} from '@/components/ui';
import { formatDate, formatPercent, formatVND } from '../../../shared/formatters.js';
import {
  Target,
  Plus,
  Coins,
  Edit2,
  Trash2,
  Calendar,
  Clock,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { useCrudModal } from '@/hooks/useCrudModal';

// Component Vòng Tròn Tiến Độ SVG (Progress Ring)
const ProgressRing = ({ progress = 0, size = 80, strokeWidth = 8, color = 'rgb(var(--color-chart-primary))' }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const clampedProgress = Math.min(100, Math.max(0, progress));
  const strokeDashoffset = circumference - (clampedProgress / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center shrink-0">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgb(var(--color-chart-border))"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          className="transition-all duration-500 ease-out"
        />
      </svg>
      <div className="absolute text-center">
        <span className="text-xs font-extrabold tabular-nums">{formatPercent(clampedProgress)}</span>
      </div>
    </div>
  );
};

export const SavingGoalsPage = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  const crudModal = useCrudModal({
    initialFormData: {
      title: '',
      targetAmount: '',
      currentAmount: '',
      deadline: ''
    },
    mapRecordToForm: (goal) => ({
      title: goal.title,
      targetAmount: goal.targetAmount,
      currentAmount: goal.currentAmount,
      deadline: goal.deadline ? new Date(goal.deadline).toISOString().split('T')[0] : ''
    })
  });

  const [isContributeOpen, setIsContributeOpen] = useState(false);
  const [contributeGoal, setContributeGoal] = useState(null);

  const [refundWalletId, setRefundWalletId] = useState('');

  const [contributeData, setContributeData] = useState({
    amount: '',
    walletId: ''
  });

  const { data: res, isLoading } = useQuery({
    queryKey: ['savingGoals'],
    queryFn: () => savingGoalApi.list()
  });

  const { data: walletsRes } = useQuery({
    queryKey: ['wallets'],
    queryFn: () => walletApi.list()
  });

  const goals = res?.data?.goals || [];
  const wallets = walletsRes?.data?.wallets || [];

  const saveMutation = useMutation({
    mutationFn: ({ data, record, mode }) => {
      if (mode === 'edit') {
        return savingGoalApi.update(record.id, data);
      }
      return savingGoalApi.create(data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['savingGoals'] });
      addToast({
        message: `${variables.mode === 'edit' ? 'Cập nhật' : 'Tạo'} mục tiêu tiết kiệm thành công! 🎯`,
        type: 'success'
      });
      crudModal.close();
    }
  });

  const contributeMutation = useMutation({
    mutationFn: ({ goalId, data }) => savingGoalApi.contribute(goalId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savingGoals'] });
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      queryClient.invalidateQueries({ queryKey: ['reportSummary'] });
      addToast({ message: 'Đã tích lũy thêm vào quỹ mục tiêu thành công! 💰', type: 'success' });
      setIsContributeOpen(false);
      setContributeGoal(null);
      setContributeData({ amount: '', walletId: '' });
    },
    onError: (err) => {
      addToast({ message: err.message || 'Lỗi khi tích lũy tiền', type: 'error' });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: ({ id, refundWalletId }) => savingGoalApi.delete(id, refundWalletId),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['savingGoals'] });
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      queryClient.invalidateQueries({ queryKey: ['reportSummary'] });
      addToast({
        message: res?.message || 'Đã xóa mục tiêu tiết kiệm thành công!',
        type: 'success'
      });
      crudModal.cancelDelete();
    },
    onError: (err) => {
      addToast({ message: err.message || 'Không thể xóa mục tiêu', type: 'error' });
    }
  });

  const handleSave = async (event) => {
    event.preventDefault();
    const data = {
      ...crudModal.formData,
      targetAmount: parseFloat(crudModal.formData.targetAmount),
      currentAmount: parseFloat(crudModal.formData.currentAmount) || 0,
      deadline: crudModal.formData.deadline || null
    };

    try {
      await crudModal.submit((_, record, mode) =>
        saveMutation.mutateAsync({ data, record, mode })
      );
    } catch (error) {
      addToast({ message: error.message || 'Lỗi khi lưu mục tiêu', type: 'error' });
    }
  };

  const openContributeModal = (g) => {
    setContributeGoal(g);
    setContributeData({
      amount: '',
      walletId: wallets[0]?.id || ''
    });
    setIsContributeOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-primary">
            Mục Tiêu Tiết Kiệm 🎯
          </h1>
          <p className="text-xs sm:text-sm text-secondary mt-1">
            Đặt kế hoạch mua sắm, dự phòng hoặc tích lũy tài chính cho các dự định quan trọng
          </p>
        </div>

        <Button variant="primary" size="md" icon={Plus} onClick={() => crudModal.openCreate()} className="font-semibold text-sm">
          Tạo mục tiêu mới
        </Button>
      </div>

      {/* 2. Goals Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <Skeleton className="h-56" />
          <Skeleton className="h-56" />
          <Skeleton className="h-56" />
        </div>
      ) : goals.length === 0 ? (
        <EmptyState
          title="Chưa có mục tiêu tiết kiệm nào"
          description="Bắt đầu đặt mục tiêu mua Laptop, học thêm chứng chỉ hoặc du lịch hè cùng bạn bè!"
          action={
            <Button variant="primary" size="md" icon={Plus} onClick={() => crudModal.openCreate()} className="font-semibold text-sm">
              Tạo mục tiêu đầu tiên
            </Button>
          }
          className="py-16"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {goals.map((g) => {
            const isFinished = g.isCompleted;

            return (
              <Card key={g.id} className="p-6 flex flex-col justify-between space-y-4" hover>
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-primary line-clamp-2">
                      {g.title}
                    </h3>
                    {g.deadline && (
                      <p className="text-xs text-secondary flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-tangerine" />
                        Hạn chót: {formatDate(g.deadline)}
                      </p>
                    )}
                  </div>

                  {/* Vòng tròn Progress Ring SVG */}
                  <ProgressRing
                    progress={g.progress}
                    color={isFinished ? 'rgb(var(--color-accent))' : 'rgb(var(--color-chart-primary))'}
                    size={76}
                  />
                </div>

                {/* Tiền đã tích lũy vs Mục tiêu */}
                <div className="space-y-2 p-3.5 rounded-20 bg-sand/20 dark:bg-white/5 border border-border/60">
                  <div className="flex justify-between text-xs">
                    <span className="text-secondary">Đã tích lũy:</span>
                    <Money amount={g.currentAmount} type="income" className="font-bold" />
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-secondary">Mục tiêu:</span>
                    <Money amount={g.targetAmount} type="neutral" className="font-semibold" />
                  </div>
                  <div className="flex justify-between text-xs pt-1 border-t border-border/40">
                    <span className="text-secondary">Còn thiếu:</span>
                    <Money amount={g.remainingAmount} type="expense" className="font-bold" />
                  </div>
                </div>

                {/* Ngày hoàn thành dự kiến */}
                {g.projectedCompletionDate && (
                  <div className="text-[11px] text-secondary flex items-center gap-1.5 bg-mint/30 dark:bg-white/5 px-3 py-1.5 rounded-full w-fit">
                    <Clock className="w-3.5 h-3.5 text-brand dark:text-lime" />
                    <span>
                      Dự kiến hoàn thành: <strong className="text-primary">{g.projectedCompletionDate}</strong>
                    </span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-3 border-t border-border/60">
                  <Button
                    variant="lime"
                    size="sm"
                    icon={Coins}
                    onClick={() => openContributeModal(g)}
                  >
                    Tích lũy thêm
                  </Button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => crudModal.openEdit(g)}
                      className="p-1.5 rounded-full hover:bg-sand/60 dark:hover:bg-white/10 text-secondary hover:text-ink-light transition-colors"
                      title="Sửa mục tiêu"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        crudModal.requestDelete(g);
                        setRefundWalletId(wallets[0]?.id || '');
                      }}
                      className="p-1.5 rounded-full hover:bg-coral/15 text-secondary hover:text-coral transition-colors"
                      title="Xóa mục tiêu"
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

      {/* Modal Tạo / Sửa Mục Tiêu */}
      <FormModal
        isOpen={crudModal.isOpen}
        onClose={crudModal.close}
        onSubmit={handleSave}
        title={crudModal.mode === 'edit' ? 'Chỉnh Sửa Mục Tiêu' : 'Tạo Mục Tiêu Tiết Kiệm Mới'}
        maxWidth="max-w-md"
        isSubmitting={crudModal.isSubmitting}
        submitText={crudModal.mode === 'edit' ? 'Lưu thay đổi' : 'Tạo mục tiêu'}
      >
          <Input
            label="Tên mục tiêu (*)"
            placeholder="VD: Đổi Laptop làm đồ án, Đi du lịch Đà Lạt..."
            value={crudModal.formData.title}
            onChange={(e) => crudModal.setField('title', e.target.value)}
            required
          />

          <Input
            label="Số tiền mục tiêu (VND) (*)"
            type="number"
            step="10000"
            placeholder="VD: 15.000.000"
            value={crudModal.formData.targetAmount}
            onChange={(e) => crudModal.setField('targetAmount', e.target.value)}
            required
          />

          {crudModal.mode === 'create' && (
            <Input
              label="Số tiền đã có sẵn (VND)"
              type="number"
              placeholder="0"
              value={crudModal.formData.currentAmount}
              onChange={(e) => crudModal.setField('currentAmount', e.target.value)}
            />
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-secondary">
              Hạn chót dự kiến hoàn thành
            </label>
            <input
              type="date"
              className="w-full bg-surface text-primary border border-border rounded-16 px-4 py-2.5 text-sm outline-none focus:border-primary dark:focus:border-lime"
              value={crudModal.formData.deadline}
              onChange={(e) => crudModal.setField('deadline', e.target.value)}
            />
          </div>
      </FormModal>

      {/* Modal Tích Lũy Thêm (Add Contribution) */}
      <Modal
        isOpen={isContributeOpen}
        onClose={() => setIsContributeOpen(false)}
        title={`Nạp Tiền Vào Quỹ: "${contributeGoal?.title}"`}
        maxWidth="max-w-md"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            contributeMutation.mutate({
              goalId: contributeGoal.id,
              data: {
                amount: parseFloat(contributeData.amount),
                walletId: contributeData.walletId || undefined
              }
            });
          }}
          className="space-y-4"
        >
          <Input
            label="Số tiền nạp thêm (VND) (*)"
            type="number"
            step="10000"
            placeholder="VD: 500.000"
            value={contributeData.amount}
            onChange={(e) => setContributeData({ ...contributeData, amount: e.target.value })}
            required
          />

          <Select
            label="Trừ tiền từ ví (Tùy chọn)"
            value={contributeData.walletId}
            onChange={(e) => setContributeData({ ...contributeData, walletId: e.target.value })}
            helperText="Nếu chọn ví, số dư ví tương ứng sẽ được trừ tự động"
          >
            <option value="">Không trừ ví (Nạp từ nguồn ngoài)</option>
            {wallets.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name} (Khả dụng: {formatVND(w.balance)})
              </option>
            ))}
          </Select>

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button type="button" variant="secondary" size="sm" onClick={() => setIsContributeOpen(false)}>
              Hủy
            </Button>
            <Button type="submit" variant="lime" size="sm" isLoading={contributeMutation.isPending} icon={Coins}>
              Xác nhận nạp tiền
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Xóa có hoàn tiền (nếu mục tiêu đã có tiền tích lũy) */}
      <Modal
        isOpen={crudModal.isDeleteConfirmationOpen && Boolean(crudModal.deleteTarget && Number(crudModal.deleteTarget.currentAmount) > 0)}
        onClose={crudModal.cancelDelete}
        title="Xóa mục tiêu & Hoàn tiền tích lũy"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <div className="p-3.5 rounded-20 bg-coral/10 border border-coral/20 text-xs sm:text-sm text-primary space-y-1.5">
            <p className="font-bold text-coral">
              Bạn đang chuẩn bị xóa mục tiêu: &ldquo;{crudModal.deleteTarget?.title}&rdquo;
            </p>
            <p className="text-xs text-secondary">
              Mục tiêu này đang có số tiền đã tích lũy là{' '}
              <strong className="text-primary font-extrabold text-sm">
                <Money amount={crudModal.deleteTarget?.currentAmount || 0} type="neutral" className="text-primary font-extrabold text-sm" />
              </strong>
              . Bạn có muốn hoàn trả số tiền này về lại một trong các ví của bạn không?
            </p>
          </div>

          <Select
            label="Hoàn trả tiền về ví"
            value={refundWalletId}
            onChange={(e) => setRefundWalletId(e.target.value)}
            helperText="Số tiền tích lũy sẽ được cộng trực tiếp vào số dư ví bạn chọn"
          >
            {wallets.map((w) => (
              <option key={w.id} value={w.id}>
                Hoàn về: {w.name} (Số dư hiện tại: {formatVND(w.balance)})
              </option>
            ))}
            <option value="">Không hoàn trả (Hủy bỏ số tiền tích lũy)</option>
          </Select>

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={crudModal.cancelDelete}
            >
              Hủy
            </Button>
            <Button
              type="button"
              variant="danger"
              size="sm"
              isLoading={deleteMutation.isPending}
              onClick={() => {
                if (crudModal.deleteTarget) {
                  deleteMutation.mutate({
                    id: crudModal.deleteTarget.id,
                    refundWalletId: refundWalletId || undefined
                  });
                }
              }}
            >
              Xác nhận xóa {refundWalletId ? '& Hoàn tiền' : ''}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Confirm Dialog Xóa thông thường (nếu currentAmount === 0) */}
      <ConfirmDialog
        isOpen={crudModal.isDeleteConfirmationOpen && Boolean(crudModal.deleteTarget && Number(crudModal.deleteTarget.currentAmount) <= 0)}
        onClose={crudModal.cancelDelete}
        onConfirm={() => {
          if (crudModal.deleteTarget) {
            deleteMutation.mutate({ id: crudModal.deleteTarget.id, refundWalletId: undefined });
          }
        }}
        title="Xóa mục tiêu tiết kiệm"
        message={`Bạn có chắc chắn muốn xóa mục tiêu "${crudModal.deleteTarget?.title}"? Thao tác này không thể hoàn tác.`}
        confirmText="Xóa mục tiêu"
        isDanger
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};
