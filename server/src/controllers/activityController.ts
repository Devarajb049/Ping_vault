import { Response } from 'express';
import { ActivityLog } from '../models/ActivityLog';
import { AuthRequest } from '../middleware/authMiddleware';
import { CryptoServer } from '../security/cryptoServer';

export class ActivityController {
  public static async getUserActivity(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const receiverId = req.user?.receiverId;
      if (!userId || !receiverId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const receiverIdHash = CryptoServer.hashReceiverId(receiverId);

      const logs = await ActivityLog.find({
        $or: [{ userId }, { receiverId: receiverIdHash }],
      })
        .sort({ createdAt: -1 })
        .limit(100);

      res.json({ success: true, data: logs });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to fetch activity logs' });
    }
  }
}
