import { Router } from 'express';
import { CategoryController } from '../controllers/category.controller.js';
import { authenticate } from '../middlewares/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', CategoryController.list);
router.post('/', CategoryController.create);
router.patch('/:id', CategoryController.update);
router.delete('/:id', CategoryController.delete);

export default router;
