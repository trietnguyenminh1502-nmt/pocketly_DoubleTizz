import React from 'react';
import { Link } from 'react-router-dom';

/* ─────────────────────────────────────────────
   AuthSplitLayout – Dark glassmorphism
   Dùng chung cho /login và /register
───────────────────────────────────────────── */

/** Vòng tròn trang trí – biểu tượng mục tiêu tài chính */
const GoalIcon = () => (
  <div
    className="relative w-20 h-20 flex items-center justify-center"
    aria-hidden="true"
  >
    {/* vòng tròn nét đứt mờ ngoài */}
    <svg
      className="absolute inset-0 w-full h-full"
      viewBox="0 0 96 96"
      fill="none"
    >
      <circle
        cx="48" cy="48" r="44"
        stroke="#D4F25C"
        strokeOpacity="0.25"
        strokeWidth="1.5"
        strokeDasharray="5 5"
      />
      <circle
        cx="48" cy="48" r="32"
        stroke="#D4F25C"
        strokeOpacity="0.15"
        strokeWidth="1"
        strokeDasharray="3 6"
      />
    </svg>
    {/* icon trung tâm */}
    <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10 relative z-10">
      <circle cx="24" cy="24" r="20" fill="#D4F25C" fillOpacity="0.15" />
      <circle cx="24" cy="24" r="12" fill="#D4F25C" fillOpacity="0.3" />
      <circle cx="24" cy="24" r="5"  fill="#D4F25C" />
      {/* mũi tên */}
      <path
        d="M32 16l-8 8"
        stroke="#D4F25C" strokeWidth="2" strokeLinecap="round"
      />
      <path
        d="M28 16h4v4"
        stroke="#D4F25C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  </div>
);

/** Vòng trang trí lớn nền trái */
const DecorRing = () => (
  <svg
    className="absolute bottom-6 left-1/2 -translate-x-1/2 opacity-[0.07] pointer-events-none"
    width="540" height="540" viewBox="0 0 560 560" fill="none"
    aria-hidden="true"
  >
    <circle cx="280" cy="280" r="276" stroke="#D4F25C" strokeWidth="1.5" strokeDasharray="8 8"/>
    <circle cx="280" cy="280" r="200" stroke="#D4F25C" strokeWidth="1" strokeDasharray="5 10"/>
    <circle cx="280" cy="280" r="120" stroke="#D4F25C" strokeWidth="0.8"/>
  </svg>
);

export const AuthSplitLayout = ({ title, subtitle, isRegister = false, children }) => {
  return (
    <div
      className="fixed inset-0 w-full h-full overflow-hidden flex flex-col lg:flex-row"
      style={{
        background: 'radial-gradient(ellipse at 30% 20%, #1F5A43 0%, #0A241B 55%, #071A14 100%)',
        fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif",
      }}
    >
      {/* ── CỘT TRÁI (ẩn trên mobile) ── */}
      <div
        className="hidden lg:flex flex-col justify-between relative overflow-hidden text-white shrink-0"
        style={{ width: '50%', padding: '44px 64px 32px 80px' }}
      >
        <DecorRing />

        {/* Logo */}
        <div className="relative z-10 shrink-0">
          <Link
            to="/"
            className="inline-flex items-center gap-2.5 group"
            aria-label="Trang chủ Pocketly"
          >
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
              <rect width="28" height="28" rx="8" fill="#D4F25C" fillOpacity="0.15"/>
              <path d="M6 14C6 9.58 9.58 6 14 6s8 3.58 8 8-3.58 8-8 8" stroke="#D4F25C" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="14" cy="14" r="3" fill="#D4F25C"/>
            </svg>
            <span
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 800,
                fontSize: '22px',
                color: '#D4F25C',
                letterSpacing: '-0.5px',
              }}
            >
              Pocketly
            </span>
          </Link>
        </div>

        {/* Tagline trung tâm */}
        <div className="relative z-10 my-auto py-2">
          <GoalIcon />

          <h2
            className="font-extrabold font-heading text-white leading-[1.1] mt-5 mb-0"
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: 'clamp(36px, 3.8vw, 54px)',
              letterSpacing: '-1.4px',
            }}
          >
            {isRegister ? (
              <>Chào mừng<br /><span style={{ color: '#D4F25C' }}>thành viên mới.</span></>
            ) : (
              <>Làm chủ ví tiền,<br /><span style={{ color: '#D4F25C' }}>bứt phá tương lai.</span></>
            )}
          </h2>

          <p
            className="mt-4 text-sm sm:text-base text-[#CFE2D8] max-w-md leading-relaxed"
          >
            Ứng dụng quản lý tài chính thông minh tích hợp AI Chatbot, thiết kế riêng cho lối sống sinh viên Gen-Z.
          </p>
        </div>

        {/* Footer bản quyền */}
        <div
          className="relative z-10 text-xs text-[#CFE2D8]/60 shrink-0"
        >
          © 2026 Pocketly Inc. · An toàn · Bảo mật · Tối giản
        </div>
      </div>

      {/* ── CỘT PHẢI – thẻ kính ── */}
      <div
        className="flex-1 h-full flex flex-col justify-center items-center px-4 sm:px-6 overflow-hidden"
      >
        {/* Logo trên mobile */}
        <div
          className="lg:hidden mb-4 shrink-0 text-center"
        >
          <Link
            to="/"
            className="inline-flex items-center gap-2"
            aria-label="Trang chủ Pocketly"
          >
            <svg width="26" height="26" viewBox="0 0 28 28" fill="none" aria-hidden="true">
              <rect width="28" height="28" rx="8" fill="#D4F25C" fillOpacity="0.2"/>
              <path d="M6 14C6 9.58 9.58 6 14 6s8 3.58 8 8-3.58 8-8 8" stroke="#D4F25C" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="14" cy="14" r="3" fill="#D4F25C"/>
            </svg>
            <span style={{ fontWeight: 800, fontSize: '22px', color: '#D4F25C', letterSpacing: '-0.4px' }}>
              Pocketly
            </span>
          </Link>
        </div>

        {/* Thẻ kính */}
        <div
          className="w-full max-w-[460px] p-7 sm:p-8 rounded-[28px] border border-white/16 shadow-2xl shrink-0"
          style={{
            background: 'rgba(255,255,255,0.07)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            /* fallback nếu browser không hỗ trợ backdrop-filter */
            backgroundColor: 'rgba(10,36,27,0.85)',
          }}
        >
          {/* Tiêu đề thẻ */}
          <div className="mb-5">
            <h1
              className="font-extrabold font-heading text-white m-0 text-2xl sm:text-3xl tracking-tight"
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                letterSpacing: '-0.6px',
              }}
            >
              {title}
            </h1>
            {subtitle && (
              <p
                className="mt-1.5 text-xs sm:text-sm text-[#CFE2D8] leading-relaxed"
              >
                {subtitle}
              </p>
            )}
          </div>

          {children}
        </div>
      </div>
    </div>
  );
};
