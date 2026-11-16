# Sơ đồ Tuần tự Luồng Chatbot AI (Chatbot Sequence Diagram)

Tài liệu này mô tả chi tiết luồng xử lý tương tác giữa Sinh viên, Giao diện Web, Backend Server, Cơ sở dữ liệu và Google Gemini API khi sinh viên gửi câu hỏi cho Trợ lý tài chính **Pocket Assistant**.

```mermaid
sequenceDiagram
    autonumber
    actor Student as 🎓 Sinh viên (Client)
    participant ChatUI as 💻 Pocket Chat UI
    participant Server as ⚡ Pocketly Server (Express API)
    participant RateLimiter as 🛡️ Chat Rate Limiter
    participant ContextBuilder as 🧠 Context Builder Service
    participant Database as 🗄️ PostgreSQL (Prisma ORM)
    participant GeminiAPI as 🤖 Google Gemini API (2.5 Flash)

    Student->>ChatUI: Nhập câu hỏi (ví dụ: "Tháng này tôi đã tiêu bao nhiêu cho ăn uống?")
    ChatUI->>Server: POST /api/v1/chat/sessions/:id/messages { content }
    Note over Server: Kiểm tra JWT Token & Scoped User ID

    Server->>RateLimiter: Kiểm tra hạn mức gọi tin nhắn của người dùng
    alt Vượt quá rate limit (e.g. > 15 req/phút)
        RateLimiter-->>Server: Rate limit exceeded
        Server-->>ChatUI: 429 Too Many Requests (Vui lòng đợi vài giây)
        ChatUI-->>Student: Hiển thị thông báo giới hạn tốc độ
    else Trong hạn mức cho phép
        RateLimiter-->>Server: Passed

        Server->>Database: Lưu tin nhắn của sinh viên (role: "user")
        Database-->>Server: ChatMessage (user) saved

        Server->>ContextBuilder: buildUserFinancialContext(userId)
        
        activate ContextBuilder
        par Thu thập dữ liệu tài chính người dùng
            ContextBuilder->>Database: Lấy tổng thu nhập & chi tiêu tháng hiện tại
            ContextBuilder->>Database: Lấy Top danh mục chi tiêu nhiều nhất
            ContextBuilder->>Database: Lấy trạng thái cảnh báo ngân sách
            ContextBuilder->>Database: Lấy tiến độ các mục tiêu tiết kiệm
            ContextBuilder->>Database: Lấy 20 giao dịch gần nhất
        end
        Database-->>ContextBuilder: Trả về tập dữ liệu tài chính thực tế
        ContextBuilder-->>Server: Trả về context summary (dưới dạng văn bản có cấu trúc)
        deactivate ContextBuilder

        Server->>Database: Lấy 10 tin nhắn gần nhất trong ChatSession để làm hội thoại ngữ cảnh
        Database-->>Server: Return recent conversation history

        Note over Server: Ráp System Prompt nghiêm ngặt:<br/>1. Chỉ trả lời tài chính cá nhân sinh viên<br/>2. Không bịa đặt số liệu không có trong context<br/>3. Đưa ra mẹo tiết kiệm thực tế, thân thiện sinh viên<br/>4. Trả lời đúng ngôn ngữ người dùng

        Server->>GeminiAPI: generateContent({ contents: [SystemInstruction, Context, ...History, NewMessage] })
        activate GeminiAPI
        GeminiAPI-->>Server: Response generated (Markdown text)
        deactivate GeminiAPI

        Server->>Database: Lưu phản hồi của AI (role: "model")
        Database-->>Server: ChatMessage (model) saved

        Server-->>ChatUI: 200 OK { status: "success", data: { message: modelMessage } }
        ChatUI-->>Student: Hiển thị phản hồi với hiệu ứng Markdown, danh sách gợi ý tiếp theo
    end
```

## Các Quy tắc Bảo vệ Ngữ cảnh & Hệ thống

1. **Bảo mật dữ liệu tuyệt đối (Data Isolation)**:
   - Dữ liệu tài chính sinh viên được truy vấn đúng theo `req.user.id` từ JWT đã xác thực. Không có rò rỉ dữ liệu giữa các sinh viên.
2. **Không ảo giác số liệu (Grounding / Anti-hallucination)**:
   - Hệ thống nghiêm cấm Gemini API tự suy đoán số dư hoặc số tiền ngoài các số liệu đã được `ContextBuilder` tổng hợp từ PostgreSQL.
3. **Phục hồi lỗi êm dịu (Graceful Degradation)**:
   - Khi Gemini API gặp sự cố mạng hoặc quá tải quota, hệ thống bắt lỗi và trả về phản hồi lịch sự, không làm treo ứng dụng client.
