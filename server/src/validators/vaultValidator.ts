import { z } from 'zod';

export const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  publicKey: z.string().min(1, 'Public key is required'),
  encryptedPrivateKey: z.string().min(1, 'Encrypted private key is required'),
  salt: z.string().min(1, 'Salt is required'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const createVaultSchema = z.object({
  titleEncrypted: z.string().min(1, 'Encrypted title is required'),
  ciphertext: z.string().min(1, 'Encrypted payload is required'),
  iv: z.string().min(1, 'IV is required'),
  authTag: z.string().min(1, 'Auth tag is required'),
  fileMetadata: z
    .object({
      originalNameEncrypted: z.string().optional(),
      mimeType: z.string().default('text/plain'),
      size: z.number().default(0),
      fileUrl: z.string().optional(),
    })
    .optional(),
  recipientReceiverIds: z.array(z.string()).min(1, 'At least one Recipient User ID is required'),
  encryptedSymmetricKeys: z.record(z.string(), z.string()), // receiverId -> encryptedKey
  isPasswordProtected: z.boolean().default(false),
  vaultPassword: z.string().optional(),
  isOTPRequired: z.boolean().default(false),
  expiryMinutes: z.number().optional(), // 10, 30, 60, 360, 720, 1440, 10080, 43200 or -1 (Never)
  maxViews: z.number().optional(), // 1, 2, 5, 10, 25 or undefined (Unlimited)
  deleteAfterReading: z.boolean().default(false),
});
