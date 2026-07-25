import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { ENV } from '../config/env';

export class CryptoServer {
  /**
   * Generates a unique Username-based Public User ID
   * Example: username "deva" -> "deva1280"
   */
  public static generateReceiverId(username: string): string {
    const cleanUsername = username.toLowerCase().replace(/[^a-z0-9]/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    return `${cleanUsername}${randomSuffix}`;
  }

  /**
   * Generates a deterministic HMAC Blind Index hash of Receiver ID for encrypted database lookups
   */
  public static hashReceiverId(receiverId: string): string {
    const cleanId = receiverId.trim().toLowerCase();
    return crypto.createHmac('sha256', ENV.JWT_SECRET).update(cleanId).digest('hex');
  }

  /**
   * Encrypts receiver string with AES-256-GCM
   */
  public static encryptReceiverId(receiverId: string): string {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', crypto.scryptSync(ENV.JWT_SECRET, 'salt', 32), iv);
    let encrypted = cipher.update(receiverId, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
  }

  /**
   * Decrypts AES-256-GCM encrypted receiver string
   */
  public static decryptReceiverId(encryptedStr: string): string {
    try {
      const parts = encryptedStr.split(':');
      if (parts.length !== 3) return 'Recipient';
      const [ivHex, authTagHex, encryptedHex] = parts;
      const iv = Buffer.from(ivHex, 'hex');
      const authTag = Buffer.from(authTagHex, 'hex');
      const decipher = crypto.createDecipheriv('aes-256-gcm', crypto.scryptSync(ENV.JWT_SECRET, 'salt', 32), iv);
      decipher.setAuthTag(authTag);
      let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (e) {
      return 'Recipient';
    }
  }

  /**
   * Hashes user password with bcrypt / salt
   */
  public static async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(12);
    return bcrypt.hash(password, salt);
  }

  /**
   * Compares password with hash
   */
  public static async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Creates short-lived JWT Access Token
   */
  public static generateAccessToken(payload: { userId: string; role: string; receiverId: string }): string {
    return jwt.sign(payload, ENV.JWT_SECRET, { expiresIn: '15m' });
  }

  /**
   * Creates long-lived JWT Refresh Token
   */
  public static generateRefreshToken(payload: { userId: string }): string {
    return jwt.sign(payload, ENV.JWT_REFRESH_SECRET, { expiresIn: '7d' });
  }

  /**
   * Verifies Access Token
   */
  public static verifyAccessToken(token: string): any {
    return jwt.verify(token, ENV.JWT_SECRET);
  }

  /**
   * Verifies Refresh Token
   */
  public static verifyRefreshToken(token: string): any {
    return jwt.verify(token, ENV.JWT_REFRESH_SECRET);
  }

  /**
   * SHA-256 Checksum for file integrity
   */
  public static calculateSHA256(content: Buffer | string): string {
    return crypto.createHash('sha256').update(content).digest('hex');
  }
}
