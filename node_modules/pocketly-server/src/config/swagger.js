export const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Pocketly API 🌿',
    version: '1.0.0',
    description: 'API documentation for Pocketly - Student Expense Tracker with AI Chatbot',
    contact: {
      name: 'Pocketly Support',
      email: 'support@pocketly.com'
    }
  },
  servers: [
    {
      url: 'http://localhost:5000/api/v1',
      description: 'Local Development Server'
    }
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Nhập JWT access token nhận được từ endpoint /auth/login'
      }
    }
  },
  security: [{ BearerAuth: [] }],
  paths: {
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Kiểm tra trạng thái server và database',
        security: [],
        responses: { 200: { description: 'API và Database hoạt động tốt' } }
      }
    },
    '/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Đăng ký tài khoản người dùng mới',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['fullName', 'email', 'password'],
                properties: {
                  fullName: { type: 'string', example: 'Nguyễn Văn A' },
                  email: { type: 'string', example: 'student@pocketly.com' },
                  password: { type: 'string', example: 'Student@123' },
                  currency: { type: 'string', example: 'VND' }
                }
              }
            }
          }
        },
        responses: { 201: { description: 'Đăng ký thành công' } }
      }
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Đăng nhập người dùng',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', example: 'user1@pocketly.com' },
                  password: { type: 'string', example: 'User@123' }
                }
              }
            }
          }
        },
        responses: { 200: { description: 'Đăng nhập thành công, trả về Access Token và httpOnly Cookie' } }
      }
    },
    '/auth/refresh-token': {
      post: {
        tags: ['Auth'],
        summary: 'Làm mới Access Token thông qua Refresh Token cookie',
        security: [],
        responses: { 200: { description: 'Cấp token mới thành công' } }
      }
    },
    '/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Đăng xuất người dùng và thu hồi refresh token',
        responses: { 200: { description: 'Đăng xuất thành công' } }
      }
    },
    '/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Lấy thông tin người dùng hiện tại đang đăng nhập',
        responses: { 200: { description: 'Thông tin tài khoản' } }
      }
    },
    '/users/profile': {
      get: {
        tags: ['User Profile'],
        summary: 'Xem chi tiết hồ sơ cá nhân',
        responses: { 200: { description: 'Profile cá nhân' } }
      },
      patch: {
        tags: ['User Profile'],
        summary: 'Cập nhật họ tên, đơn vị tiền tệ',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  fullName: { type: 'string', example: 'Nguyễn Minh Trí' },
                  currency: { type: 'string', example: 'VND' }
                }
              }
            }
          }
        },
        responses: { 200: { description: 'Cập nhật thành công' } }
      }
    },
    '/categories': {
      get: {
        tags: ['Categories'],
        summary: 'Lấy danh mục (hệ thống + riêng của user)',
        parameters: [{ in: 'query', name: 'type', schema: { type: 'string', enum: ['INCOME', 'EXPENSE'] } }],
        responses: { 200: { description: 'Danh sách danh mục' } }
      },
      post: {
        tags: ['Categories'],
        summary: 'Tạo danh mục riêng của user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'icon', 'color', 'type'],
                properties: {
                  name: { type: 'string', example: 'Trà sữa & Ăn vặt' },
                  icon: { type: 'string', example: 'Coffee' },
                  color: { type: 'string', example: '#FF6A2B' },
                  type: { type: 'string', enum: ['INCOME', 'EXPENSE'] }
                }
              }
            }
          }
        },
        responses: { 201: { description: 'Tạo danh mục thành công' } }
      }
    },
    '/wallets': {
      get: {
        tags: ['Wallets'],
        summary: 'Lấy danh sách các ví và tổng số dư tài sản',
        responses: { 200: { description: 'Danh sách ví và tổng số dư' } }
      },
      post: {
        tags: ['Wallets'],
        summary: 'Tạo ví mới',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name'],
                properties: {
                  name: { type: 'string', example: 'Ví MoMo Sinh Viên' },
                  balance: { type: 'number', example: 500000 },
                  icon: { type: 'string', example: 'Smartphone' }
                }
              }
            }
          }
        },
        responses: { 201: { description: 'Tạo ví thành công' } }
      }
    },
    '/wallets/transfer': {
      post: {
        tags: ['Wallets'],
        summary: 'Chuyển tiền giữa 2 ví (Prisma ACID Transaction)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['fromWalletId', 'toWalletId', 'amount'],
                properties: {
                  fromWalletId: { type: 'string', format: 'uuid' },
                  toWalletId: { type: 'string', format: 'uuid' },
                  amount: { type: 'number', example: 200000 },
                  note: { type: 'string', example: 'Rút tiền ATM nạp vào ví tiền mặt' }
                }
              }
            }
          }
        },
        responses: { 200: { description: 'Chuyển tiền thành công' } }
      }
    },
    '/transactions': {
      get: {
        tags: ['Transactions'],
        summary: 'Lấy danh sách giao dịch có lọc, tìm kiếm, sắp xếp và phân trang',
        parameters: [
          { in: 'query', name: 'startDate', schema: { type: 'string' } },
          { in: 'query', name: 'endDate', schema: { type: 'string' } },
          { in: 'query', name: 'categoryId', schema: { type: 'string' } },
          { in: 'query', name: 'type', schema: { type: 'string', enum: ['INCOME', 'EXPENSE'] } },
          { in: 'query', name: 'walletId', schema: { type: 'string' } },
          { in: 'query', name: 'search', schema: { type: 'string' } },
          { in: 'query', name: 'page', schema: { type: 'integer', default: 1 } },
          { in: 'query', name: 'limit', schema: { type: 'integer', default: 20 } }
        ],
        responses: { 200: { description: 'Danh sách giao dịch' } }
      },
      post: {
        tags: ['Transactions'],
        summary: 'Thêm giao dịch mới (Tự động cập nhật số dư ví & kiểm tra ngân sách)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['walletId', 'categoryId', 'type', 'amount'],
                properties: {
                  walletId: { type: 'string', format: 'uuid' },
                  categoryId: { type: 'string', format: 'uuid' },
                  type: { type: 'string', enum: ['INCOME', 'EXPENSE'] },
                  amount: { type: 'number', example: 35000 },
                  note: { type: 'string', example: 'Cơm sườn trưa' },
                  date: { type: 'string', format: 'date-time' }
                }
              }
            }
          }
        },
        responses: { 201: { description: 'Tạo giao dịch thành công' } }
      }
    },
    '/transactions/export/excel': {
      get: {
        tags: ['Transactions'],
        summary: 'Xuất dữ liệu giao dịch ra file Excel (.xlsx)',
        responses: { 200: { description: 'File Excel đính kèm' } }
      }
    },
    '/transactions/export/csv': {
      get: {
        tags: ['Transactions'],
        summary: 'Xuất dữ liệu giao dịch ra file CSV (.csv)',
        responses: { 200: { description: 'File CSV đính kèm' } }
      }
    },
    '/budgets': {
      get: {
        tags: ['Budgets'],
        summary: 'Lấy trạng thái ngân sách (spent, limit, percentage, status)',
        parameters: [
          { in: 'query', name: 'month', schema: { type: 'integer' } },
          { in: 'query', name: 'year', schema: { type: 'integer' } }
        ],
        responses: { 200: { description: 'Trạng thái ngân sách' } }
      },
      post: {
        tags: ['Budgets'],
        summary: 'Tạo ngân sách mới cho danh mục hoặc toàn tháng',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['amount', 'month', 'year'],
                properties: {
                  categoryId: { type: 'string', format: 'uuid', nullable: true },
                  amount: { type: 'number', example: 2000000 },
                  month: { type: 'integer', example: 11 },
                  year: { type: 'integer', example: 2026 },
                  alertThreshold: { type: 'integer', default: 80 }
                }
              }
            }
          }
        },
        responses: { 201: { description: 'Thiết lập ngân sách thành công' } }
      }
    },
    '/saving-goals': {
      get: {
        tags: ['Saving Goals'],
        summary: 'Lấy danh sách mục tiêu tiết kiệm, tiến độ % và ngày dự kiến hoàn thành',
        responses: { 200: { description: 'Danh sách mục tiêu' } }
      },
      post: {
        tags: ['Saving Goals'],
        summary: 'Tạo mục tiêu tiết kiệm mới',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['title', 'targetAmount'],
                properties: {
                  title: { type: 'string', example: 'Đổi Laptop mới' },
                  targetAmount: { type: 'number', example: 15000000 },
                  currentAmount: { type: 'number', example: 3000000 },
                  deadline: { type: 'string', format: 'date' }
                }
              }
            }
          }
        },
        responses: { 201: { description: 'Tạo mục tiêu thành công' } }
      }
    },
    '/reports/summary': {
      get: {
        tags: ['Reports & Dashboard'],
        summary: 'Tổng quan tài chính Dashboard (Số dư, Thu/Chi tháng, Tiết kiệm, MoM)',
        responses: { 200: { description: 'Báo cáo tổng quan' } }
      }
    },
    '/reports/category-spending': {
      get: {
        tags: ['Reports & Dashboard'],
        summary: 'Cơ cấu chi tiêu theo danh mục (Biểu đồ Donut)',
        responses: { 200: { description: 'Phần trăm chi tiêu từng danh mục' } }
      }
    },
    '/reports/trends': {
      get: {
        tags: ['Reports & Dashboard'],
        summary: 'Xu hướng thu chi 6 đến 12 tháng gần nhất (Biểu đồ cột)',
        responses: { 200: { description: 'Dữ liệu xu hướng thu chi' } }
      }
    },
    '/chat/sessions': {
      get: {
        tags: ['AI Chatbot'],
        summary: 'Danh sách các phiên tư vấn tài chính',
        responses: { 200: { description: 'Danh sách phiên chat' } }
      },
      post: {
        tags: ['AI Chatbot'],
        summary: 'Tạo phiên tư vấn tài chính mới',
        responses: { 201: { description: 'Tạo phiên chat thành công' } }
      }
    },
    '/chat/sessions/{sessionId}/messages': {
      get: {
        tags: ['AI Chatbot'],
        summary: 'Lấy lịch sử tin nhắn trong phiên trò chuyện',
        parameters: [{ in: 'path', name: 'sessionId', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Lịch sử tin nhắn' } }
      },
      post: {
        tags: ['AI Chatbot'],
        summary: 'Gửi câu hỏi và nhận câu trả lời tư vấn từ Gemini AI',
        parameters: [{ in: 'path', name: 'sessionId', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['content'],
                properties: {
                  content: { type: 'string', example: 'Tháng này mình còn bao nhiêu tiền và nên tiết kiệm khoản nào?' }
                }
              }
            }
          }
        },
        responses: { 200: { description: 'Câu trả lời của AI' } }
      }
    },
    '/admin/dashboard': {
      get: {
        tags: ['Admin'],
        summary: 'Thống kê tổng quan hệ thống (chỉ dành cho ADMIN)',
        responses: { 200: { description: 'Số liệu tổng quan' } }
      }
    },
    '/admin/users': {
      get: {
        tags: ['Admin'],
        summary: 'Danh sách người dùng hệ thống có tìm kiếm, lọc, phân trang',
        responses: { 200: { description: 'Danh sách users' } }
      }
    },
    '/admin/broadcast': {
      post: {
        tags: ['Admin'],
        summary: 'Phát sóng thông báo toàn hệ thống (Broadcast Notification)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['title', 'message'],
                properties: {
                  title: { type: 'string', example: 'Bảo trì hệ thống định kỳ' },
                  message: { type: 'string', example: 'Pocketly sẽ bảo trì nâng cấp vào lúc 02:00 sáng mai.' },
                  type: { type: 'string', example: 'SYSTEM' }
                }
              }
            }
          }
        },
        responses: { 201: { description: 'Đã gửi thông báo đến toàn bộ người dùng' } }
      }
    },
    '/admin/audit-logs': {
      get: {
        tags: ['Admin'],
        summary: 'Lấy lịch sử nhật ký kiểm tra hành động Admin (Audit Log)',
        responses: { 200: { description: 'Danh sách audit logs' } }
      }
    }
  }
};
