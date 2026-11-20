import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui';
import { Home, ArrowLeft } from 'lucide-react';

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
