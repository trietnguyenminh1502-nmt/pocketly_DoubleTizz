import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, CardHeader, Money, Button } from '../components/ui';
import { Plus, ArrowUpRight, ArrowDownLeft, Wallet, Bot } from 'lucide-react';
import { Link } from 'react-router-dom';

export const DashboardPlaceholder = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-ink-light dark:text-ink-dark">
            Xin chào, {user?.fullName}! 🌿
          </h1>
          <p className="text-sm text-ink-muted mt-1">
            Bảng điều khiển tài chính sinh viên của bạn
          </p>
        </div>

        <div className="flex gap-2.5">
          <Link to="/transactions">
            <Button variant="primary" size="sm" icon={Plus}>Thêm giao dịch</Button>
          </Link>
          <Link to="/chat">
            <Button variant="lime" size="sm" icon={Bot}>Hỏi AI Chatbot</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Card>
          <span className="text-xs text-ink-muted">Tổng số dư khả dụng</span>
          <div className="mt-1">
            <Money amount={4600000} type="neutral" className="text-2xl sm:text-3xl" />
          </div>
        </Card>
        <Card>
          <span className="text-xs text-ink-muted">Thu nhập tháng này</span>
          <div className="mt-1">
            <Money amount={6200000} type="income" showSign className="text-2xl sm:text-3xl" />
          </div>
        </Card>
        <Card>
          <span className="text-xs text-ink-muted">Chi tiêu tháng này</span>
          <div className="mt-1">
            <Money amount={4077000} type="expense" showSign className="text-2xl sm:text-3xl" />
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader
          title="Chào mừng bạn đến với Pocketly"
          subtitle="Tất cả các module backend và frontend đang sẵn sàng kết nối hoàn chỉnh!"
        />
        <p className="text-sm text-ink-muted leading-relaxed">
          Bạn có thể truy cập các trang Giao dịch, Ví tiền, Ngân sách, Mục tiêu tiết kiệm hoặc AI Chatbot thông qua thanh menu bên trái.
        </p>
      </Card>
    </div>
  );
};

export const AdminPlaceholder = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-tangerine">
        Trang Quản trị Hệ thống (Admin Portal)
      </h1>
      <Card>
        <CardHeader title="Bảng điều khiển Quản trị viên" subtitle="Quản lý người dùng, danh mục hệ thống và audit log" />
        <p className="text-sm text-ink-muted">
          Khu vực này chỉ dành riêng cho tài khoản có vai trò <strong>ADMIN</strong>.
        </p>
      </Card>
    </div>
  );
};
