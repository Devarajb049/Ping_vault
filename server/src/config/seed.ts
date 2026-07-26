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
          publicKey: `MOCK_DEMO_RSA_PUBLIC_KEY_${demo.username.toUpperCase()}`,
          encryptedPrivateKey: `MOCK_DEMO_RSA_PRIV_KEY_${demo.username.toUpperCase()}`,
          salt,
          role: 'user',
          isVerified: true,
          securityScore: 98,
        });

        console.log(`[Seed] Created Demo User: ${demo.username} (${demo.receiverId})`);
      }
    }
  } catch (err: any) {
    console.error(`[Seed Error] Failed to seed demo accounts: ${err.message}`);
  }
};
