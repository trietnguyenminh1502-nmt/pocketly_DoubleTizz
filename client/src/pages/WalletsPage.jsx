import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { walletApi } from '@/api/finance';
import {
  Button,
  Input,
  Select,
  Modal,
  ConfirmDialog,
  useToast
} from '@/components/ui';
import {
  Wallet,
  ArrowRightLeft,
  CreditCard,
  Banknote,
  Smartphone
} from 'lucide-react';

const WALLET_ICONS = [
  { name: 'Banknote', icon: Banknote, label: 'Tiền mặt' },
  { name: 'CreditCard', icon: CreditCard, label: 'Thẻ ngân hàng' },
  { name: 'Smartphone', icon: Smartphone, label: 'Ví điện tử' },
  { name: 'Wallet', icon: Wallet, label: 'Ví chung' }
];

// Hàm xác định màu thẻ ví theo chuẩn thiết kế
const getWalletColor = (name = '', index = 0) => {
  const lower = name.toLowerCase().trim();
  if (lower.includes('tiền mặt') || lower.includes('cash')) {
    return '#4A7410';
  }
  if (
    lower.includes('ngân hàng') ||
    lower.includes('bank') ||
    lower.includes('tài khoản') ||
    lower.includes('atm') ||
    lower.includes('mb') ||
    lower.includes('vcb') ||
    lower.includes('bidv') ||
    lower.includes('techcombank')
  ) {
    return '#1F4E9C';
  }
  if (
    lower.includes('ví điện tử') ||
    lower.includes('momo') ||
    lower.includes('zalopay') ||
    lower.includes('shopeepay') ||
    lower.includes('viettel') ||
    lower.includes('vnpay')
  ) {
    return '#C2185B';
  }
  const fallbackList = ['#B45309', '#0F766E', '#7C2D12', '#334155'];
  return fallbackList[index % fallbackList.length];
};

