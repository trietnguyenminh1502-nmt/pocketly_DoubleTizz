import { Router } from 'express';
import { WalletController } from '../controllers/wallet.controller.js';
import { authenticate } from '../middlewares/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', WalletController.list);
router.post('/', WalletController.create);
router.post('/transfer', WalletController.transfer);
router.get('/:id', WalletController.getById);
router.patch('/:id', WalletController.update);
router.delete('/:id', WalletController.delete);

export default router;
