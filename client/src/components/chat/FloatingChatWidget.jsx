import React, { useState } from 'react';
import { ChatInterface } from './ChatInterface';
import { Bot, X } from 'lucide-react';

export const FloatingChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-20 md:bottom-6 right-6 z-40">
      {/* Floating Popup Window */}
      {isOpen && (
        <div className="mb-3 animate-in slide-in-from-bottom-5 duration-200">
          <ChatInterface isWidget onClose={() => setIsOpen(false)} />
        </div>
      )}

      {/* Floating Trigger Pill/Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-4 py-3 rounded-full bg-primary hover:bg-primary-hover text-white dark:bg-lime dark:text-ink-light dark:hover:bg-lime-hover shadow-modal hover:scale-105 active:scale-95 transition-all"
        title="Trò chuyện cùng Pocket Assistant AI"
      >
        {isOpen ? (
          <X className="w-5 h-5" />
        ) : (
          <>
            <Bot className="w-5 h-5 text-lime dark:text-ink-light" />
            <span className="text-xs font-bold font-heading hidden sm:inline">Hỏi Pocket Assistant</span>
          </>
        )}
      </button>
    </div>
  );
};
