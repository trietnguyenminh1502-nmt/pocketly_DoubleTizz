import { Router } from 'express';
import { TransactionController } from '../controllers/transaction.controller.js';
import { authenticate } from '../middlewares/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', TransactionController.list);
router.post('/', TransactionController.create);
router.post('/bulk-delete', TransactionController.bulkDelete);
router.get('/export/excel', TransactionController.exportExcel);
router.get('/export/csv', TransactionController.exportCSV);
router.get('/:id', TransactionController.getById);
router.patch('/:id', TransactionController.update);
router.delete('/:id', TransactionController.delete);

export default router;
