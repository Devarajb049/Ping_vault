import { Router } from 'express';
import { ReceiverController } from '../controllers/receiverController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateToken);

router.get('/lookup/:receiverId', ReceiverController.lookup);
router.post('/validate-batch', ReceiverController.validateBatch);

export default router;
