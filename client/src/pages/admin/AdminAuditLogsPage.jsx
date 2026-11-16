import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../api/admin';
import {
  Card,
  CardHeader,
  Badge,
  Input,
  Select,
  Table,
  Pagination,
  Skeleton,
  EmptyState,
  Avatar,
  Button
} from '../../components/ui';
import {
  FileSpreadsheet,
  ShieldAlert,
  Search,
  Clock,
  User,
  Copy,
  Check
} from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const ACTION_CONFIG = {
  USER_LOCKED: { label: 'Khóa tài khoản', variant: 'coral' },
  USER_UNLOCKED: { label: 'Mở khóa tài khoản', variant: 'lime' },
  USER_ROLE_CHANGED: { label: 'Thay đổi vai trò', variant: 'warning' },
  USER_DELETED: { label: 'Xóa tài khoản', variant: 'coral' },
  CREATE_DEFAULT_CATEGORY: { label: 'Tạo danh mục mẫu', variant: 'lime' },
  UPDATE_DEFAULT_CATEGORY: { label: 'Cập nhật danh mục', variant: 'neutral' },
  DELETE_DEFAULT_CATEGORY: { label: 'Xóa danh mục mẫu', variant: 'coral' },
  BROADCAST_NOTIFICATION: { label: 'Phát sóng thông báo', variant: 'tangerine' }
};

export const AdminAuditLogsPage = () => {
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  // Fetch Audit Logs
  const { data: auditRes, isLoading } = useQuery({
    queryKey: ['adminAuditLogs', page],
    queryFn: () => adminApi.listAuditLogs({ page, limit: 15 }),
    keepPreviousData: true
  });

  const logs = auditRes?.data?.logs || [];
  const meta = auditRes?.data?.meta || { total: 0, totalPages: 1, page: 1 };

  // Filter logs locally if action filter or search query is applied
  const filteredLogs = logs.filter((log) => {
    if (actionFilter !== 'ALL' && log.action !== actionFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const adminMatch = log.admin?.fullName?.toLowerCase().includes(q) ||
        log.admin?.email?.toLowerCase().includes(q);
      const actionMatch = log.action?.toLowerCase().includes(q);
      const targetMatch = log.targetId?.toLowerCase().includes(q);
      return adminMatch || actionMatch || targetMatch;
    }
    return true;
  });

  const handleCopyTarget = (id) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const columns = [
    {
      header: 'Quản trị viên thực hiện',
      render: (log) => {
        const admin = log.admin;
        return (
          <div className="flex items-center gap-2.5">
            <Avatar
              fallback={admin?.fullName?.[0] || 'A'}
              size="sm"
              className="bg-tangerine text-white"
            />
            <div>
              <p className="font-bold text-xs text-ink-light dark:text-ink-dark line-clamp-1">
                {admin?.fullName || 'Admin hệ thống'}
              </p>
              <p className="text-[11px] text-ink-muted line-clamp-1">{admin?.email || 'N/A'}</p>
            </div>
          </div>
        );
      }
    },
    {
      header: 'Hành động',
      render: (log) => {
        const config = ACTION_CONFIG[log.action] || {
          label: log.action,
          variant: 'neutral'
        };
        return (
          <Badge variant={config.variant} size="sm" className="font-semibold">
            {config.label}
          </Badge>
        );
      }
    },
    {
      header: 'Mã đối tượng tác động (Target ID)',
      render: (log) => (
        <div className="flex items-center gap-1.5 font-mono text-xs text-ink-muted">
          <span className="bg-sand/30 dark:bg-white/5 px-2 py-1 rounded-8 line-clamp-1 max-w-[200px]">
            {log.targetId || 'N/A'}
          </span>
          {log.targetId && (
            <button
              onClick={() => handleCopyTarget(log.targetId)}
              title="Sao chép ID"
              className="p-1 hover:text-ink-light dark:hover:text-ink-dark transition-colors"
            >
              {copiedId === log.targetId ? (
                <Check className="w-3.5 h-3.5 text-lime" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          )}
        </div>
      )
    },
    {
      header: 'Thời điểm',
      render: (log) => (
        <span className="text-xs text-ink-muted whitespace-nowrap">
          {log.createdAt ? format(new Date(log.createdAt), 'dd/MM/yyyy HH:mm:ss', { locale: vi }) : 'N/A'}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-heading font-extrabold text-ink-light dark:text-ink-dark flex items-center gap-2.5">
          <span>🛡️</span> Nhật ký Thao tác Quản trị (Audit Logs)
        </h1>
        <p className="text-sm text-ink-muted mt-1">
          Hệ thống ghi nhận minh bạch và không thể chỉnh sửa mọi hành động của quản trị viên để bảo mật.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="w-full sm:w-80">
            <Input
              placeholder="Tìm theo tên Admin, email, Target ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-ink-muted" />}
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-bold text-ink-muted whitespace-nowrap">Loại hành động:</span>
            <Select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              options={[
                { label: 'Tất cả hành động', value: 'ALL' },
                { label: 'Khóa tài khoản', value: 'USER_LOCKED' },
                { label: 'Mở khóa tài khoản', value: 'USER_UNLOCKED' },
                { label: 'Đổi vai trò người dùng', value: 'USER_ROLE_CHANGED' },
                { label: 'Xóa tài khoản', value: 'USER_DELETED' },
                { label: 'Tạo danh mục hệ thống', value: 'CREATE_DEFAULT_CATEGORY' },
                { label: 'Cập nhật danh mục', value: 'UPDATE_DEFAULT_CATEGORY' },
                { label: 'Xóa danh mục', value: 'DELETE_DEFAULT_CATEGORY' },
                { label: 'Phát sóng thông báo', value: 'BROADCAST_NOTIFICATION' }
              ]}
              className="w-56"
            />
          </div>
        </div>
      </Card>

      {/* Audit Log Table */}
      <Card className="overflow-hidden">
        <CardHeader
          title={`Danh sách sự kiện ghi nhận (${meta.total} bản ghi)`}
          description="Sắp xếp theo thứ tự mới nhất được thực hiện trên hệ thống."
        />

        {isLoading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4, 5].map((n) => (
              <Skeleton key={n} className="h-12 rounded-16" />
            ))}
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={ShieldAlert}
              title="Không tìm thấy nhật ký kiểm tra"
              description="Chưa có hành động quản trị viên nào được thực hiện hoặc không khớp với bộ lọc."
            />
          </div>
        ) : (
          <div>
            <Table columns={columns} data={filteredLogs} />

            {/* Pagination */}
            {meta.totalPages > 1 && (
              <div className="p-4 border-t border-border-light dark:border-border-dark flex justify-center">
                <Pagination
                  currentPage={page}
                  totalPages={meta.totalPages}
                  onPageChange={(p) => setPage(p)}
                />
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};
