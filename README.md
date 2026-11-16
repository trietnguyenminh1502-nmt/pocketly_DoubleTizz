# 🌿 Pocketly - Student Expense Tracker with Gemini AI 💸

> **Pocketly** là ứng dụng quản lý chi tiêu và cố vấn tài chính cá nhân thông minh dành riêng cho học sinh, sinh viên thế hệ Gen-Z. Kết hợp giữa ngôn ngữ thiết kế **Editorial Fintech** hiện đại (không dùng màu xanh dương/tím thông thường, loại bỏ hoàn toàn bóng đổ màu mè hay hiệu ứng sến súa) cùng trí tuệ nhân tạo **Google Gemini 2.5 Flash**, Pocketly biến việc quản lý ví tiền từ một gánh nặng nhàm chán thành trải nghiệm trực quan, thú vị và đầy cảm hứng.

---

## 📑 Mục lục
1. [Tổng quan & Tính năng cốt lõi](#-tính-năng-cốt-lõi)
2. [Ngôn ngữ Thiết kế & Bảng màu](#-ngôn-ngữ-thiết-kế--bảng-màu)
3. [Công nghệ Sử dụng (Tech Stack)](#-công-nghệ-sử-dụng-tech-stack)
4. [Cấu trúc Thư mục (Monorepo Structure)](#-cấu-trúc-thư-mục-monorepo-structure)
5. [Hướng dẫn Cài đặt & Chạy Dự án](#-hướng-dẫn-cài-đặt--chạy-dự-án)
6. [Biến Môi trường (Environment Variables)](#-biến-môi-trường-environment-variables)
7. [Tài khoản Thử nghiệm (Demo Accounts)](#-tài-khoản-thử-nghiệm-demo-accounts)
8. [Tổng quan API & Tài liệu Swagger](#-tổng-quan-api--tài-liệu-swagger)
9. [Kiểm thử Tự động (Testing)](#-kiểm-thử-tự-động-testing)
10. [Sơ đồ Kiến trúc & Thiết kế (/docs)](#-sơ-đồ-kiến-trúc--thiết-kế-docs)

---

## 🌟 Tính năng Cốt lõi

### 🎓 Phân hệ Sinh viên (User)
- **Xác thực & Bảo mật chuẩn Enterprise**:
  - Đăng ký tài khoản với thanh đo độ mạnh mật khẩu trực quan theo thời gian thực (Zod validation).
  - Đăng nhập bảo mật với JWT Access Token (15 phút, lưu trong bộ nhớ) và Refresh Token (7 ngày, lưu trong `httpOnly` Cookie chống XSS).
  - Quên mật khẩu & đặt lại mật khẩu an toàn thông qua email token.
  - Quản lý hồ sơ cá nhân: Cập nhật thông tin, tải avatar, đổi tiền tệ hiển thị (`VND`, `USD`), đổi mật khẩu, xóa tài khoản.
- **Quản lý Ví tiền Đa năng (Wallets)**:
  - Khởi tạo không giới hạn ví: Tiền mặt, Tài khoản Ngân hàng, Ví điện tử (MoMo, ZaloPay, ShopeePay).
  - Chuyển tiền qua lại giữa các ví (sử dụng Prisma Database Transaction tự động cân bằng số dư).
- **Phân loại Chi tiêu Linh hoạt (Categories)**:
  - Danh mục mặc định hệ thống cùng khả năng tự do tạo danh mục cá nhân.
  - Tự chọn Icon Lucide và bảng màu sắc đặc trưng theo sở thích.
- **Quản lý Giao dịch Thu/Chi (Transactions)**:
  - Bộ lọc nâng cao: Khoảng thời gian, danh mục, loại thu/chi, ví thanh toán, khoảng tiền tối thiểu/tối đa.
  - Tìm kiếm ghi chú tức thì, sắp xếp theo ngày/số tiền, phân trang mượt mà.
  - Xóa một hoặc xóa hàng loạt (Bulk Delete) giao dịch.
  - Xuất dữ liệu giao dịch sang **Excel (.xlsx)** chuyên nghiệp với ExcelJS và file **CSV (.csv)**.
- **Kế hoạch Ngân sách Thông minh (Budgets)**:
  - Thiết lập ngân sách định kỳ theo từng tháng (ngân sách tổng hoặc chi tiết theo từng danh mục).
  - Theo dõi tỷ lệ đã chi tiêu trực quan qua thanh tiến độ đổi màu (An toàn: Xanh/Cam $\rightarrow$ Nguy cơ: Cam $\rightarrow$ Vượt hạn mức: Đỏ san hô).
  - **Tự động kích hoạt thông báo cảnh báo** ngay khi sinh viên phát sinh giao dịch đạt ngưỡng cảnh báo (mặc định 80%) hoặc vượt quá ngân sách.
- **Hũ Tiết kiệm & Tích lũy (Saving Goals)**:
  - Đặt mục tiêu mua sắm laptop, học phí, du lịch, quỹ khẩn cấp.
  - Đóng góp tích lũy từng đợt, hiển thị vòng tiến độ phần trăm và tự động tính toán ngày dự kiến hoàn thành.
- **Báo cáo & Phân tích Chi tiêu (Reports & Dashboard)**:
  - Thẻ tổng quan số dư, thu nhập, chi tiêu và số tiền tiết kiệm trong tháng.
  - Biểu đồ hình tròn Donut phân bổ chi tiêu theo danh mục.
  - Biểu đồ cột/đường so sánh Thu nhập vs Chi tiêu theo chuỗi 6-12 tháng gần nhất.
  - Bảng phân tích biến động chi tiêu so với tháng trước (Month-over-Month - MoM).
  - Xuất báo cáo tài chính định dạng Excel.
- **Trợ lý Tài chính AI "Pocket Assistant" (Google Gemini 2.5 Flash)**:
  - Widget nổi (Floating Widget) truy cập mọi nơi kèm trang hội thoại toàn màn hình (`/chat`).
  - **Context Builder Engine**: Tự động tổng hợp dữ liệu tài chính thật của sinh viên (số dư, thu chi tháng này, cảnh báo ngân sách, mục tiêu tiết kiệm, 20 giao dịch gần nhất) nạp vào prompt.
  - **Strict Grounding Rules**: Chỉ tư vấn tài chính sinh viên, tuyệt đối không bịa đặt số liệu không có trong hồ sơ, từ chối khéo léo các chủ đề ngoài lề, phản hồi theo đúng ngôn ngữ của người dùng.
- **Trung tâm Thông báo (Notifications)**:
  - Chuông thông báo hiển thị số lượng chưa đọc, hỗ trợ đánh dấu đọc từng tin hoặc đọc tất cả.
  - Nhận các thông báo cá nhân (cảnh báo ngân sách) và thông báo phát sóng toàn hệ sinh thái từ Admin.

---

### 🛡️ Phân hệ Quản trị viên (Admin Portal)
- **Admin Dashboard**:
  - Thẻ thống kê tổng quát: Tổng người dùng, người dùng mới trong tuần, tổng số lượng giao dịch toàn hệ thống, người dùng hoạt động/bị khóa, tần suất sử dụng AI.
  - Biểu đồ phân bổ hoạt động của người dùng.
  - **Form Phát sóng Thông báo Hệ thống**: Gửi broadcast notification tới toàn bộ tài khoản người dùng ngay lập tức.
- **Quản lý Người dùng (User Management)**:
  - Bảng tra cứu sinh viên với bộ lọc tìm kiếm theo tên, email, vai trò (`USER`/`ADMIN`), trạng thái (`ACTIVE`/`LOCKED`).
  - **Drawer chi tiết**: Xem đầy đủ ví tiền, mục tiêu tiết kiệm và các chỉ số giao dịch của sinh viên.
  - Thao tác an toàn: Khóa tài khoản vi phạm, mở khóa, chuyển đổi quyền hạn quản trị, xóa tài khoản vĩnh viễn (kèm hộp thoại xác nhận nhiều lớp).
- **Quản lý Danh mục Hệ thống (Default Categories)**:
  - Quản trị toàn bộ danh mục mẫu dùng chung cho toàn bộ sinh viên mới đăng ký.
- **Nhật ký & Thống kê Tương tác AI (Chatbot Logs & Analytics)**:
  - Theo dõi tổng số lượng tin nhắn, số phiên hội thoại, tỷ lệ tin nhắn trung bình trên mỗi phiên.
  - Xem bảng nhật ký chi tiết các đoạn trao đổi kèm modal xem toàn văn câu hỏi và câu trả lời của AI.
- **Nhật ký Kiểm toán (Audit Logs)**:
  - Tự động ghi lại minh bạch và không thể chỉnh sửa mọi thao tác của Admin (khóa user, đổi role, xóa danh mục, phát thông báo).

---

## 🎨 Ngôn ngữ Thiết kế & Bảng màu

Hệ thống giao diện tuân thủ triệt để tinh thần **Editorial Gen-Z Fintech**:
- **Tuyệt đối không sử dụng**: Màu xanh dương/tím (`#3B82F6`, `#6366F1`, `#8B5CF6`), bóng đổ neon hay hiệu ứng glassmorphism mờ đục.
- **Typography**: Font tiêu đề `Bricolage Grotesque` cá tính, font nội dung `DM Sans` dễ đọc.
- **Bảng màu nhận diện**:
  | Mã Màu | Tên Màu | Ứng Dụng |
  | :--- | :--- | :--- |
  | `#123D2F` | **Forest Green (Primary)** | Màu thương hiệu chính, nút hành động chính, thanh điều hướng |
  | `#FF6A2B` | **Tangerine Accent** | Điểm nhấn năng động, trạng thái cảnh báo, huy hiệu Admin |
  | `#D4F05A` | **Electric Lime** | Điểm nhấn trẻ trung, mục tiêu hoàn thành, nút Dark mode |
  | `#FF8A7A` | **Coral Pink** | Khoản chi tiêu (Expense), trạng thái vượt hạn mức, xóa |
  | `#F6F2EA` | **Warm Sand (Light BG)** | Nền dịu mắt phong cách báo in (Light Mode) |
  | `#0E1512` | **Deep Forest (Dark BG)**| Nền tối hiện đại, giảm mỏi mắt (Dark Mode) |
  | `#16211C` | **Deep Ink** | Màu chữ hiển thị độ tương phản cao |

---

## 💻 Công nghệ Sử dụng (Tech Stack)

### Phía Máy chủ (Server)
- **Môi trường & Framework**: Node.js (ES Modules) + Express.js
- **Cơ sở Dữ liệu & ORM**: PostgreSQL 16 + Prisma ORM 5.x
- **Trí tuệ Nhân tạo**: Google Gemini API (`@google/genai` - Gemini 2.5 Flash)
- **Bảo mật & Phân quyền**: JSON Web Token (`jsonwebtoken`), `bcryptjs`, `cookie-parser`, `helmet`, `cors`, `express-rate-limit`
- **Xác thực Dữ liệu (Validation)**: Zod 3.x
- **Báo cáo & Xuất file**: ExcelJS, Nodemailer (Ethereal test mailer)
- **Tài liệu API**: Swagger UI (`swagger-ui-express` với chuẩn OpenAPI 3.0)
- **Kiểm thử**: Jest + Supertest

### Phía Máy khách (Client)
- **Nền tảng**: React 18 + Vite
- **Định kiểu (Styling)**: Tailwind CSS v3 với Custom Color Tokens + Hỗ trợ Dark Mode chuẩn
- **Quản lý Dữ liệu Máy chủ**: TanStack React Query v5 (Caching, Automatic Background Refetching)
- **Biểu mẫu (Forms)**: React Hook Form + Zod Resolvers
- **Biểu đồ (Charts)**: Recharts (Donut Chart, Stacked Bar Chart, MoM Variance)
- **Chuyển động & Biểu tượng**: Framer Motion, Lucide React
- **Định dạng & Markdown**: date-fns, react-markdown
- **Kiểm thử**: Vitest + React Testing Library + JSDOM

---

## 📁 Cấu trúc Thư mục (Monorepo Structure)

```
pocketly/
├── client/                     # Ứng dụng Frontend (React 18 + Vite)
│   ├── src/
│   │   ├── api/                # Cấu hình Axios Interceptors & Service Endpoints
│   │   ├── components/
│   │   │   ├── chatbot/        # Floating Widget & Markdown Chat View
│   │   │   ├── finance/        # Modal nhập giao dịch, bộ chọn ví, danh mục
│   │   │   └── ui/             # Thư viện Reusable UI (Button, Input, Card, Modal, Table...)
│   │   ├── context/            # AuthContext, ThemeContext, ToastContext
│   │   ├── layouts/            # AppLayout, AdminLayout, AuthSplitLayout, PublicLayout
│   │   ├── pages/              # Các trang người dùng, landing page, auth & admin
│   │   │   └── admin/          # Admin Dashboard, Users, Categories, Chatbot, Audit Logs
│   │   ├── routes/             # ProtectedRoute, AdminRoute
│   │   ├── test/               # Vitest test suites (Button, LoginForm, TransactionForm)
│   │   ├── App.jsx             # React Router v6 setup
│   │   └── index.css           # Cấu hình font chữ & Tailwind base layer
│   ├── tailwind.config.js      # Bảng màu Gen-Z Fintech tokens
│   └── vite.config.js          # Cấu hình build & Vitest test runner
│
├── server/                     # Ứng dụng Backend API (Node.js + Express)
│   ├── prisma/
│   │   ├── schema.prisma       # Mô hình CSDL chuẩn PostgreSQL
│   │   └── seed.js             # Dữ liệu khởi tạo mẫu (Admin, Demo Users, 160+ transactions)
│   ├── src/
│   │   ├── config/             # Kết nối Prisma, biến môi trường, Swagger doc
│   │   ├── controllers/        # Điều hướng nghiệp vụ request/response
│   │   ├── middlewares/        # Auth JWT, Admin role, Rate limit, Multer, Error handler
│   │   ├── routes/             # Khai báo các API routes v1
│   │   ├── services/           # Logic nghiệp vụ (Finance, Chatbot Context Builder, Admin)
│   │   ├── utils/              # Token hashing, response formatter, export Excel/CSV
│   │   ├── validators/         # Schema kiểm tra dữ liệu đầu vào Zod
│   │   ├── app.js              # Khởi tạo Express App & Middlewares
│   │   └── server.js           # Điểm khởi chạy server
│   ├── tests/                  # Jest test suites (Auth, Transactions, Budgets)
│   └── jest.config.js          # Cấu hình Jest cho ES Modules
│
├── docs/                       # Tài liệu & Sơ đồ Thiết kế Hệ thống
│   ├── erd.md                  # Sơ đồ Cơ sở Dữ liệu (Mermaid ERD)
│   ├── use-cases.md            # Sơ đồ Ca sử dụng (Mermaid Use-case Diagram)
│   ├── chatbot-sequence.md     # Sơ đồ Tuần tự Trợ lý AI (Mermaid Sequence Diagram)
│   └── README.md               # Mục lục tài liệu kiến trúc
│
├── docker-compose.yml          # Cấu hình PostgreSQL 16 container
├── package.json                # Monorepo NPM Workspaces
└── README.md                   # Tài liệu hướng dẫn chính
```

---

## 🚀 Hướng dẫn Cài đặt & Chạy Dự án

### 1. Yêu cầu Tiên quyết
- **Node.js**: v18.0.0 hoặc v20+ trở lên.
- **Docker & Docker Desktop**: Để chạy cơ sở dữ liệu PostgreSQL cục bộ.

### 2. Khởi động Cơ sở Dữ liệu PostgreSQL
Tại thư mục gốc `pocketly/`, mở terminal và chạy:
```bash
docker compose up -d
```
Container PostgreSQL sẽ được tạo và lắng nghe tại cổng `5432`.

### 3. Cài đặt & Khởi tạo Máy chủ (Server)
```bash
cd server

# Cài đặt các thư viện phụ thuộc
npm install

# Tạo file cấu hình môi trường từ mẫu
cp .env.example .env

# Sinh mã Prisma Client và chạy Migration
npm run db:generate
npm run db:migrate

# Nạp dữ liệu mẫu phong phú (~160 giao dịch, ví tiền, ngân sách, mục tiêu, admin)
npm run db:seed

# Khởi chạy server ở chế độ phát triển
npm run dev
```
Máy chủ API sẽ hoạt động tại địa chỉ: `http://localhost:5000`

Kiểm tra trạng thái server:
```bash
curl http://localhost:5000/api/v1/health
```

### 4. Cài đặt & Khởi tạo Máy khách (Client)
Tại một cửa sổ terminal mới:
```bash
cd client

# Cài đặt các thư viện phụ thuộc
npm install

# Khởi chạy giao diện React Vite
npm run dev
```
Ứng dụng giao diện sẽ sẵn sàng tại: `http://localhost:5173`

---

## 🔑 Biến Môi trường (Environment Variables)

### Cấu hình Backend (`server/.env`)
```env
# Cổng chạy máy chủ
PORT=5000
NODE_ENV=development

# Kết nối cơ sở dữ liệu PostgreSQL (Docker container)
DATABASE_URL="postgresql://pocketly:pocketly_secret_2026@localhost:5432/pocketly_db?schema=public"

# Chuỗi bí mật ký JSON Web Token
JWT_ACCESS_SECRET="pocketly_super_secure_access_secret_key_2026_jwt"
JWT_REFRESH_SECRET="pocketly_super_secure_refresh_secret_key_2026_jwt"
JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# Địa chỉ Web Client (cho CORS)
CLIENT_URL="http://localhost:5173"

# Google Gemini API Key (dùng cho AI Chatbot Pocket Assistant)
GEMINI_API_KEY="YOUR_GEMINI_API_KEY_HERE"
```

---

## 👤 Tài khoản Thử nghiệm (Demo Accounts)

Sau khi chạy lệnh `npm run db:seed`, cơ sở dữ liệu đã có sẵn các tài khoản sau để kiểm thử:

| Nhóm Tài Khoản | Địa chỉ Email | Mật khẩu | Quyền hạn | Dữ liệu khởi tạo |
| :--- | :--- | :--- | :--- | :--- |
| **Quản trị viên (Admin)** | `admin@pocketly.com` | `Admin@123` | `ADMIN` | Truy cập toàn bộ Cổng Admin (`/admin`), xem thống kê, quản lý người dùng, audit logs. |
| **Sinh viên Demo 1** | `user1@pocketly.com` | `User@123` | `USER` | Có sẵn 3 ví tiền, ~160 giao dịch chi tiết qua 6 tháng, ngân sách, mục tiêu tiết kiệm. |
| **Sinh viên Demo 2** | `user2@pocketly.com` | `User@123` | `USER` | Dữ liệu tài chính sinh viên phong phú phục vụ kiểm thử song song. |

---

## 📖 Tổng quan API & Tài liệu Swagger

Tài liệu tương tác trực quan Swagger UI (OpenAPI 3.0) tích hợp sẵn tại:  
👉 **`http://localhost:5000/api/docs`**

### Bảng tóm tắt Endpoints chính:

| Phân hệ | Phương thức | Endpoint | Chức năng | Phân quyền |
| :--- | :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/api/v1/auth/register` | Đăng ký tài khoản sinh viên mới | Public |
| | `POST` | `/api/v1/auth/login` | Đăng nhập hệ thống (nhận JWT & HttpOnly Cookie) | Public |
| | `POST` | `/api/v1/auth/refresh-token` | Tự động làm mới Access Token | Public |
| | `POST` | `/api/v1/auth/logout` | Đăng xuất & thu hồi Refresh Token | Public |
| | `GET` | `/api/v1/auth/me` | Lấy thông tin tài khoản hiện tại | User / Admin |
| **Wallets** | `GET / POST` | `/api/v1/wallets` | Lấy danh sách ví / Tạo ví mới | User |
| | `POST` | `/api/v1/wallets/transfer` | Chuyển tiền giữa 2 ví (Prisma Transaction) | User |
| **Categories** | `GET / POST` | `/api/v1/categories` | Lấy danh sách danh mục / Tạo danh mục mới | User |
| **Transactions** | `GET / POST` | `/api/v1/transactions` | Tra cứu có bộ lọc / Tạo giao dịch mới | User |
| | `POST` | `/api/v1/transactions/bulk-delete` | Xóa hàng loạt giao dịch đã chọn | User |
| | `GET` | `/api/v1/transactions/export/excel` | Xuất danh sách giao dịch sang file Excel | User |
| | `GET` | `/api/v1/transactions/export/csv` | Xuất danh sách giao dịch sang file CSV | User |
| **Budgets** | `GET` | `/api/v1/budgets` | Lấy trạng thái ngân sách tháng (đã tiêu vs hạn mức) | User |
| | `POST` | `/api/v1/budgets` | Tạo / Cập nhật hạn mức ngân sách tháng | User |
| **Saving Goals** | `GET / POST` | `/api/v1/saving-goals` | Danh sách mục tiêu / Tạo mục tiêu tích lũy | User |
| | `POST` | `/api/v1/saving-goals/:id/contribute` | Đóng góp thêm tiền vào mục tiêu tiết kiệm | User |
| **Reports** | `GET` | `/api/v1/reports/summary` | Tóm tắt số dư, thu nhập, chi tiêu tháng | User |
| | `GET` | `/api/v1/reports/category-spending` | Thống kê tỷ trọng chi tiêu theo danh mục (Donut) | User |
| | `GET` | `/api/v1/reports/trends` | Biến động thu nhập vs chi tiêu qua các tháng | User |
| **Chatbot AI** | `POST` | `/api/v1/chat/sessions` | Khởi tạo phiên trò chuyện tài chính mới | User |
| | `POST` | `/api/v1/chat/sessions/:id/messages` | Gửi câu hỏi & nhận tư vấn thông minh từ Gemini | User |
| **Admin** | `GET` | `/api/v1/admin/dashboard` | Thống kê số liệu toàn bộ nền tảng | Admin |
| | `GET` | `/api/v1/admin/users` | Quản lý danh sách người dùng & phân trang | Admin |
| | `PATCH` | `/api/v1/admin/users/:id/status` | Khóa / Mở khóa tài khoản sinh viên | Admin |
| | `POST` | `/api/v1/admin/broadcast` | Phát sóng thông báo khẩn cấp toàn hệ sinh thái | Admin |
| | `GET` | `/api/v1/admin/audit-logs` | Xem lịch sử nhật ký kiểm toán hệ thống | Admin |

---

## 🧪 Kiểm thử Tự động (Testing)

Dự án áp dụng chiến lược kiểm thử tự động toàn diện trên cả 2 tầng:

### 1. Kiểm thử Backend (`/server`) với Jest & Supertest
Kiểm thử tích hợp các endpoint xác thực (`Auth`), xử lý giao dịch (`Transactions`) và ngân sách (`Budgets`):
```bash
cd server
npm test
```
*Kết quả:* **17/17 test cases vượt qua thành công 100%**.

### 2. Kiểm thử Frontend (`/client`) với Vitest & React Testing Library
Kiểm thử Unit & Component đối với các thành phần cốt lõi:
- **Button Component**: Kiểm tra kết xuất, sự kiện click, trạng thái disabled, biểu tượng xoay `isLoading`, các biến thể màu sắc (danger, lime, primary).
- **Login Form**: Kiểm tra nhập liệu email/mật khẩu, submit form, hiển thị thông báo lỗi khi xác thực thất bại.
- **Transaction Form**: Kiểm tra hiển thị đầy đủ trường số tiền, danh mục, ví, ngày; chuyển đổi tab Thu/Chi; kiểm tra validate số tiền dương; nạp dữ liệu chỉnh sửa giao dịch cũ.
```bash
cd client
npm test
```

---

## 📊 Sơ đồ Kiến trúc & Thiết kế (/docs)

Để tìm hiểu sâu hơn về kiến trúc hệ thống, mời bạn xem các tài liệu chuyên biệt đi kèm sơ đồ Mermaid tại thư mục `/docs`:

1. **[Sơ đồ Thực thể Quan hệ (ERD)](file:///c:/Nam4/CNPMM/pocketly/docs/erd.md)**: Chi tiết toàn bộ 11 bảng CSDL PostgreSQL, khóa chính, khóa ngoại và chỉ mục hiệu năng.
2. **[Sơ đồ Ca sử dụng (Use Cases)](file:///c:/Nam4/CNPMM/pocketly/docs/use-cases.md)**: Bản đồ toàn diện mọi luồng nghiệp vụ của Sinh viên, Admin và kết nối với Google Gemini Engine.
3. **[Sơ đồ Tuần tự Trợ lý AI (Chatbot Flow)](file:///c:/Nam4/CNPMM/pocketly/docs/chatbot-sequence.md)**: Minh họa chi tiết quy trình xử lý tin nhắn từ Client $\rightarrow$ Rate Limiter $\rightarrow$ Context Builder $\rightarrow$ Google Gemini API $\rightarrow$ Database $\rightarrow$ Client.

---

*Pocketly - Smart Money for Gen-Z Students 🌿*
