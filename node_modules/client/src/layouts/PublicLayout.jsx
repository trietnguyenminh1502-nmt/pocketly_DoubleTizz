import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { ThemeToggle, Button } from '@/components/ui';

export const PublicLayout = () => {
  return (
    <div className="min-h-screen bg-bg-light dark:bg-bg-dark text-ink-light dark:text-ink-dark flex flex-col transition-colors">
      {/* Top Navbar */}
      <nav className="sticky top-0 z-40 bg-surface-light/80 dark:bg-surface-dark/80 backdrop-blur-md border-b border-border-light dark:border-border-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="text-2xl">🌿</span>
            <span className="font-heading font-extrabold text-xl text-primary dark:text-lime">
              Pocketly
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-ink-muted">
            <a href="/#features" className="hover:text-primary dark:hover:text-lime transition-colors">Tính năng</a>
            <a href="/#how-it-works" className="hover:text-primary dark:hover:text-lime transition-colors">Cách hoạt động</a>
            <a href="/#faq" className="hover:text-primary dark:hover:text-lime transition-colors">Hỏi đáp (FAQ)</a>
            <Link to="/design-preview" className="text-tangerine font-semibold hover:underline">UI Kit Preview</Link>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link to="/login">
              <Button variant="ghost" size="sm">Đăng nhập</Button>
            </Link>
            <Link to="/register">
              <Button variant="primary" size="sm">Đăng ký ngay</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark py-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌿</span>
            <span className="font-heading font-extrabold text-lg text-primary dark:text-lime">Pocketly</span>
            <span className="text-xs text-ink-muted ml-2">© 2026 Quản lý chi tiêu thông minh cho sinh viên.</span>
          </div>

          <div className="flex items-center gap-6 text-xs text-ink-muted">
            <Link to="/terms" className="hover:underline">Điều khoản sử dụng</Link>
            <Link to="/privacy" className="hover:underline">Chính sách bảo mật</Link>
            <Link to="/contact" className="hover:underline">Liên hệ hỗ trợ</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
