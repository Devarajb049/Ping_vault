import { Router } from 'express';
import authRoutes from './authRoutes';
import vaultRoutes from './vaultRoutes';
import receiverRoutes from './receiverRoutes';
import adminRoutes from './adminRoutes';
import notificationRoutes from './notificationRoutes';
import activityRoutes from './activityRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/vaults', vaultRoutes);
router.use('/receivers', receiverRoutes);
router.use('/admin', adminRoutes);
router.use('/notifications', notificationRoutes);
router.use('/activity', activityRoutes);

export default router;
