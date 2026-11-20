import { Router } from 'express';
import { SupportController } from '../controllers/support.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = Router();

// 1. Endpoint Public: Mọi người dùng / khách đều có thể gửi yêu cầu hỗ trợ
router.post('/', SupportController.createTicket);

// 3. Endpoint Public: Gửi email hỗ trợ thực tế
router.post('/email', SupportController.sendEmail);

router.get('/admin', authenticate, authorize('ADMIN'), SupportController.listTickets);
router.patch('/admin/:id', authenticate, authorize('ADMIN'), SupportController.updateTicket);
router.delete('/admin/:id', authenticate, authorize('ADMIN'), SupportController.deleteTicket);

export default router;
