import { Router } from 'express';
import { ReportController } from '../controllers/report.controller.js';
import { authenticate } from '../middlewares/auth.js';

const router = Router();

router.use(authenticate);

router.get('/summary', ReportController.getSummary);
router.get('/category-spending', ReportController.getSpendingByCategory);
router.get('/trends', ReportController.getTrends);
router.get('/top-categories', ReportController.getTopCategories);
router.get('/export/excel', ReportController.exportExcel);

export default router;
