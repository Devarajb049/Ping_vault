import { Response } from 'express';
import { Vault } from '../models/Vault';
import { SharedVault } from '../models/SharedVault';
import { User } from '../models/User';
import { ActivityLog } from '../models/ActivityLog';
import { Notification } from '../models/Notification';
import { AuthRequest } from '../middleware/authMiddleware';
import { createVaultSchema } from '../validators/vaultValidator';
import { CryptoServer } from '../security/cryptoServer';
import { emitToUser } from '../socket/socketHandler';

export class VaultController {
  public static async createVault(req: AuthRequest, res: Response): Promise<void> {
    try {
      const parseResult = createVaultSchema.safeParse(req.body);
      if (!parseResult.success) {
        res.status(400).json({ success: false, message: parseResult.error.errors[0].message });
        return;
      }

      const {
        titleEncrypted,
        ciphertext,
        iv,
        authTag,
        fileMetadata,
        recipientReceiverIds,
        encryptedSymmetricKeys,
        isPasswordProtected,
        vaultPassword,
        isOTPRequired,
        expiryMinutes,
        maxViews,
        deleteAfterReading,
      } = parseResult.data;

      const ownerId = req.user?.userId;
      const senderReceiverId = req.user?.receiverId;

      if (!ownerId || !senderReceiverId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      let passwordHash: string | undefined = undefined;
      if (isPasswordProtected && vaultPassword) {
        passwordHash = await CryptoServer.hashPassword(vaultPassword);
      }

      let expiryTime: Date | undefined = undefined;
      if (expiryMinutes && expiryMinutes > 0) {
        expiryTime = new Date(Date.now() + expiryMinutes * 60 * 1000);
      }

      const vault = await Vault.create({
        ownerId,
        titleEncrypted,
        ciphertext,
        iv,
        authTag,
        fileMetadata,
        isPasswordProtected,
        passwordHash,
        isOTPRequired,
        expiryTime,
        maxViews,
        deleteAfterReading,
      });

      const sharedVaults = [];
      for (const recId of recipientReceiverIds) {
        const cleanRecId = recId.trim().toLowerCase();
        const inputHash = CryptoServer.hashReceiverId(cleanRecId);

        // Find recipient by receiverId, receiverIdHash, username, or email
        const recUser = await User.findOne({
          $or: [
            { receiverId: cleanRecId },
            { receiverIdHash: inputHash },
            { username: cleanRecId },
            { email: cleanRecId },
          ],
        });

        const targetReceiverId = recUser ? recUser.receiverId : cleanRecId;
        const targetReceiverIdHash = recUser?.receiverIdHash || CryptoServer.hashReceiverId(targetReceiverId);
        const targetReceiverIdEncrypted = CryptoServer.encryptReceiverId(targetReceiverId);

        // Robust key resolution for recipient key mapping
        let encKey =
          encryptedSymmetricKeys[targetReceiverId] ||
          encryptedSymmetricKeys[cleanRecId] ||
          encryptedSymmetricKeys[recId];

        if (!encKey) {
          const matchingKey = Object.keys(encryptedSymmetricKeys).find(
            (k) => k.toLowerCase() === cleanRecId || k.toLowerCase() === targetReceiverId.toLowerCase()
          );
          if (matchingKey) {
            encKey = encryptedSymmetricKeys[matchingKey];
          } else if (Object.keys(encryptedSymmetricKeys).length === 1) {
            encKey = Object.values(encryptedSymmetricKeys)[0];
          }
        }

        if (encKey) {
          const shared = await SharedVault.create({
            vaultId: vault._id,
            senderId: ownerId,
            receiverIdHash: targetReceiverIdHash,
            receiverIdEncrypted: targetReceiverIdEncrypted,
            encryptedSymmetricKey: encKey,
            status: 'pending',
          });
          sharedVaults.push(shared);

          if (recUser) {
            await Notification.create({
              userId: recUser._id,
              type: 'VAULT_RECEIVED',
              title: 'New Encrypted File Received',
              message: `${senderReceiverId} shared "${titleEncrypted}" with you`,
              vaultId: vault._id,
              senderReceiverId,
            });

            // Emit real-time WebSocket toast events to recipient user ID and receiver ID rooms
            emitToUser(recUser._id.toString(), 'vault_received', {
              vaultId: vault._id,
              senderReceiverId,
              titleEncrypted,
              expiryTime,
            });
            emitToUser(recUser.receiverId, 'vault_received', {
              vaultId: vault._id,
              senderReceiverId,
              titleEncrypted,
              expiryTime,
            });
          }
        }
      }


      await ActivityLog.create({
        userId: ownerId as any,
        receiverId: CryptoServer.hashReceiverId(senderReceiverId),
        vaultId: vault._id,
        action: 'CREATED',
        userAgent: req.headers['user-agent'] || 'Unknown',
        status: 'SUCCESS',
        details: `Encrypted vault created and transmitted to ${sharedVaults.length} recipient(s)`,
      });

      res.status(201).json({
        success: true,
        message: 'Vault encrypted and transmitted successfully',
        data: {
          vaultId: vault._id,
          recipientsCount: sharedVaults.length,
          expiryTime,
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to create vault' });
    }
  }

  public static async getReceivedVaults(req: AuthRequest, res: Response): Promise<void> {
    try {
      const user = await User.findById(req.user?.userId);
      const receiverId = req.user?.receiverId || user?.receiverId;
      if (!receiverId && !user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const possibleHashes = Array.from(
        new Set([
          CryptoServer.hashReceiverId(receiverId || ''),
          user?.receiverIdHash,
          user?.username ? CryptoServer.hashReceiverId(user.username.trim().toLowerCase()) : '',
          user?.email ? CryptoServer.hashReceiverId(user.email.trim().toLowerCase()) : '',
        ].filter(Boolean))
      );

      const sharedVaults = await SharedVault.find({
        receiverIdHash: { $in: possibleHashes },
        status: { $ne: 'revoked' },
      })
        .populate('vaultId')
        .populate('senderId', 'fullName username receiverId avatarUrl')
        .sort({ createdAt: -1 });


      const result = sharedVaults
        .filter((sv) => sv.vaultId)
        .map((sv) => {
          const vault: any = sv.vaultId;
          const now = new Date();
          const isTimeExpired = vault?.expiryTime ? new Date(vault.expiryTime) < now : false;
          const isViewExpired = vault?.maxViews ? sv.viewsCount >= vault.maxViews : false;
          const isSelfDestructed = vault?.deleteAfterReading ? sv.viewsCount >= 1 : false;
          const isExpired = isTimeExpired || isViewExpired || isSelfDestructed || sv.status === 'expired';

          return {
            sharedId: sv._id,
            vaultId: vault?._id,
            sender: sv.senderId,
            titleEncrypted: vault?.titleEncrypted,
            encryptedSymmetricKey: sv.encryptedSymmetricKey,
            fileMetadata: vault?.fileMetadata,
            isPasswordProtected: vault?.isPasswordProtected,
            isOTPRequired: vault?.isOTPRequired,
            deleteAfterReading: vault?.deleteAfterReading,
            status: isExpired ? 'expired' : sv.status,
            viewsCount: sv.viewsCount,
            maxViews: vault?.maxViews,
            expiryTime: vault?.expiryTime,
            createdAt: sv.createdAt,
          };
        });

      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async getCreatedVaults(req: AuthRequest, res: Response): Promise<void> {
    try {
      const ownerId = req.user?.userId;
      const vaults = await Vault.find({ ownerId }).sort({ createdAt: -1 });

      const detailedVaults = await Promise.all(
        vaults.map(async (v) => {
          const shares = await SharedVault.find({ vaultId: v._id });
          return {
            id: v._id,
            titleEncrypted: v.titleEncrypted,
            fileMetadata: v.fileMetadata,
            isPasswordProtected: v.isPasswordProtected,
            expiryTime: v.expiryTime,
            maxViews: v.maxViews,
            totalViews: v.totalViews,
            deleteAfterReading: v.deleteAfterReading,
            recipients: shares.map((s) => ({
              status: s.status,
              viewsCount: s.viewsCount,
              lastViewedAt: s.lastViewedAt,
              receiverId: s.receiverIdEncrypted
                ? CryptoServer.decryptReceiverId(s.receiverIdEncrypted)
                : 'Recipient',
            })),
            createdAt: v.createdAt,
          };
        })
      );

      res.json({ success: true, data: detailedVaults });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async getVaultPayload(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { vaultId } = req.params;
      const { password } = req.body;
      const userId = req.user?.userId;
      const receiverId = req.user?.receiverId;

      if (!receiverId || !userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const receiverIdHash = CryptoServer.hashReceiverId(receiverId);

      const vault = await Vault.findById(vaultId);
      if (!vault) {
        res.status(404).json({ success: false, message: 'Vault payload not found or deleted by sender' });
        return;
      }

      const shared = await SharedVault.findOne({ vaultId, receiverIdHash });
      if (!shared && vault.ownerId.toString() !== userId) {
        res.status(403).json({ success: false, message: 'Access denied to this vault' });
        return;
      }

      if (shared && shared.status === 'revoked') {
        res.status(403).json({ success: false, message: 'Access to this vault has been revoked by sender' });
        return;
      }

      // Check self-destruct (deleteAfterReading) 1-view policy IMMEDIATELY before password entry
      if (vault.deleteAfterReading && shared && shared.viewsCount >= 1) {
        shared.status = 'expired';
        await shared.save();
        res.status(410).json({ success: false, message: 'This self-destructing vault has already been viewed once and is now locked.' });
        return;
      }

      const now = new Date();
      if (vault.expiryTime && new Date(vault.expiryTime) < now) {
        if (shared) {
          shared.status = 'expired';
          await shared.save();
        }
        res.status(410).json({ success: false, message: 'This vault payload has expired' });
        return;
      }

      if (vault.maxViews && shared && shared.viewsCount >= vault.maxViews) {
        shared.status = 'expired';
        await shared.save();
        res.status(410).json({ success: false, message: 'Maximum view limit reached for this vault' });
        return;
      }

      if (vault.isPasswordProtected && vault.passwordHash) {
        if (!password) {
          res.status(401).json({ success: false, message: 'Vault password required' });
          return;
        }
        const isMatch = await CryptoServer.comparePassword(password, vault.passwordHash);
        if (!isMatch) {
          res.status(401).json({ success: false, message: 'Invalid vault password' });
          return;
        }
      }

      if (shared) {
        shared.viewsCount += 1;
        shared.lastViewedAt = now;
        if (vault.deleteAfterReading || (vault.maxViews && shared.viewsCount >= vault.maxViews)) {
          shared.status = 'expired';
        } else {
          shared.status = 'opened';
        }
        await shared.save();
      }

      vault.totalViews += 1;
      await vault.save();

      await ActivityLog.create({
        userId: userId as any,
        receiverId: receiverIdHash,
        vaultId: vault._id,
        action: 'OPENED',
        userAgent: req.headers['user-agent'] || 'Unknown',
        status: 'SUCCESS',
        details: `Decrypted payload accessed by recipient`,
      });

      res.json({
        success: true,
        data: {
          vaultId: vault._id,
          titleEncrypted: vault.titleEncrypted,
          ciphertext: vault.ciphertext,
          iv: vault.iv,
          authTag: vault.authTag,
          encryptedSymmetricKey: shared?.encryptedSymmetricKey,
          fileMetadata: vault.fileMetadata,
          deleteAfterReading: vault.deleteAfterReading,
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async revokeAccess(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { vaultId, receiverId } = req.body;
      const ownerId = req.user?.userId;

      const vault = await Vault.findOne({ _id: vaultId, ownerId });
      if (!vault) {
        res.status(404).json({ success: false, message: 'Vault not found or permission denied' });
        return;
      }

      if (receiverId) {
        const receiverIdHash = CryptoServer.hashReceiverId(receiverId);
        await SharedVault.updateOne({ vaultId, receiverIdHash }, { status: 'revoked' });
      } else {
        await SharedVault.updateMany({ vaultId }, { status: 'revoked' });
      }

      await ActivityLog.create({
        userId: ownerId as any,
        vaultId: vault._id,
        action: 'REVOKED',
        status: 'SUCCESS',
        details: `Access revoked for recipient`,
      });

      res.json({ success: true, message: 'Access revoked successfully' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async deleteVault(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { vaultId } = req.params;
      const ownerId = req.user?.userId;

      const vault = await Vault.findOne({ _id: vaultId, ownerId });
      if (!vault) {
        res.status(404).json({ success: false, message: 'Vault not found or permission denied' });
        return;
      }

      const shares = await SharedVault.find({ vaultId: vault._id });
      for (const s of shares) {
        const recUser = await User.findOne({ receiverIdHash: s.receiverIdHash });
        if (recUser) {
          emitToUser(recUser._id.toString(), 'vault_deleted', {
            vaultId: vault._id,
            titleEncrypted: vault.titleEncrypted,
            message: 'A file shared with you has been removed by the sender.',
          });
        }
      }

      // Explicit user deletion: purge vault, shared records, AND all activity logs!
      await Vault.findByIdAndDelete(vault._id);
      await SharedVault.deleteMany({ vaultId: vault._id });
      await ActivityLog.deleteMany({ vaultId: vault._id });

      res.json({ success: true, message: 'Vault and all associated logs permanently deleted by sender' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async deleteReceivedVault(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { sharedId } = req.params;
      const receiverId = req.user?.receiverId;
      if (!receiverId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const receiverIdHash = CryptoServer.hashReceiverId(receiverId);
      const shared = await SharedVault.findOneAndDelete({ _id: sharedId, receiverIdHash });

      if (!shared) {
        res.status(404).json({ success: false, message: 'Received vault share not found' });
        return;
      }

      // Purge all activity logs associated with this deleted received vault for this recipient
      await ActivityLog.deleteMany({
        $or: [
          { vaultId: shared.vaultId, userId: req.user?.userId },
          { vaultId: shared.vaultId, receiverId: receiverIdHash },
          { vaultId: shared.vaultId, receiverId: receiverId },
        ],
      });

      res.json({ success: true, message: 'Received vault reference and associated activity logs deleted' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
