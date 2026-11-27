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
        stroke="rgb(var(--color-auth-accent))"
        strokeOpacity="0.25"
        strokeWidth="1.5"
        strokeDasharray="5 5"
      />
      <circle
        cx="48" cy="48" r="32"
        stroke="rgb(var(--color-auth-accent))"
        strokeOpacity="0.15"
        strokeWidth="1"
        strokeDasharray="3 6"
      />
    </svg>
    {/* icon trung tâm */}
    <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10 relative z-10">
      <circle cx="24" cy="24" r="20" fill="rgb(var(--color-auth-accent))" fillOpacity="0.15" />
      <circle cx="24" cy="24" r="12" fill="rgb(var(--color-auth-accent))" fillOpacity="0.3" />
      <circle cx="24" cy="24" r="5"  fill="rgb(var(--color-auth-accent))" />
      {/* mũi tên */}
      <path
        d="M32 16l-8 8"
        stroke="rgb(var(--color-auth-accent))" strokeWidth="2" strokeLinecap="round"
      />
      <path
        d="M28 16h4v4"
        stroke="rgb(var(--color-auth-accent))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
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
    <circle cx="280" cy="280" r="276" stroke="rgb(var(--color-auth-accent))" strokeWidth="1.5" strokeDasharray="8 8"/>
    <circle cx="280" cy="280" r="200" stroke="rgb(var(--color-auth-accent))" strokeWidth="1" strokeDasharray="5 10"/>
    <circle cx="280" cy="280" r="120" stroke="rgb(var(--color-auth-accent))" strokeWidth="0.8"/>
  </svg>
);

export const AuthSplitLayout = ({ title, subtitle, isRegister = false, children }) => {
  return (
    <div
      className="fixed inset-0 w-full h-full overflow-hidden flex flex-col lg:flex-row bg-auth-gradient font-jakarta"
    >
      {/* ── CỘT TRÁI (ẩn trên mobile) ── */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-between relative overflow-hidden text-white shrink-0 pt-[44px] pb-8 pr-16 pl-20"
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
              <rect width="28" height="28" rx="8" fill="rgb(var(--color-auth-accent))" fillOpacity="0.15"/>
              <path d="M6 14C6 9.58 9.58 6 14 6s8 3.58 8 8-3.58 8-8 8" stroke="rgb(var(--color-auth-accent))" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="14" cy="14" r="3" fill="rgb(var(--color-auth-accent))"/>
            </svg>
              <span className="font-jakarta font-extrabold text-[22px] text-auth-accent tracking-[-0.5px]">
              Pocketly
            </span>
          </Link>
        </div>

        {/* Tagline trung tâm */}
        <div className="relative z-10 my-auto py-2">
          <GoalIcon />

          <h2 className="font-extrabold font-heading font-jakarta text-white leading-[1.1] mt-5 mb-0 text-[clamp(36px,3.8vw,54px)] tracking-[-1.4px]">
            {isRegister ? (
              <>Chào mừng<br /><span className="text-auth-accent">thành viên mới.</span></>
            ) : (
              <>Làm chủ ví tiền,<br /><span className="text-auth-accent">bứt phá tương lai.</span></>
            )}
          </h2>

          <p className="mt-4 text-sm sm:text-base text-auth max-w-md leading-relaxed">
            Ứng dụng quản lý tài chính thông minh tích hợp AI Chatbot, thiết kế riêng cho lối sống sinh viên Gen-Z.
          </p>
        </div>

        {/* Footer bản quyền */}
        <div className="relative z-10 text-xs text-auth/60 shrink-0">
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
              <rect width="28" height="28" rx="8" fill="rgb(var(--color-auth-accent))" fillOpacity="0.2"/>
              <path d="M6 14C6 9.58 9.58 6 14 6s8 3.58 8 8-3.58 8-8 8" stroke="rgb(var(--color-auth-accent))" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="14" cy="14" r="3" fill="rgb(var(--color-auth-accent))"/>
            </svg>
            <span className="font-extrabold text-[22px] text-auth-accent tracking-[-0.4px]">
              Pocketly
            </span>
          </Link>
        </div>

        {/* Thẻ kính */}
        <div
          className="w-full max-w-[460px] p-7 sm:p-8 rounded-[28px] border border-white/16 shadow-2xl shrink-0 auth-glass"
        >
          {/* Tiêu đề thẻ */}
          <div className="mb-5">
            <h1 className="font-extrabold font-heading font-jakarta text-white m-0 text-2xl sm:text-3xl tracking-[-0.6px]">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-1.5 text-xs sm:text-sm text-auth leading-relaxed">
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
