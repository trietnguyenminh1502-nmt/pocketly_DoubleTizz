import React from 'react';
import { ChatInterface } from '../components/chat/ChatInterface';

export const ChatPage = () => {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-ink-light dark:text-ink-dark">
          Pocket Assistant AI 🌿
        </h1>
        <p className="text-xs sm:text-sm text-ink-muted mt-1">
          Trợ lý tài chính cá nhân dành riêng cho sinh viên - Phân tích dữ liệu thực tế và đưa ra lời khuyên hữu ích
        </p>
      </div>

      <ChatInterface isWidget={false} />
    </div>
  );
};
