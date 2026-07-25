import { Request, Response, NextFunction } from 'express';
import { CryptoServer } from '../security/cryptoServer';

declare global {
  namespace Express {
    interface User {
      userId?: string;
      role?: string;
      receiverId?: string;
      _id?: any;
    }
  }
}

export type AuthRequest = Request;

export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  try {
    let token = req.cookies?.accessToken;
    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
      return;
    }

    const decoded: any = CryptoServer.verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid or expired authentication token.' });
  }
};

// Alias export for compatibility
export const authMiddleware = authenticateToken;
