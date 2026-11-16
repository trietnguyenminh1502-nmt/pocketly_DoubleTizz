import { Router } from 'express';
import { SavingGoalController } from '../controllers/savingGoal.controller.js';
import { authenticate } from '../middlewares/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', SavingGoalController.list);
router.post('/', SavingGoalController.create);
router.get('/:id', SavingGoalController.getById);
router.patch('/:id', SavingGoalController.update);
router.post('/:id/contribute', SavingGoalController.contribute);
router.delete('/:id', SavingGoalController.delete);

export default router;
