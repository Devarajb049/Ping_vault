import { Router } from 'express';
import { AdminController } from '../controllers/adminController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateToken);

router.get('/stats', AdminController.getStats);
router.get('/logs', AdminController.getAuditLogs);

export default router;
