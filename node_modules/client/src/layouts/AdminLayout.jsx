import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { ThemeToggle, Avatar, Dropdown } from '@/components/ui';
import {
  LayoutDashboard,
  Users,
  Tags,
  Bot,
  FileSpreadsheet,
  MessageSquare,
  ArrowLeft,
  LogOut,
  User
} from 'lucide-react';
import { cn } from '@/utils/cn';

export const AdminLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const adminUserMenuItems = [
    { label: 'Hồ sơ cá nhân', icon: User, onClick: () => window.location.href = '/profile' },
    { label: 'Quay lại Ứng dụng', icon: ArrowLeft, onClick: () => window.location.href = '/dashboard' },
    { label: 'Đăng xuất Admin', icon: LogOut, danger: true, onClick: logout }
  ];

  const adminNav = [
    { name: 'Thống kê Tổng quan', href: '/admin', icon: LayoutDashboard },
    { name: 'Quản lý Người dùng', href: '/admin/users', icon: Users },
    { name: 'Danh mục Hệ thống', href: '/admin/categories', icon: Tags },
    { name: 'Nhật ký Chatbot AI', href: '/admin/chatbot', icon: Bot },
    { name: 'Hộp thư Hỗ trợ', href: '/admin/support', icon: MessageSquare },
    { name: 'Audit Logs', href: '/admin/audit-logs', icon: FileSpreadsheet }
  ];

  return (
    <div className="min-h-screen bg-background text-primary flex transition-colors">
      {/* Sidebar Admin */}
      <aside className="w-64 border-r border-border bg-surface flex flex-col shrink-0 sticky top-0 h-screen">
        <div className="h-16 flex items-center gap-2.5 px-6 border-b border-border">
          <span className="text-2xl">🛡️</span>
          <span className="font-heading font-extrabold text-lg text-tangerine">Pocketly Admin</span>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto">
          {adminNav.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'flex items-center gap-3 px-3.5 py-3 rounded-20 text-sm font-semibold transition-all duration-150',
                  isActive
                    ? 'bg-tangerine text-white shadow-soft'
                    : 'text-secondary hover:text-ink-light dark:hover:text-ink-dark hover:bg-sand/30 dark:hover:bg-white/5'
                )}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-border space-y-2">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-brand dark:text-lime hover:underline"
          >
            <ArrowLeft className="w-4 h-4" /> Quay lại Ứng dụng
          </Link>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-coral hover:bg-coral/10 rounded-16 transition-colors"
          >
            <LogOut className="w-4 h-4" /> Đăng xuất Admin
          </button>
        </div>
      </aside>

      {/* Admin Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-border bg-surface/80 backdrop-blur-md px-6 flex items-center justify-between">
          <h2 className="text-sm font-bold text-secondary">Cổng thông tin Quản trị viên Hệ thống</h2>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Dropdown
              trigger={
                <button
                  type="button"
                  className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer"
                  title="Menu tài khoản Quản trị viên"
                >
                  <Avatar fallback="A" size="sm" className="bg-tangerine text-white" />
                  <span className="text-xs font-bold text-primary hidden sm:inline">Admin</span>
                </button>
              }
              items={adminUserMenuItems}
            />
          </div>
        </header>

        <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
