import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { authApi } from '@/api/auth';
import { AuthSplitLayout } from '@/layouts/AuthSplitLayout';
import { useToast } from '@/components/ui';
import { Mail, Lock, User, UserPlus, Eye, EyeOff, AlertCircle, RefreshCw, ArrowLeft, CheckCircle2 } from 'lucide-react';

/* ─── Hàm che bớt email (vd: t***t@domain.com) ─── */
const maskEmail = (email) => {
  if (!email || !email.includes('@')) return email;
  const [local, domain] = email.split('@');
  if (local.length <= 2) return `${local[0]}***@${domain}`;
  return `${local[0]}***${local[local.length - 1]}@${domain}`;
};

export const RegisterPage = () => {
  const { register: registerUser, handleAuthSuccess } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  // Màn hình: 'form' (Form đăng ký) | 'otp' (Xác nhận email 6 số)
  const [screen, setScreen] = useState('form');

  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Toggle ẩn/hiện mật khẩu
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // OTP state (Single controlled value pattern - chống nhảy số, chống Unikey duplicate)
  const [otpValue, setOtpValue] = useState('');
  const [otpError, setOtpError] = useState('');
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(60);
  const [isResending, setIsResending] = useState(false);
  const [isOtpFocused, setIsOtpFocused] = useState(false);
  const otpInputRef = useRef(null);

  /* ═══════════════════════════════════════════════════════════════
     VALIDATION ENGINE (Client-side)
  ═══════════════════════════════════════════════════════════════ */
  const validateField = useCallback((field, value, allValues = formData) => {
    const val = (value ?? allValues[field] ?? '').trim();

    switch (field) {
      case 'fullName':
        if (!val) return 'Vui lòng nhập họ và tên';
        if (val.length < 2) return 'Họ và tên tối thiểu 2 ký tự';
        return '';

      case 'email':
        if (!val) return 'Vui lòng nhập địa chỉ email';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
          return 'Email không đúng định dạng';
        }
        return '';

      case 'password': {
        const rawPwd = value ?? allValues.password ?? '';
        if (!rawPwd) return 'Vui lòng nhập mật khẩu';
        if (rawPwd.length < 8) return 'Mật khẩu phải có tối thiểu 8 ký tự';
        if (!/[a-zA-Z]/.test(rawPwd) || !/[0-9]/.test(rawPwd)) {
          return 'Mật khẩu phải chứa cả chữ và số';
        }
        return '';
      }

      case 'confirmPassword': {
        const rawConfirm = value ?? allValues.confirmPassword ?? '';
        const rawPwd = allValues.password ?? '';
        if (!rawConfirm) return 'Vui lòng xác nhận mật khẩu';
        if (rawConfirm !== rawPwd) return 'Mật khẩu xác nhận không khớp';
        return '';
      }

      default:
        return '';
    }
  }, [formData]);

  // Kiểm tra tính hợp lệ toàn bộ form
  const isFormValid =
    !validateField('fullName', formData.fullName) &&
    !validateField('email', formData.email) &&
    !validateField('password', formData.password) &&
    !validateField('confirmPassword', formData.confirmPassword) &&
    agreed;

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const err = validateField(field, formData[field]);
    setErrors((prev) => ({ ...prev, [field]: err }));
  };

  const handleChange = (field, value) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);

    // Validate realtime nếu trường đó đã được tương tác
    if (touched[field]) {
      const err = validateField(field, value, updated);
      setErrors((prev) => ({ ...prev, [field]: err }));
    }

    // Nếu sửa mật khẩu chính, kiểm tra lại khớp với ô xác nhận
    if (field === 'password' && touched.confirmPassword) {
      const confirmErr = validateField('confirmPassword', updated.confirmPassword, updated);
      setErrors((prev) => ({ ...prev, confirmPassword: confirmErr }));
    }
  };

  /* ═══════════════════════════════════════════════════════════════
     SUBMIT ĐĂNG KÝ
  ═══════════════════════════════════════════════════════════════ */
  const handleSubmitRegister = async (e) => {
    e.preventDefault();

    // Đánh dấu tất cả trường đã touch
    const allTouched = { fullName: true, email: true, password: true, confirmPassword: true };
    setTouched(allTouched);

    const newErrors = {
      fullName: validateField('fullName', formData.fullName),
      email: validateField('email', formData.email),
      password: validateField('password', formData.password),
      confirmPassword: validateField('confirmPassword', formData.confirmPassword),
    };
    setErrors(newErrors);

    if (Object.values(newErrors).some(Boolean) || !agreed) {
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Gọi backend register API thực tế
      await registerUser({
        fullName: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        currency: 'VND'
      });

      // 2. Chuyển sang màn hình xác nhận OTP
      setScreen('otp');
      setResendCooldown(60);
      setOtpValue('');
      setOtpError('');
    } catch (err) {
      const msg = err?.message || '';
      // Bắt lỗi email đã tồn tại từ backend
      if (
        msg.toLowerCase().includes('email') &&
        (msg.includes('tồn tại') || msg.includes('exist') || msg.includes('already'))
      ) {
        setErrors((prev) => ({
          ...prev,
          email: 'Email này đã được đăng ký'
        }));
      } else {
        // Nếu lỗi hệ thống khác, hoặc backend trả 200 nhưng cần verify OTP
        setScreen('otp');
        setResendCooldown(60);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ═══════════════════════════════════════════════════════════════
     XỬ LÝ 6 Ô OTP (Single Input Pattern)
  ═══════════════════════════════════════════════════════════════ */
  // Đếm ngược 60s nút gửi lại
  useEffect(() => {
    if (screen !== 'otp' || resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [screen, resendCooldown]);

  // Tự động focus ô nhập khi mở màn hình OTP
  useEffect(() => {
    if (screen === 'otp') {
      setTimeout(() => otpInputRef.current?.focus(), 150);
    }
  }, [screen]);

  // Xử lý thay đổi mã OTP (chỉ lấy số, tối đa 6 ký tự)
  const handleOtpChange = (e) => {
    const cleanDigits = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtpValue(cleanDigits);
    setOtpError('');
  };

  // Tự động gửi khi đã điền đủ 6 số
  useEffect(() => {
    if (screen === 'otp' && otpValue.length === 6 && !isVerifyingOtp) {
      handleVerifyOtp(otpValue);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otpValue, screen]);

  // Xác minh mã OTP
  const handleVerifyOtp = async (code) => {
    setIsVerifyingOtp(true);
    setOtpError('');

    try {
      // Gọi API xác minh OTP thực tế từ backend
      const res = await authApi.verifyOtp({
        email: formData.email.trim().toLowerCase(),
        otp: code
      });

      // Nếu có token và user trả về, tự động lưu phiên đăng nhập
      if (res?.data?.accessToken || res?.data?.user) {
        handleAuthSuccess?.(res.data);
      }

      addToast({
        message: 'Đăng ký và xác thực tài khoản thành công! 🌿',
        type: 'success'
      });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setOtpError(err?.response?.data?.message || err.message || 'Mã xác nhận không đúng hoặc đã hết hạn. Vui lòng kiểm tra lại.');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  // Gửi lại mã OTP
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || isResending) return;

    setIsResending(true);
    setOtpError('');
    setOtpValue('');
    try {
      await authApi.resendOtp({ email: formData.email.trim().toLowerCase() });
      setResendCooldown(60);
      addToast({
        message: `Đã gửi mã xác nhận 6 số mới đến ${formData.email}!`,
        type: 'success'
      });
      setTimeout(() => otpInputRef.current?.focus(), 100);
    } catch (err) {
      setOtpError(err?.response?.data?.message || err.message || 'Không thể gửi lại mã lúc này. Vui lòng thử lại sau.');
    } finally {
      setIsResending(false);
    }
  };

  /* ═══════════════════════════════════════════════════════════════
     GIAO DIỆN CHÍNH
  ═══════════════════════════════════════════════════════════════ */
  return (
    <AuthSplitLayout
      title={screen === 'form' ? 'Tạo tài khoản mới' : 'Xác nhận email'}
      subtitle={
        screen === 'form'
          ? 'Bắt đầu hành trình quản lý tài chính thông minh của bạn cùng Pocketly.'
          : `Chúng tôi đã gửi mã 6 số tới ${maskEmail(formData.email)}`
      }
      isRegister
    >
      {/* ── MÀN HÌNH 1: FORM ĐĂNG KÝ ── */}
      {screen === 'form' && (
        <form onSubmit={handleSubmitRegister} noValidate className="flex flex-col gap-3.5">
          {/* 1. Họ và tên */}
          <div className="flex flex-col">
            <label
              htmlFor="reg-fullName"
              className="text-[11px] font-bold tracking-wider uppercase text-[#D4F25C] mb-1.5"
            >
              Họ và tên
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-[#0A241B]/40 pointer-events-none flex" aria-hidden="true">
                <User size={18} />
              </span>
              <input
                id="reg-fullName"
                type="text"
                autoComplete="name"
                placeholder="Nguyễn Văn A"
                value={formData.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
                onBlur={() => handleBlur('fullName')}
                aria-describedby={errors.fullName ? 'err-fullName' : undefined}
                aria-invalid={!!errors.fullName}
                className="w-full h-[50px] bg-white text-[#0A241B] rounded-[14px] pl-11 pr-4 text-sm font-medium outline-none transition-all placeholder:text-[#0A241B]/40 focus:ring-[3px] focus:ring-[#D4F25C]/50 focus:border-[#D4F25C]"
                style={{
                  border: errors.fullName ? '2px solid #FF8A7A' : '2px solid transparent',
                }}
              />
            </div>
            {touched.fullName && errors.fullName && (
              <div id="err-fullName" role="alert" aria-live="polite" className="flex items-center gap-1.5 text-xs text-[#FF8A7A] font-medium pt-1">
                <AlertCircle size={14} className="shrink-0" />
                <span>{errors.fullName}</span>
              </div>
            )}
          </div>

          {/* 2. Địa chỉ email */}
          <div className="flex flex-col">
            <label
              htmlFor="reg-email"
              className="text-[11px] font-bold tracking-wider uppercase text-[#D4F25C] mb-1.5"
            >
              Địa chỉ Email
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-[#0A241B]/40 pointer-events-none flex" aria-hidden="true">
                <Mail size={18} />
              </span>
              <input
                id="reg-email"
                type="email"
                autoComplete="email"
                placeholder="student@school.edu.vn"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                onBlur={() => handleBlur('email')}
                aria-describedby={errors.email ? 'err-email' : undefined}
                aria-invalid={!!errors.email}
                className="w-full h-[50px] bg-white text-[#0A241B] rounded-[14px] pl-11 pr-4 text-sm font-medium outline-none transition-all placeholder:text-[#0A241B]/40 focus:ring-[3px] focus:ring-[#D4F25C]/50 focus:border-[#D4F25C]"
                style={{
                  border: errors.email ? '2px solid #FF8A7A' : '2px solid transparent',
                }}
              />
            </div>
            {touched.email && errors.email && (
              <div id="err-email" role="alert" aria-live="polite" className="flex items-center gap-1.5 text-xs text-[#FF8A7A] font-medium pt-1">
                <AlertCircle size={14} className="shrink-0" />
                <span>{errors.email}</span>
                {errors.email.includes('đăng ký') && (
                  <Link to="/login" className="text-[#FFB08A] font-bold underline ml-1 hover:text-white">
                    Đăng nhập?
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* 3. Mật khẩu */}
          <div className="flex flex-col">
            <label
              htmlFor="reg-password"
              className="text-[11px] font-bold tracking-wider uppercase text-[#D4F25C] mb-1.5"
            >
              Mật khẩu
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-[#0A241B]/40 pointer-events-none flex" aria-hidden="true">
                <Lock size={18} />
              </span>
              <input
                id="reg-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Tối thiểu 8 ký tự, có chữ và số"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                onBlur={() => handleBlur('password')}
                aria-describedby={errors.password ? 'err-password' : undefined}
                aria-invalid={!!errors.password}
                className="w-full h-[50px] bg-white text-[#0A241B] rounded-[14px] pl-11 pr-11 text-sm font-medium outline-none transition-all placeholder:text-[#0A241B]/40 focus:ring-[3px] focus:ring-[#D4F25C]/50 focus:border-[#D4F25C]"
                style={{
                  border: errors.password ? '2px solid #FF8A7A' : '2px solid transparent',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                className="absolute right-3 p-1.5 text-[#0A241B]/50 hover:text-[#0A241B] transition-colors rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4F25C]"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {touched.password && errors.password && (
              <div id="err-password" role="alert" aria-live="polite" className="flex items-center gap-1.5 text-xs text-[#FF8A7A] font-medium pt-1">
                <AlertCircle size={14} className="shrink-0" />
                <span>{errors.password}</span>
              </div>
            )}
          </div>

          {/* 4. Nhập lại mật khẩu */}
          <div className="flex flex-col">
            <label
              htmlFor="reg-confirmPassword"
              className="text-[11px] font-bold tracking-wider uppercase text-[#D4F25C] mb-1.5"
            >
              Nhập lại mật khẩu
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-[#0A241B]/40 pointer-events-none flex" aria-hidden="true">
                <Lock size={18} />
              </span>
              <input
                id="reg-confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Nhập lại chính xác mật khẩu"
                value={formData.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                onBlur={() => handleBlur('confirmPassword')}
                aria-describedby={errors.confirmPassword ? 'err-confirmPassword' : undefined}
                aria-invalid={!!errors.confirmPassword}
                className="w-full h-[50px] bg-white text-[#0A241B] rounded-[14px] pl-11 pr-11 text-sm font-medium outline-none transition-all placeholder:text-[#0A241B]/40 focus:ring-[3px] focus:ring-[#D4F25C]/50 focus:border-[#D4F25C]"
                style={{
                  border: errors.confirmPassword ? '2px solid #FF8A7A' : '2px solid transparent',
                }}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                aria-label={showConfirmPassword ? 'Ẩn mật khẩu xác nhận' : 'Hiện mật khẩu xác nhận'}
                className="absolute right-3 p-1.5 text-[#0A241B]/50 hover:text-[#0A241B] transition-colors rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4F25C]"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {touched.confirmPassword && errors.confirmPassword && (
              <div id="err-confirmPassword" role="alert" aria-live="polite" className="flex items-center gap-1.5 text-xs text-[#FF8A7A] font-medium pt-1">
                <AlertCircle size={14} className="shrink-0" />
                <span>{errors.confirmPassword}</span>
              </div>
            )}
          </div>

          {/* 5. Checkbox Điều khoản & Chính sách */}
          <div className="pt-1">
            <label className="flex items-start gap-2.5 cursor-pointer text-xs sm:text-[13px] text-[#CFE2D8] leading-normal select-none">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded accent-[#D4F25C] cursor-pointer shrink-0"
                aria-label="Đồng ý Điều khoản dịch vụ và Chính sách bảo mật"
              />
              <span>
                Tôi đồng ý với{' '}
                <a
                  href="/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#D4F25C] font-semibold underline underline-offset-2 hover:text-white"
                >
                  Điều khoản dịch vụ
                </a>{' '}
                và{' '}
                <a
                  href="/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#D4F25C] font-semibold underline underline-offset-2 hover:text-white"
                >
                  Chính sách bảo mật
                </a>.
              </span>
            </label>
          </div>

          {/* 6. Nút Đăng ký miễn phí */}
          <button
            type="submit"
            disabled={!isFormValid || isSubmitting}
            className="w-full h-[52px] rounded-full flex items-center justify-center gap-2 font-bold text-base tracking-wide transition-all mt-2 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
            style={{
              background: '#D4F25C',
              color: '#0A241B',
              boxShadow: isFormValid && !isSubmitting ? '0 0 24px rgba(212,242,92,0.35)' : 'none'
            }}
          >
            {isSubmitting ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-[#0A241B] border-t-transparent rounded-full animate-spin" />
                Đang tạo tài khoản...
              </span>
            ) : (
              <span className="inline-flex items-center gap-2">
                <UserPlus size={18} />
                Đăng ký miễn phí
              </span>
            )}
          </button>

          {/* Link sang Đăng nhập */}
          <p className="text-center text-xs sm:text-[13px] text-[#CFE2D8] pt-2">
            Đã có tài khoản Pocketly?{' '}
            <Link to="/login" className="text-[#D4F25C] font-bold hover:underline">
              Đăng nhập ngay
            </Link>
          </p>
        </form>
      )}

      {/* ── MÀN HÌNH 2: NHẬP MÃ XÁC NHẬN (OTP) ── */}
      {screen === 'otp' && (
        <div className="flex flex-col gap-5 py-1">
          {/* Thông báo hướng dẫn */}
          <div className="p-4 rounded-2xl bg-[#D4F25C]/10 border border-[#D4F25C]/20 text-xs sm:text-sm text-[#CFE2D8] leading-relaxed">
            <p className="font-semibold text-[#D4F25C] flex items-center gap-2 mb-1">
              <CheckCircle2 size={16} /> Kiểm tra hòm thư của bạn
            </p>
            <p className="text-xs sm:text-[13px]">
              Mã xác thực 6 số đã được gửi tới email <strong>{formData.email}</strong>. Vui lòng kiểm tra hộp thư đến (hoặc hòm thư Spam/Rác) để lấy mã.
            </p>
          </div>

          {/* 6 ô nhập mã OTP - Dùng Single Input Pattern điều khiển */}
          <div
            className="relative flex justify-between items-center gap-2 sm:gap-3 cursor-pointer"
            onClick={() => otpInputRef.current?.focus()}
          >
            {/* Input thực tế vô hình phủ lên toàn bộ để nhận bàn phím và IME */}
            <input
              ref={otpInputRef}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete="one-time-code"
              maxLength={6}
              value={otpValue}
              onChange={handleOtpChange}
              onFocus={() => setIsOtpFocused(true)}
              onBlur={() => setIsOtpFocused(false)}
              className="absolute inset-0 w-full h-full opacity-0 z-20 cursor-pointer caret-transparent"
              aria-label="Nhập mã xác thực 6 số"
            />

            {/* 6 ô hiển thị giao diện */}
            {[0, 1, 2, 3, 4, 5].map((idx) => {
              const digit = otpValue[idx] || '';
              const isActive = isOtpFocused && (idx === otpValue.length || (idx === 5 && otpValue.length === 6));

              return (
                <div
                  key={idx}
                  className="w-11 h-14 sm:w-14 sm:h-16 flex items-center justify-center text-xl sm:text-2xl font-black bg-white text-[#0A241B] transition-all select-none relative"
                  style={{
                    borderRadius: '16px',
                    border: otpError
                      ? '2px solid #FF8A7A'
                      : isActive
                      ? '2px solid #D4F25C'
                      : digit
                      ? '2px solid #D4F25C'
                      : '2px solid transparent',
                    boxShadow: isActive ? '0 0 0 3px rgba(212,242,92,0.4)' : 'none',
                    boxSizing: 'border-box'
                  }}
                >
                  {digit ? (
                    digit
                  ) : isActive ? (
                    <span className="w-[2.5px] h-6 bg-[#0A241B] animate-pulse rounded-full" />
                  ) : (
                    ''
                  )}
                </div>
              );
            })}
          </div>

          {/* Thông báo lỗi OTP */}
          {otpError && (
            <div role="alert" aria-live="assertive" className="flex items-center justify-center gap-1.5 text-xs text-[#FF8A7A] font-medium text-center">
              <AlertCircle size={15} className="shrink-0" />
              <span>{otpError}</span>
            </div>
          )}

          {/* Đang xác minh */}
          {isVerifyingOtp && (
            <div className="flex items-center justify-center gap-2 text-xs text-[#D4F25C]">
              <span className="w-3.5 h-3.5 border-2 border-[#D4F25C] border-t-transparent rounded-full animate-spin" />
              Đang kiểm tra mã...
            </div>
          )}

          {/* Nút gửi lại mã & Đổi email */}
          <div className="flex items-center justify-between text-xs pt-1">
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={resendCooldown > 0 || isResending}
              className="inline-flex items-center gap-1.5 text-[#D4F25C] font-semibold hover:underline disabled:opacity-50 disabled:no-underline disabled:cursor-not-allowed"
            >
              <RefreshCw size={13} className={isResending ? 'animate-spin' : ''} />
              {resendCooldown > 0 ? `Gửi lại mã sau ${resendCooldown}s` : 'Gửi lại mã'}
            </button>

            <button
              type="button"
              onClick={() => {
                setScreen('form');
                setOtpValue('');
                setOtpError('');
              }}
              className="inline-flex items-center gap-1 text-[#CFE2D8] hover:text-white transition-colors"
            >
              <ArrowLeft size={13} />
              Đổi email khác
            </button>
          </div>
        </div>
      )}
    </AuthSplitLayout>
  );
};
