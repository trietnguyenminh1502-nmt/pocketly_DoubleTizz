import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transactionApi, categoryApi, walletApi } from '@/api/finance';
import {
  Card,
  CardHeader,
  Button,
  Input,
  Select,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Pagination,
  Badge,
  Money,
  Skeleton,
  EmptyState,
  ConfirmDialog,
  useToast
} from '@/components/ui';
import { TransactionFormModal } from '@/components/finance/TransactionFormModal';
import { formatDate } from '../../../shared/formatters.js';
import {
  Search,
  Plus,
  Trash2,
  Edit2,
  FileSpreadsheet,
  FileText,
  Filter,
  ArrowUpDown,
  RotateCcw
} from 'lucide-react';

export const TransactionsPage = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  // Filters State
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    categoryId: '',
    walletId: '',
    startDate: '',
    endDate: '',
    minAmount: '',
    maxAmount: '',
    sortBy: 'date',
    order: 'desc',
    page: 1,
    limit: 15
  });

  const [selectedIds, setSelectedIds] = useState([]);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);

  // 1. Fetch Danh sách Giao dịch
  const { data: txRes, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: ['transactions', filters],
    queryFn: () => transactionApi.list(filters)
  });

  // 2. Fetch Categories & Wallets cho Form và Filter Select
  const { data: categoriesRes } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryApi.list()
  });

  const { data: walletsRes } = useQuery({
    queryKey: ['wallets'],
    queryFn: () => walletApi.list()
  });

  const transactions = txRes?.data?.transactions || [];
  const meta = txRes?.data?.meta || { total: 0, page: 1, totalPages: 1 };
  const categories = categoriesRes?.data?.categories || [];
  const wallets = walletsRes?.data?.wallets || [];

  // Mutation Xóa 1 giao dịch
  const deleteMutation = useMutation({
    mutationFn: (id) => transactionApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['reportSummary'] });
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      addToast({ message: 'Đã xóa giao dịch thành công!', type: 'success' });
      setIsDeleteDialogOpen(false);
      setDeletingId(null);
    },
    onError: (err) => {
      addToast({ message: err.message || 'Không thể xóa giao dịch', type: 'error' });
    }
  });

  // Mutation Bulk Delete
  const bulkDeleteMutation = useMutation({
    mutationFn: (ids) => transactionApi.bulkDelete(ids),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['reportSummary'] });
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      addToast({ message: `Đã xóa thành công ${res.data?.deletedCount} giao dịch!`, type: 'success' });
      setSelectedIds([]);
      setIsBulkDeleteDialogOpen(false);
    },
    onError: (err) => {
      addToast({ message: err.message || 'Lỗi khi xóa hàng loạt giao dịch', type: 'error' });
    }
  });

  // Export Excel & CSV
  const handleExport = async (type) => {
    try {
      addToast({ message: `Đang xuất file ${type.toUpperCase()}...`, type: 'info' });
      const res =
        type === 'excel'
          ? await transactionApi.exportExcel(filters)
          : await transactionApi.exportCSV(filters);

      const blob = new Blob([res], {
        type:
          type === 'excel'
            ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            : 'text/csv; charset=utf-8'
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pocketly-transactions-${Date.now()}.${type === 'excel' ? 'xlsx' : 'csv'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      addToast({ message: `Xuất file ${type.toUpperCase()} thành công! 🌿`, type: 'success' });
    } catch {
      addToast({ message: 'Có lỗi xảy ra khi tải file', type: 'error' });
    }
  };

  // Checkbox Select All
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(transactions.map((t) => t.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      type: '',
      categoryId: '',
      walletId: '',
      startDate: '',
      endDate: '',
      minAmount: '',
      maxAmount: '',
      sortBy: 'date',
      order: 'desc',
      page: 1,
      limit: 15
    });
  };

  return (
    <div className="space-y-6">
      {/* 1. Page Header & Primary Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-primary">
            Sổ Giao Dịch 🧾
          </h1>
          <p className="text-xs sm:text-sm text-secondary mt-1">
            Quản lý chi tiết các khoản thu, chi và lịch sử biến động số dư
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            icon={FileSpreadsheet}
            onClick={() => handleExport('excel')}
          >
            Xuất Excel
          </Button>
          <Button
            variant="outline"
            size="sm"
            icon={FileText}
            onClick={() => handleExport('csv')}
          >
            Xuất CSV
          </Button>
          <Button
            variant="primary"
            size="md"
            icon={Plus}
            className="font-semibold text-sm"
            onClick={() => {
              setEditingTransaction(null);
              setIsFormModalOpen(true);
            }}
          >
            Thêm mới
          </Button>
        </div>
      </div>

      {/* 2. Filter & Search Card */}
      <Card className="space-y-4">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-secondary">
            <Filter className="w-4 h-4 text-tangerine" />
            <span>Bộ Lọc Tìm Kiếm Nâng Cao</span>
          </div>
          <button
            onClick={resetFilters}
            className="text-xs text-secondary hover:text-brand dark:hover:text-lime flex items-center gap-1 font-semibold"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Đặt lại
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Ô Tìm kiếm Note */}
          <Input
            placeholder="Tìm theo ghi chú..."
            icon={Search}
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
          />

          {/* Lọc theo Loại Thu / Chi */}
          <Select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value, page: 1 })}
          >
            <option value="">Tất cả loại giao dịch</option>
            <option value="EXPENSE">Chi tiêu (Expense)</option>
            <option value="INCOME">Thu nhập (Income)</option>
          </Select>

          {/* Lọc theo Danh mục */}
          <Select
            value={filters.categoryId}
            onChange={(e) => setFilters({ ...filters, categoryId: e.target.value, page: 1 })}
          >
            <option value="">Tất cả danh mục</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.type === 'INCOME' ? 'Thu' : 'Chi'})
              </option>
            ))}
          </Select>

          {/* Lọc theo Ví */}
          <Select
            value={filters.walletId}
            onChange={(e) => setFilters({ ...filters, walletId: e.target.value, page: 1 })}
          >
            <option value="">Tất cả các ví</option>
            {wallets.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </Select>
        </div>

        {/* Lọc theo Khoảng ngày & Sắp xếp */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-secondary whitespace-nowrap">Từ:</span>
            <input
              type="date"
              className="w-full bg-sand/30 dark:bg-surface-dark border border-border rounded-16 px-3 py-1.5 text-xs outline-none"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value, page: 1 })}
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-secondary whitespace-nowrap">Đến:</span>
            <input
              type="date"
              className="w-full bg-sand/30 dark:bg-surface-dark border border-border rounded-16 px-3 py-1.5 text-xs outline-none"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value, page: 1 })}
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-secondary whitespace-nowrap">Sắp xếp:</span>
            <Select
              value={`${filters.sortBy}-${filters.order}`}
              onChange={(e) => {
                const [sortBy, order] = e.target.value.split('-');
                setFilters({ ...filters, sortBy, order, page: 1 });
              }}
              className="py-1.5 text-xs"
            >
              <option value="date-desc">Mới nhất trước</option>
              <option value="date-asc">Cũ nhất trước</option>
              <option value="amount-desc">Số tiền cao nhất</option>
              <option value="amount-asc">Số tiền thấp nhất</option>
            </Select>
          </div>
        </div>
      </Card>

      {/* 3. Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between p-3.5 rounded-20 bg-sand dark:bg-surface-dark border border-border animate-in fade-in">
          <span className="text-xs font-bold text-primary">
            Đã chọn <strong>{selectedIds.length}</strong> giao dịch
          </span>
          <Button
            variant="danger"
            size="sm"
            icon={Trash2}
            onClick={() => setIsBulkDeleteDialogOpen(true)}
          >
            Xóa đã chọn
          </Button>
        </div>
      )}

      {/* 4. Transactions Table */}
      <Card className="p-0 overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
          </div>
        ) : isError ? (
          <div className="py-12 px-6 text-center">
            <p className="text-sm text-coral font-medium">
              Không thể tải danh sách giao dịch: {error?.response?.data?.message || error?.message}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="mt-3"
            >
              Thử tải lại
            </Button>
          </div>
        ) : transactions.length === 0 ? (
          <EmptyState
            title="Không tìm thấy giao dịch nào"
            description="Thử thay đổi bộ lọc hoặc thêm giao dịch mới để hiển thị"
            className="py-16"
          />
        ) : (
          <div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === transactions.length && transactions.length > 0}
                      onChange={handleSelectAll}
                      className="rounded accent-primary cursor-pointer"
                    />
                  </TableHead>
                  <TableHead>Ngày</TableHead>
                  <TableHead>Danh mục</TableHead>
                  <TableHead>Ghi chú</TableHead>
                  <TableHead>Ví</TableHead>
                  <TableHead>Số tiền</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell className="text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(tx.id)}
                        onChange={() => handleSelectOne(tx.id)}
                        className="rounded accent-primary cursor-pointer"
                      />
                    </TableCell>
                    <TableCell className="tabular-nums text-xs font-semibold text-secondary">
                      {formatDate(tx.date)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: tx.category?.color || 'rgb(var(--color-tangerine))' }}
                        />
                        <span className="font-bold text-xs">{tx.category?.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-xs text-primary">
                      {tx.note || <span className="text-secondary/50 italic">Không có ghi chú</span>}
                    </TableCell>
                    <TableCell className="text-xs text-secondary">{tx.wallet?.name}</TableCell>
                    <TableCell>
                      <Money
                        amount={Number(tx.amount)}
                        type={tx.type === 'INCOME' ? 'income' : 'expense'}
                        showSign
                        className="text-sm font-bold"
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setEditingTransaction(tx);
                            setIsFormModalOpen(true);
                          }}
                          className="p-1.5 rounded-full hover:bg-sand/60 dark:hover:bg-white/10 text-secondary hover:text-ink-light transition-colors"
                          title="Sửa giao dịch"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setDeletingId(tx.id);
                            setIsDeleteDialogOpen(true);
                          }}
                          className="p-1.5 rounded-full hover:bg-coral/15 text-secondary hover:text-coral transition-colors"
                          title="Xóa giao dịch"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Phân trang */}
            <div className="p-4 border-t border-border">
              <Pagination
                currentPage={filters.page}
                totalPages={meta.totalPages}
                onPageChange={(p) => setFilters({ ...filters, page: p })}
              />
            </div>
          </div>
        )}
      </Card>

      {/* Modal Thêm / Chỉnh sửa Giao dịch */}
      <TransactionFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingTransaction(null);
        }}
        initialData={editingTransaction}
        categories={categories}
        wallets={wallets}
      />

      {/* Confirm Dialog Xóa 1 giao dịch */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setDeletingId(null);
        }}
        onConfirm={() => deleteMutation.mutate(deletingId)}
        title="Xóa giao dịch"
        message="Số tiền của giao dịch này sẽ được tự động hoàn lại vào ví tương ứng. Bạn có chắc chắn muốn xóa không?"
        confirmText="Xóa giao dịch"
        isDanger
        isLoading={deleteMutation.isPending}
      />

      {/* Confirm Dialog Xóa hàng loạt */}
      <ConfirmDialog
        isOpen={isBulkDeleteDialogOpen}
        onClose={() => setIsBulkDeleteDialogOpen(false)}
        onConfirm={() => bulkDeleteMutation.mutate(selectedIds)}
        title="Xóa hàng loạt giao dịch"
        message={`Bạn đang chọn xóa ${selectedIds.length} giao dịch. Toàn bộ số dư ví sẽ được tự động hoàn trả chính xác. Hành động này không thể hoàn tác!`}
        confirmText={`Xóa ${selectedIds.length} giao dịch`}
        isDanger
        isLoading={bulkDeleteMutation.isPending}
      />
    </div>
  );
};
