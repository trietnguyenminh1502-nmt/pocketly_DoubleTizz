import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { authApi } from '@/api/auth';
import { AuthSplitLayout } from '@/layouts/AuthSplitLayout';
import { Button } from '@/components/ui';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Mã xác thực email không được cung cấp');
        return;
      }

      try {
        await authApi.verifyEmail(token);
        setStatus('success');
      } catch (err) {
        setStatus('error');
        setMessage(err.message || 'Mã xác thực không hợp lệ hoặc đã hết hạn');
      }
    };

    verify();
  }, [token]);

  return (
    <AuthSplitLayout
      title="Xác thực tài khoản"
      subtitle="Hoàn tất quy trình xác thực địa chỉ email cho tài khoản"
    >
      <div className="text-center p-6 rounded-24 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark space-y-4">
        {status === 'loading' && (
          <div className="py-8 space-y-3">
            <Loader2 className="w-10 h-10 animate-spin text-primary dark:text-lime mx-auto" />
            <p className="text-xs text-ink-muted">Đang kiểm tra mã xác thực email của bạn...</p>
          </div>
        )}

        {status === 'success' && (
          <>
            <div className="w-12 h-12 mx-auto rounded-full bg-mint flex items-center justify-center text-primary">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-ink-light dark:text-ink-dark">
              Email đã được xác thực thành công! 🌿
            </h3>
            <p className="text-xs text-ink-muted">
              Tài khoản Pocketly của bạn đã sẵn sàng. Hãy đăng nhập để bắt đầu trải nghiệm!
            </p>
            <div className="pt-2">
              <Link to="/login">
                <Button variant="primary" size="sm">Đăng nhập vào Pocketly</Button>
              </Link>
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-12 h-12 mx-auto rounded-full bg-coral/20 flex items-center justify-center text-coral">
              <AlertCircle className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-ink-light dark:text-ink-dark">
              Xác thực không thành công
            </h3>
            <p className="text-xs text-coral">{message}</p>
            <div className="pt-2">
              <Link to="/login">
                <Button variant="outline" size="sm">Về trang Đăng nhập</Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </AuthSplitLayout>
  );
};
