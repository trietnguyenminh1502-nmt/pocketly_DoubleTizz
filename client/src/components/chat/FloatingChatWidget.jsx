import React, { useState } from 'react';
import { ChatInterface } from '@/components/chat/ChatInterface';
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

      {/* Floating Trigger Button (Icon tròn thu nhỏ) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-12 h-12 rounded-full bg-primary hover:bg-primary-hover text-white dark:bg-lime dark:text-ink-light dark:hover:bg-lime-hover shadow-modal hover:scale-105 active:scale-95 transition-all"
        title="Hỏi Pocket Assistant"
        aria-label="Hỏi Pocket Assistant"
      >
        {isOpen ? (
          <X className="w-5 h-5" />
        ) : (
          <Bot className="w-6 h-6 text-lime dark:text-ink-light" />
        )}
      </button>
    </div>
  );
};
