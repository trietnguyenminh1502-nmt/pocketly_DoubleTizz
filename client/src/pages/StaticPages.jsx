import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, Input, Textarea, Select, useToast } from '@/components/ui';
import { Home, ArrowLeft, Mail, Phone, MapPin, MessageSquare, Send, HelpCircle, CheckCircle2 } from 'lucide-react';
import { supportApi } from '@/api/support';

export const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-bg-light dark:bg-bg-dark text-ink-light dark:text-ink-dark flex flex-col items-center justify-center p-6 text-center">
      <span className="text-8xl font-black font-heading text-primary dark:text-lime tracking-tighter">
        404
      </span>
      <h1 className="text-2xl font-bold font-heading mt-2">Trang không tồn tại</h1>
      <p className="text-sm text-ink-muted max-w-sm mt-2 mb-6">
        Đường dẫn bạn đang tìm kiếm có thể đã bị di chuyển, xóa hoặc không còn tồn tại trên hệ thống Pocketly.
      </p>
      <Link to="/">
        <Button variant="primary" icon={Home}>Về trang chủ</Button>
      </Link>
    </div>
  );
};

export const ForbiddenPage = () => {
  return (
    <div className="min-h-screen bg-bg-light dark:bg-bg-dark text-ink-light dark:text-ink-dark flex flex-col items-center justify-center p-6 text-center">
      <span className="text-8xl font-black font-heading text-coral tracking-tighter">
        403
      </span>
      <h1 className="text-2xl font-bold font-heading mt-2">Truy cập bị từ chối</h1>
      <p className="text-sm text-ink-muted max-w-sm mt-2 mb-6">
        Bạn không có quyền hạn quản trị viên (ADMIN) để truy cập vào khu vực này.
      </p>
      <Link to="/dashboard">
        <Button variant="secondary" icon={ArrowLeft}>Quay lại Dashboard</Button>
      </Link>
    </div>
  );
};

