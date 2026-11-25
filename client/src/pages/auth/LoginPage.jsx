import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { AuthSplitLayout } from '@/layouts/AuthSplitLayout';
import { useToast } from '@/components/ui';
import { Mail, Lock, LogIn, Eye, EyeOff } from 'lucide-react';

/* ─── Shared styled primitives ─────────────────────────────── */

const AuthLabel = ({ htmlFor, children }) => (
  <label
    htmlFor={htmlFor}
    style={{
      display: 'block',
      marginBottom: '8px',
      fontSize: '11px',
      fontWeight: 700,
      letterSpacing: '1px',
      textTransform: 'uppercase',
      color: '#D4F25C',
    }}
  >
    {children}
  </label>
);

const AuthInput = React.forwardRef(({ id, icon: Icon, type = 'text', error, rightSlot, ...props }, ref) => (
  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
    {Icon && (
      <span
        style={{
          position: 'absolute',
          left: '15px',
          color: 'rgba(207,226,216,0.6)',
          pointerEvents: 'none',
          display: 'flex',
        }}
        aria-hidden="true"
      >
        <Icon size={18} />
      </span>
    )}
    <input
      id={id}
      ref={ref}
      type={type}
      style={{
        width: '100%',
        height: '50px',
        background: '#FFFFFF',
        color: '#0A241B',
        border: error ? '2px solid #FF8A7A' : '2px solid transparent',
        borderRadius: '14px',
        padding: Icon ? '0 44px 0 44px' : '0 16px',
        fontSize: '14px',
        fontWeight: 500,
        outline: 'none',
        transition: 'box-shadow 0.18s, border-color 0.18s',
        fontFamily: 'inherit',
        boxSizing: 'border-box',
      }}
      onFocus={e => {
        e.target.style.boxShadow = '0 0 0 3px rgba(212,242,92,0.4)';
        e.target.style.borderColor = '#D4F25C';
      }}
      onBlur={e => {
        e.target.style.boxShadow = 'none';
        e.target.style.borderColor = error ? '#FF8A7A' : 'transparent';
      }}
      {...props}
    />
    {rightSlot && (
      <span style={{ position: 'absolute', right: '14px' }}>
        {rightSlot}
      </span>
    )}
  </div>
));
AuthInput.displayName = 'AuthInput';

const AuthButton = ({ children, isLoading, disabled, icon: Icon, ...props }) => (
  <button
    disabled={disabled || isLoading}
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      width: '100%',
      height: '52px',
      background: disabled || isLoading ? 'rgba(212,242,92,0.5)' : '#D4F25C',
      color: '#0A241B',
      border: 'none',
      borderRadius: '999px',
      fontSize: '15px',
      fontWeight: 700,
      cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
      boxShadow: disabled || isLoading ? 'none' : '0 0 24px rgba(212,242,92,0.35)',
      transition: 'box-shadow 0.18s, transform 0.12s, background 0.18s',
      fontFamily: 'inherit',
      letterSpacing: '-0.2px',
    }}
    onMouseEnter={e => {
      if (!disabled && !isLoading) {
        e.currentTarget.style.boxShadow = '0 0 36px rgba(212,242,92,0.5)';
        e.currentTarget.style.transform = 'translateY(-1px)';
      }
    }}
    onMouseLeave={e => {
      e.currentTarget.style.boxShadow = disabled || isLoading ? 'none' : '0 0 24px rgba(212,242,92,0.35)';
      e.currentTarget.style.transform = 'none';
    }}
    onFocus={e => { e.currentTarget.style.outline = '3px solid rgba(212,242,92,0.5)'; e.currentTarget.style.outlineOffset = '2px'; }}
    onBlur={e => { e.currentTarget.style.outline = 'none'; }}
    {...props}
  >
    {isLoading ? (
      <span
        style={{
          width: '18px', height: '18px',
          border: '2.5px solid #0A241B',
          borderTopColor: 'transparent',
          borderRadius: '50%',
          display: 'inline-block',
          animation: 'spin 0.7s linear infinite',
        }}
      />
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
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>

          {/* Lỗi chung */}
          {error && (
            <div
              role="alert"
              style={{
                marginBottom: '20px',
                padding: '12px 16px',
                borderRadius: '14px',
                background: 'rgba(255,138,122,0.15)',
                border: '1px solid rgba(255,138,122,0.4)',
                color: '#FF8A7A',
                fontSize: '13px',
                fontWeight: 500,
              }}
            >
              {error}
            </div>
          )}

          {/* Email */}
          <div style={{ marginBottom: '16px' }}>
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
          <div style={{ marginBottom: '14px' }}>
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
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'rgba(10,36,27,0.5)',
                    display: 'flex',
                    padding: '4px',
                    borderRadius: '6px',
                  }}
                  onFocus={e => { e.currentTarget.style.outline = '2px solid #D4F25C'; }}
                  onBlur={e => { e.currentTarget.style.outline = 'none'; }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
            />
          </div>

          {/* Ghi nhớ + quên mật khẩu */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px',
              fontSize: '13px',
            }}
          >
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                color: '#CFE2D8',
                userSelect: 'none',
              }}
            >
              <input
                type="checkbox"
                defaultChecked
                style={{ accentColor: '#D4F25C', width: '15px', height: '15px' }}
                aria-label="Ghi nhớ phiên đăng nhập"
              />
              Ghi nhớ phiên đăng nhập
            </label>
            <Link
              to="/forgot-password"
              state={{ email: formData.email }}
              style={{ color: '#FFB08A', fontWeight: 600, textDecoration: 'none' }}
              onMouseEnter={e => { e.currentTarget.style.textDecoration = 'underline'; }}
              onMouseLeave={e => { e.currentTarget.style.textDecoration = 'none'; }}
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
            style={{
              textAlign: 'center',
              fontSize: '13px',
              color: '#CFE2D8',
              marginTop: '16px',
            }}
          >
            Chưa có tài khoản Pocketly?{' '}
            <Link
              to="/register"
              style={{ color: '#D4F25C', fontWeight: 700, textDecoration: 'none' }}
              onMouseEnter={e => { e.currentTarget.style.textDecoration = 'underline'; }}
              onMouseLeave={e => { e.currentTarget.style.textDecoration = 'none'; }}
            >
              Đăng ký miễn phí
            </Link>
          </p>

          {/* Khung demo */}
          <div
            style={{
              marginTop: '18px',
              padding: '14px 16px',
              borderRadius: '16px',
              background: 'rgba(0,0,0,0.25)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <p
              style={{
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.8px',
                textTransform: 'uppercase',
                color: '#D4F25C',
                marginBottom: '8px',
              }}
            >
              Tài khoản demo
            </p>
            <div style={{ fontSize: '12px', color: '#CFE2D8', lineHeight: 1.8 }}>
              <div>
                Sinh viên:{' '}
                <code style={{ color: '#D4F25C', fontSize: '12px' }}>user1@pocketly.com</code>
                {' '}/ <code style={{ color: '#D4F25C', fontSize: '12px' }}>User@123</code>
              </div>
              <div>
                Quản trị:{' '}
                <code style={{ color: '#FFB08A', fontSize: '12px' }}>admin@pocketly.com</code>
                {' '}/ <code style={{ color: '#FFB08A', fontSize: '12px' }}>Admin@123</code>
              </div>
            </div>
          </div>

        </form>
      </AuthSplitLayout>
    </>
  );
};
