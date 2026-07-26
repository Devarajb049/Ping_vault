import { Router, Request, Response } from 'express';
import passport from '../config/passport';
import { AuthController } from '../controllers/authController';
import { authenticateToken } from '../middleware/authMiddleware';
import { authLimiter } from '../middleware/rateLimiters';
import { CryptoServer } from '../security/cryptoServer';
import { Session } from '../models/Session';
import { ENV } from '../config/env';

const router = Router();

router.post('/register', authLimiter, AuthController.register);
router.post('/login', authLimiter, AuthController.login);
router.get('/me', authenticateToken, AuthController.getProfile);
router.post('/logout', authenticateToken, AuthController.logout);

// Google OAuth Routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${ENV.CLIENT_URL}/login?error=oauth_failed` }),
  async (req: Request, res: Response) => {

    try {
      const user = req.user as any;
      if (!user) {
        res.redirect(`${ENV.CLIENT_URL}/login?error=no_user`);
        return;
      }

      const accessToken = CryptoServer.generateAccessToken({
        userId: user._id.toString(),
        role: user.role || 'user',
        receiverId: user.receiverId || '',
      });
      const refreshToken = CryptoServer.generateRefreshToken({ userId: user._id.toString() });


      await Session.create({
        userId: user._id,
        refreshToken,
        deviceFingerprint: req.headers['user-agent'] || 'Google OAuth',
        ipAddress: req.ip || '127.0.0.1',
        userAgent: req.headers['user-agent'] || 'Google OAuth',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

      const isProduction = ENV.NODE_ENV === 'production';
      const cookieOptions = {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? ('none' as const) : ('lax' as const),
      };

      res.cookie('accessToken', accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 });
      res.cookie('refreshToken', refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });

      console.log(`[Google OAuth] Success for User: ${user._id} (${user.email}). Redirecting to dashboard.`);
      res.redirect(`${ENV.CLIENT_URL}/dashboard?token=${accessToken}&refreshToken=${refreshToken}`);
    } catch (err: any) {
      console.error(`[Google OAuth Error] Callback exception: ${err.message}`);
      res.redirect(`${ENV.CLIENT_URL}/login?error=token_failed`);
    }
  }
);


export default router;
