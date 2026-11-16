import { Router } from 'express';
import { UserController } from '../controllers/user.controller.js';
import { authenticate } from '../middlewares/auth.js';
import { uploadAvatar } from '../middlewares/upload.js';

const router = Router();

// Tất cả các route bên dưới đều yêu cầu đăng nhập
router.use(authenticate);

router.get('/profile', UserController.getProfile);
router.patch('/profile', UserController.updateProfile);
router.post('/avatar', uploadAvatar.single('avatar'), UserController.updateAvatar);
router.post('/change-password', UserController.changePassword);
router.delete('/account', UserController.deleteAccount);

export default router;
