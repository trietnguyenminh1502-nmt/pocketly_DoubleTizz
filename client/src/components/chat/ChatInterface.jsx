import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ReactMarkdown from 'react-markdown';
import { chatApi } from '@/api/chatNotificationUser';
import { Button, Input, Skeleton, useToast } from '@/components/ui';
import {
  Bot,
  Send,
  Trash2,
  Plus,
  MessageSquare,
  Sparkles,
  Loader2,
  X,
  Maximize2,
  Minimize2
} from 'lucide-react';

const SUGGESTED_CHIPS = [
  'Tháng này mình còn bao nhiêu tiền khả dụng?',
  'Mình đã tiêu lố vào những khoản gì nhất?',
  'Có mẹo nào tiết kiệm tiền ăn uống cho sinh viên không?',
  'Tình hình ngân sách tháng này của mình thế nào?'
];

export const ChatInterface = ({
  isWidget = false,
  onClose = null,
  className = ''
}) => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  const messagesEndRef = useRef(null);

  const [activeSessionId, setActiveSessionId] = useState(null);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // 1. Fetch danh sách các phiên chat
  const { data: sessionsRes, isLoading: loadingSessions } = useQuery({
    queryKey: ['chatSessions'],
    queryFn: () => chatApi.listSessions()
  });

  const sessions = sessionsRes?.data?.sessions || [];

  // Tự động chọn session đầu tiên nếu có
  useEffect(() => {
    if (sessions.length > 0 && !activeSessionId) {
      setActiveSessionId(sessions[0].id);
    }
  }, [sessions, activeSessionId]);

  // 2. Fetch tin nhắn trong session hiện tại
  const { data: messagesRes, isLoading: loadingMessages } = useQuery({
    queryKey: ['chatMessages', activeSessionId],
    queryFn: () => chatApi.getMessages(activeSessionId),
    enabled: !!activeSessionId
  });

  const messages = messagesRes?.data?.messages || [];

  // Tự động scroll xuống cuối khi có tin nhắn mới
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // 3. Mutation Tạo session mới
  const createSessionMutation = useMutation({
    mutationFn: () => chatApi.createSession({ title: 'Phiên tư vấn mới' }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['chatSessions'] });
      setActiveSessionId(res.data.session.id);
      addToast({ message: 'Đã mở phiên tư vấn mới!', type: 'success' });
    }
  });

  // 4. Mutation Gửi tin nhắn
  const sendMessageMutation = useMutation({
    mutationFn: ({ sessionId, content }) => chatApi.sendMessage(sessionId, content),
    onMutate: () => {
      setIsTyping(true);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatMessages', activeSessionId] });
      queryClient.invalidateQueries({ queryKey: ['chatSessions'] });
      setInputText('');
    },
    onError: (err) => {
      addToast({
        message: err.message || 'Lỗi khi gửi tin nhắn. Vui lòng thử lại!',
        type: 'error'
      });
    },
    onSettled: () => {
      setIsTyping(false);
    }
  });

  // 5. Mutation Xóa toàn bộ tin nhắn trong phiên
  const clearSessionMutation = useMutation({
    mutationFn: (sessionId) => chatApi.clearSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatMessages', activeSessionId] });
      addToast({ message: 'Đã dọn dẹp lịch sử phiên chat!', type: 'info' });
    }
  });

  const handleSend = (textToSend = null) => {
    const text = textToSend || inputText;
    if (!text.trim() || isTyping) return;

    if (!activeSessionId) {
      // Tạo session mới rồi gửi
      chatApi.createSession({ title: text.substring(0, 30) }).then((res) => {
        const newId = res.data.session.id;
        setActiveSessionId(newId);
        sendMessageMutation.mutate({ sessionId: newId, content: text });
      });
    } else {
      sendMessageMutation.mutate({ sessionId: activeSessionId, content: text });
    }
  };

  return (
    <div
      className={`flex bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-24 overflow-hidden shadow-modal ${
        isWidget ? 'h-[520px] w-full max-w-[420px]' : 'h-[calc(100vh-140px)] w-full'
      } ${className}`}
    >
      {/* Session Sidebar (chỉ hiển thị trên full view hoặc khi cần) */}
      {!isWidget && (
        <aside className="w-64 border-r border-border-light dark:border-border-dark bg-sand/20 dark:bg-black/20 flex flex-col shrink-0">
          <div className="p-3 border-b border-border-light dark:border-border-dark">
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              className="w-full text-xs"
              onClick={() => createSessionMutation.mutate()}
              isLoading={createSessionMutation.isPending}
            >
              Cuộc trò chuyện mới
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {loadingSessions ? (
              <div className="space-y-2 p-2">
                <Skeleton className="h-8" />
                <Skeleton className="h-8" />
                <Skeleton className="h-8" />
              </div>
            ) : sessions.length === 0 ? (
              <p className="text-xs text-ink-muted text-center py-6">Chưa có phiên chat nào</p>
            ) : (
              sessions.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setActiveSessionId(s.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-16 text-xs flex items-center gap-2 transition-colors ${
                    activeSessionId === s.id
                      ? 'bg-primary text-white dark:bg-lime dark:text-ink-light font-bold shadow-soft'
                      : 'text-ink-muted hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{s.title || 'Phiên tư vấn'}</span>
                </button>
              ))
            )}
          </div>
        </aside>
      )}

      {/* Main Chat Conversation Container */}
      <div className="flex-1 flex flex-col min-w-0 bg-surface-light dark:bg-surface-dark">
        {/* Chat Top Header */}
        <div className="h-14 px-4 border-b border-border-light dark:border-border-dark flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-lime/20 text-lime-dark dark:text-lime flex items-center justify-center font-bold">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-ink-light dark:text-ink-dark flex items-center gap-1">
                Pocket Assistant AI 🌿
              </h3>
              <p className="text-[10px] text-ink-muted">Cố vấn tài chính sinh viên thông minh</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {activeSessionId && messages.length > 0 && (
              <button
                onClick={() => clearSessionMutation.mutate(activeSessionId)}
                className="p-1.5 rounded-full hover:bg-coral/15 text-ink-muted hover:text-coral transition-colors"
                title="Xóa lịch sử cuộc trò chuyện"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}

            {isWidget && onClose && (
              <button
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-ink-muted hover:text-ink-light"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Message Stream Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loadingMessages ? (
            <div className="space-y-3">
              <Skeleton className="h-12 w-2/3" />
              <Skeleton className="h-16 w-3/4 ml-auto" />
              <Skeleton className="h-12 w-1/2" />
            </div>
          ) : messages.length === 0 ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-mint/50 text-primary mx-auto flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-ink-light dark:text-ink-dark">
                  Chào bạn! Mình có thể giúp gì cho ví tiền của bạn hôm nay?
                </h4>
                <p className="text-xs text-ink-muted max-w-xs mx-auto">
                  Hãy hỏi về tổng tiền hiện có, danh mục chi tiêu nhiều nhất hoặc cách lên kế hoạch tiết kiệm!
                </p>
              </div>

              {/* Suggested Questions Chips */}
              <div className="flex flex-wrap justify-center gap-2 pt-2 max-w-md mx-auto">
                {SUGGESTED_CHIPS.map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(chip)}
                    className="text-left text-xs px-3 py-1.5 rounded-full bg-sand/30 dark:bg-white/5 border border-border-light dark:border-border-dark text-ink-muted hover:text-primary dark:hover:text-lime hover:border-primary/40 transition-colors"
                  >
                    💡 {chip}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((m) => {
              const isUser = m.role === 'user';
              return (
                <div
                  key={m.id}
                  className={`flex items-start gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <div className="w-7 h-7 rounded-full bg-primary text-white dark:bg-lime dark:text-ink-light flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] sm:max-w-[75%] rounded-20 px-4 py-2.5 text-xs leading-relaxed ${
                      isUser
                        ? 'bg-primary text-white dark:bg-lime dark:text-ink-light rounded-br-none shadow-soft'
                        : 'bg-sand/30 dark:bg-surface-dark border border-border-light dark:border-border-dark text-ink-light dark:text-ink-dark rounded-bl-none prose prose-xs dark:prose-invert max-w-none'
                    }`}
                  >
                    {isUser ? (
                      m.content
                    ) : (
                      <ReactMarkdown>{m.content}</ReactMarkdown>
                    )}
                  </div>
                </div>
              );
            })
          )}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex items-center gap-2 text-xs text-ink-muted pt-2 animate-pulse">
              <div className="w-6 h-6 rounded-full bg-lime/20 text-lime-dark flex items-center justify-center">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              </div>
              <span>Pocket Assistant đang phân tích dữ liệu tài chính của bạn...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Nhập câu hỏi tài chính cho AI..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isTyping}
              className="flex-1 bg-sand/30 dark:bg-surface-dark text-ink-light dark:text-ink-dark border border-border-light dark:border-border-dark rounded-full px-4 py-2.5 text-xs outline-none focus:border-primary dark:focus:border-lime"
            />
            <Button
              type="submit"
              variant="primary"
              size="sm"
              icon={Send}
              disabled={!inputText.trim() || isTyping}
              className="p-2.5 rounded-full"
            />
          </form>
        </div>
      </div>
    </div>
  );
};
