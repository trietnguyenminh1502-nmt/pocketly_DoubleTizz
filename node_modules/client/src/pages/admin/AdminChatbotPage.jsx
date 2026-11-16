import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../api/admin';
import {
  Card,
  CardHeader,
  Button,
  Badge,
  Input,
  Select,
  Table,
  Modal,
  Pagination,
  Skeleton,
  EmptyState,
  Avatar
} from '../../components/ui';
import {
  Bot,
  MessageSquare,
  Sparkles,
  BarChart3,
  Clock,
  User,
  Search,
  ExternalLink,
  Cpu
} from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

export const AdminChatbotPage = () => {
  const [page, setPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState('ALL'); // ALL, user, model
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLog, setSelectedLog] = useState(null);

  // Fetch Chatbot stats & logs
  const { data: chatbotRes, isLoading } = useQuery({
    queryKey: ['adminChatbotStats', page],
    queryFn: () => adminApi.getChatbotStats({ page, limit: 15 }),
    keepPreviousData: true
  });

  const stats = chatbotRes?.data?.stats || {
    totalMessages: 0,
    totalSessions: 0,
    averageMessagesPerSession: 0
  };
  const logs = chatbotRes?.data?.recentLogs || [];
  const meta = chatbotRes?.data?.meta || { totalPages: 1, page: 1 };

  // Filter logs locally if search query or role filter is applied
  const filteredLogs = logs.filter((log) => {
    if (roleFilter !== 'ALL' && log.role !== roleFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const contentMatch = log.content?.toLowerCase().includes(q);
      const userMatch = log.session?.user?.fullName?.toLowerCase().includes(q) ||
        log.session?.user?.email?.toLowerCase().includes(q);
      const sessionMatch = log.session?.title?.toLowerCase().includes(q);
      return contentMatch || userMatch || sessionMatch;
    }
    return true;
  });

  const columns = [
    {
      header: 'Người dùng',
      render: (log) => {
        const u = log.session?.user;
        return (
          <div className="flex items-center gap-2.5">
            <Avatar fallback={u?.fullName?.[0] || 'U'} size="sm" className="bg-sand text-ink-light" />
            <div>
              <p className="font-bold text-xs text-ink-light dark:text-ink-dark line-clamp-1">
                {u?.fullName || 'Khách ẩn danh'}
              </p>
              <p className="text-[11px] text-ink-muted line-clamp-1">{u?.email || 'N/A'}</p>
            </div>
          </div>
        );
      }
    },
    {
      header: 'Phiên Chat',
      render: (log) => (
        <span className="text-xs font-semibold text-ink-muted line-clamp-1 max-w-[140px]" title={log.session?.title}>
          {log.session?.title || 'Trò chuyện tài chính'}
        </span>
      )
    },
    {
      header: 'Vai trò',
      render: (log) => (
        <Badge
          variant={log.role === 'model' ? 'lime' : 'neutral'}
          size="sm"
          className="flex items-center gap-1 w-fit"
        >
          {log.role === 'model' ? (
            <>
              <Bot className="w-3 h-3 text-forest" />
              <span>Pocket AI</span>
            </>
          ) : (
            <>
              <User className="w-3 h-3" />
              <span>Người dùng</span>
            </>
          )}
        </Badge>
      )
    },
    {
      header: 'Trích đoạn Tin nhắn',
      render: (log) => (
        <p className="text-xs text-ink-light dark:text-ink-dark line-clamp-2 max-w-md font-mono bg-sand/20 dark:bg-white/5 p-1.5 rounded-12">
          {log.content}
        </p>
      )
    },
    {
      header: 'Thời gian',
      render: (log) => (
        <span className="text-xs text-ink-muted whitespace-nowrap">
          {log.createdAt ? format(new Date(log.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi }) : 'N/A'}
        </span>
      )
    },
    {
      header: 'Thao tác',
      align: 'right',
      render: (log) => (
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setSelectedLog(log)}
          leftIcon={<ExternalLink className="w-3.5 h-3.5" />}
          className="text-xs text-primary dark:text-lime hover:underline"
        >
          Chi tiết
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-heading font-extrabold text-ink-light dark:text-ink-dark flex items-center gap-2.5">
          <span>🤖</span> Nhật ký & Thống kê AI Chatbot
        </h1>
        <p className="text-sm text-ink-muted mt-1">
          Theo dõi lưu lượng tương tác, hội thoại tài chính sinh viên và hiệu suất mô hình Google Gemini.
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-20 bg-tangerine/15 flex items-center justify-center text-tangerine shrink-0">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-ink-muted uppercase">Tổng tin nhắn AI</p>
            <h3 className="text-2xl font-heading font-extrabold text-ink-light dark:text-ink-dark mt-0.5">
              {stats.totalMessages.toLocaleString('vi-VN')}
            </h3>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-20 bg-lime/25 flex items-center justify-center text-primary dark:text-lime shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-ink-muted uppercase">Số phiên trò chuyện</p>
            <h3 className="text-2xl font-heading font-extrabold text-ink-light dark:text-ink-dark mt-0.5">
              {stats.totalSessions.toLocaleString('vi-VN')}
            </h3>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-20 bg-coral/15 flex items-center justify-center text-coral shrink-0">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-ink-muted uppercase">TB Tin nhắn / Phiên</p>
            <h3 className="text-2xl font-heading font-extrabold text-ink-light dark:text-ink-dark mt-0.5">
              {stats.averageMessagesPerSession}
            </h3>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-20 bg-primary/10 dark:bg-white/10 flex items-center justify-center text-primary dark:text-lime shrink-0">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-ink-muted uppercase">Mô hình AI</p>
            <h3 className="text-base font-heading font-extrabold text-ink-light dark:text-ink-dark mt-0.5">
              Gemini 2.5 Flash
            </h3>
            <span className="text-[10px] text-ink-muted font-bold">Google DeepMind</span>
          </div>
        </Card>
      </div>

      {/* Filters & Search */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="w-full sm:w-72">
            <Input
              placeholder="Tìm kiếm nội dung, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-ink-muted" />}
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-bold text-ink-muted whitespace-nowrap">Lọc đối tượng:</span>
            <Select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              options={[
                { label: 'Tất cả đối tượng', value: 'ALL' },
                { label: 'Chỉ người dùng (User)', value: 'user' },
                { label: 'Chỉ AI Trả lời (Pocket AI)', value: 'model' }
              ]}
              className="w-48"
            />
          </div>
        </div>
      </Card>

      {/* Logs Table */}
      <Card className="overflow-hidden">
        <CardHeader
          title="Nhật ký tương tác gần đây"
          description="Các đoạn hội thoại được ghi nhận tự động theo thời gian thực."
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
              icon={Bot}
              title="Không tìm thấy nhật ký tương tác"
              description="Chưa có tin nhắn nào phù hợp với bộ lọc hiện tại hoặc chưa phát sinh trao đổi AI."
            />
          </div>
        ) : (
          <div>
            <Table columns={columns} data={filteredLogs} />

            {/* Phân trang */}
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

      {/* Modal Xem chi tiết tin nhắn */}
      <Modal
        isOpen={Boolean(selectedLog)}
        onClose={() => setSelectedLog(null)}
        title="Chi tiết Nhật ký Hội thoại"
        size="lg"
      >
        {selectedLog && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-sand/20 dark:bg-white/5 rounded-16 border border-border-light dark:border-border-dark">
              <div className="flex items-center gap-2.5">
                <Avatar
                  fallback={selectedLog.session?.user?.fullName?.[0] || 'U'}
                  size="sm"
                  className="bg-sand text-ink-light"
                />
                <div>
                  <p className="font-bold text-sm text-ink-light dark:text-ink-dark">
                    {selectedLog.session?.user?.fullName || 'Người dùng ẩn danh'}
                  </p>
                  <p className="text-xs text-ink-muted">{selectedLog.session?.user?.email}</p>
                </div>
              </div>

              <div className="text-right">
                <Badge variant={selectedLog.role === 'model' ? 'lime' : 'neutral'}>
                  {selectedLog.role === 'model' ? 'Pocket AI Assistant' : 'Học sinh / Sinh viên'}
                </Badge>
                <p className="text-[11px] text-ink-muted mt-1">
                  {selectedLog.createdAt
                    ? format(new Date(selectedLog.createdAt), 'dd/MM/yyyy HH:mm:ss', { locale: vi })
                    : ''}
                </p>
              </div>
            </div>

            <div>
              <p className="text-xs font-bold text-ink-muted uppercase mb-1.5">Tiêu đề phiên hội thoại:</p>
              <p className="text-sm font-semibold text-ink-light dark:text-ink-dark p-2 bg-sand/10 dark:bg-white/5 rounded-12">
                {selectedLog.session?.title || 'Trò chuyện tài chính thông minh'}
              </p>
            </div>

            <div>
              <p className="text-xs font-bold text-ink-muted uppercase mb-1.5">Toàn bộ nội dung tin nhắn:</p>
              <div className="p-4 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-20 max-h-72 overflow-y-auto text-sm leading-relaxed whitespace-pre-wrap font-sans text-ink-light dark:text-ink-dark">
                {selectedLog.content}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-border-light dark:border-border-dark">
              <Button variant="ghost" onClick={() => setSelectedLog(null)}>
                Đóng
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
