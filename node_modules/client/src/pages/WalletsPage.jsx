import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { walletApi } from '@/api/finance';
import {
  Card,
  CardHeader,
  Button,
  Input,
  Select,
  Money,
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
  Edit2,
  Trash2,
  CreditCard,
  Banknote,
  Smartphone,
  ShieldCheck
} from 'lucide-react';

const WALLET_ICONS = [
  { name: 'Banknote', icon: Banknote, label: 'Tiền mặt' },
  { name: 'CreditCard', icon: CreditCard, label: 'Thẻ ngân hàng' },
  { name: 'Smartphone', icon: Smartphone, label: 'Ví điện tử' },
  { name: 'Wallet', icon: Wallet, label: 'Ví chung' }
];

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

  const getWalletIconComponent = (iconName) => {
    const item = WALLET_ICONS.find((i) => i.name === iconName);
    return item ? item.icon : Wallet;
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-ink-light dark:text-ink-dark">
            Ví Tài Khoản 💳
          </h1>
          <p className="text-xs sm:text-sm text-ink-muted mt-1">
            Quản lý số dư tiền mặt, tài khoản ngân hàng và ví điện tử của bạn
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button variant="outline" size="sm" icon={ArrowRightLeft} onClick={openTransferModal}>
            Chuyển tiền giữa các ví
          </Button>
          <Button variant="primary" size="sm" icon={Plus} onClick={openCreateModal}>
            Thêm ví mới
          </Button>
        </div>
      </div>

      {/* 2. Total Balance Banner */}
      <Card className="bg-sand/30 dark:bg-surface-dark border-border-light dark:border-border-dark flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-ink-muted">
            Tổng tài sản trên tất cả các ví
          </span>
          <div className="mt-1">
            <Money amount={totalBalance} type="neutral" className="text-3xl sm:text-4xl font-extrabold font-heading" />
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-primary dark:text-lime bg-surface-light dark:bg-white/5 border border-border-light/60 dark:border-border-dark px-3.5 py-2 rounded-full w-fit">
          <ShieldCheck className="w-4 h-4" />
          <span>Bảo mật và cập nhật theo thời gian thực</span>
        </div>
      </Card>

      {/* 3. Wallet Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Skeleton className="h-44" />
          <Skeleton className="h-44" />
          <Skeleton className="h-44" />
        </div>
      ) : wallets.length === 0 ? (
        <EmptyState title="Chưa có ví nào" description="Tạo ví để bắt đầu quản lý dòng tiền" className="py-16" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {wallets.map((w) => {
            const IconComp = getWalletIconComponent(w.icon);
            return (
              <Card key={w.id} className="flex flex-col justify-between p-6 space-y-4" hover>
                <div className="flex items-start justify-between">
                  <div className="p-3 rounded-20 bg-primary/10 dark:bg-lime/10 text-primary dark:text-lime">
                    <IconComp className="w-6 h-6" />
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(w)}
                      className="p-1.5 rounded-full hover:bg-sand/60 dark:hover:bg-white/10 text-ink-muted hover:text-ink-light transition-colors"
                      title="Sửa ví"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {wallets.length > 1 && (
                      <button
                        onClick={() => {
                          setDeletingId(w.id);
                          setIsDeleteDialogOpen(true);
                        }}
                        className="p-1.5 rounded-full hover:bg-coral/15 text-ink-muted hover:text-coral transition-colors"
                        title="Xóa ví"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-bold text-ink-light dark:text-ink-dark">{w.name}</h3>
                  <div className="mt-2">
                    <Money amount={Number(w.balance)} type="neutral" className="text-2xl font-extrabold font-heading" />
                  </div>
                </div>

                <div className="pt-3 border-t border-border-light/60 dark:border-border-dark/60 text-xs text-ink-muted flex justify-between">
                  <span>Số giao dịch liên kết:</span>
                  <strong className="text-ink-light dark:text-ink-dark">{w._count?.transactions || 0}</strong>
                </div>
              </Card>
            );
          })}
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
