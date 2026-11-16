import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../../api/auth';
import { AuthSplitLayout } from '../../layouts/AuthSplitLayout';
import { Input, Button } from '../../components/ui';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await authApi.forgotPassword(email);
      setSubmitted(true);
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra khi gửi yêu cầu');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthSplitLayout
      title="Khôi phục mật khẩu"
      subtitle="Nhập email của bạn để nhận liên kết đặt lại mật khẩu"
    >
      {submitted ? (
        <div className="text-center space-y-4 p-6 rounded-24 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark">
          <div className="w-12 h-12 mx-auto rounded-full bg-mint flex items-center justify-center text-primary">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-ink-light dark:text-ink-dark">Đã gửi email khôi phục!</h3>
          <p className="text-xs text-ink-muted leading-relaxed">
            Nếu email <strong>{email}</strong> tồn tại trong hệ thống Pocketly, chúng tôi đã gửi hướng dẫn đặt lại mật khẩu kèm đường link xác nhận. Vui lòng kiểm tra hộp thư đến hoặc hòm thư spam.
          </p>
          <Link to="/login" className="inline-block mt-2">
            <Button variant="outline" size="sm">Quay về trang đăng nhập</Button>
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3.5 rounded-16 bg-coral/15 border border-coral/30 text-xs text-coral font-medium">
              {error}
            </div>
          )}

          <Input
            label="Địa chỉ Email tài khoản"
            type="email"
            placeholder="student@school.edu.vn"
            icon={Mail}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Button type="submit" variant="primary" className="w-full" isLoading={isLoading}>
            Gửi liên kết đặt lại mật khẩu
          </Button>

          <div className="text-center pt-2">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs text-ink-muted hover:text-primary dark:hover:text-lime font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Quay lại Đăng nhập
            </Link>
          </div>
        </form>
      )}
    </AuthSplitLayout>
  );
};
