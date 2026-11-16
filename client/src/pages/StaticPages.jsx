import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui';
import { Home, ArrowLeft } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-bg-light dark:bg-bg-dark text-ink-light dark:text-ink-dark flex flex-col items-center justify-center p-6 text-center">
      <span className="text-8xl font-black font-heading text-primary dark:text-lime tracking-tighter">
        404
      </span>
      <h1 className="text-2xl font-bold font-heading mt-2">Trang không tồn tại</h1>
      <p className="text-sm text-ink-muted max-w-sm mt-2 mb-6">
        Đường dẫn bạn đang tìm kiếm có thể đã bị di chuyển, xóa hoặc không còn tồn tại trên hệ thống Pocketly.
      </p>
      <Link to="/">
        <Button variant="primary" icon={Home}>Về trang chủ</Button>
      </Link>
    </div>
  );
};

export const ForbiddenPage = () => {
  return (
    <div className="min-h-screen bg-bg-light dark:bg-bg-dark text-ink-light dark:text-ink-dark flex flex-col items-center justify-center p-6 text-center">
      <span className="text-8xl font-black font-heading text-coral tracking-tighter">
        403
      </span>
      <h1 className="text-2xl font-bold font-heading mt-2">Truy cập bị từ chối</h1>
      <p className="text-sm text-ink-muted max-w-sm mt-2 mb-6">
        Bạn không có quyền hạn quản trị viên (ADMIN) để truy cập vào khu vực này.
      </p>
      <Link to="/dashboard">
        <Button variant="secondary" icon={ArrowLeft}>Quay lại Dashboard</Button>
      </Link>
    </div>
  );
};

export const LegalPage = ({ type = 'terms' }) => {
  const isTerms = type === 'terms';

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 space-y-6">
      <h1 className="text-3xl font-extrabold font-heading text-primary dark:text-lime">
        {isTerms ? 'Điều khoản sử dụng Pocketly' : 'Chính sách bảo mật thông tin'}
      </h1>
      <p className="text-xs text-ink-muted">Cập nhật lần cuối: Tháng 11/2026</p>

      <div className="space-y-4 text-sm leading-relaxed text-ink-muted">
        <p>
          Chào mừng bạn đến với <strong>Pocketly</strong>. Khi đăng ký và sử dụng dịch vụ của chúng tôi, bạn cam kết tuân thủ các quy tắc bảo mật và quyền riêng tư được nêu rõ dưới đây.
        </p>

        <h3 className="text-base font-bold text-ink-light dark:text-ink-dark pt-2">1. Quyền sở hữu và bảo mật dữ liệu</h3>
        <p>
          Toàn bộ thông tin tài khoản, danh sách giao dịch, ví tiền và số dư của bạn là tài sản riêng của bạn. Chúng tôi cam kết không bán, không thương mại hóa và không chia sẻ dữ liệu này cho bất kỳ bên thứ ba nào.
        </p>

        <h3 className="text-base font-bold text-ink-light dark:text-ink-dark pt-2">2. Sử dụng trí tuệ nhân tạo (AI Chatbot)</h3>
        <p>
          AI Chatbot hoạt động hoàn toàn ở phía máy chủ backend để cung cấp lời khuyên quản lý tài chính cho sinh viên. Dữ liệu tài chính chỉ được sử dụng trong phạm vi phiên hỏi đáp của chính bạn.
        </p>

        <h3 className="text-base font-bold text-ink-light dark:text-ink-dark pt-2">3. Trách nhiệm người dùng</h3>
        <p>
          Bạn có trách nhiệm bảo mật mật khẩu tài khoản và thông báo ngay cho quản trị viên nếu phát hiện hành vi truy cập trái phép.
        </p>
      </div>
    </div>
  );
};
