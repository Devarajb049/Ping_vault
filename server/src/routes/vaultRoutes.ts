import { Router } from 'express';
import { VaultController } from '../controllers/vaultController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// Protect all vault endpoints
router.use(authenticateToken);

router.post('/create', VaultController.createVault);
router.get('/received', VaultController.getReceivedVaults);
router.get('/created', VaultController.getCreatedVaults);
router.post('/open/:vaultId', VaultController.getVaultPayload);
router.post('/revoke', VaultController.revokeAccess);
router.delete('/delete/:vaultId', VaultController.deleteVault);
router.delete('/received/delete/:sharedId', VaultController.deleteReceivedVault);

export default router;