export const LegalPage = ({ type = 'terms' }) => {
  const isTerms = type === 'terms';

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 space-y-6">
      <h1 className="text-3xl font-extrabold font-heading text-primary dark:text-lime">
        {isTerms ? 'Điều khoản sử dụng Pocketly' : 'Chính sách bảo mật thông tin'}
      </h1>
      <p className="text-xs text-ink-muted">Cập nhật lần cuối: Tháng 11/2026</p>

      {isTerms ? (
        /* Nội dung Điều khoản sử dụng */
        <div className="space-y-5 text-sm leading-relaxed text-ink-muted">
          <p>
            Chào mừng bạn đến với <strong>Pocketly</strong> – Ứng dụng quản lý tài chính cá nhân thông minh dành cho sinh viên. Khi đăng ký tài khoản và sử dụng bất kỳ dịch vụ nào của Pocketly, bạn đồng ý tuân thủ các điều khoản và điều kiện được nêu rõ dưới đây.
          </p>

          <section className="space-y-1.5">
            <h3 className="text-base font-bold text-ink-light dark:text-ink-dark pt-2">
              1. Điều kiện đăng ký và tài khoản người dùng
            </h3>
            <p>
              Người dùng cần cung cấp thông tin chính xác (email, họ tên) khi tạo tài khoản. Mỗi tài khoản chỉ thuộc quyền sở hữu của một cá nhân duy nhất. Bạn có trách nhiệm tự bảo mật mật khẩu và chịu trách nhiệm với mọi hoạt động diễn ra dưới tài khoản của mình.
            </p>
          </section>

          <section className="space-y-1.5">
            <h3 className="text-base font-bold text-ink-light dark:text-ink-dark pt-2">
              2. Quyền và trách nhiệm khi sử dụng dịch vụ
            </h3>
            <p>
              Pocketly cung cấp các công cụ ghi chép giao dịch, phân bổ ví tiền, đặt hạn mức ngân sách và lập mục tiêu tiết kiệm. Bạn cam kết không sử dụng ứng dụng cho các mục đích gian lận, phát tán mã độc hoặc can thiệp trái phép vào hệ thống máy chủ của Pocketly.
            </p>
          </section>

          <section className="space-y-1.5">
            <h3 className="text-base font-bold text-ink-light dark:text-ink-dark pt-2">
              3. Tính năng Cố vấn Tài chính AI (Pocket Assistant)
            </h3>
            <p>
              Trợ lý AI của Pocketly sử dụng mô hình ngôn ngữ lớn để phân tích xu hướng chi tiêu và đưa ra lời khuyên tiết kiệm thực tế cho sinh viên. Các phản hồi của AI mang tính chất tham khảo, hỗ trợ nâng cao thói quen chi tiêu và không thay thế cho các lời khuyên tư vấn tài chính hoặc đầu tư chuyên nghiệp.
            </p>
          </section>

          <section className="space-y-1.5">
            <h3 className="text-base font-bold text-ink-light dark:text-ink-dark pt-2">
              4. Bản quyền và quyền sở hữu trí tuệ
            </h3>
            <p>
              Toàn bộ giao diện người dùng, mã nguồn, biểu tượng, thiết kế và logo Pocketly thuộc quyền sở hữu trí tuệ của đội ngũ phát triển Pocketly. Bạn không được sao chép, phân phối lại hoặc dịch ngược ứng dụng khi chưa có sự đồng thuận bằng văn bản.
            </p>
          </section>

          <section className="space-y-1.5">
            <h3 className="text-base font-bold text-ink-light dark:text-ink-dark pt-2">
              5. Tạm ngừng và chấm dứt tài khoản
            </h3>
            <p>
              Bạn có thể xóa tài khoản của mình bất cứ lúc nào trong trang Hồ sơ cá nhân. Pocketly có quyền tạm khóa hoặc chấm dứt quyền truy cập đối với các tài khoản vi phạm nghiêm trọng các quy định sử dụng hoặc có hành vi phá hoại hệ thống.
            </p>
          </section>
        </div>
      ) : (
        /* Nội dung Chính sách bảo mật thông tin */
        <div className="space-y-5 text-sm leading-relaxed text-ink-muted">
          <p>
            Tại <strong>Pocketly</strong>, chúng tôi hiểu rằng dữ liệu tài chính là thông tin cực kỳ nhạy cảm và quan trọng. Chính sách này mô tả cách chúng tôi thu thập, sử dụng và cam kết bảo vệ dữ liệu cá nhân của bạn khi sử dụng ứng dụng.
          </p>

          <section className="space-y-1.5">
            <h3 className="text-base font-bold text-ink-light dark:text-ink-dark pt-2">
              1. Dữ liệu chúng tôi thu thập
            </h3>
            <p>
              Để phục vụ việc quản lý chi tiêu, Pocketly chỉ thu thập những dữ liệu cần thiết do bạn chủ động cung cấp, bao gồm: thông tin tài khoản (họ tên, email, ảnh đại diện), dữ liệu tài chính (danh sách ví, các khoản thu/chi, số tiền, ngày giao dịch, danh mục chi tiêu, ngân sách và mục tiêu tiết kiệm).
            </p>
          </section>

          <section className="space-y-1.5">
            <h3 className="text-base font-bold text-ink-light dark:text-ink-dark pt-2">
              2. Mục đích sử dụng dữ liệu
            </h3>
            <p>
              Dữ liệu của bạn được sử dụng duy nhất cho các mục đích: tổng hợp báo cáo trực quan, tính toán số dư thực tế, gửi cảnh báo khi chi tiêu sắp chạm hạn mức ngân sách và cung cấp ngữ cảnh tài chính để AI Chatbot đưa ra lời khuyên cá nhân hóa chính xác cho bạn.
            </p>
          </section>

          <section className="space-y-1.5">
            <h3 className="text-base font-bold text-ink-light dark:text-ink-dark pt-2">
              3. Cam kết KHÔNG chia sẻ hoặc bán dữ liệu
            </h3>
            <p>
              Toàn bộ dữ liệu tài chính của bạn là tài sản riêng của bạn. Pocketly <strong>tuyệt đối không bán, không cho thuê, không thương mại hóa</strong> và không chia sẻ hồ sơ tài chính của bạn cho bất kỳ đối tác quảng cáo hay bên thứ ba nào.
            </p>
          </section>

          <section className="space-y-1.5">
            <h3 className="text-base font-bold text-ink-light dark:text-ink-dark pt-2">
              4. Bảo mật dữ liệu với Trí tuệ nhân tạo (AI Chatbot)
            </h3>
            <p>
              Khi bạn trò chuyện với Pocket Assistant, dữ liệu chi tiêu tháng chỉ được trích xuất tạm thời ở phía server để xây dựng ngữ cảnh trả lời phiên hỏi đáp của bạn. Dữ liệu cá nhân của bạn không được lưu lại để huấn luyện các mô hình AI công cộng.
            </p>
          </section>

          <section className="space-y-1.5">
            <h3 className="text-base font-bold text-ink-light dark:text-ink-dark pt-2">
              5. Quyền kiểm soát và xóa dữ liệu của bạn
            </h3>
            <p>
              Bạn nắm toàn quyền kiểm soát dữ liệu: có thể xem lại, chỉnh sửa hoặc xuất báo cáo ra file Excel/CSV bất cứ lúc nào. Khi bạn thực hiện thao tác "Xóa tài khoản" trong phần Cài đặt, toàn bộ thông tin cá nhân và lịch sử giao dịch của bạn sẽ được xóa vĩnh viễn khỏi cơ sở dữ liệu hệ thống.
            </p>
          </section>
        </div>
      )}
    </div>
  );
};

