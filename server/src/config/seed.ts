import crypto from 'crypto';
import { User } from '../models/User';
import { CryptoServer } from '../security/cryptoServer';

export const seedDemoAccounts = async () => {
  try {
    const demoAccounts = [
      {
        fullName: 'Demo User One',
        username: 'demo1',
        receiverId: 'demo1001',
        email: 'demo1@pingvault.com',
        password: 'Demo@123',
      },
      {
        fullName: 'Demo User Two',
        username: 'demo2',
        receiverId: 'demo1002',
        email: 'demo2@pingvault.com',
        password: 'Demo@123',
      },
    ];

    for (const demo of demoAccounts) {
      const existing = await User.findOne({
        $or: [{ username: demo.username }, { email: demo.email }, { receiverId: demo.receiverId }],
      });

      // Generate a valid 2048-bit RSA keypair in SPKI / PKCS8 format
      const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: { type: 'spki', format: 'der' },
        privateKeyEncoding: { type: 'pkcs8', format: 'der' },
      });
      const publicKeyBase64 = publicKey.toString('base64');
      const privateKeyBase64 = privateKey.toString('base64');

      if (!existing) {
        const passwordHash = await CryptoServer.hashPassword(demo.password);
        const receiverIdHash = CryptoServer.hashReceiverId(demo.receiverId);
        const salt = await CryptoServer.calculateSHA256(demo.username + Date.now());

        await User.create({
          fullName: demo.fullName,
          username: demo.username,
          email: demo.email,
          passwordHash,
          receiverId: demo.receiverId,
          receiverIdHash,
          publicKey: publicKeyBase64,
          encryptedPrivateKey: privateKeyBase64,
          salt,
          role: 'user',
          isVerified: true,
          securityScore: 98,
        });

        console.log(`[Seed] Created Demo User: ${demo.username} (${demo.receiverId}) with valid RSA keypair`);
      } else if (existing.publicKey.startsWith('MOCK_') || existing.publicKey.startsWith('GOOGLE_')) {
        existing.publicKey = publicKeyBase64;
        existing.encryptedPrivateKey = privateKeyBase64;
        await existing.save();
        console.log(`[Seed] Upgraded mock RSA keypair to valid WebCrypto SPKI key for ${demo.username}`);
      }
    }
  } catch (err: any) {
    console.error(`[Seed Error] Failed to seed demo accounts: ${err.message}`);
  }
};

