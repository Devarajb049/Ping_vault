import { Request, Response } from 'express';
import crypto from 'crypto';
import { User } from '../models/User';
import { CryptoServer } from '../security/cryptoServer';

const ensureValidRSAKey = async (user: any): Promise<string> => {
  const currentKey = user.publicKey || '';
  let isValid = false;

  if (currentKey && !currentKey.startsWith('GOOGLE_') && !currentKey.startsWith('MOCK_')) {
    try {
      const buffer = Buffer.from(currentKey.replace(/[\r\n\s]/g, ''), 'base64');
      if (buffer.length > 100) {
        isValid = true;
      }
    } catch (e) {
      isValid = false;
    }
  }

  if (!isValid) {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: { type: 'spki', format: 'der' },
      privateKeyEncoding: { type: 'pkcs8', format: 'der' },
    });
    user.publicKey = publicKey.toString('base64');
    user.encryptedPrivateKey = privateKey.toString('base64');
    await user.save();
    console.log(`[Auto-Heal RSA Key] Regenerated valid 2048-bit RSA SPKI key for user ${user.username} (${user.receiverId})`);
  }

  return user.publicKey;
};

export class ReceiverController {
  /**
   * Looks up a single User ID, Username, or Email and returns public key & profile
   */
  public static async lookup(req: Request, res: Response): Promise<void> {
    try {
      const input = (req.params.receiverId as string).trim().toLowerCase();
      const inputHash = CryptoServer.hashReceiverId(input);

      const user = await User.findOne({
        $or: [{ receiverId: input }, { receiverIdHash: inputHash }, { username: input }, { email: input }],
      });

      if (!user) {
        res.status(404).json({ success: false, message: `User ID or username "${input}" not found` });
        return;
      }

      // Auto-heal legacy or invalid keys to valid WebCrypto SPKI keys
      const publicKey = await ensureValidRSAKey(user);

      res.json({
        success: true,
        data: {
          fullName: user.fullName,
          username: user.username,
          receiverId: user.receiverId,
          publicKey,
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
        $or: [
          { receiverId: { $in: formattedIds } },
          { receiverIdHash: { $in: formattedHashes } },
          { username: { $in: formattedIds } },
          { email: { $in: formattedIds } },
        ],
      });

      const foundMap: Record<string, { receiverId: string; fullName: string; username: string; publicKey: string }> = {};

      for (const u of users) {
        const publicKey = await ensureValidRSAKey(u);
        foundMap[u.receiverId] = {
          receiverId: u.receiverId,
          fullName: u.fullName,
          username: u.username,
          publicKey,
        };
        // Also index by username for flexible matching
        foundMap[u.username.toLowerCase()] = {
          receiverId: u.receiverId,
          fullName: u.fullName,
          username: u.username,
          publicKey,
        };
      }

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

