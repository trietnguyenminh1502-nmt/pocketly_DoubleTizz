import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = Router();

// Toàn bộ các endpoints Admin đều yêu cầu xác thực và quyền ADMIN
router.use(authenticate, authorize('ADMIN'));

// 1. Thống kê Dashboard
router.get('/dashboard', AdminController.getDashboardStats);

// 2. Quản lý Người dùng
router.get('/users', AdminController.listUsers);
router.get('/users/:id', AdminController.getUserDetail);
router.patch('/users/:id/status', AdminController.updateUserStatus);
router.patch('/users/:id/role', AdminController.updateUserRole);
router.delete('/users/:id', AdminController.deleteUser);

// 3. Quản lý Danh mục mặc định hệ thống
router.get('/categories', AdminController.listDefaultCategories);
router.post('/categories', AdminController.createDefaultCategory);
router.patch('/categories/:id', AdminController.updateDefaultCategory);
router.delete('/categories/:id', AdminController.deleteDefaultCategory);

// 4. Nhật ký Chatbot & Thống kê
router.get('/chatbot/stats', AdminController.getChatbotStats);

// 5. Nhật ký kiểm tra (Audit Log)
router.get('/audit-logs', AdminController.listAuditLogs);

// 6. Phát sóng thông báo toàn hệ thống
router.post('/broadcast', AdminController.broadcastNotification);

export default router;
