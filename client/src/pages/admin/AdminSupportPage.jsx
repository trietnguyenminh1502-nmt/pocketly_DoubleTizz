import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supportApi } from '@/api/support';
import { Card, Button, Input, Select, Modal, Textarea, useToast, Pagination } from '@/components/ui';
import {
  MessageSquare,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  Trash2,
  Eye,
  Mail,
  RefreshCw,
  ExternalLink,
  Tag
} from 'lucide-react';
import { cn } from '@/utils/cn';

const TOPIC_LABELS = {
  general: 'Hỏi đáp chung',
  account: 'Sự cố tài khoản',
  transaction: 'Giao dịch & Ví tiền',
  ai: 'Trợ lý AI',
  feedback: 'Góp ý cải tiến',
  other: 'Khác'
};

const TOPIC_COLORS = {
  general: 'bg-sand text-ink-light dark:bg-surface-dark dark:text-ink-dark',
  account: 'bg-coral/10 text-coral',
  transaction: 'bg-primary/10 text-primary dark:bg-lime/10 dark:text-lime',
  ai: 'bg-tangerine/10 text-tangerine',
  feedback: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  other: 'bg-slate-500/10 text-slate-600 dark:text-slate-400'
};

const STATUS_LABELS = {
  PENDING: { label: 'Chờ xử lý', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' },
  IN_PROGRESS: { label: 'Đang xử lý', color: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20' },
  RESOLVED: { label: 'Đã giải quyết', color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' }
};

export const AdminSupportPage = () => {
  const { addToast } = useToast();
  const queryClient = useQueryClient();

  // Filters State
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('ALL');
  const [topic, setTopic] = useState('ALL');
  const [page, setPage] = useState(1);

  // Selected Ticket for Modal
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [editNotes, setEditNotes] = useState('');
  const [editStatus, setEditStatus] = useState('PENDING');

  // Query: Danh sách support tickets
  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['admin-support-tickets', { search, status, topic, page }],
    queryFn: () => supportApi.listTickets({ search, status, topic, page, limit: 10 }),
    keepPreviousData: true
  });

  const tickets = data?.data?.tickets || data?.tickets || [];
  const pagination = data?.data?.pagination || data?.pagination || { page: 1, totalPages: 1, total: 0 };
  const stats = data?.data?.stats || data?.stats || { total: 0, pending: 0, in_progress: 0, resolved: 0 };

  // Mutation: Cập nhật trạng thái / ghi chú
  const updateMutation = useMutation({
    mutationFn: ({ id, status, notes }) => supportApi.updateTicket(id, { status, notes }),
    onSuccess: (res) => {
      addToast({ message: 'Cập nhật yêu cầu hỗ trợ thành công!', type: 'success' });
      queryClient.invalidateQueries(['admin-support-tickets']);
      if (selectedTicket) {
        setSelectedTicket(res?.data?.ticket || res?.ticket || null);
      }
    },
    onError: (err) => {
      addToast({ message: err.message || 'Lỗi khi cập nhật yêu cầu', type: 'error' });
    }
  });

  // Mutation: Xóa ticket
  const deleteMutation = useMutation({
    mutationFn: (id) => supportApi.deleteTicket(id),
    onSuccess: () => {
      addToast({ message: 'Đã xóa yêu cầu hỗ trợ!', type: 'info' });
      queryClient.invalidateQueries(['admin-support-tickets']);
      if (selectedTicket) setSelectedTicket(null);
    },
    onError: (err) => {
      addToast({ message: err.message || 'Lỗi khi xóa yêu cầu', type: 'error' });
    }
  });

  const handleOpenDetail = (ticket) => {
    setSelectedTicket(ticket);
    setEditNotes(ticket.notes || '');
    setEditStatus(ticket.status);
  };

  const handleSaveModal = () => {
    if (!selectedTicket) return;
    updateMutation.mutate({
      id: selectedTicket.id,
      status: editStatus,
      notes: editNotes
    });
  };

  const handleDelete = (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa yêu cầu hỗ trợ này không?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-ink-light dark:text-ink-dark flex items-center gap-2.5">
            <span className="p-2 rounded-16 bg-tangerine/10 text-tangerine text-xl">📬</span>
            Hộp Thư Yêu Cầu & Hỗ Trợ
          </h1>
          <p className="text-xs sm:text-sm text-ink-muted mt-1">
            Theo dõi, phân loại và phản hồi các yêu cầu trợ giúp từ sinh viên sử dụng Pocketly
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          icon={RefreshCw}
          onClick={() => refetch()}
          disabled={isFetching}
        >
          Làm mới
        </Button>
      </div>

      {/* 2. Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 sm:p-5 flex items-center gap-4">
          <div className="p-3 rounded-20 bg-primary/10 dark:bg-lime/10 text-primary dark:text-lime">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-ink-muted font-medium">Tổng số yêu cầu</p>
            <p className="text-xl sm:text-2xl font-black font-heading text-ink-light dark:text-ink-dark mt-0.5">
              {stats.total}
            </p>
          </div>
        </Card>

        <Card className="p-4 sm:p-5 flex items-center gap-4 border-amber-500/30">
          <div className="p-3 rounded-20 bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-ink-muted font-medium">Chờ xử lý</p>
            <p className="text-xl sm:text-2xl font-black font-heading text-amber-600 dark:text-amber-400 mt-0.5">
              {stats.pending}
            </p>
          </div>
        </Card>

        <Card className="p-4 sm:p-5 flex items-center gap-4 border-sky-500/30">
          <div className="p-3 rounded-20 bg-sky-500/10 text-sky-600 dark:text-sky-400">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-ink-muted font-medium">Đang xử lý</p>
            <p className="text-xl sm:text-2xl font-black font-heading text-sky-600 dark:text-sky-400 mt-0.5">
              {stats.in_progress}
            </p>
          </div>
        </Card>

        <Card className="p-4 sm:p-5 flex items-center gap-4 border-emerald-500/30">
          <div className="p-3 rounded-20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-ink-muted font-medium">Đã giải quyết</p>
            <p className="text-xl sm:text-2xl font-black font-heading text-emerald-600 dark:text-emerald-400 mt-0.5">
              {stats.resolved}
            </p>
          </div>
        </Card>
      </div>

      {/* 3. Filter Bar */}
      <Card className="p-4 flex flex-col md:flex-row items-center gap-3">
        <div className="w-full md:flex-1 relative">
          <Input
            placeholder="Tìm theo họ tên, email hoặc từ khóa nội dung..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            icon={Search}
          />
        </div>

        <div className="w-full md:w-48">
          <Select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            options={[
              { value: 'ALL', label: 'Tất cả trạng thái' },
              { value: 'PENDING', label: '⏳ Chờ xử lý' },
              { value: 'IN_PROGRESS', label: '🔄 Đang xử lý' },
              { value: 'RESOLVED', label: '✅ Đã giải quyết' }
            ]}
          />
        </div>

        <div className="w-full md:w-52">
          <Select
            value={topic}
            onChange={(e) => {
              setTopic(e.target.value);
              setPage(1);
            }}
            options={[
              { value: 'ALL', label: 'Tất cả chủ đề' },
              { value: 'general', label: 'Hỏi đáp chung' },
              { value: 'account', label: 'Sự cố tài khoản' },
              { value: 'transaction', label: 'Giao dịch & Ví tiền' },
              { value: 'ai', label: 'Trợ lý AI' },
              { value: 'feedback', label: 'Góp ý cải tiến' },
              { value: 'other', label: 'Khác' }
            ]}
          />
        </div>
      </Card>

      {/* 4. Tickets Table */}
      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-ink-muted text-sm animate-pulse">
            Đang tải danh sách yêu cầu hỗ trợ...
          </div>
        ) : tickets.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <MessageSquare className="w-10 h-10 text-ink-muted mx-auto opacity-40" />
            <h3 className="text-base font-bold text-ink-light dark:text-ink-dark">Không có yêu cầu hỗ trợ nào</h3>
            <p className="text-xs text-ink-muted">
              {search || status !== 'ALL' || topic !== 'ALL'
                ? 'Không tìm thấy kết quả phù hợp với bộ lọc hiện tại.'
                : 'Chưa có sinh viên nào gửi yêu cầu hỗ trợ.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-sand/40 dark:bg-surface-dark border-b border-border-light dark:border-border-dark text-xs uppercase tracking-wider text-ink-muted">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Người gửi</th>
                  <th className="py-3.5 px-4 font-semibold">Chủ đề</th>
                  <th className="py-3.5 px-4 font-semibold">Nội dung</th>
                  <th className="py-3.5 px-4 font-semibold">Thời gian</th>
                  <th className="py-3.5 px-4 font-semibold">Trạng thái</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light dark:divide-border-dark">
                {tickets.map((t) => {
                  const statusInfo = STATUS_LABELS[t.status] || STATUS_LABELS.PENDING;
                  const topicLabel = TOPIC_LABELS[t.topic] || t.topic;
                  const topicColor = TOPIC_COLORS[t.topic] || TOPIC_COLORS.other;

                  return (
                    <tr
                      key={t.id}
                      className="hover:bg-sand/20 dark:hover:bg-white/5 transition-colors cursor-pointer"
                      onClick={() => handleOpenDetail(t)}
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-ink-light dark:text-ink-dark">{t.fullName}</div>
                        <div className="text-xs text-ink-muted">{t.email}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={cn('px-2.5 py-1 rounded-full text-xs font-semibold inline-block', topicColor)}>
                          {topicLabel}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        <p className="text-xs text-ink-light dark:text-ink-dark line-clamp-2">
                          {t.message}
                        </p>
                        {t.notes && (
                          <span className="text-[10px] text-primary dark:text-lime font-mono block mt-0.5">
                            Ghi chú: {t.notes}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-xs text-ink-muted whitespace-nowrap">
                        {new Date(t.createdAt).toLocaleString('vi-VN')}
                      </td>

                      <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={t.status}
                          onChange={(e) => updateMutation.mutate({ id: t.id, status: e.target.value })}
                          className={cn(
                            'text-xs font-bold px-2.5 py-1 rounded-full border outline-none cursor-pointer bg-transparent',
                            statusInfo.color
                          )}
                        >
                          <option value="PENDING">⏳ Chờ xử lý</option>
                          <option value="IN_PROGRESS">🔄 Đang xử lý</option>
                          <option value="RESOLVED">✅ Đã giải quyết</option>
                        </select>
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="p-1.5 hover:text-primary dark:hover:text-lime"
                            title="Xem chi tiết"
                            onClick={() => handleOpenDetail(t)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            className="p-1.5 hover:text-coral"
                            title="Xóa yêu cầu"
                            onClick={() => handleDelete(t.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="p-4 border-t border-border-light dark:border-border-dark flex justify-between items-center">
            <span className="text-xs text-ink-muted">
              Hiển thị {tickets.length} trên tổng số {pagination.total} yêu cầu
            </span>
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={(p) => setPage(p)}
            />
          </div>
        )}
      </Card>

      {/* 5. Modal Xem Chi Tiết & Xử Lý */}
      {selectedTicket && (
        <Modal
          isOpen={!!selectedTicket}
          onClose={() => setSelectedTicket(null)}
          title="Chi Tiết Yêu Cầu Hỗ Trợ"
        >
          <div className="space-y-5">
            {/* Người gửi & Thông tin cơ bản */}
            <div className="p-4 rounded-16 bg-sand/40 dark:bg-surface-dark border border-border-light dark:border-border-dark space-y-2.5">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-ink-light dark:text-ink-dark text-base">{selectedTicket.fullName}</h3>
                  <a
                    href={`mailto:${selectedTicket.email}?subject=[Pocketly Support] Phản hồi yêu cầu của bạn`}
                    className="text-xs font-semibold text-primary dark:text-lime hover:underline flex items-center gap-1 mt-0.5"
                  >
                    <Mail className="w-3.5 h-3.5" /> {selectedTicket.email} <ExternalLink className="w-3 h-3 ml-0.5" />
                  </a>
                </div>

                <span className={cn('px-2.5 py-1 rounded-full text-xs font-semibold', TOPIC_COLORS[selectedTicket.topic])}>
                  {TOPIC_LABELS[selectedTicket.topic] || selectedTicket.topic}
                </span>
              </div>

              <div className="text-xs text-ink-muted">
                Thời gian gửi: {new Date(selectedTicket.createdAt).toLocaleString('vi-VN')}
              </div>
            </div>

            {/* Nội dung tin nhắn người dùng */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-ink-muted uppercase tracking-wider block">
                Nội dung yêu cầu từ sinh viên:
              </label>
              <div className="p-4 rounded-16 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark text-sm text-ink-light dark:text-ink-dark whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto font-sans">
                {selectedTicket.message}
              </div>
            </div>

            {/* Thao tác xử lý */}
            <div className="space-y-3 pt-2 border-t border-border-light dark:border-border-dark">
              <Select
                label="Trạng thái giải quyết"
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
                options={[
                  { value: 'PENDING', label: '⏳ Chờ xử lý' },
                  { value: 'IN_PROGRESS', label: '🔄 Đang xử lý' },
                  { value: 'RESOLVED', label: '✅ Đã giải quyết xong' }
                ]}
              />

              <Textarea
                label="Ghi chú nội bộ cho Quản trị viên (Admin Notes)"
                placeholder="Ghi lại tiến trình xử lý, cách khắc phục hoặc nội dung đã gửi mail cho sinh viên..."
                rows={3}
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
              />
            </div>

            {/* Modal Actions */}
            <div className="flex justify-between items-center pt-2">
              <Button
                variant="danger"
                size="sm"
                icon={Trash2}
                onClick={() => handleDelete(selectedTicket.id)}
              >
                Xóa vé
              </Button>

              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={() => setSelectedTicket(null)}>
                  Đóng
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  isLoading={updateMutation.isPending}
                  onClick={handleSaveModal}
                >
                  Lưu cập nhật
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
