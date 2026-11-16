import { Router } from 'express';
import { BudgetController } from '../controllers/budget.controller.js';
import { authenticate } from '../middlewares/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', BudgetController.listStatus);
router.post('/', BudgetController.create);
router.patch('/:id', BudgetController.update);
router.delete('/:id', BudgetController.delete);

export default router;
