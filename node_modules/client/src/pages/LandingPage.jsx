import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, Money } from '../components/ui';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Bot,
  Zap,
  CheckCircle,
  HelpCircle
} from 'lucide-react';

export const LandingPage = () => {
  const faqs = [
    {
      q: 'Pocketly có hoàn toàn miễn phí cho sinh viên không?',
      a: 'Hoàn toàn miễn phí! Tất cả các tính năng ghi chép giao dịch, lập ngân sách, biểu đồ phân tích và hỏi đáp cùng trợ lý AI đều miễn phí 100% cho sinh viên.'
    },
    {
      q: 'AI Chatbot của Pocketly hoạt động như thế nào?',
      a: 'Chatbot được phát triển trên nền tảng Google Gemini API trực tiếp từ máy chủ backend. AI sẽ tóm tắt số liệu thu chi thực tế của riêng bạn và gợi ý mẹo tiết kiệm thông minh mà không bao giờ bịa đặt con số.'
    },
    {
      q: 'Dữ liệu tài chính của tôi có an toàn không?',
      a: 'Dữ liệu được lưu trữ an toàn trong PostgreSQL với mã hóa mật khẩu, bảo mật xác thực 2 lớp qua JWT + httpOnly cookie và không bao giờ chia sẻ cho bên thứ ba.'
    }
  ];

  return (
    <div className="space-y-24 py-12 md:py-20">
      {/* 1. HERO SECTION (Editorial look) */}
      <section className="max-w-5xl mx-auto px-4 text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sand/60 dark:bg-surface-dark border border-border-light dark:border-border-dark text-xs font-bold text-primary dark:text-lime shadow-soft">
          <Sparkles className="w-4 h-4 text-tangerine" />
          <span>Giải pháp quản lý tài chính thế hệ mới cho Gen-Z</span>
        </div>

        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold font-heading text-ink-light dark:text-ink-dark tracking-tight leading-[1.08]">
          Học cách tiêu tiền thông minh,<br />
          <span className="text-primary dark:text-lime">không còn lo “cháy túi”.</span>
        </h1>

        <p className="text-base sm:text-lg text-ink-muted max-w-2xl mx-auto leading-relaxed">
          Theo dõi từng ly cà phê, bữa cơm căn tin, chia nhỏ ngân sách và nhận tư vấn chi tiêu cực thực tế từ AI Chatbot tích hợp.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link to="/register">
            <Button variant="primary" size="lg" icon={ArrowRight}>
              Bắt đầu miễn phí ngay
            </Button>
          </Link>
          <Link to="/login">
            <Button variant="secondary" size="lg">
              Xem thử Demo tài khoản
            </Button>
          </Link>
        </div>

        {/* Dashboard Mock Preview Card */}
        <div className="pt-10">
          <div className="relative mx-auto rounded-24 p-3 bg-gradient-to-b from-border-light/60 to-transparent dark:from-border-dark shadow-modal max-w-4xl">
            <div className="rounded-20 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark p-6 md:p-8 text-left space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-border-light dark:border-border-dark">
                <div>
                  <span className="text-xs text-ink-muted uppercase font-bold tracking-wider">Tổng số dư khả dụng</span>
                  <div className="flex items-baseline gap-3 mt-1">
                    <Money amount={12450000} type="neutral" className="text-3xl md:text-4xl" />
                    <span className="text-xs font-bold text-primary dark:text-lime bg-mint/50 px-2 py-0.5 rounded-full">+12% so với tháng trước</span>
                  </div>
                </div>
                <div className="p-3 rounded-20 bg-sand/40 dark:bg-surface-dark text-primary dark:text-lime">
                  <TrendingUp className="w-6 h-6" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-16 bg-sand/20 dark:bg-white/5 border border-border-light/60 dark:border-border-dark/60">
                  <span className="text-xs text-ink-muted">Thu nhập tháng</span>
                  <p className="text-lg font-bold text-primary dark:text-lime mt-1">+4.500.000₫</p>
                </div>
                <div className="p-4 rounded-16 bg-sand/20 dark:bg-white/5 border border-border-light/60 dark:border-border-dark/60">
                  <span className="text-xs text-ink-muted">Chi tiêu tháng</span>
                  <p className="text-lg font-bold text-tangerine mt-1">-2.150.000₫</p>
                </div>
                <div className="p-4 rounded-16 bg-sand/20 dark:bg-white/5 border border-border-light/60 dark:border-border-dark/60">
                  <span className="text-xs text-ink-muted">Tiết kiệm ròng</span>
                  <p className="text-lg font-bold text-ink-light dark:text-ink-dark mt-1">2.350.000₫</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FEATURES GRID */}
      <section id="features" className="max-w-6xl mx-auto px-4 space-y-12">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-tangerine">Tính năng vượt trội</span>
          <h2 className="text-3xl font-extrabold font-heading text-ink-light dark:text-ink-dark">
            Mọi thứ bạn cần để kiểm soát tài chính
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card hover className="space-y-3">
            <div className="w-12 h-12 rounded-20 bg-mint/50 text-primary flex items-center justify-center">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold">Ghi chép giao dịch siêu tốc</h3>
            <p className="text-sm text-ink-muted leading-relaxed">
              Nhập chi tiêu chỉ mất 3 giây. Tự động trừ ví tiền mặt, thẻ ngân hàng hoặc ví MoMo đồng thời.
            </p>
          </Card>

          <Card hover className="space-y-3">
            <div className="w-12 h-12 rounded-20 bg-tangerine/15 text-tangerine flex items-center justify-center">
              <Bot className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold">Cố vấn AI Chatbot thông minh</h3>
            <p className="text-sm text-ink-muted leading-relaxed">
              Trò chuyện cùng AI để biết tháng này tiêu lố ở đâu, có nên mua đồ công nghệ mới hay cách cắt giảm tiền ăn vặt.
            </p>
          </Card>

          <Card hover className="space-y-3">
            <div className="w-12 h-12 rounded-20 bg-lime/20 text-lime-dark flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold">Cảnh báo ngân sách tự động</h3>
            <p className="text-sm text-ink-muted leading-relaxed">
              Hệ thống tự động nhắc nhở khi chi tiêu chạm ngưỡng 80% hạn mức, giúp bạn luôn chủ động trước ngày cuối tháng.
            </p>
          </Card>
        </div>
      </section>

      {/* 3. HOW IT WORKS */}
      <section id="how-it-works" className="max-w-5xl mx-auto px-4 space-y-12">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-primary dark:text-lime">Quy trình đơn giản</span>
          <h2 className="text-3xl font-extrabold font-heading">Chỉ 3 bước để bắt đầu</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-full bg-primary text-white dark:bg-lime dark:text-ink-light mx-auto flex items-center justify-center font-bold text-lg">
              1
            </div>
            <h4 className="font-bold text-base">Đăng ký tài khoản</h4>
            <p className="text-xs text-ink-muted">Tạo tài khoản miễn phí bằng email sinh viên chỉ trong 30 giây.</p>
          </div>

          <div className="space-y-3">
            <div className="w-12 h-12 rounded-full bg-primary text-white dark:bg-lime dark:text-ink-light mx-auto flex items-center justify-center font-bold text-lg">
              2
            </div>
            <h4 className="font-bold text-base">Ghi chép & Đặt ngân sách</h4>
            <p className="text-xs text-ink-muted">Tạo các ví tiền bạn dùng và đặt hạn mức chi tiêu hàng tháng.</p>
          </div>

          <div className="space-y-3">
            <div className="w-12 h-12 rounded-full bg-primary text-white dark:bg-lime dark:text-ink-light mx-auto flex items-center justify-center font-bold text-lg">
              3
            </div>
            <h4 className="font-bold text-base">Nhận tư vấn từ AI</h4>
            <p className="text-xs text-ink-muted">Mở chatbot bất cứ lúc nào để hỏi về bức tranh tài chính của mình.</p>
          </div>
        </div>
      </section>

      {/* 4. FAQ SECTION */}
      <section id="faq" className="max-w-4xl mx-auto px-4 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-extrabold font-heading">Câu hỏi thường gặp</h2>
          <p className="text-sm text-ink-muted">Giải đáp các thắc mắc phổ biến về ứng dụng Pocketly</p>
        </div>

        <div className="space-y-4">
          {faqs.map((f, i) => (
            <Card key={i} className="space-y-2">
              <h4 className="font-bold text-base flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-tangerine shrink-0" />
                {f.q}
              </h4>
              <p className="text-sm text-ink-muted leading-relaxed pl-6">{f.a}</p>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
};
