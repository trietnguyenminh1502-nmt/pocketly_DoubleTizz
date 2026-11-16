import React from 'react';
import { Link } from 'react-router-dom';

export const AuthSplitLayout = ({ title, subtitle, children }) => {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-bg-light dark:bg-bg-dark text-ink-light dark:text-ink-dark transition-colors">
      {/* Cột trái: Brand Panel (Forest Green #123D2F, Editorial Abstract Illustration) */}
      <div className="hidden lg:flex lg:col-span-5 bg-primary dark:bg-[#0c241c] p-12 flex-col justify-between relative overflow-hidden text-white">
        {/* Abstract Graphic Shapes (Editorial feel) */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-lime/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-tangerine/15 blur-3xl pointer-events-none" />

        {/* Brand Logo */}
        <div className="z-10">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <span className="text-3xl">🌿</span>
            <span className="font-heading font-extrabold text-2xl text-lime tracking-tight">Pocketly</span>
          </Link>
        </div>

        {/* Center Tagline & Illustration */}
        <div className="z-10 my-auto py-12">
          {/* Abstract Inline SVG */}
          <div className="mb-8 w-44 h-44 rounded-3xl bg-white/5 border border-white/10 p-6 flex items-center justify-center relative">
            <svg viewBox="0 0 100 100" fill="none" className="w-full h-full text-lime">
              <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="3" strokeDasharray="6 6" />
              <rect x="30" y="30" width="40" height="40" rx="12" fill="#D4F05A" fillOpacity="0.2" stroke="#D4F05A" strokeWidth="2.5" />
              <circle cx="50" cy="50" r="10" fill="#FF6A2B" />
              <path d="M50 20V30M50 70V80M20 50H30M70 50H80" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>

          <h2 className="text-3xl xl:text-4xl font-extrabold font-heading text-white leading-tight">
            Làm chủ ví tiền,<br />
            <span className="text-lime">bứt phá tương lai.</span>
          </h2>
          <p className="mt-4 text-sm text-white/80 max-w-sm leading-relaxed">
            Ứng dụng quản lý tài chính thông minh tích hợp AI Chatbot đầu tiên thiết kế riêng cho lối sống sinh viên Gen-Z.
          </p>
        </div>

        {/* Bottom Tagline */}
        <div className="z-10 text-xs text-white/60">
          © 2026 Pocketly Inc. • An toàn • Bảo mật • Tối giản
        </div>
      </div>

      {/* Cột phải: Clean Form Container */}
      <div className="lg:col-span-7 flex flex-col justify-center items-center p-6 sm:p-12 md:p-16">
        <div className="w-full max-w-md">
          {/* Mobile Brand Logo */}
          <div className="lg:hidden mb-8 text-center">
            <Link to="/" className="inline-flex items-center gap-2">
              <span className="text-3xl">🌿</span>
              <span className="font-heading font-extrabold text-2xl text-primary dark:text-lime">Pocketly</span>
            </Link>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-ink-light dark:text-ink-dark">
              {title}
            </h1>
            {subtitle && <p className="text-sm text-ink-muted mt-2">{subtitle}</p>}
          </div>

          {children}
        </div>
      </div>
    </div>
  );
};
