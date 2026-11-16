import React, { createContext, useContext, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '@/utils/cn';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ message, type = 'success', duration = 3500 }) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {createPortal(
        <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={cn(
                'pointer-events-auto flex items-center justify-between gap-3 p-4 rounded-20 border shadow-card animate-in slide-in-from-bottom-5 duration-200',
                toast.type === 'success'
                  ? 'bg-surface-light dark:bg-surface-dark border-mint text-primary dark:text-lime'
                  : toast.type === 'error'
                  ? 'bg-surface-light dark:bg-surface-dark border-coral text-coral'
                  : 'bg-surface-light dark:bg-surface-dark border-border-light dark:border-border-dark text-ink-light dark:text-ink-dark'
              )}
            >
              <div className="flex items-center gap-2.5">
                {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 shrink-0 text-primary dark:text-lime" />}
                {toast.type === 'error' && <AlertCircle className="w-5 h-5 shrink-0 text-coral" />}
                {toast.type === 'info' && <Info className="w-5 h-5 shrink-0 text-tangerine" />}
                <span className="text-sm font-medium text-ink-light dark:text-ink-dark">{toast.message}</span>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-ink-muted hover:text-ink-light dark:hover:text-ink-dark"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
