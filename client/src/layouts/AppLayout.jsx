import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { ThemeToggle, Avatar, Dropdown } from '@/components/ui';
import { NotificationBellDropdown } from '@/components/notifications/NotificationBellDropdown';
import { FloatingChatWidget } from '@/components/chat/FloatingChatWidget';
import {
  LayoutDashboard,
  ReceiptText,
  Wallet,
  PiggyBank,
  Target,
  Bot,
  Bell,
  Search,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User,
  ShieldAlert,
  BarChart3,
  Tags
} from 'lucide-react';
import { cn } from '@/utils/cn';

export const AppLayout = () => {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const navigation = [
    { name: 'Tổng quan', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Giao dịch', href: '/transactions', icon: ReceiptText },
    { name: 'Ví tiền', href: '/wallets', icon: Wallet },
    { name: 'Ngân sách', href: '/budgets', icon: PiggyBank },
    { name: 'Tiết kiệm', href: '/goals', icon: Target },
    { name: 'Báo cáo', href: '/reports', icon: BarChart3 },
    { name: 'Danh mục', href: '/categories', icon: Tags },
    { name: 'AI Chatbot', href: '/chat', icon: Bot }
  ];

  const userMenuItems = [
    { label: 'Hồ sơ cá nhân', icon: User, onClick: () => window.location.href = '/profile' },
    ...(isAdmin ? [{ label: 'Trang Quản trị Admin', icon: ShieldAlert, onClick: () => window.location.href = '/admin' }] : []),
    { label: 'Đăng xuất', icon: LogOut, danger: true, onClick: logout }
  ];

  return (
    <div className="min-h-screen bg-bg-light dark:bg-bg-dark text-ink-light dark:text-ink-dark flex transition-colors">
      {/* Desktop Collapsible Sidebar */}
      <aside
        className={cn(
          'hidden md:flex flex-col border-r border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark transition-all duration-300 z-30 shrink-0 sticky top-0 h-screen',
          collapsed ? 'w-20' : 'w-64'
        )}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-border-light dark:border-border-dark">
          {!collapsed && (
            <Link to="/dashboard" className="flex items-center gap-2.5">
              <span className="text-2xl">🌿</span>
              <span className="font-heading font-extrabold text-xl text-primary dark:text-lime">Pocketly</span>
            </Link>
          )}
          {collapsed && (
            <Link to="/dashboard" className="mx-auto text-2xl">
              🌿
            </Link>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-full text-ink-muted hover:text-ink-light dark:hover:text-ink-dark hover:bg-black/5 dark:hover:bg-white/5 ml-auto"
            title={collapsed ? 'Mở rộng sidebar' : 'Thu gọn sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = location.pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'flex items-center gap-3 px-3.5 py-3 rounded-20 text-sm font-semibold transition-all duration-150',
                  isActive
                    ? 'bg-primary text-white shadow-soft dark:bg-lime dark:text-ink-light'
                    : 'text-ink-muted hover:text-ink-light dark:hover:text-ink-dark hover:bg-sand/30 dark:hover:bg-white/5'
                )}
                title={collapsed ? item.name : undefined}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User Card at Bottom of Sidebar */}
        <div className="p-3 border-t border-border-light dark:border-border-dark">
          <div className="flex items-center gap-3 p-2 rounded-20 bg-sand/30 dark:bg-surface-dark">
            <Avatar src={user?.avatarUrl} fallback={user?.fullName?.charAt(0) || 'U'} size="sm" />
            {!collapsed && (
              <div className="overflow-hidden flex-1">
                <p className="text-xs font-bold truncate text-ink-light dark:text-ink-dark">{user?.fullName}</p>
                <p className="text-[10px] text-ink-muted truncate">{user?.email}</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Sticky Top Bar */}
        <header className="sticky top-0 z-20 h-16 bg-surface-light/80 dark:bg-surface-dark/80 backdrop-blur-md border-b border-border-light dark:border-border-dark px-4 sm:px-6 flex items-center justify-between gap-4">
          {/* Quick Search */}
          <div className="relative flex-1 max-w-md hidden sm:block">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted" />
            <input
              type="text"
              placeholder="Tìm kiếm giao dịch, ghi chú, hóa đơn..."
              className="w-full bg-sand/40 dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-full pl-10 pr-4 py-2 text-xs outline-none focus:border-primary dark:focus:border-lime"
            />
          </div>

          <div className="flex items-center gap-3 ml-auto">
            {/* Notification Bell Dropdown */}
            <NotificationBellDropdown />

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* User Dropdown */}
            <Dropdown
              trigger={
                <button className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-primary/20 transition-all">
                  <Avatar src={user?.avatarUrl} fallback={user?.fullName?.charAt(0) || 'U'} size="sm" />
                </button>
              }
              items={userMenuItems}
            />
          </div>
        </header>

        {/* Page Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 md:pb-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>

        {/* Floating Chatbot Widget on Every App Page */}
        <FloatingChatWidget />

        {/* Mobile Bottom Navigation Bar */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-surface-light/95 dark:bg-surface-dark/95 backdrop-blur-md border-t border-border-light dark:border-border-dark flex items-center justify-around py-2 px-1">
          {navigation.map((item) => {
            const isActive = location.pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'flex flex-col items-center gap-1 py-1 px-2.5 rounded-16 text-[10px] font-bold transition-colors',
                  isActive
                    ? 'text-primary dark:text-lime'
                    : 'text-ink-muted hover:text-ink-light dark:hover:text-ink-dark'
                )}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
