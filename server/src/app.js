import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import swaggerUi from 'swagger-ui-express';
import { config } from './config/index.js';
import { swaggerDocument } from './config/swagger.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { errorResponse } from './utils/response.js';

// Route imports
import healthRoutes from './routes/health.routes.js';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import categoryRoutes from './routes/category.routes.js';
import walletRoutes from './routes/wallet.routes.js';
import transactionRoutes from './routes/transaction.routes.js';
import budgetRoutes from './routes/budget.routes.js';
import savingGoalRoutes from './routes/savingGoal.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import reportRoutes from './routes/report.routes.js';
import chatbotRoutes from './routes/chatbot.routes.js';
import adminRoutes from './routes/admin.routes.js';
import supportRoutes from './routes/support.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.resolve(__dirname, '../uploads');

const app = express();

// Security middlewares (cho phép nạp tài nguyên swagger UI và ảnh đại diện tĩnh đa nguồn an toàn)
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  })
);
app.use(
  cors({
    origin: (origin, callback) => {
      // Cho phép localhost và IP nội bộ
      const allowed = [
        config.clientUrl,
        'http://localhost:5173',
        'http://192.168.168.135:5173'
      ];
      if (!origin || allowed.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
  })
);

// Rate limiter for general API routes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    data: null,
    message: 'Quá nhiều yêu cầu từ địa chỉ này, vui lòng thử lại sau 15 phút.',
    errors: null
  }
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use('/api', apiLimiter);

// Serve static upload files (avatars) với header CORS/CORP cross-origin
app.use(
  '/uploads',
  (req, res, next) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
  },
  express.static(uploadsDir)
);

// Swagger API Documentation (Tài liệu OpenAPI 3.0)
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Base API v1 Routes
app.use('/api/v1', healthRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/wallets', walletRoutes);
app.use('/api/v1/transactions', transactionRoutes);
app.use('/api/v1/budgets', budgetRoutes);
app.use('/api/v1/saving-goals', savingGoalRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/reports', reportRoutes);
app.use('/api/v1/chat', chatbotRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/support', supportRoutes);

// 404 Handler
app.use((req, res) => {
  return errorResponse(res, {
    status: 404,
    message: `Không tìm thấy endpoint: ${req.method} ${req.originalUrl}`
  });
});

// Centralized Error Handler Middleware
app.use(errorHandler);

export default app;
