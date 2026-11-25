import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { walletApi } from '@/api/finance';
import {
  Card,
  CardHeader,
  Button,
  Input,
  Select,
  Modal,
  ConfirmDialog,
  Skeleton,
  EmptyState,
  useToast
} from '@/components/ui';
import {
  Wallet,
  Plus,
  ArrowRightLeft,
  CreditCard,
  Banknote,
  Smartphone
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

const WALLET_ICONS = [
  { name: 'Banknote', icon: Banknote, label: 'Tiền mặt' },
  { name: 'CreditCard', icon: CreditCard, label: 'Thẻ ngân hàng' },
  { name: 'Smartphone', icon: Smartphone, label: 'Ví điện tử' },
  { name: 'Wallet', icon: Wallet, label: 'Ví chung' }
];

const getWalletBadgeInfo = (name, index) => {
  const lower = name.toLowerCase();
  if (lower.includes('mb') || lower.includes('ngân hàng') || lower.includes('bank')) {
    return {
      color: '#38BDF8',
      textColor: '#FFFFFF',
      abbr: 'MB'
    };
  }
  if (lower.includes('momo')) {
    return {
      color: '#F43F5E',
      textColor: '#FFFFFF',
      abbr: 'Mo'
    };
  }
  if (lower.includes('tiền mặt') || lower.includes('cash')) {
    return {
      color: '#A3E635',
      textColor: '#16211C',
      abbr: 'TM'
    };
  }
  const fallbackList = [
    { color: '#8B5CF6', textColor: '#FFFFFF' },
    { color: '#FB923C', textColor: '#FFFFFF' },
    { color: '#06B6D4', textColor: '#FFFFFF' },
    { color: '#EC4899', textColor: '#FFFFFF' }
  ];
  const item = fallbackList[index % fallbackList.length];
  const words = name.trim().split(/\s+/);
  const abbr = words.length >= 2
    ? (words[0][0] + words[1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase();

  return {
    color: item.color,
    textColor: item.textColor,
    abbr
  };
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark p-3 rounded-16 shadow-modal text-xs">
        <p className="font-semibold text-ink-light dark:text-ink-dark flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: data.payload.color }} />
          {data.name}:
        </p>
        <p className="font-bold text-ink-light dark:text-ink-dark tabular-nums mt-0.5">
          {Number(data.value).toLocaleString('vi-VN')} đ ({data.payload.percentage}%)
        </p>
      </div>
    );
  }
  return null;
};

export const WalletsPage = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWallet, setEditingWallet] = useState(null);

  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    balance: 0,
    icon: 'Wallet'
  });

  const [transferData, setTransferData] = useState({
    fromWalletId: '',
    toWalletId: '',
    amount: '',
    note: ''
  });

  const { data: res, isLoading } = useQuery({
    queryKey: ['wallets'],
    queryFn: () => walletApi.list()
  });

  const wallets = res?.data?.wallets || [];
  const totalBalance = res?.data?.totalBalance || 0;

  // Dữ liệu cho biểu đồ Donut tỷ trọng các ví
  const walletChartData = wallets.map((w, idx) => {
    const badge = getWalletBadgeInfo(w.name, idx);
    const val = Math.max(0, Number(w.balance));
    const percentage = totalBalance > 0
      ? ((val / totalBalance) * 100).toFixed(1).replace('.', ',')
      : '0';

    return {
      name: w.name,
      value: val,
      color: badge.color,
      percentage,
      abbr: badge.abbr
    };
  });

  const saveMutation = useMutation({
    mutationFn: (data) => {
      if (editingWallet) {
        return walletApi.update(editingWallet.id, data);
      }
      return walletApi.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      queryClient.invalidateQueries({ queryKey: ['reportSummary'] });
      addToast({
        message: `${editingWallet ? 'Cập nhật' : 'Thêm'} ví thành công! 🌿`,
        type: 'success'
      });
      setIsModalOpen(false);
      setEditingWallet(null);
    },
    onError: (err) => {
      addToast({ message: err.message || 'Lỗi khi lưu ví', type: 'error' });
    }
  });

  const transferMutation = useMutation({
    mutationFn: (data) => walletApi.transfer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      queryClient.invalidateQueries({ queryKey: ['reportSummary'] });
      addToast({ message: 'Chuyển tiền giữa các ví thành công!', type: 'success' });
      setIsTransferOpen(false);
      setTransferData({ fromWalletId: '', toWalletId: '', amount: '', note: '' });
    },
    onError: (err) => {
      addToast({ message: err.message || 'Lỗi khi chuyển tiền', type: 'error' });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => walletApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      queryClient.invalidateQueries({ queryKey: ['reportSummary'] });
      addToast({ message: 'Đã xóa ví thành công!', type: 'success' });
      setIsDeleteDialogOpen(false);
      setDeletingId(null);
    },
    onError: (err) => {
      addToast({ message: err.message || 'Không thể xóa ví này', type: 'error' });
    }
  });

  const openCreateModal = () => {
    setEditingWallet(null);
    setFormData({ name: '', balance: 0, icon: 'Wallet' });
    setIsModalOpen(true);
  };

  const openEditModal = (w) => {
    setEditingWallet(w);
    setFormData({ name: w.name, balance: Number(w.balance), icon: w.icon });
    setIsModalOpen(true);
  };

  const openTransferModal = () => {
    if (wallets.length < 2) {
      addToast({ message: 'Bạn cần có ít nhất 2 ví để thực hiện chuyển tiền!', type: 'error' });
      return;
    }
    setTransferData({
      fromWalletId: wallets[0].id,
      toWalletId: wallets[1].id,
      amount: '',
      note: ''
    });
    setIsTransferOpen(true);
  };

  return (
    <div className="space-y-8">
      {/* 1. Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-ink-light dark:text-ink-dark">
            Ví tài khoản
          </h1>
          <p className="text-xs sm:text-sm text-ink-muted mt-1">
            Quản lý số dư tiền mặt, tài khoản ngân hàng và ví điện tử của bạn.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={openTransferModal}
            className="px-5 py-2.5 rounded-full bg-[#F59E0B] hover:bg-[#D97706] text-ink-light font-semibold text-sm transition-all shadow-soft"
          >
            Chuyển tiền giữa các ví
          </button>
          <Button
            variant="primary"
            size="md"
            icon={Plus}
            className="font-semibold text-sm"
            onClick={openCreateModal}
          >
            Thêm ví mới
          </Button>
        </div>
      </div>

      {/* 2. Main Content: 2 Cột (Donut Chart & Danh sách ví) */}
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <Skeleton className="lg:col-span-5 h-80 rounded-3xl" />
          <Skeleton className="lg:col-span-7 h-80 rounded-3xl" />
        </div>
      ) : wallets.length === 0 ? (
        <EmptyState title="Chưa có ví nào" description="Tạo ví để bắt đầu quản lý dòng tiền" className="py-16" />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Cột trái: Card Biểu đồ Donut Cơ cấu tài sản ví */}
          <Card className="lg:col-span-5 flex flex-col p-6 sm:p-7 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-3xl shadow-sm">
            <CardHeader
              title="Cơ Cấu Ví Tài Khoản"
              subtitle={`Phân bổ dòng tiền theo các ví (Tổng: ${Number(totalBalance).toLocaleString('vi-VN')} đ)`}
            />

            <div className="flex flex-col flex-1 justify-between space-y-6">
              <div className="h-56 sm:h-60 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={walletChartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={68}
                      outerRadius={98}
                      paddingAngle={4}
                      stroke="none"
                    >
                      {walletChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Số tiền tổng bự bự dưới biểu đồ */}
              <div className="text-center py-2 -mt-2">
                <span className="text-xs uppercase font-bold text-ink-muted tracking-wider block">
                  Tổng tài sản tích lũy
                </span>
                <span className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-heading text-ink-light dark:text-ink-dark block mt-1">
                  {Number(totalBalance).toLocaleString('vi-VN')} đ
                </span>
              </div>

              {/* Chú thích (Legend) dạng lưới 2 cột giống Cơ cấu chi tiêu tháng này */}
              <div className="pt-4 border-t border-border-light/60 dark:border-border-dark/60">
                <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-sm">
                  {walletChartData.map((w, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: w.color }}
                      />
                      <span className="truncate text-ink-muted text-xs sm:text-sm">{w.name}:</span>
                      <strong className="text-ink-light dark:text-ink-dark text-xs sm:text-sm font-bold shrink-0">
                        {w.percentage}%
                      </strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Cột phải: Danh sách các ví theo hàng */}
          <Card className="lg:col-span-7 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="divide-y divide-border-light/60 dark:divide-border-dark/60">
              {wallets.map((w, idx) => {
                const badge = getWalletBadgeInfo(w.name, idx);
                const val = Number(w.balance);
                const percentage = totalBalance > 0
                  ? ((Math.max(0, val) / totalBalance) * 100).toFixed(1).replace('.', ',')
                  : '0';

                return (
                  <div
                    key={w.id}
                    className="py-5 first:pt-0 last:pb-0 flex items-center justify-between gap-4"
                  >
                    {/* Badge & Tên ví */}
                    <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
                      <div
                        className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center font-black text-sm sm:text-base shrink-0 shadow-sm"
                        style={{ backgroundColor: badge.color, color: badge.textColor }}
                      >
                        {badge.abbr}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-sm sm:text-base text-ink-light dark:text-ink-dark truncate">
                          {w.name}
                        </h3>
                        <p className="text-xs text-ink-muted mt-0.5">
                          {percentage}% tổng tài sản
                        </p>
                      </div>
                    </div>

                    {/* Số dư & Nút Thao tác */}
                    <div className="flex items-center gap-3 sm:gap-5 shrink-0">
                      <div className="text-right">
                        <p className="text-base sm:text-lg font-black font-heading text-ink-light dark:text-ink-dark">
                          {Number(w.balance).toLocaleString('vi-VN')} đ
                        </p>
                        <p className="text-xs text-ink-muted mt-0.5">
                          {w._count?.transactions || 0} giao dịch liên kết
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => openEditModal(w)}
                          className="px-3 py-1.5 text-xs font-semibold border border-border-light dark:border-border-dark rounded-12 hover:bg-sand/40 dark:hover:bg-white/10 text-ink-muted hover:text-ink-light transition-colors"
                        >
                          Sửa
                        </button>
                        {wallets.length > 1 && (
                          <button
                            onClick={() => {
                              setDeletingId(w.id);
                              setIsDeleteDialogOpen(true);
                            }}
                            className="px-3 py-1.5 text-xs font-semibold border border-border-light dark:border-border-dark rounded-12 hover:bg-coral/10 hover:border-coral/40 hover:text-coral text-ink-muted transition-colors"
                          >
                            Xóa
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      {/* Modal Thêm / Sửa Ví */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingWallet ? 'Chỉnh Sửa Ví' : 'Thêm Ví Mới'}
        maxWidth="max-w-md"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            saveMutation.mutate(formData);
          }}
          className="space-y-4"
        >
          <Input
            label="Tên ví (*)"
            placeholder="VD: MB Bank, Tiền mặt, Ví MoMo..."
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          {!editingWallet && (
            <Input
              label="Số dư ban đầu (VND)"
              type="number"
              placeholder="0"
              value={formData.balance}
              onChange={(e) => setFormData({ ...formData, balance: parseFloat(e.target.value) || 0 })}
            />
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
              Biểu tượng loại ví
            </label>
            <div className="grid grid-cols-4 gap-2">
              {WALLET_ICONS.map((item) => {
                const Icon = item.icon;
                const isSelected = formData.icon === item.name;
                return (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => setFormData({ ...formData, icon: item.name })}
                    className={`p-3 rounded-20 flex flex-col items-center gap-1 transition-all border ${
                      isSelected
                        ? 'border-primary dark:border-lime bg-primary/10 dark:bg-lime/10 text-primary dark:text-lime shadow-soft'
                        : 'border-border-light dark:border-border-dark text-ink-muted hover:bg-black/5 dark:hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-[10px] font-bold">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border-light dark:border-border-dark">
            <Button type="button" variant="secondary" size="sm" onClick={() => setIsModalOpen(false)}>
              Hủy
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={saveMutation.isPending}>
              {editingWallet ? 'Lưu thay đổi' : 'Tạo ví ngay'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Chuyển tiền giữa các ví (Transfer Modal) */}
      <Modal
        isOpen={isTransferOpen}
        onClose={() => setIsTransferOpen(false)}
        title="Chuyển Tiền Giữa Các Ví"
        maxWidth="max-w-md"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            transferMutation.mutate({
              ...transferData,
              amount: parseFloat(transferData.amount)
            });
          }}
          className="space-y-4"
        >
          <Select
            label="Chuyển từ ví nguồn (*)"
            value={transferData.fromWalletId}
            onChange={(e) => setTransferData({ ...transferData, fromWalletId: e.target.value })}
            required
          >
            {wallets.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name} (Khả dụng: {Number(w.balance).toLocaleString('vi-VN')}₫)
              </option>
            ))}
          </Select>

          <Select
            label="Chuyển đến ví đích (*)"
            value={transferData.toWalletId}
            onChange={(e) => setTransferData({ ...transferData, toWalletId: e.target.value })}
            required
          >
            {wallets
              .filter((w) => w.id !== transferData.fromWalletId)
              .map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} (Số dư: {Number(w.balance).toLocaleString('vi-VN')}₫)
                </option>
              ))}
          </Select>

          <Input
            label="Số tiền chuyển (VND) (*)"
            type="number"
            step="1000"
            placeholder="VD: 200.000"
            value={transferData.amount}
            onChange={(e) => setTransferData({ ...transferData, amount: e.target.value })}
            required
          />

          <Input
            label="Ghi chú chuyển khoản"
            placeholder="VD: Rút tiền ATM nạp ví tiền mặt"
            value={transferData.note}
            onChange={(e) => setTransferData({ ...transferData, note: e.target.value })}
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-border-light dark:border-border-dark">
            <Button type="button" variant="secondary" size="sm" onClick={() => setIsTransferOpen(false)}>
              Hủy
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={transferMutation.isPending} icon={ArrowRightLeft}>
              Xác nhận chuyển tiền
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirm Dialog Xóa ví */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={() => deleteMutation.mutate(deletingId)}
        title="Xóa ví tiền"
        message="Hành động này sẽ xóa vĩnh viễn ví. Các giao dịch trước đó vẫn được lưu lại nhưng sẽ không còn ví liên kết. Bạn có muốn xóa không?"
        confirmText="Xóa ví này"
        isDanger
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};
