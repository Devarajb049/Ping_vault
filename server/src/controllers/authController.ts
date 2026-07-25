import { Request, Response } from 'express';
import { User } from '../models/User';
import { Session } from '../models/Session';
import { ActivityLog } from '../models/ActivityLog';
import { CryptoServer } from '../security/cryptoServer';
import { registerSchema, loginSchema } from '../validators/vaultValidator';
import { AuthRequest } from '../middleware/authMiddleware';

export class AuthController {
  public static async register(req: Request, res: Response): Promise<void> {
    try {
      const parseResult = registerSchema.safeParse(req.body);
      if (!parseResult.success) {
        res.status(400).json({ success: false, message: parseResult.error.errors[0].message });
        return;
      }

      const { fullName, username, email, password, publicKey, encryptedPrivateKey, salt } = parseResult.data;

      // Check existing email or username
      const existingUser = await User.findOne({ $or: [{ email }, { username }] });
      if (existingUser) {
        res.status(400).json({ success: false, message: 'User with this email or username already exists' });
        return;
      }

      // Generate Username-based User ID e.g. deva1280
      let receiverId = CryptoServer.generateReceiverId(username);
      let attempts = 0;
      while (await User.findOne({ receiverId })) {
        receiverId = CryptoServer.generateReceiverId(username);
        attempts++;
        if (attempts > 10) break;
      }

      const receiverIdHash = CryptoServer.hashReceiverId(receiverId);
      const passwordHash = await CryptoServer.hashPassword(password);

      const newUser = await User.create({
        fullName,
        username,
        email,
        passwordHash,
        receiverId,
        receiverIdHash,
        publicKey,
        encryptedPrivateKey,
        salt,
        role: 'user',
        isVerified: true,
        securityScore: 98,
      });

      // Audit Log
      await ActivityLog.create({
        userId: newUser._id,
        receiverId: receiverIdHash,
        action: 'CREATED',
        userAgent: req.headers['user-agent'] || 'Unknown',
        status: 'SUCCESS',
        details: 'User account registered with encrypted User ID blind index',
      });

      const accessToken = CryptoServer.generateAccessToken({
        userId: newUser._id.toString(),
        role: newUser.role,
        receiverId: newUser.receiverId,
      });
      const refreshToken = CryptoServer.generateRefreshToken({ userId: newUser._id.toString() });

      // Save Session
      await Session.create({
        userId: newUser._id,
        refreshToken,
        deviceFingerprint: req.headers['user-agent'] || 'Unknown Device',
        ipAddress: '0.0.0.0',
        userAgent: req.headers['user-agent'] || 'Unknown',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

      res.cookie('accessToken', accessToken, { httpOnly: true, secure: false, maxAge: 15 * 60 * 1000 });
      res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: false, maxAge: 7 * 24 * 60 * 60 * 1000 });

      res.status(201).json({
        success: true,
        message: 'Account created successfully',
        data: {
          user: {
            id: newUser._id,
            fullName: newUser.fullName,
            username: newUser.username,
            email: newUser.email,
            receiverId: newUser.receiverId,
            publicKey: newUser.publicKey,
            encryptedPrivateKey: newUser.encryptedPrivateKey,
            salt: newUser.salt,
            role: newUser.role,
            securityScore: newUser.securityScore,
            createdAt: newUser.createdAt,
          },
          tokens: { accessToken, refreshToken },
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Registration failed' });
    }
  }

  public static async login(req: Request, res: Response): Promise<void> {
    try {
      const parseResult = loginSchema.safeParse(req.body);
      if (!parseResult.success) {
        res.status(400).json({ success: false, message: parseResult.error.errors[0].message });
        return;
      }

      const { email, password } = parseResult.data;
      const user = await User.findOne({ email });

      if (!user || !user.passwordHash) {
        await ActivityLog.create({
          action: 'FAILED_LOGIN',
          userAgent: req.headers['user-agent'] || 'Unknown',
          status: 'FAILED',
          details: `Failed login attempt for ${email}`,
        });
        res.status(401).json({ success: false, message: 'Invalid email or password' });
        return;
      }

      const isValid = await CryptoServer.comparePassword(password, user.passwordHash);
      if (!isValid) {
        await ActivityLog.create({
          userId: user._id,
          receiverId: (user as any).receiverIdHash || user.receiverId,
          action: 'FAILED_LOGIN',
          userAgent: req.headers['user-agent'] || 'Unknown',
          status: 'FAILED',
          details: 'Incorrect password entered',
        });
        res.status(401).json({ success: false, message: 'Invalid email or password' });
        return;
      }

      const accessToken = CryptoServer.generateAccessToken({
        userId: user._id.toString(),
        role: user.role,
        receiverId: user.receiverId,
      });
      const refreshToken = CryptoServer.generateRefreshToken({ userId: user._id.toString() });

      await Session.create({
        userId: user._id,
        refreshToken,
        deviceFingerprint: req.headers['user-agent'] || 'Unknown Device',
        ipAddress: '0.0.0.0',
        userAgent: req.headers['user-agent'] || 'Unknown',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

      await ActivityLog.create({
        userId: user._id,
        receiverId: (user as any).receiverIdHash || user.receiverId,
        action: 'LOGIN',
        userAgent: req.headers['user-agent'] || 'Unknown',
        status: 'SUCCESS',
        details: 'User logged in successfully',
      });

      res.cookie('accessToken', accessToken, { httpOnly: true, secure: false, maxAge: 15 * 60 * 1000 });
      res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: false, maxAge: 7 * 24 * 60 * 60 * 1000 });

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user._id,
            fullName: user.fullName,
            username: user.username,
            email: user.email,
            receiverId: user.receiverId,
            publicKey: user.publicKey,
            encryptedPrivateKey: user.encryptedPrivateKey,
            salt: user.salt,
            role: user.role,
            securityScore: user.securityScore,
            createdAt: user.createdAt,
          },
          tokens: { accessToken, refreshToken },
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Login failed' });
    }
  }

  public static async getProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      const user = await User.findById(req.user?.userId).select('-passwordHash');
      if (!user) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }
      res.json({ success: true, data: user });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async logout(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (req.user?.userId) {
        await Session.deleteMany({ userId: req.user.userId });
        await ActivityLog.create({
          userId: req.user.userId as any,
          receiverId: req.user.receiverId,
          action: 'LOGOUT',
          userAgent: req.headers['user-agent'] || 'Unknown',
          status: 'SUCCESS',
        });
      }
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');
      res.json({ success: true, message: 'Logged out successfully' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
