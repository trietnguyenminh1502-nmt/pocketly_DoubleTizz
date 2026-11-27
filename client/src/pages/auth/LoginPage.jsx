import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { AuthSplitLayout } from '@/layouts/AuthSplitLayout';
import { useToast } from '@/components/ui';
import { Mail, Lock, LogIn, Eye, EyeOff } from 'lucide-react';

const AuthLabel = ({ htmlFor, children }) => (
  <label htmlFor={htmlFor} className="block mb-2 text-[11px] font-bold tracking-[1px] uppercase text-auth-accent">
    {children}
  </label>
);

const AuthInput = React.forwardRef(({ id, icon: Icon, type = 'text', error, rightSlot, ...props }, ref) => (
  <div className="relative flex items-center">
    {Icon && (
      <span className="absolute left-[15px] text-auth/60 pointer-events-none flex" aria-hidden="true">
        <Icon size={18} />
      </span>
    )}
    <input
      id={id}
      ref={ref}
      type={type}
      className={`w-full h-[50px] bg-white text-auth-ink rounded-[14px] ${Icon ? 'px-11' : 'px-4'} text-sm font-medium outline-none transition-all border-2 focus:border-auth-accent focus:ring-[3px] focus:ring-auth-accent/40 ${error ? 'border-coral' : 'border-transparent'}`}
      {...props}
    />
    {rightSlot && (
      <span className="absolute right-[14px]">
        {rightSlot}
      </span>
    )}
  </div>
));
AuthInput.displayName = 'AuthInput';

const AuthButton = ({ children, isLoading, disabled, icon: Icon, ...props }) => (
  <button
    disabled={disabled || isLoading}
    className="flex items-center justify-center gap-2 w-full h-[52px] bg-auth-accent text-auth-ink border-0 rounded-full text-[15px] font-bold cursor-pointer shadow-auth-button hover:shadow-auth-button-hover hover:-translate-y-px disabled:cursor-not-allowed disabled:bg-auth-accent/50 disabled:shadow-none disabled:translate-y-0 transition-all tracking-[-0.2px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-auth-accent"
    {...props}
  >
    {isLoading ? (
      <span className="inline-block w-[18px] h-[18px] border-[2.5px] border-auth-ink border-t-transparent rounded-full animate-spin" />
    ) : Icon ? <Icon size={18} /> : null}
    {children}
  </button>
);

/* ─── LoginPage ──────────────────────────────────────────────── */
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
  const [showPassword, setShowPassword] = useState(false);

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

  const emailId = 'login-email';
  const passwordId = 'login-password';

  return (
    <>
      <AuthSplitLayout
        title="Đăng nhập tài khoản"
        subtitle="Nhập thông tin đăng nhập của bạn để tiếp tục quản lý chi tiêu"
      >
        <form onSubmit={handleSubmit} className="flex flex-col">

          {/* Lỗi chung */}
          {error && (
            <div
              role="alert"
              className="mb-5 p-3 px-4 rounded-[14px] bg-coral/15 border border-coral/40 text-coral text-[13px] font-medium"
            >
              {error}
            </div>
          )}

          {/* Email */}
          <div className="mb-4">
            <AuthLabel htmlFor={emailId}>Địa chỉ email</AuthLabel>
            <AuthInput
              id={emailId}
              type="email"
              placeholder="name@school.edu.vn"
              icon={Mail}
              autoComplete="email"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              required
              aria-label="Địa chỉ email"
            />
          </div>

          {/* Mật khẩu */}
          <div className="mb-[14px]">
            <AuthLabel htmlFor={passwordId}>Mật khẩu</AuthLabel>
            <AuthInput
              id={passwordId}
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              icon={Lock}
              autoComplete="current-password"
              value={formData.password}
              onChange={e => setFormData({ ...formData, password: e.target.value })}
              required
              aria-label="Mật khẩu"
              rightSlot={
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  className="bg-transparent border-0 cursor-pointer text-auth-ink/50 flex p-1.5 rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-auth-accent"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
            />
          </div>

          {/* Ghi nhớ + quên mật khẩu */}
          <div
            className="flex items-center justify-between mb-5 text-[13px]"
          >
            <label
              className="flex items-center gap-2 cursor-pointer text-auth select-none"
            >
              <input
                type="checkbox"
                defaultChecked
                className="accent-auth-accent w-[15px] h-[15px]"
                aria-label="Ghi nhớ phiên đăng nhập"
              />
              Ghi nhớ phiên đăng nhập
            </label>
            <Link
              to="/forgot-password"
              state={{ email: formData.email }}
              className="text-auth-warm font-semibold no-underline hover:underline"
            >
              Quên mật khẩu?
            </Link>
          </div>

          {/* Nút đăng nhập */}
          <AuthButton type="submit" isLoading={isLoading} icon={LogIn}>
            Đăng nhập ngay
          </AuthButton>

          {/* Link đăng ký */}
          <p
            className="text-center text-[13px] text-auth mt-4"
          >
            Chưa có tài khoản Pocketly?{' '}
            <Link
              to="/register"
              className="text-auth-accent font-bold no-underline hover:underline"
            >
              Đăng ký miễn phí
            </Link>
          </p>

          {/* Khung demo */}
          <div
            className="mt-[18px] p-[14px_16px] rounded-16 bg-black/25 border border-white/10"
          >
            <p
              className="text-[11px] font-bold tracking-[0.8px] uppercase text-auth-accent mb-2"
            >
              Tài khoản demo
            </p>
            <div className="text-12 text-auth leading-[1.8]">
              <div>
                Sinh viên:{' '}
                <code className="text-auth-accent text-12">user1@pocketly.com</code>
                {' '}/ <code className="text-auth-accent text-12">User@123</code>
              </div>
              <div>
                Quản trị:{' '}
                <code className="text-auth-warm text-12">admin@pocketly.com</code>
                {' '}/ <code className="text-auth-warm text-12">Admin@123</code>
              </div>
            </div>
          </div>

        </form>
      </AuthSplitLayout>
    </>
  );
};
