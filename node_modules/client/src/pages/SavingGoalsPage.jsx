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
  ConfirmDialog,
  Skeleton,
  EmptyState,
  useToast
} from '@/components/ui';
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

// Component Vòng Tròn Tiến Độ SVG (Progress Ring)
const ProgressRing = ({ progress = 0, size = 80, strokeWidth = 8, color = '#123D2F' }) => {
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
          stroke="#E8E2D6"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="dark:stroke-[#24332C]"
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
        <span className="text-xs font-extrabold tabular-nums">{clampedProgress}%</span>
      </div>
    </div>
  );
};

export const SavingGoalsPage = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);

  const [isContributeOpen, setIsContributeOpen] = useState(false);
  const [contributeGoal, setContributeGoal] = useState(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    targetAmount: '',
    currentAmount: '',
    deadline: ''
  });

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
    mutationFn: (data) => {
      if (editingGoal) {
        return savingGoalApi.update(editingGoal.id, data);
      }
      return savingGoalApi.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savingGoals'] });
      addToast({
        message: `${editingGoal ? 'Cập nhật' : 'Tạo'} mục tiêu tiết kiệm thành công! 🎯`,
        type: 'success'
      });
      setIsModalOpen(false);
      setEditingGoal(null);
    },
    onError: (err) => {
      addToast({ message: err.message || 'Lỗi khi lưu mục tiêu', type: 'error' });
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
    mutationFn: (id) => savingGoalApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savingGoals'] });
      addToast({ message: 'Đã xóa mục tiêu tiết kiệm thành công!', type: 'success' });
      setIsDeleteDialogOpen(false);
      setDeletingId(null);
    },
    onError: (err) => {
      addToast({ message: err.message || 'Không thể xóa mục tiêu', type: 'error' });
    }
  });

  const openCreateModal = () => {
    setEditingGoal(null);
    setFormData({ title: '', targetAmount: '', currentAmount: '', deadline: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (g) => {
    setEditingGoal(g);
    setFormData({
      title: g.title,
      targetAmount: g.targetAmount,
      currentAmount: g.currentAmount,
      deadline: g.deadline ? new Date(g.deadline).toISOString().split('T')[0] : ''
    });
    setIsModalOpen(true);
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
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-ink-light dark:text-ink-dark">
            Mục Tiêu Tiết Kiệm 🎯
          </h1>
          <p className="text-xs sm:text-sm text-ink-muted mt-1">
            Đặt kế hoạch mua sắm, dự phòng hoặc tích lũy tài chính cho các dự định quan trọng
          </p>
        </div>

        <Button variant="primary" size="sm" icon={Plus} onClick={openCreateModal}>
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
            <Button variant="primary" size="sm" icon={Plus} onClick={openCreateModal}>
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
                    <h3 className="text-base font-bold text-ink-light dark:text-ink-dark line-clamp-2">
                      {g.title}
                    </h3>
                    {g.deadline && (
                      <p className="text-xs text-ink-muted flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-tangerine" />
                        Hạn chót: {new Date(g.deadline).toLocaleDateString('vi-VN')}
                      </p>
                    )}
                  </div>

                  {/* Vòng tròn Progress Ring SVG */}
                  <ProgressRing
                    progress={g.progress}
                    color={isFinished ? '#D4F05A' : '#123D2F'}
                    size={76}
                  />
                </div>

                {/* Tiền đã tích lũy vs Mục tiêu */}
                <div className="space-y-2 p-3.5 rounded-20 bg-sand/20 dark:bg-white/5 border border-border-light/60 dark:border-border-dark/60">
                  <div className="flex justify-between text-xs">
                    <span className="text-ink-muted">Đã tích lũy:</span>
                    <Money amount={g.currentAmount} type="income" className="font-bold" />
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-ink-muted">Mục tiêu:</span>
                    <Money amount={g.targetAmount} type="neutral" className="font-semibold" />
                  </div>
                  <div className="flex justify-between text-xs pt-1 border-t border-border-light/40 dark:border-border-dark/40">
                    <span className="text-ink-muted">Còn thiếu:</span>
                    <Money amount={g.remainingAmount} type="expense" className="font-bold" />
                  </div>
                </div>

                {/* Ngày hoàn thành dự kiến */}
                {g.projectedCompletionDate && (
                  <div className="text-[11px] text-ink-muted flex items-center gap-1.5 bg-mint/30 dark:bg-white/5 px-3 py-1.5 rounded-full w-fit">
                    <Clock className="w-3.5 h-3.5 text-primary dark:text-lime" />
                    <span>
                      Dự kiến hoàn thành: <strong className="text-ink-light dark:text-ink-dark">{g.projectedCompletionDate}</strong>
                    </span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-3 border-t border-border-light/60 dark:border-border-dark/60">
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
                      onClick={() => openEditModal(g)}
                      className="p-1.5 rounded-full hover:bg-sand/60 dark:hover:bg-white/10 text-ink-muted hover:text-ink-light transition-colors"
                      title="Sửa mục tiêu"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        setDeletingId(g.id);
                        setIsDeleteDialogOpen(true);
                      }}
                      className="p-1.5 rounded-full hover:bg-coral/15 text-ink-muted hover:text-coral transition-colors"
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
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingGoal ? 'Chỉnh Sửa Mục Tiêu' : 'Tạo Mục Tiêu Tiết Kiệm Mới'}
        maxWidth="max-w-md"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            saveMutation.mutate({
              ...formData,
              targetAmount: parseFloat(formData.targetAmount),
              currentAmount: parseFloat(formData.currentAmount) || 0,
              deadline: formData.deadline || null
            });
          }}
          className="space-y-4"
        >
          <Input
            label="Tên mục tiêu (*)"
            placeholder="VD: Đổi Laptop làm đồ án, Đi du lịch Đà Lạt..."
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />

          <Input
            label="Số tiền mục tiêu (VND) (*)"
            type="number"
            step="10000"
            placeholder="VD: 15.000.000"
            value={formData.targetAmount}
            onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
            required
          />

          {!editingGoal && (
            <Input
              label="Số tiền đã có sẵn (VND)"
              type="number"
              placeholder="0"
              value={formData.currentAmount}
              onChange={(e) => setFormData({ ...formData, currentAmount: e.target.value })}
            />
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
              Hạn chót dự kiến hoàn thành
            </label>
            <input
              type="date"
              className="w-full bg-surface-light dark:bg-surface-dark text-ink-light dark:text-ink-dark border border-border-light dark:border-border-dark rounded-16 px-4 py-2.5 text-sm outline-none focus:border-primary dark:focus:border-lime"
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border-light dark:border-border-dark">
            <Button type="button" variant="secondary" size="sm" onClick={() => setIsModalOpen(false)}>
              Hủy
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={saveMutation.isPending}>
              {editingGoal ? 'Lưu thay đổi' : 'Tạo mục tiêu'}
            </Button>
          </div>
        </form>
      </Modal>

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
                {w.name} (Khả dụng: {Number(w.balance).toLocaleString('vi-VN')}₫)
              </option>
            ))}
          </Select>

          <div className="flex justify-end gap-2 pt-3 border-t border-border-light dark:border-border-dark">
            <Button type="button" variant="secondary" size="sm" onClick={() => setIsContributeOpen(false)}>
              Hủy
            </Button>
            <Button type="submit" variant="lime" size="sm" isLoading={contributeMutation.isPending} icon={Coins}>
              Xác nhận nạp tiền
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirm Dialog Xóa */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={() => deleteMutation.mutate(deletingId)}
        title="Xóa mục tiêu tiết kiệm"
        message="Bạn có chắc chắn muốn xóa mục tiêu này? Số tiền đã tích lũy sẽ không bị trừ khỏi các ví của bạn."
        confirmText="Xóa mục tiêu"
        isDanger
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};
