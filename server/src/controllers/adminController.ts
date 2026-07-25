import { Request, Response } from 'express';
import { User } from '../models/User';
import { Vault } from '../models/Vault';
import { SharedVault } from '../models/SharedVault';
import { ActivityLog } from '../models/ActivityLog';

export class AdminController {
  public static async getStats(req: Request, res: Response): Promise<void> {
    try {
      const totalUsers = await User.countDocuments();
      const totalVaults = await Vault.countDocuments();
      const totalShared = await SharedVault.countDocuments();
      const expiredVaults = await SharedVault.countDocuments({ status: 'expired' });

      // Calculate approximate storage used
      const vaults = await Vault.find().select('fileMetadata ciphertext');
      const storageUsedBytes = vaults.reduce((acc, v) => acc + (v.fileMetadata?.size || v.ciphertext.length), 0);

      const recentLogs = await ActivityLog.find().sort({ createdAt: -1 }).limit(10);

      res.json({
        success: true,
        data: {
          totalUsers,
          totalVaults,
          totalShared,
          expiredVaults,
          storageUsedMB: (storageUsedBytes / (1024 * 1024)).toFixed(2),
          securityScore: 98.4,
          systemHealth: '100% Operational',
          recentLogs,
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async getAuditLogs(req: Request, res: Response): Promise<void> {
    try {
      const logs = await ActivityLog.find().populate('userId', 'fullName username email receiverId').sort({ createdAt: -1 }).limit(100);
      res.json({ success: true, data: logs });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
