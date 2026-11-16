# 📚 Tài liệu Thiết kế & Kiến trúc Hệ thống Pocketly

Thư mục `/docs` chứa toàn bộ sơ đồ kiến trúc, cơ sở dữ liệu, ca sử dụng và các luồng xử lý cốt lõi của ứng dụng **Pocketly**.

---

### Danh mục tài liệu

1. **[Sơ đồ Cơ sở Dữ liệu (ERD)](file:///c:/Nam4/CNPMM/pocketly/docs/erd.md)**:
   - Mô hình dữ liệu PostgreSQL quản lý bởi Prisma ORM.
   - Chi tiết các bảng: `users`, `wallets`, `categories`, `transactions`, `budgets`, `saving_goals`, `notifications`, `chat_sessions`, `chat_messages`, `audit_logs`.
   
2. **[Sơ đồ Ca sử dụng (Use Cases)](file:///c:/Nam4/CNPMM/pocketly/docs/use-cases.md)**:
   - Bản đồ các tính năng nghiệp vụ của 2 nhóm đối tượng chính: **Sinh viên (User)** và **Quản trị viên (Admin)**.
   - Tích hợp với dịch vụ ngoài: **Google Gemini AI**.

3. **[Sơ đồ Tuần tự Trợ lý AI (Chatbot Sequence)](file:///c:/Nam4/CNPMM/pocketly/docs/chatbot-sequence.md)**:
   - Luồng dữ liệu khi sinh viên trò chuyện với **Pocket Assistant**.
   - Cơ chế thu thập dữ liệu tài chính thời gian thực (`ContextBuilder`), rate-limiting và kỹ thuật prompt an toàn chống bịa đặt thông tin.

---

### Nguyên tắc Kiến trúc
- **Backend**: Kiến trúc 3 tầng chuẩn `Routes -> Controllers -> Services` với Prisma Data Access Layer.
- **Frontend**: Single Page Application (React 18 + Vite), quản lý state từ xa qua TanStack React Query và bảo mật thông tin với Token Interceptors.
- **Bảo mật**: JWT Access Token (15 phút, lưu trong bộ nhớ) kết hợp Refresh Token (7 ngày, lưu trong HttpOnly Cookie chống XSS), mật khẩu băm với Salt Rounds bằng `bcryptjs`.
