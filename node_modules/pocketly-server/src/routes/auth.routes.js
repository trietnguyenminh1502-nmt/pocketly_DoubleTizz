import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { AuthController } from '../controllers/auth.controller.js';
import { authenticate } from '../middlewares/auth.js';

const router = Router();

// Rate limiting riêng cho các endpoint nhạy cảm (auth)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 30, // Tối đa 30 lần thử
  message: {
    success: false,
    data: null,
    message: 'Quá nhiều yêu cầu đăng nhập/xác thực. Vui lòng thử lại sau 15 phút.',
    errors: null
  }
});

router.post('/register', authLimiter, AuthController.register);
router.post('/login', authLimiter, AuthController.login);
router.post('/refresh-token', AuthController.refreshToken);
router.post('/logout', AuthController.logout);
router.post('/forgot-password', authLimiter, AuthController.forgotPassword);
router.post('/reset-password', authLimiter, AuthController.resetPassword);
router.post('/verify-email', AuthController.verifyEmail);

// Magic link confirmation
router.get('/confirm-reset', AuthController.confirmReset);
router.post('/check-reset-status', AuthController.checkResetStatus);

// Yêu cầu xác thực JWT
router.get('/me', authenticate, AuthController.getMe);

export default router;
