import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationApi } from '@/api/chatNotificationUser';
import { formatDateTime } from '../../../shared/formatters.js';
import {
  Card,
  CardHeader,
  Button,
  Badge,
  Pagination,
  Skeleton,
  EmptyState,
  useToast
} from '@/components/ui';
import {
  Bell,
  CheckCheck,
  Trash2,
  AlertTriangle,
  Info,
  ShieldAlert,
  Check
} from 'lucide-react';

export const NotificationsPage = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  const [page, setPage] = useState(1);

  const { data: res, isLoading } = useQuery({
    queryKey: ['notifications', { page, limit: 15 }],
    queryFn: () => notificationApi.list({ page, limit: 15 })
  });

  const notifications = res?.data?.notifications || [];
  const meta = res?.data?.meta || { total: 0, totalPages: 1, unreadCount: 0 };

  const markAllMutation = useMutation({
    mutationFn: () => notificationApi.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notificationsUnreadCount'] });
      addToast({ message: 'Đã đánh dấu tất cả là đã đọc!', type: 'success' });
    }
  });

  const markOneMutation = useMutation({
    mutationFn: (id) => notificationApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notificationsUnreadCount'] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => notificationApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notificationsUnreadCount'] });
      addToast({ message: 'Đã xóa thông báo!', type: 'info' });
    }
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-primary">
            Trung Tâm Thông Báo 🔔
          </h1>
          <p className="text-xs sm:text-sm text-secondary mt-1">
            Cập nhật cảnh báo ngân sách, thông báo phát sóng hệ thống và tin tức từ Pocketly
          </p>
        </div>

        {meta.unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            icon={CheckCheck}
            onClick={() => markAllMutation.mutate()}
            isLoading={markAllMutation.isPending}
          >
            Đánh dấu tất cả đã đọc
          </Button>
        )}
      </div>

      {/* 2. Notifications List Card */}
      <Card className="p-0 overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-4">
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
          </div>
        ) : notifications.length === 0 ? (
          <EmptyState
            title="Hộp thư thông báo trống"
            description="Bạn đã đọc hết tất cả thông báo hoặc chưa có cảnh báo mới nào!"
            className="py-16"
          />
        ) : (
          <div>
            <div className="divide-y divide-border-light/60 dark:divide-border-dark/60">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-4 sm:p-5 flex items-start justify-between gap-4 transition-colors ${
                    !n.isRead ? 'bg-sand/20 dark:bg-white/5' : 'hover:bg-sand/10 dark:hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-start gap-3.5 flex-1">
                    <div
                      className={`p-2 rounded-20 shrink-0 mt-0.5 ${
                        n.type === 'BUDGET_ALERT'
                          ? 'bg-coral/15 text-coral'
                          : 'bg-primary/10 text-brand dark:bg-lime/20 dark:text-lime'
                      }`}
                    >
                      {n.type === 'BUDGET_ALERT' ? (
                        <AlertTriangle className="w-5 h-5" />
                      ) : (
                        <Info className="w-5 h-5" />
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-primary">
                          {n.title}
                        </h4>
                        {!n.isRead && (
                          <Badge variant="tangerine" className="text-[10px]">Mới</Badge>
                        )}
                        {!n.userId && (
                          <Badge variant="sand" className="text-[10px]">Hệ thống</Badge>
                        )}
                      </div>

                      <p className="text-xs text-secondary leading-relaxed">{n.message}</p>
                      <span className="text-[10px] text-secondary/70 block pt-1">
                        {formatDateTime(n.createdAt)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {!n.isRead && (
                      <button
                        onClick={() => markOneMutation.mutate(n.id)}
                        className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-secondary hover:text-brand dark:hover:text-lime transition-colors"
                        title="Đánh dấu đã đọc"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteMutation.mutate(n.id)}
                      className="p-1.5 rounded-full hover:bg-coral/15 text-secondary hover:text-coral transition-colors"
                      title="Xóa thông báo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-border">
              <Pagination
                currentPage={page}
                totalPages={meta.totalPages}
                onPageChange={setPage}
              />
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
