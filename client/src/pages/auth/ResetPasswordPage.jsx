import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { authApi } from '@/api/auth';
import { AuthSplitLayout } from '@/layouts/AuthSplitLayout';
import { Input, Button, useToast } from '@/components/ui';
import { Lock, Check } from 'lucide-react';

export const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không trùng khớp');
      return;
    }
    if (password.length < 6) {
      setError('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await authApi.resetPassword({ token, password });
      addToast({ message: 'Đặt lại mật khẩu thành công! Vui lòng đăng nhập lại.', type: 'success' });
      navigate('/login');
    } catch (err) {
      setError(err.message || 'Mã xác thực không hợp lệ hoặc đã hết hạn');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthSplitLayout
      title="Tạo mật khẩu mới"
      subtitle="Thiết lập mật khẩu bảo mật mới cho tài khoản Pocketly của bạn"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3.5 rounded-16 bg-coral/15 border border-coral/30 text-xs text-coral font-medium">
            {error}
          </div>
        )}

        <Input
          label="Mã xác thực (Token)"
          type="text"
          value={token}
          placeholder="Nhập mã token từ email"
          readOnly={!!token}
          required
        />

        <Input
          label="Mật khẩu mới"
          type="password"
          placeholder="Tối thiểu 6 ký tự"
          icon={Lock}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <Input
          label="Xác nhận mật khẩu mới"
          type="password"
          placeholder="Nhập lại mật khẩu mới"
          icon={Lock}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        <Button type="submit" variant="primary" className="w-full mt-2" isLoading={isLoading} icon={Check}>
          Cập nhật mật khẩu mới
        </Button>

        <div className="text-center pt-2">
          <Link to="/login" className="text-xs text-ink-muted hover:underline">
            Quay lại trang Đăng nhập
          </Link>
        </div>
      </form>
    </AuthSplitLayout>
  );
};
