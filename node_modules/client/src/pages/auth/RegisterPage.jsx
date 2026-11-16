import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AuthSplitLayout } from '../../layouts/AuthSplitLayout';
import { Input, Button, useToast, ProgressBar } from '../../components/ui';
import { Mail, Lock, User, UserPlus, Check, X } from 'lucide-react';

export const RegisterPage = () => {
  const { register: registerUser } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    currency: 'VND'
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Tính độ mạnh của mật khẩu (Password Strength Indicator)
  const computePasswordStrength = (pwd) => {
    let score = 0;
    if (pwd.length >= 6) score += 25;
    if (pwd.length >= 8) score += 25;
    if (/[A-Z]/.test(pwd)) score += 25;
    if (/[0-9!@#$%^&*]/.test(pwd)) score += 25;
    return score;
  };

  const strength = computePasswordStrength(formData.password);
  const strengthColor = strength <= 25 ? 'coral' : strength <= 50 ? 'tangerine' : strength <= 75 ? 'lime' : 'primary';
  const strengthLabel = strength <= 25 ? 'Yếu' : strength <= 50 ? 'Trung bình' : strength <= 75 ? 'Khá mạnh' : 'Rất mạnh';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      await registerUser(formData);
      addToast({
        message: 'Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.',
        type: 'success'
      });
      navigate('/login');
    } catch (err) {
      setError(err.message || 'Đăng ký tài khoản thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthSplitLayout
      title="Tạo tài khoản mới"
      subtitle="Tham gia cùng hàng nghìn sinh viên quản lý tài chính hiệu quả"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3.5 rounded-16 bg-coral/15 border border-coral/30 text-xs text-coral font-medium">
            {error}
          </div>
        )}

        <Input
          label="Họ và tên sinh viên"
          type="text"
          placeholder="Nguyễn Văn A"
          icon={User}
          value={formData.fullName}
          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
          required
        />

        <Input
          label="Địa chỉ Email"
          type="email"
          placeholder="student@school.edu.vn"
          icon={Mail}
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />

        <div className="space-y-1.5">
          <Input
            label="Mật khẩu"
            type="password"
            placeholder="Tối thiểu 6 ký tự"
            icon={Lock}
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />

          {formData.password && (
            <div className="space-y-1 pt-1">
              <div className="flex justify-between text-[11px] text-ink-muted">
                <span>Độ mạnh: <strong className="text-ink-light dark:text-ink-dark">{strengthLabel}</strong></span>
                <span>{strength}%</span>
              </div>
              <ProgressBar progress={strength} color={strengthColor} />
            </div>
          )}
        </div>

        <p className="text-xs text-ink-muted leading-relaxed pt-1">
          Bằng việc đăng ký, bạn đồng ý với{' '}
          <Link to="/terms" className="text-primary dark:text-lime underline">Điều khoản dịch vụ</Link> và{' '}
          <Link to="/privacy" className="text-primary dark:text-lime underline">Chính sách bảo mật</Link> của Pocketly.
        </p>

        <Button
          type="submit"
          variant="primary"
          className="w-full mt-2"
          isLoading={isLoading}
          icon={UserPlus}
        >
          Tạo tài khoản Pocketly
        </Button>

        <p className="text-center text-xs text-ink-muted pt-3">
          Đã có tài khoản?{' '}
          <Link to="/login" className="text-primary dark:text-lime font-bold hover:underline">
            Đăng nhập tại đây
          </Link>
        </p>
      </form>
    </AuthSplitLayout>
  );
};
