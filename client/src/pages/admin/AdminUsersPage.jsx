import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/api/admin';
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
  Avatar,
  ConfirmDialog,
  Skeleton,
  EmptyState,
  useToast
} from '@/components/ui';
import {
  Search,
  Lock,
  Unlock,
  Shield,
  Trash2,
  Eye,
  X,
  Mail,
  Calendar,
  Wallet,
  ReceiptText
} from 'lucide-react';

export const AdminUsersPage = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  const [filters, setFilters] = useState({
    search: '',
    role: '',
    status: '',
    page: 1,
    limit: 10
  });

  const [selectedUser, setSelectedUser] = useState(null);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);

  // Dialog states
  const [confirmAction, setConfirmAction] = useState(null); // { type, user }

  // 1. Fetch danh sách người dùng
  const { data: usersRes, isLoading } = useQuery({
    queryKey: ['adminUsers', filters],
    queryFn: () => adminApi.listUsers(filters)
  });

  const users = usersRes?.data?.users || [];
  const meta = usersRes?.data?.meta || { total: 0, totalPages: 1 };

  // 2. Fetch chi tiết người dùng khi mở Drawer
  const { data: userDetailRes, isLoading: loadingDetail } = useQuery({
    queryKey: ['adminUserDetail', selectedUser?.id],
    queryFn: () => adminApi.getUserDetail(selectedUser.id),
    enabled: !!selectedUser && detailDrawerOpen
  });

  const userDetail = userDetailRes?.data?.user;

  // Mutation Khóa / Mở Khóa User
  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => adminApi.updateUserStatus(id, status),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboardStats'] });
      addToast({
        message: `Đã ${res.data.user.status === 'LOCKED' ? 'khóa' : 'mở khóa'} tài khoản thành công!`,
        type: 'success'
      });
      setConfirmAction(null);
    },
    onError: (err) => {
      addToast({ message: err.message || 'Lỗi khi cập nhật trạng thái user', type: 'error' });
    }
  });

  // Mutation Đổi Role (USER / ADMIN)
  const roleMutation = useMutation({
    mutationFn: ({ id, role }) => adminApi.updateUserRole(id, role),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      addToast({
        message: `Đã cập nhật vai trò người dùng thành ${res.data.user.role}!`,
        type: 'success'
      });
      setConfirmAction(null);
    },
    onError: (err) => {
      addToast({ message: err.message || 'Lỗi khi đổi vai trò user', type: 'error' });
    }
  });

  // Mutation Xóa User
  const deleteMutation = useMutation({
    mutationFn: (id) => adminApi.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboardStats'] });
      addToast({ message: 'Đã xóa người dùng khỏi hệ thống!', type: 'success' });
      setConfirmAction(null);
      if (detailDrawerOpen) setDetailDrawerOpen(false);
    },
    onError: (err) => {
      addToast({ message: err.message || 'Không thể xóa người dùng này', type: 'error' });
    }
  });

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-primary">
          Quản Lý Người Dùng 👥
        </h1>
        <p className="text-xs sm:text-sm text-secondary mt-1">
          Xem thông tin, phân quyền, khóa tài khoản hoặc kiểm tra chi tiết sinh viên
        </p>
      </div>

      {/* 2. Filter & Search Bar */}
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            placeholder="Tìm theo tên hoặc email..."
            icon={Search}
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
          />

          <Select
            value={filters.role}
            onChange={(e) => setFilters({ ...filters, role: e.target.value, page: 1 })}
          >
            <option value="">Tất cả vai trò</option>
            <option value="USER">Sinh viên (USER)</option>
            <option value="ADMIN">Quản trị viên (ADMIN)</option>
          </Select>

          <Select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="ACTIVE">Hoạt động (ACTIVE)</option>
            <option value="LOCKED">Bị khóa (LOCKED)</option>
          </Select>
        </div>
      </Card>

      {/* 3. Users Table */}
      <Card className="p-0 overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
          </div>
        ) : users.length === 0 ? (
          <EmptyState title="Không tìm thấy người dùng nào" className="py-16" />
        ) : (
          <div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Người dùng</TableHead>
                  <TableHead>Vai trò</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ngày đăng ký</TableHead>
                  <TableHead className="text-center">Số giao dịch</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={u.avatarUrl ? `http://localhost:5000${u.avatarUrl}` : null}
                          fallback={u.fullName?.charAt(0) || 'U'}
                          size="sm"
                        />
                        <div>
                          <p className="text-xs font-bold text-primary">{u.fullName}</p>
                          <p className="text-[11px] text-secondary">{u.email}</p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge variant={u.role === 'ADMIN' ? 'tangerine' : 'primary'}>
                        {u.role}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <Badge variant={u.status === 'ACTIVE' ? 'lime' : 'coral'}>
                        {u.status === 'ACTIVE' ? 'Hoạt động' : 'Đã khóa'}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-xs text-secondary">
                      {new Date(u.createdAt).toLocaleDateString('vi-VN')}
                    </TableCell>

                    <TableCell className="text-center font-bold text-xs">
                      {u._count?.transactions || 0}
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedUser(u);
                            setDetailDrawerOpen(true);
                          }}
                          className="p-1.5 rounded-full hover:bg-sand/60 dark:hover:bg-white/10 text-secondary hover:text-ink-light"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => setConfirmAction({ type: 'STATUS', user: u })}
                          className={`p-1.5 rounded-full hover:bg-sand/60 dark:hover:bg-white/10 ${
                            u.status === 'ACTIVE' ? 'text-coral' : 'text-brand dark:text-lime'
                          }`}
                          title={u.status === 'ACTIVE' ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                        >
                          {u.status === 'ACTIVE' ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                        </button>

                        <button
                          onClick={() => setConfirmAction({ type: 'ROLE', user: u })}
                          className="p-1.5 rounded-full hover:bg-sand/60 dark:hover:bg-white/10 text-tangerine"
                          title="Đổi vai trò USER / ADMIN"
                        >
                          <Shield className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => setConfirmAction({ type: 'DELETE', user: u })}
                          className="p-1.5 rounded-full hover:bg-coral/15 text-coral"
                          title="Xóa người dùng"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

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

      {/* 4. User Detail Drawer (Side Panel) */}
      {detailDrawerOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setDetailDrawerOpen(false)}
          />

          <div className="relative w-full max-w-md bg-surface border-l border-border h-full shadow-modal p-6 overflow-y-auto space-y-6 z-10 animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <h3 className="text-base font-bold text-primary">
                Chi Tiết Người Dùng
              </h3>
              <button
                onClick={() => setDetailDrawerOpen(false)}
                className="p-1 rounded-full text-secondary hover:text-ink-light"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {loadingDetail ? (
              <div className="space-y-4">
                <Skeleton className="h-16" />
                <Skeleton className="h-24" />
                <Skeleton className="h-32" />
              </div>
            ) : userDetail ? (
              <div className="space-y-6">
                {/* Profile header */}
                <div className="flex items-center gap-3.5 p-4 rounded-20 bg-sand/20 dark:bg-white/5 border border-border/60">
                  <Avatar
                    src={userDetail.avatarUrl ? `http://localhost:5000${userDetail.avatarUrl}` : null}
                    fallback={userDetail.fullName?.charAt(0) || 'U'}
                    size="md"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-primary">{userDetail.fullName}</h4>
                    <p className="text-xs text-secondary">{userDetail.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={userDetail.role === 'ADMIN' ? 'tangerine' : 'primary'}>
                        {userDetail.role}
                      </Badge>
                      <Badge variant={userDetail.status === 'ACTIVE' ? 'lime' : 'coral'}>
                        {userDetail.status}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Thống kê hoạt động */}
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="p-3 rounded-16 bg-sand/20 dark:bg-white/5 border border-border/60">
                    <span className="text-xs text-secondary block">Tổng giao dịch</span>
                    <strong className="text-lg text-brand dark:text-lime">
                      {userDetail._count?.transactions || 0}
                    </strong>
                  </div>
                  <div className="p-3 rounded-16 bg-sand/20 dark:bg-white/5 border border-border/60">
                    <span className="text-xs text-secondary block">Phiên Chatbot AI</span>
                    <strong className="text-lg text-tangerine">
                      {userDetail._count?.chatSessions || 0}
                    </strong>
                  </div>
                </div>

                {/* Danh sách ví */}
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-secondary">
                    Ví cá nhân ({userDetail.wallets?.length || 0})
                  </span>
                  <div className="space-y-1.5">
                    {userDetail.wallets?.map((w) => (
                      <div
                        key={w.id}
                        className="p-2.5 rounded-16 bg-sand/20 dark:bg-white/5 flex items-center justify-between text-xs"
                      >
                        <span className="font-semibold">{w.name}</span>
                        <strong className="text-brand dark:text-lime">
                          {Number(w.balance).toLocaleString('vi-VN')}₫
                        </strong>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mục tiêu tiết kiệm */}
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-secondary">
                    Mục tiêu tiết kiệm ({userDetail.savingGoals?.length || 0})
                  </span>
                  <div className="space-y-1.5">
                    {userDetail.savingGoals?.map((g) => (
                      <div
                        key={g.id}
                        className="p-2.5 rounded-16 bg-sand/20 dark:bg-white/5 flex items-center justify-between text-xs"
                      >
                        <span className="font-semibold truncate max-w-[180px]">{g.title}</span>
                        <span>
                          {Number(g.currentAmount).toLocaleString('vi-VN')}₫ / {Number(g.targetAmount).toLocaleString('vi-VN')}₫
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Confirm Action Dialog */}
      {confirmAction && (
        <ConfirmDialog
          isOpen={!!confirmAction}
          onClose={() => setConfirmAction(null)}
          onConfirm={() => {
            const { type, user } = confirmAction;
            if (type === 'STATUS') {
              const newStatus = user.status === 'ACTIVE' ? 'LOCKED' : 'ACTIVE';
              statusMutation.mutate({ id: user.id, status: newStatus });
            } else if (type === 'ROLE') {
              const newRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN';
              roleMutation.mutate({ id: user.id, role: newRole });
            } else if (type === 'DELETE') {
              deleteMutation.mutate(user.id);
            }
          }}
          title={
            confirmAction.type === 'STATUS'
              ? `${confirmAction.user.status === 'ACTIVE' ? 'Khóa' : 'Mở khóa'} tài khoản`
              : confirmAction.type === 'ROLE'
              ? 'Đổi vai trò người dùng'
              : 'Xóa người dùng vĩnh viễn'
          }
          message={
            confirmAction.type === 'STATUS'
              ? `Bạn có chắc chắn muốn ${confirmAction.user.status === 'ACTIVE' ? 'khóa' : 'mở khóa'} tài khoản "${confirmAction.user.fullName}"?`
              : confirmAction.type === 'ROLE'
              ? `Chuyển vai trò của "${confirmAction.user.fullName}" thành ${confirmAction.user.role === 'ADMIN' ? 'USER' : 'ADMIN'}?`
              : `Hành động này sẽ xóa vĩnh viễn tài khoản "${confirmAction.user.fullName}" cùng toàn bộ dữ liệu giao dịch liên kết. Không thể hoàn tác!`
          }
          confirmText="Xác nhận thực hiện"
          isDanger={confirmAction.type === 'DELETE' || (confirmAction.type === 'STATUS' && confirmAction.user.status === 'ACTIVE')}
          isLoading={statusMutation.isPending || roleMutation.isPending || deleteMutation.isPending}
        />
      )}
    </div>
  );
};