// Định dạng tiền tệ kiểu tiếng Việt với Fraunces + tabular-nums
const formatMoney = (amount) => {
  const val = Number(amount || 0);
  const isNegative = val < 0;
  const formatted = new Intl.NumberFormat('vi-VN').format(Math.abs(val));
  return `${isNegative ? '−' : ''}${formatted} ₫`;
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

  const { data: res, isLoading, isError, refetch } = useQuery({
    queryKey: ['wallets'],
    queryFn: () => walletApi.list()
  });

  const wallets = res?.data?.wallets || [];
  const rawTotal = res?.data?.totalBalance;
  const totalBalance = typeof rawTotal === 'number'
    ? rawTotal
    : wallets.reduce((sum, w) => sum + Number(w.balance || 0), 0);

  // Sắp xếp ví theo số dư giảm dần
  const sortedWallets = [...wallets].sort((a, b) => Number(b.balance || 0) - Number(a.balance || 0));

  // Tính tỷ trọng phân bổ cho từng ví
  const allocatedWallets = sortedWallets.map((w, index) => {
    const balance = Number(w.balance || 0);
    const color = getWalletColor(w.name, index);
    const pct = totalBalance > 0 ? (Math.max(0, balance) / totalBalance) * 100 : 0;
    const pctFormatted = pct.toFixed(1).replace('.', ',');
    return {
      ...w,
      balance,
      color,
      pct,
      pctFormatted
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
        message: `${editingWallet ? 'Cập nhật' : 'Thêm'} ví thành công.`,
        type: 'success'
      });
      setIsModalOpen(false);
      setEditingWallet(null);
    },
    onError: (err) => {
      addToast({ message: err.message || 'Lỗi khi lưu ví tài khoản', type: 'error' });
    }
  });

  const transferMutation = useMutation({
    mutationFn: (data) => walletApi.transfer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      queryClient.invalidateQueries({ queryKey: ['reportSummary'] });
      addToast({ message: 'Chuyển tiền giữa các ví thành công.', type: 'success' });
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
      addToast({ message: 'Đã xóa ví thành công.', type: 'success' });
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
      addToast({ message: 'Bạn cần có ít nhất 2 ví để thực hiện chuyển tiền.', type: 'error' });
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
    <div className="space-y-8 text-[#16201B]">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="font-fraunces font-bold text-[36px] sm:text-[46px] tracking-[-1px] text-[#16201B] leading-tight">
            Ví tài khoản
          </h1>
          <p className="text-[15px] text-[#56635C] mt-1">
            Quản lý số dư tiền mặt, tài khoản ngân hàng và ví điện tử của bạn.
          </p>
        </div>

        {/* Nút thao tác góc phải */}
        <div className="flex flex-wrap items-center gap-[8px] justify-end sm:self-auto shrink-0">
          <button
            type="button"
            onClick={openTransferModal}
            className="rounded-[12px] px-[18px] py-[12px] bg-[#F2B84B] text-[#14201A] text-[14px] font-medium hover:bg-[#e4ad44] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#14201A] focus-visible:ring-offset-2"
          >
            Chuyển tiền giữa các ví
          </button>
          <button
            type="button"
            onClick={openCreateModal}
            className="rounded-[12px] px-[18px] py-[12px] bg-[#0F3D2E] text-white text-[14px] font-medium hover:bg-[#0c2f23] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F3D2E] focus-visible:ring-offset-2"
          >
            + Thêm ví mới
          </button>
        </div>
      </div>

      {/* 2. Loading State */}
      {isLoading && (
        <div className="space-y-8 animate-pulse">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center pb-[36px]">
            <div className="space-y-3">
              <div className="h-4 w-48 bg-[#E2DDD3] rounded" />
              <div className="h-16 w-72 bg-[#E2DDD3] rounded-xl" />
            </div>
            <div className="space-y-3">
              <div className="h-[14px] w-full bg-[#E2DDD3] rounded-full" />
              <div className="h-4 w-60 bg-[#E2DDD3] rounded" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[20px]">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-[240px] rounded-[24px] bg-[#E2DDD3] p-[24px]" />
            ))}
          </div>
        </div>
      )}

      {/* 3. Error State */}
      {!isLoading && isError && (
        <div className="p-8 text-center bg-white rounded-[24px] border border-[#E8E2D6] space-y-3 my-6">
          <p className="text-[15px] text-[#16201B]">Không thể tải danh sách ví tài khoản. Vui lòng thử lại.</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="px-4 py-2 rounded-[12px] bg-[#0F3D2E] text-white text-[14px] font-medium hover:bg-[#0c2f23] transition-colors"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* 4. Main Content */}
      {!isLoading && !isError && (
        <>
          {/* Khối tổng tài sản (Hero) - Nằm thẳng trên nền trang */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center pb-[36px]">
            {/* Cột trái: Số tổng thật lớn */}
            <div>
              <span className="text-[14px] font-medium text-[#56635C] block">
                Tổng tài sản trên tất cả các ví
              </span>
              <div className="font-fraunces font-bold text-[44px] sm:text-[60px] lg:text-[72px] tracking-[-2px] text-[#16201B] tabular-nums leading-none mt-2">
                {formatMoney(totalBalance)}
              </div>
            </div>

            {/* Cột phải: Thanh phân bổ & Chú thích */}
            <div>
              {totalBalance <= 0 || allocatedWallets.length === 0 ? (
                <div>
                  <div className="h-[14px] w-full rounded-full bg-[#E2DDD3]" />
                  <p className="text-[14px] text-[#56635C] mt-2.5">Chưa có số dư</p>
                </div>
              ) : (
                <div>
                  {/* Thanh phân bổ cao 14px, bo tròn, các đoạn cách nhau 3px */}
                  <div className="h-[14px] w-full rounded-full overflow-hidden flex gap-[3px] bg-[#E2DDD3]">
                    {allocatedWallets.map((w) => {
                      if (w.pct <= 0) return null;
                      return (
                        <div
                          key={w.id}
                          className="h-full transition-all duration-300"
                          style={{ width: `${w.pct}%`, backgroundColor: w.color }}
                          title={`${w.name}: ${w.pctFormatted}%`}
                        />
                      );
                    })}
                  </div>

                  {/* Chú thích dạng hàng */}
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-3 text-[14px] text-[#56635C]">
                    {allocatedWallets.map((w) => (
                      <div key={w.id} className="flex items-center gap-2">
                        <span
                          className="w-[10px] h-[10px] rounded-[2px] shrink-0"
                          style={{ backgroundColor: w.color }}
                        />
                        <span className="truncate max-w-[160px]" title={w.name}>
                          {w.name}
                        </span>
                        <span className="tabular-nums font-medium text-[#16201B]">
                          {w.pctFormatted}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Lưới thẻ ví (Grid 4 cột) */}
          {wallets.length === 0 ? (
            <div className="border-2 border-dashed border-[#BDB7A8] rounded-[24px] p-12 text-center flex flex-col items-center justify-center gap-4 bg-transparent my-4">
              <p className="text-[16px] font-medium text-[#56635C]">Chưa có ví nào</p>
              <button
                type="button"
                onClick={openCreateModal}
                className="px-5 py-2.5 rounded-[12px] bg-[#0F3D2E] text-white text-[14px] font-medium hover:bg-[#0c2f23] transition-colors"
              >
                + Thêm ví đầu tiên
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[20px]">
              {allocatedWallets.map((w) => (
                <div
                  key={w.id}
                  className="rounded-[24px] p-[24px] min-h-[240px] text-white flex flex-col justify-between transition-all duration-[180ms] hover:-translate-y-[3px] hover:shadow-[0_12px_28px_rgba(22,32,27,0.18)] motion-reduce:hover:translate-y-0 relative"
                  style={{ backgroundColor: w.color }}
                >
                  {/* Hàng trên: Tên ví & Chip trang trí */}
                  <div className="flex items-start justify-between gap-3">
                    <h3
                      className="text-[17px] font-semibold text-white truncate max-w-[calc(100%-48px)] leading-snug"
                      title={w.name}
                    >
                      {w.name}
                    </h3>

                    {/* Chip trang trí 40x30px, bo 7px, nền rgba(255,255,255,.28) */}
                    <div
                      className="w-[40px] h-[30px] rounded-[7px] bg-white/[0.28] border border-white/20 relative flex items-center justify-center shrink-0"
                      aria-hidden="true"
                    >
                      <div className="w-[18px] h-[20px] border border-white/40 rounded-[3px] flex items-center justify-center">
                        <div className="w-[10px] h-[12px] border-t border-b border-white/40" />
                      </div>
                    </div>
                  </div>

                  {/* Phần dưới: Số dư, số giao dịch liên kết và nút Sửa/Xóa */}
                  <div className="mt-6">
                    <div className="font-fraunces font-bold text-[28px] sm:text-[32px] tracking-[-0.5px] tabular-nums text-white leading-tight">
                      {formatMoney(w.balance)}
                    </div>

                    <p className="text-[13px] text-white/90 mt-1">
                      {w._count?.transactions || 0} giao dịch liên kết
                    </p>

                    <div className="flex items-center gap-[14px] mt-4 pt-1">
                      <button
                        type="button"
                        onClick={() => openEditModal(w)}
                        aria-label={`Sửa ví ${w.name}`}
                        className="underline underline-offset-[3px] text-white hover:text-white/80 transition-colors bg-transparent border-0 py-[6px] px-0 text-[13px] font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2"
                      >
                        Sửa
                      </button>

                      {wallets.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            setDeletingId(w.id);
                            setIsDeleteDialogOpen(true);
                          }}
                          aria-label={`Xóa ví ${w.name}`}
                          className="underline underline-offset-[3px] text-white hover:text-white/80 transition-colors bg-transparent border-0 py-[6px] px-0 text-[13px] font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2"
                        >
                          Xóa
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Thẻ cuối cùng - "Thêm ví mới" nét đứt */}
              <button
                type="button"
                onClick={openCreateModal}
                aria-label="Thêm ví mới"
                className="border-2 border-dashed border-[#BDB7A8] bg-transparent rounded-[24px] min-h-[240px] p-[24px] flex flex-col items-center justify-center gap-2 group hover:border-[#0F3D2E] hover:bg-[#0F3D2E]/[0.05] transition-all duration-[180ms] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F3D2E] focus-visible:ring-offset-2"
              >
                <span className="text-[32px] font-bold leading-none text-[#56635C] group-hover:text-[#0F3D2E] transition-colors">
                  +
                </span>
                <span className="text-[15px] font-medium text-[#56635C] group-hover:text-[#0F3D2E] transition-colors">
                  Thêm ví mới
                </span>
              </button>
            </div>
          )}
        </>
      )}

      {/* Modal Thêm / Sửa Ví */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingWallet ? 'Chỉnh sửa ví' : 'Thêm ví mới'}
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
            placeholder="Ví dụ: MB Bank, Tiền mặt, Ví MoMo..."
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
        title="Chuyển tiền giữa các ví"
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
                {w.name} (Khả dụng: {Number(w.balance).toLocaleString('vi-VN')} ₫)
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
                  {w.name} (Số dư: {Number(w.balance).toLocaleString('vi-VN')} ₫)
                </option>
              ))}
          </Select>

          <Input
            label="Số tiền chuyển (VND) (*)"
            type="number"
            step="1000"
            placeholder="Ví dụ: 200.000"
            value={transferData.amount}
            onChange={(e) => setTransferData({ ...transferData, amount: e.target.value })}
            required
          />

          <Input
            label="Ghi chú chuyển khoản"
            placeholder="Ví dụ: Rút tiền ATM nạp ví tiền mặt"
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
        title="Xóa ví tài khoản"
        message="Hành động này sẽ xóa vĩnh viễn ví. Các giao dịch trước đó vẫn được lưu lại nhưng sẽ không còn ví liên kết. Bạn có muốn xóa không?"
        confirmText="Xóa ví này"
        isDanger
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};

