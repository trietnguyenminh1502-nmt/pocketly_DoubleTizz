import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationApi } from '@/api/chatNotificationUser';
import { Bell, Check, CheckCheck, Trash2, Info, AlertTriangle, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';

export const NotificationBellDropdown = () => {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // 1. Fetch số lượng chưa đọc
  const { data: countRes } = useQuery({
    queryKey: ['notificationsUnreadCount'],
    queryFn: () => notificationApi.getUnreadCount(),
    refetchInterval: 15000 // tự động refresh mỗi 15s
  });

  // 2. Fetch danh sách 5 thông báo mới nhất khi mở dropdown
  const { data: notifsRes, isLoading } = useQuery({
    queryKey: ['notifications', { limit: 5 }],
    queryFn: () => notificationApi.list({ limit: 5, page: 1 }),
    enabled: isOpen
  });

  const unreadCount = countRes?.data?.unreadCount || 0;
  const notifications = notifsRes?.data?.notifications || [];

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAllMutation = useMutation({
    mutationFn: () => notificationApi.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notificationsUnreadCount'] });
    }
  });

  const markOneMutation = useMutation({
    mutationFn: (id) => notificationApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notificationsUnreadCount'] });
    }
  });

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Nút Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2.5 rounded-full border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark text-ink-light dark:text-ink-dark hover:scale-105 transition-all shadow-soft relative"
        aria-label="Thông báo"
        title="Xem thông báo"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="min-w-4 h-4 px-1 rounded-full bg-tangerine text-white text-[10px] font-bold flex items-center justify-center absolute -top-1 -right-1 shadow-soft">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Box */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-24 border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark p-3 shadow-modal z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between pb-2 px-2 border-b border-border-light/60 dark:border-border-dark/60">
            <span className="text-xs font-bold text-ink-light dark:text-ink-dark">
              Thông báo ({unreadCount} chưa đọc)
            </span>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllMutation.mutate()}
                className="text-[11px] text-primary dark:text-lime hover:underline font-semibold flex items-center gap-1"
              >
                <CheckCheck className="w-3.5 h-3.5" /> Đọc tất cả
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-border-light/40 dark:divide-border-dark/40 py-1">
            {isLoading ? (
              <div className="py-4 text-center text-xs text-ink-muted">Đang tải...</div>
            ) : notifications.length === 0 ? (
              <div className="py-6 text-center text-xs text-ink-muted">Không có thông báo nào</div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => !n.isRead && markOneMutation.mutate(n.id)}
                  className={`p-2.5 rounded-16 flex items-start gap-2.5 transition-colors cursor-pointer ${
                    !n.isRead ? 'bg-sand/30 dark:bg-white/5 font-semibold' : 'hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  <div className="p-1.5 rounded-full shrink-0 mt-0.5 bg-tangerine/10 text-tangerine">
                    {n.type === 'BUDGET_ALERT' ? (
                      <AlertTriangle className="w-3.5 h-3.5 text-coral" />
                    ) : (
                      <Info className="w-3.5 h-3.5 text-primary dark:text-lime" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-ink-light dark:text-ink-dark leading-snug">{n.title}</p>
                    <p className="text-[11px] text-ink-muted line-clamp-2 mt-0.5 font-normal">{n.message}</p>
                    <span className="text-[10px] text-ink-muted/70 block mt-1">
                      {new Date(n.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>

                  {!n.isRead && (
                    <span className="w-2 h-2 rounded-full bg-tangerine shrink-0 mt-1.5" />
                  )}
                </div>
              ))
            )}
          </div>

          <div className="pt-2 px-2 border-t border-border-light/60 dark:border-border-dark/60 text-center">
            <Link
              to="/notifications"
              onClick={() => setIsOpen(false)}
              className="text-xs font-bold text-primary dark:text-lime hover:underline block py-1"
            >
              Xem tất cả thông báo →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
