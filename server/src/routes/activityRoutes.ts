import { Router } from 'express';
import { ActivityController } from '../controllers/activityController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateToken);
router.get('/', ActivityController.getUserActivity);

export default router;
