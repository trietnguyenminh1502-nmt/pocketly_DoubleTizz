# Sơ đồ Thực thể Quan hệ (Entity-Relationship Diagram - ERD)

Tài liệu này mô tả cấu trúc cơ sở dữ liệu của hệ thống **Pocketly** được xây dựng trên **PostgreSQL** và quản lý thông qua **Prisma ORM**.

```mermaid
erDiagram
    users ||--o{ refresh_tokens : "has"
    users ||--o{ password_reset_tokens : "has"
    users ||--o{ wallets : "owns"
    users ||--o{ categories : "creates"
    users ||--o{ transactions : "performs"
    users ||--o{ budgets : "defines"
    users ||--o{ saving_goals : "targets"
    users ||--o{ notifications : "receives"
    users ||--o{ chat_sessions : "starts"
    users ||--o{ audit_logs : "records_admin_actions"

    wallets ||--o{ transactions : "records"
    categories ||--o{ transactions : "classifies"
    categories ||--o{ budgets : "limits"

    chat_sessions ||--o{ chat_messages : "contains"

    users {
        uuid id PK
        string fullName
        string email UK
        string passwordHash
        string avatarUrl
        string role "USER | ADMIN"
        string status "ACTIVE | LOCKED"
        string currency "VND"
        boolean emailVerified
        datetime createdAt
        datetime updatedAt
    }

    refresh_tokens {
        uuid id PK
        uuid userId FK
        string tokenHash UK
        datetime expiresAt
        boolean revoked
        datetime createdAt
    }

    password_reset_tokens {
        uuid id PK
        uuid userId FK
        string tokenHash UK
        datetime expiresAt
        boolean used
        datetime createdAt
    }

    categories {
        uuid id PK
        string name
        string icon
        string color
        string type "INCOME | EXPENSE"
        boolean isDefault
        uuid userId FK "null for system default"
        datetime createdAt
        datetime updatedAt
    }

    wallets {
        uuid id PK
        uuid userId FK
        string name
        decimal balance
        string icon
        datetime createdAt
        datetime updatedAt
    }

    transactions {
        uuid id PK
        uuid userId FK
        uuid categoryId FK
        uuid walletId FK
        string type "INCOME | EXPENSE"
        decimal amount
        string note
        datetime date
        datetime createdAt
        datetime updatedAt
    }

    budgets {
        uuid id PK
        uuid userId FK
        uuid categoryId FK "null for overall monthly"
        decimal amount
        int month
        int year
        int alertThreshold "default 80%"
        datetime createdAt
        datetime updatedAt
    }

    saving_goals {
        uuid id PK
        uuid userId FK
        string title
        decimal targetAmount
        decimal currentAmount
        datetime deadline
        datetime createdAt
        datetime updatedAt
    }

    notifications {
        uuid id PK
        uuid userId FK "null for broadcast"
        string title
        string message
        string type "INFO | WARNING | BUDGET_ALERT | SYSTEM"
        boolean isRead
        datetime createdAt
    }

    chat_sessions {
        uuid id PK
        uuid userId FK
        string title
        datetime createdAt
        datetime updatedAt
    }

    chat_messages {
        uuid id PK
        uuid sessionId FK
        string role "user | model"
        text content
        datetime createdAt
    }

    audit_logs {
        uuid id PK
        uuid adminId FK
        string action
        string targetId
        datetime createdAt
    }
```

## Diễn giải Mối quan hệ
1. **User (Người dùng)**:
   - Là thực thể trung tâm, liên kết với hầu hết các dữ liệu tài chính (Ví, Giao dịch, Danh mục tùy chỉnh, Ngân sách, Mục tiêu, Phiên tư vấn AI).
   - Có cờ `role` (`USER` hoặc `ADMIN`) và `status` (`ACTIVE` hoặc `LOCKED`).
2. **Category (Danh mục)**:
   - Nếu `userId` là `null`, đây là **Danh mục Mặc định của Hệ thống** (do Admin quản lý).
   - Nếu `userId` có giá trị, đây là **Danh mục Tùy chỉnh** do sinh viên tự tạo.
3. **Transaction (Giao dịch)**:
   - Thuộc về một người dùng, liên kết với một `Wallet` (để cộng/trừ số dư theo cơ chế transaction) và một `Category`.
4. **Budget (Ngân sách)**:
   - Hỗ trợ ngân sách theo từng danh mục hoặc ngân sách tổng toàn tháng (`categoryId` = null).
   - Có `alertThreshold` (mặc định 80%) để kích hoạt thông báo tự động khi sinh viên sắp vượt giới hạn.
5. **Notification (Thông báo)**:
   - Hỗ trợ cả thông báo cá nhân (`userId` cụ thể) và thông báo phát sóng toàn hệ thống (`userId` = null).
6. **ChatSession & ChatMessage**:
   - Lưu trữ lịch sử hội thoại tài chính với Google Gemini AI, giúp duy trì ngữ cảnh khi sinh viên đặt câu hỏi liên tiếp.
7. **AuditLog**:
   - Tự động ghi lại các hành động nhạy cảm của Admin (Khóa tài khoản, Thay đổi danh mục hệ thống, Phát sóng thông báo) phục vụ kiểm toán an ninh.
