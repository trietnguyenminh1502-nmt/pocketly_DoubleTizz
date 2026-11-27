import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import BotMessage from '@/components/chat/BotMessage';
import { adminApi } from '@/api/admin';
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
  Avatar,
  useToast
} from '@/components/ui';
import {
  Bot,
  MessageSquare,
  Sparkles,
  BarChart3,
  User,
  Search,
  ExternalLink,
  Cpu,
  Trash2,
  Calendar,
  Clock,
  MessageCircle,
  Eye
} from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

export const AdminChatbotPage = () => {
  const [page, setPage] = useState(1);
  const [filterType, setFilterType] = useState('ALL'); // ALL, WITH_MESSAGES, EMPTY
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSession, setSelectedSession] = useState(null);
  const [sessionToDelete, setSessionToDelete] = useState(null);

  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  // Fetch Chatbot stats & sessions
  const { data: chatbotRes, isLoading } = useQuery({
    queryKey: ['adminChatbotSessions', page, searchQuery],
    queryFn: () => adminApi.getChatbotStats({ page, limit: 12, search: searchQuery }),
    keepPreviousData: true
  });

  const stats = chatbotRes?.data?.stats || {
    totalMessages: 0,
    totalSessions: 0,
    averageMessagesPerSession: 0
  };
  const sessions = chatbotRes?.data?.sessions || [];
  const meta = chatbotRes?.data?.meta || { totalPages: 1, page: 1, total: 0 };

  // Xóa phiên hội thoại
  const deleteMutation = useMutation({
    mutationFn: (id) => adminApi.deleteChatSession(id),
    onSuccess: () => {
      showSuccess('Xóa cuộc trò chuyện thành công!');
      setSessionToDelete(null);
      if (selectedSession?.id === sessionToDelete?.id) {
        setSelectedSession(null);
      }
      queryClient.invalidateQueries(['adminChatbotSessions']);
    },
    onError: (err) => {
      showError(err.response?.data?.message || 'Không thể xóa cuộc trò chuyện');
    }
  });

  const isAiRole = (role) => role === 'model' || role === 'assistant';

  // Lọc theo trạng thái số lượng tin nhắn
  const filteredSessions = sessions.filter((s) => {
    const msgCount = s._count?.messages || s.messages?.length || 0;
    if (filterType === 'WITH_MESSAGES' && msgCount === 0) return false;
    if (filterType === 'EMPTY' && msgCount > 0) return false;
    return true;
  });

  const columns = [
    {
      header: 'Sinh viên / Người dùng',
      render: (s) => {
        const u = s.user;
        return (
          <div className="flex items-center gap-3">
            <Avatar
              fallback={u?.fullName?.[0] || 'U'}
              src={u?.avatarUrl}
              size="md"
              className="bg-sand text-ink-light font-bold"
            />
            <div>
              <p className="font-bold text-xs text-primary line-clamp-1">
                {u?.fullName || 'Người dùng ẩn danh'}
              </p>
              <p className="text-[11px] text-secondary line-clamp-1">{u?.email || 'N/A'}</p>
            </div>
          </div>
        );
      }
    },
    {
      header: 'Cuộc trò chuyện & Trích đoạn',
      render: (s) => {
        const lastMsg = s.messages && s.messages.length > 0 ? s.messages[s.messages.length - 1] : null;
        return (
          <div className="max-w-md py-1">
            <div className="flex items-center gap-1.5 font-bold text-xs text-primary line-clamp-1">
              <MessageSquare className="w-3.5 h-3.5 text-brand dark:text-lime shrink-0" />
              <span>{s.title || 'Trò chuyện tài chính thông minh'}</span>
            </div>
            {lastMsg ? (
              <p className="text-[11px] text-secondary line-clamp-1 mt-1 font-sans">
                <span className="font-semibold text-primary">
                  {isAiRole(lastMsg.role) ? 'Pocket AI: ' : 'Sinh viên: '}
                </span>
                {lastMsg.content}
              </p>
            ) : (
              <span className="text-[10px] text-secondary italic mt-1 block">Chưa có tin nhắn nào</span>
            )}
          </div>
        );
      }
    },
    {
      header: 'Số tin nhắn',
      align: 'center',
      render: (s) => {
        const count = s._count?.messages ?? s.messages?.length ?? 0;
        return (
          <Badge
            variant={count > 0 ? 'lime' : 'neutral'}
            size="sm"
            className="font-bold text-xs px-2.5 py-0.5"
          >
            {count} tin nhắn
          </Badge>
        );
      }
    },
    {
      header: 'Cập nhật lần cuối',
      render: (s) => (
        <div className="text-xs text-secondary whitespace-nowrap">
          <p className="font-semibold text-primary">
            {s.updatedAt ? format(new Date(s.updatedAt), 'dd/MM/yyyy HH:mm', { locale: vi }) : 'N/A'}
          </p>
          <span className="text-[10px] text-secondary">
            Tạo lúc: {s.createdAt ? format(new Date(s.createdAt), 'dd/MM/yyyy', { locale: vi }) : ''}
          </span>
        </div>
      )
    },
    {
      header: 'Thao tác',
      align: 'right',
      render: (s) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setSelectedSession(s)}
            leftIcon={<Eye className="w-3.5 h-3.5" />}
            className="text-xs text-brand dark:text-lime hover:underline whitespace-nowrap font-bold"
          >
            Xem hội thoại
          </Button>
          <button
            onClick={() => setSessionToDelete(s)}
            title="Xóa cuộc trò chuyện này"
            className="p-1.5 text-secondary hover:text-danger hover:bg-danger/10 rounded-8 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-heading font-extrabold text-primary flex items-center gap-2.5">
          <span>🤖</span> Nhật ký & Thống kê AI Chatbot
        </h1>
        <p className="text-sm text-secondary mt-1">
          Theo dõi các cuộc hội thoại tài chính sinh viên được lưu trữ theo từng phiên tương tác với Pocket AI.
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-20 bg-tangerine/15 flex items-center justify-center text-tangerine shrink-0">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-secondary uppercase">Tổng tin nhắn AI</p>
            <h3 className="text-2xl font-heading font-extrabold text-primary mt-0.5">
              {stats.totalMessages.toLocaleString('vi-VN')}
            </h3>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-20 bg-lime/25 flex items-center justify-center text-brand dark:text-lime shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-secondary uppercase">Số cuộc trò chuyện</p>
            <h3 className="text-2xl font-heading font-extrabold text-primary mt-0.5">
              {stats.totalSessions.toLocaleString('vi-VN')}
            </h3>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-20 bg-coral/15 flex items-center justify-center text-coral shrink-0">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-secondary uppercase">TB Tin nhắn / Phiên</p>
            <h3 className="text-2xl font-heading font-extrabold text-primary mt-0.5">
              {stats.averageMessagesPerSession}
            </h3>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-20 bg-primary/10 dark:bg-white/10 flex items-center justify-center text-brand dark:text-lime shrink-0">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-secondary uppercase">Mô hình AI</p>
            <h3 className="text-base font-heading font-extrabold text-primary mt-0.5">
              Gemini 2.5 Flash
            </h3>
            <span className="text-[10px] text-secondary font-bold">Google DeepMind</span>
          </div>
        </Card>
      </div>

      {/* Filters & Search */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="w-full sm:w-80">
            <Input
              placeholder="Tìm theo tiêu đề, sinh viên, email, nội dung chat..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              leftIcon={<Search className="w-4 h-4 text-secondary" />}
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-bold text-secondary whitespace-nowrap">Bộ lọc:</span>
            <Select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              options={[
                { label: 'Tất cả cuộc trò chuyện', value: 'ALL' },
                { label: 'Đã có tin nhắn trao đổi', value: 'WITH_MESSAGES' },
                { label: 'Phiên chưa nhắn (0 tin)', value: 'EMPTY' }
              ]}
              className="w-52"
            />
          </div>
        </div>
      </Card>

      {/* Sessions Table */}
      <Card className="overflow-hidden">
        <CardHeader
          title={`Danh sách các cuộc trò chuyện AI (${meta.total || filteredSessions.length} phiên)`}
          description="Lưu vết đầy đủ nội dung hỏi đáp của sinh viên và câu trả lời tư vấn của Pocket AI."
        />

        {isLoading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4, 5].map((n) => (
              <Skeleton key={n} className="h-14 rounded-16" />
            ))}
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={MessageCircle}
              title="Không tìm thấy cuộc trò chuyện nào"
              description="Chưa có cuộc trò chuyện nào phù hợp với bộ lọc tìm kiếm hiện tại."
            />
          </div>
        ) : (
          <div>
            <Table columns={columns} data={filteredSessions} />

            {/* Phân trang */}
            {meta.totalPages > 1 && (
              <div className="p-4 border-t border-border flex justify-center">
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

      {/* Modal Xem toàn bộ nội dung cuộc trò chuyện */}
      <Modal
        isOpen={Boolean(selectedSession)}
        onClose={() => setSelectedSession(null)}
        title="Nội dung Cuộc trò chuyện AI"
        size="xl"
      >
        {selectedSession && (
          <div className="space-y-4">
            {/* Header info bar */}
            <div className="p-4 bg-sand/30 dark:bg-white/5 rounded-20 border border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Avatar
                  fallback={selectedSession.user?.fullName?.[0] || 'U'}
                  src={selectedSession.user?.avatarUrl}
                  size="md"
                  className="bg-sand text-ink-light font-bold"
                />
                <div>
                  <h4 className="font-bold text-sm text-primary">
                    {selectedSession.user?.fullName || 'Người dùng ẩn danh'}
                  </h4>
                  <p className="text-xs text-secondary">{selectedSession.user?.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="lime" size="sm" className="font-bold">
                  {selectedSession.messages?.length || 0} tin nhắn
                </Badge>
                <span className="text-xs text-secondary">
                  Bắt đầu:{' '}
                  {selectedSession.createdAt
                    ? format(new Date(selectedSession.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })
                    : ''}
                </span>
              </div>
            </div>

            {/* Tiêu đề phiên */}
            <div className="px-1 flex items-center gap-2">
              <span className="text-xs font-bold text-secondary uppercase">Chủ đề:</span>
              <span className="text-sm font-semibold text-brand dark:text-lime">
                {selectedSession.title || 'Trò chuyện tài chính thông minh'}
              </span>
            </div>

            {/* Khung chat trực quan hiển thị toàn bộ luồng hội thoại */}
            <div className="max-h-[62vh] overflow-y-auto space-y-4 p-4 bg-sand/15 dark:bg-black/25 rounded-20 border border-border">
              {!selectedSession.messages || selectedSession.messages.length === 0 ? (
                <div className="py-12 text-center text-secondary">
                  <Bot className="w-10 h-10 mx-auto text-secondary/50 mb-2" />
                  <p className="text-sm font-medium">Phiên này chưa phát sinh tin nhắn trao đổi nào.</p>
                </div>
              ) : (
                selectedSession.messages.map((m, index) => {
                  const isUser = m.role === 'user';
                  return (
                    <div
                      key={m.id || index}
                      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                    >
                      {/* Avatar */}
                      <div className="shrink-0 pt-0.5">
                        {isUser ? (
                          <Avatar
                            fallback={selectedSession.user?.fullName?.[0] || 'U'}
                            src={selectedSession.user?.avatarUrl}
                            size="sm"
                            className="bg-primary text-white font-bold"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-lime/30 text-forest dark:text-lime flex items-center justify-center font-bold text-xs border border-lime/40 shadow-sm">
                            <Bot className="w-4 h-4" />
                          </div>
                        )}
                      </div>

                      {/* Bubble */}
                      <div className={`max-w-[85%] sm:max-w-[78%] space-y-1 ${isUser ? 'text-right' : 'text-left'}`}>
                        <div className="flex items-center gap-2 px-1 text-[11px] text-secondary">
                          {isUser ? (
                            <>
                              <span className="font-semibold text-primary">
                                {selectedSession.user?.fullName || 'Sinh viên'}
                              </span>
                              <span>•</span>
                              <span>
                                {m.createdAt
                                  ? format(new Date(m.createdAt), 'HH:mm dd/MM/yyyy', { locale: vi })
                                  : ''}
                              </span>
                            </>
                          ) : (
                            <>
                              <span className="font-bold text-brand dark:text-lime flex items-center gap-1">
                                Pocket AI
                              </span>
                              <Badge variant="lime" size="xs" className="text-[9px] py-0 px-1 font-semibold">
                                Gemini 2.5 Flash
                              </Badge>
                              <span>•</span>
                              <span>
                                {m.createdAt
                                  ? format(new Date(m.createdAt), 'HH:mm dd/MM/yyyy', { locale: vi })
                                  : ''}
                              </span>
                            </>
                          )}
                        </div>

                        <div
                          className={`max-w-[85%] sm:max-w-[85%] rounded-20 px-4 py-3 text-xs sm:text-sm leading-relaxed ${
                            isUser
                              ? 'bg-primary text-white dark:bg-lime dark:text-ink-light rounded-tr-none shadow-sm text-left whitespace-pre-wrap'
                              : 'bg-surface border border-border text-primary rounded-tl-none shadow-sm'
                          } [overflow-wrap:anywhere]`}
                        >
                          {isUser ? (
                            <p className="whitespace-pre-wrap">{m.content}</p>
                          ) : (
                            <BotMessage content={m.content} />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-border">
              <span className="text-xs text-secondary">
                Toàn bộ luồng hội thoại gồm <b>{selectedSession.messages?.length || 0}</b> tin nhắn.
              </span>
              <Button variant="ghost" onClick={() => setSelectedSession(null)}>
                Đóng
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Xác nhận Xóa phiên */}
      <Modal
        isOpen={Boolean(sessionToDelete)}
        onClose={() => setSessionToDelete(null)}
        title="Xác nhận xóa cuộc trò chuyện"
        size="sm"
      >
        {sessionToDelete && (
          <div className="space-y-4">
            <p className="text-sm text-primary">
              Bạn có chắc chắn muốn xóa cuộc trò chuyện{' '}
              <b>"{sessionToDelete.title || 'Trò chuyện tài chính'}"</b> của sinh viên{' '}
              <b>{sessionToDelete.user?.fullName}</b> không?
            </p>
            <p className="text-xs text-danger">
              Hành động này sẽ xóa vĩnh viễn toàn bộ {sessionToDelete._count?.messages || 0} tin nhắn bên trong và
              không thể khôi phục.
            </p>
            <div className="flex justify-end gap-2 pt-3 border-t border-border">
              <Button variant="ghost" onClick={() => setSessionToDelete(null)}>
                Hủy
              </Button>
              <Button
                variant="danger"
                isLoading={deleteMutation.isLoading}
                onClick={() => deleteMutation.mutate(sessionToDelete.id)}
              >
                Xóa vĩnh viễn
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