export const ContactSupportPage = () => {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    topic: 'general',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.email.trim() || !formData.message.trim()) {
      addToast({ message: 'Vui lòng điền đầy đủ các thông tin bắt buộc!', type: 'error' });
      return;
    }

    try {
      setLoading(true);
      await supportApi.sendEmail(formData);
      setSubmitted(true);
      addToast({
        message: 'Gửi email hỗ trợ thành công! Đội ngũ Pocketly sẽ liên hệ qua email trong vòng 24h.',
        type: 'success'
      });
      setFormData({ fullName: '', email: '', topic: 'general', message: '' });
    } catch (error) {
      addToast({
        message: error?.response?.data?.message || error.message || 'Không thể gửi yêu cầu lúc này, vui lòng thử lại sau!',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const faqs = [
    {
      q: 'Pocketly có hoàn toàn miễn phí cho sinh viên không?',
      a: 'Có, Pocketly là dự án ứng dụng tài chính cá nhân dành riêng cho sinh viên với 100% tính năng hoàn toàn miễn phí, bao gồm ghi chép thu chi, báo cáo trực quan, quản lý ngân sách và trợ lý AI.'
    },
    {
      q: 'Làm thế nào để tôi xuất dữ liệu chi tiêu ra file Excel?',
      a: 'Bạn chỉ cần truy cập vào mục "Sổ Giao Dịch" hoặc "Báo Cáo & Phân Tích", ở góc trên bên phải sẽ có nút "Xuất Excel" và "Xuất CSV" để tải về máy tính tức thì.'
    },
    {
      q: 'Trợ lý Pocket Assistant AI có bảo mật thông tin ví của tôi không?',
      a: 'Hoàn toàn bảo mật. Dữ liệu tài chính chỉ được trích xuất tạm thời làm ngữ cảnh cục bộ trong phiên hỏi đáp của bạn. Pocketly cam kết không bán và không chia sẻ dữ liệu ví/chi tiêu cho bất kỳ bên thứ ba nào.'
    },
    {
      q: 'Tôi quên mật khẩu thì phải làm sao?',
      a: 'Tại màn hình Đăng nhập, hãy bấm vào nút "Quên mật khẩu", sau đó nhập địa chỉ email đã đăng ký. Hệ thống sẽ gửi mã xác thực để bạn tạo mật khẩu mới an toàn.'
    }
  ];

  return (
    <div className="max-w-5xl mx-auto py-12 px-4 space-y-12">
      {/* 1. Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 dark:bg-lime/10 text-primary dark:text-lime text-xs font-bold uppercase tracking-wider">
          <MessageSquare className="w-3.5 h-3.5" /> Trung Tâm Trợ Giúp
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-ink-light dark:text-ink-dark tracking-tight">
          Liên Hệ & Hỗ Trợ Kỹ Thuật
        </h1>
        <p className="text-sm text-ink-muted">
          Bạn gặp khó khăn trong quá trình sử dụng, cần giải đáp thắc mắc hoặc có ý tưởng đóng góp cho Pocketly? Đội ngũ chúng mình luôn sẵn sàng lắng nghe bạn!
        </p>
      </div>

      {/* 2. Grid thông tin liên hệ & Form */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Cột trái: Kênh liên hệ trực tiếp */}
        <div className="md:col-span-5 space-y-4">
          <Card className="p-6 space-y-6">
            <h2 className="text-lg font-bold font-heading text-ink-light dark:text-ink-dark border-b border-border-light dark:border-border-dark pb-3">
              Thông Tin Liên Hệ
            </h2>

            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-16 bg-primary/10 dark:bg-lime/10 text-primary dark:text-lime shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-ink-light dark:text-ink-dark">Email hỗ trợ</h3>
                  <p className="text-xs text-ink-muted mt-0.5">Phản hồi nhanh trong vòng 24 giờ</p>
                  <a href="mailto:tvocabs1502@gmail.com" className="text-xs font-bold text-primary dark:text-lime hover:underline mt-1 inline-block">
                    tvocabs1502@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-16 bg-tangerine/10 text-tangerine shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-ink-light dark:text-ink-dark">Đường dây nóng</h3>
                  <p className="text-xs text-ink-muted mt-0.5">Thứ 2 - Thứ 7 (8:00 - 18:00)</p>
                  <a href="tel:0385814985" className="text-xs font-bold text-ink-light dark:text-ink-dark hover:underline mt-1 inline-block">
                    (+84) 038 5814 985
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-16 bg-sand dark:bg-surface-dark text-ink-muted shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-ink-light dark:text-ink-dark">Địa chỉ nghiên cứu & phát triển</h3>
                  <p className="text-xs text-ink-muted mt-0.5 leading-relaxed">
                    Trường Đại học Công nghệ Kỹ thuật TP.HCM, Số 1 Võ Văn Ngân, Thành phố Thủ Đức
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-16 bg-sand/60 dark:bg-surface-dark text-xs text-ink-muted space-y-1">
              <span className="font-bold text-ink-light dark:text-ink-dark block">⚡ Hỗ trợ trực tuyến:</span>
              Bạn cũng có thể mở thanh <strong>"Hỏi Pocket Assistant"</strong> ở góc dưới bên phải màn hình để được trợ lý AI giải đáp tức thì về các thao tác sử dụng ví, ngân sách hay tra cứu giao dịch.
            </div>
          </Card>
        </div>

        {/* Cột phải: Form gửi tin nhắn hỗ trợ */}
        <div className="md:col-span-7">
          <Card className="p-6 sm:p-8 space-y-6">
            <h2 className="text-lg font-bold font-heading text-ink-light dark:text-ink-dark border-b border-border-light dark:border-border-dark pb-3">
              Gửi Yêu Cầu Hỗ Trợ
            </h2>

            {submitted ? (
              <div className="text-center py-8 space-y-3">
                <CheckCircle2 className="w-12 h-12 text-primary dark:text-lime mx-auto" />
                <h3 className="text-lg font-bold text-ink-light dark:text-ink-dark">Cảm ơn bạn đã liên hệ!</h3>
                <p className="text-xs text-ink-muted max-w-md mx-auto">
                  Chúng mình đã tiếp nhận tin nhắn và sẽ phản hồi đến địa chỉ email của bạn sớm nhất. Chúc bạn có một ngày học tập và quản lý chi tiêu hiệu quả!
                </p>
                <Button variant="secondary" size="sm" onClick={() => setSubmitted(false)}>
                  Gửi yêu cầu khác
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Họ và tên của bạn (*)"
                    placeholder="Nguyễn Văn A"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    required
                  />
                  <Input
                    label="Địa chỉ Email (*)"
                    type="email"
                    placeholder="student@university.edu.vn"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                <Select
                  label="Vấn đề bạn cần hỗ trợ"
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  options={[
                    { value: 'general', label: 'Hỏi đáp chung về ứng dụng Pocketly' },
                    { value: 'account', label: 'Sự cố tài khoản & Đăng nhập' },
                    { value: 'transaction', label: 'Giao dịch, Ví tiền & Báo cáo' },
                    { value: 'ai', label: 'Trợ lý AI & Lời khuyên chi tiêu' },
                    { value: 'feedback', label: 'Đóng góp ý kiến cải tiến ứng dụng' },
                    { value: 'other', label: 'Vấn đề khác' }
                  ]}
                />

                <Textarea
                  label="Nội dung chi tiết (*)"
                  placeholder="Mô tả cụ thể vấn đề bạn gặp phải hoặc nội dung cần giải đáp..."
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                />

                <Button
                  type="submit"
                  variant="primary"
                  icon={Send}
                  isLoading={loading}
                  className="w-full"
                >
                  Gửi yêu cầu hỗ trợ
                </Button>
              </form>
            )}
          </Card>
        </div>
      </div>

      {/* 3. FAQ Section */}
      <div className="space-y-6 pt-6 border-t border-border-light dark:border-border-dark">
        <div className="text-center space-y-1">
          <h2 className="text-xl font-bold font-heading text-ink-light dark:text-ink-dark flex items-center justify-center gap-2">
            <HelpCircle className="w-5 h-5 text-primary dark:text-lime" /> Câu Hỏi Thường Gặp (FAQ)
          </h2>
          <p className="text-xs text-ink-muted">Giải đáp nhanh các thắc mắc phổ biến nhất của sinh viên</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {faqs.map((faq, idx) => (
            <Card key={idx} className="p-5 space-y-2">
              <h3 className="text-sm font-bold text-ink-light dark:text-ink-dark flex items-start gap-2">
                <span className="text-primary dark:text-lime font-mono">Q:</span>
                {faq.q}
              </h3>
              <p className="text-xs text-ink-muted leading-relaxed pl-5">
                {faq.a}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
