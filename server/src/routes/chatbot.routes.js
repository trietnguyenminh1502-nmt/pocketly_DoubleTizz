import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { ChatbotController } from '../controllers/chatbot.controller.js';
import { authenticate } from '../middlewares/auth.js';

const router = Router();

router.use(authenticate);

// Per-user rate limiting cho Chatbot: tối đa 20 tin nhắn / 1 phút để tránh spam API
const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  keyGenerator: (req) => req.user?.id || req.ip,
  message: {
    success: false,
    data: null,
    message: 'Bạn đang gửi tin nhắn quá nhanh. Vui lòng đợi một lát trước khi hỏi tiếp nhé!',
    errors: null
  }
});

router.get('/sessions', ChatbotController.listSessions);
router.post('/sessions', ChatbotController.createSession);
router.get('/sessions/:sessionId/messages', ChatbotController.getMessages);
router.post('/sessions/:sessionId/messages', chatLimiter, ChatbotController.sendMessage);
router.delete('/sessions/:sessionId/messages', ChatbotController.clearSession);
router.delete('/sessions/:sessionId', ChatbotController.deleteSession);

export default router;
