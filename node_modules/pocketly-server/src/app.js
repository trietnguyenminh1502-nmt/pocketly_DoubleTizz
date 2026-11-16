import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { config } from './config/index.js';
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

const app = express();

// Security middlewares
app.use(helmet());
app.use(
  cors({
    origin: config.clientUrl,
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

// Serve static upload files (avatars)
app.use('/uploads', express.static(path.resolve('uploads')));

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
