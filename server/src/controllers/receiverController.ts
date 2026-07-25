import { Request, Response } from 'express';
import { User } from '../models/User';
import { CryptoServer } from '../security/cryptoServer';

export class ReceiverController {
  /**
   * Looks up a single User ID and returns public key & public profile
   */
  public static async lookup(req: Request, res: Response): Promise<void> {
    try {
      const receiverId = (req.params.receiverId as string).trim().toLowerCase();
      const receiverIdHash = CryptoServer.hashReceiverId(receiverId);

      const user = await User.findOne({
        $or: [{ receiverId }, { receiverIdHash }],
      }).select('fullName username receiverId publicKey avatarUrl securityScore');

      if (!user) {
        res.status(404).json({ success: false, message: `User ID "${receiverId}" not found` });
        return;
      }

      res.json({
        success: true,
        data: {
          fullName: user.fullName,
          username: user.username,
          receiverId: user.receiverId,
          publicKey: user.publicKey,
          avatarUrl: user.avatarUrl,
          securityScore: user.securityScore,
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Validates multiple User IDs in batch and returns their public keys
   */
  public static async validateBatch(req: Request, res: Response): Promise<void> {
    try {
      const { receiverIds } = req.body;
      if (!Array.isArray(receiverIds) || receiverIds.length === 0) {
        res.status(400).json({ success: false, message: 'receiverIds array is required' });
        return;
      }

      const formattedIds = receiverIds.map((id: string) => id.trim().toLowerCase());
      const formattedHashes = formattedIds.map((id: string) => CryptoServer.hashReceiverId(id));

      const users = await User.find({
        $or: [{ receiverId: { $in: formattedIds } }, { receiverIdHash: { $in: formattedHashes } }],
      }).select('fullName username receiverId publicKey avatarUrl');

      const foundMap: Record<string, { receiverId: string; fullName: string; username: string; publicKey: string }> = {};
      users.forEach((u) => {
        foundMap[u.receiverId] = {
          receiverId: u.receiverId,
          fullName: u.fullName,
          username: u.username,
          publicKey: u.publicKey,
        };
      });

      const missingIds = formattedIds.filter((id) => !foundMap[id]);

      res.json({
        success: true,
        data: {
          validReceivers: foundMap,
          missingIds,
          isValid: missingIds.length === 0,
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
