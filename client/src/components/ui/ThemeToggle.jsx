import React from 'react';
import { useTheme } from '@/context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className="p-2.5 rounded-full border border-border bg-surface text-primary hover:scale-105 transition-all shadow-soft"
      aria-label="Toggle theme"
      title={theme === 'dark' ? 'Chuyển sang chế độ Sáng' : 'Chuyển sang chế độ Tối'}
    >
      {theme === 'dark' ? (
        <Sun className="w-5 h-5 text-lime" />
      ) : (
        <Moon className="w-5 h-5 text-brand" />
      )}
    </button>
  );
};
