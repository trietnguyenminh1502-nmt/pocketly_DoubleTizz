import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AuthSplitLayout } from '../../layouts/AuthSplitLayout';
import { Input, Button, useToast } from '../../components/ui';
import { Mail, Lock, LogIn } from 'lucide-react';

export const LoginPage = () => {
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: 'user1@pocketly.com',
    password: 'User@123'
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const user = await login(formData);
      addToast({ message: `Chào mừng bạn trở lại, ${user.fullName}! 🌿`, type: 'success' });
      const from = location.state?.from?.pathname || (user.role === 'ADMIN' ? '/admin' : '/dashboard');
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Đăng nhập không thành công');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthSplitLayout
      title="Đăng nhập tài khoản"
      subtitle="Nhập thông tin đăng nhập của bạn để tiếp tục quản lý chi tiêu"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3.5 rounded-16 bg-coral/15 border border-coral/30 text-xs text-coral font-medium">
            {error}
          </div>
        )}

        <Input
          label="Địa chỉ Email"
          type="email"
          placeholder="name@school.edu.vn"
          icon={Mail}
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />

        <Input
          label="Mật khẩu"
          type="password"
          placeholder="••••••••"
          icon={Lock}
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          required
        />

        <div className="flex items-center justify-between text-xs pt-1">
          <label className="flex items-center gap-2 cursor-pointer text-ink-muted">
            <input type="checkbox" className="rounded accent-primary" defaultChecked />
            <span>Ghi nhớ phiên đăng nhập</span>
          </label>
          <Link to="/forgot-password" className="text-tangerine font-semibold hover:underline">
            Quên mật khẩu?
          </Link>
        </div>

        <Button
          type="submit"
          variant="primary"
          className="w-full mt-2"
          isLoading={isLoading}
          icon={LogIn}
        >
          Đăng nhập ngay
        </Button>

        <p className="text-center text-xs text-ink-muted pt-4">
          Chưa có tài khoản Pocketly?{' '}
          <Link to="/register" className="text-primary dark:text-lime font-bold hover:underline">
            Đăng ký tài khoản miễn phí
          </Link>
        </p>

        {/* Demo Credentials Box */}
        <div className="mt-6 p-4 rounded-20 bg-sand/40 dark:bg-surface-dark border border-border-light dark:border-border-dark text-xs space-y-1 text-ink-muted">
          <p className="font-bold text-ink-light dark:text-ink-dark">🔑 Tài khoản Demo sẵn có:</p>
          <p>• Sinh viên: <code className="text-primary dark:text-lime">user1@pocketly.com</code> / <code className="text-primary dark:text-lime">User@123</code></p>
          <p>• Quản trị: <code className="text-tangerine">admin@pocketly.com</code> / <code className="text-tangerine">Admin@123</code></p>
        </div>
      </form>
    </AuthSplitLayout>
  );
};
