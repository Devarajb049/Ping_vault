import passport from 'passport';
import { Strategy as GoogleStrategy, Profile, VerifyCallback } from 'passport-google-oauth20';
import crypto from 'crypto';
import { User } from '../models/User';
import { ENV } from './env';
import { CryptoServer } from '../security/cryptoServer';


if (ENV.GOOGLE_CLIENT_ID && ENV.GOOGLE_CLIENT_ID !== 'mock-google-client-id') {
  passport.use(
    new GoogleStrategy(
      {
        clientID: ENV.GOOGLE_CLIENT_ID,
        clientSecret: ENV.GOOGLE_CLIENT_SECRET,
        callbackURL: ENV.GOOGLE_CALLBACK_URL,
      },

      async (accessToken: string, refreshToken: string, profile: Profile, done: VerifyCallback) => {
        try {
          let user = await User.findOne({ googleId: profile.id });

          if (!user && profile.emails?.[0]?.value) {
            user = await User.findOne({ email: profile.emails[0].value });
          }

          if (!user) {
            const rawUsername = profile.displayName ? profile.displayName.split(' ')[0] : 'googleuser';
            const receiverId = CryptoServer.generateReceiverId(rawUsername);
            const keyGen = await CryptoServer.calculateSHA256(profile.id + Date.now());

            // Generate real 2048-bit RSA SPKI/PKCS8 key pair for Google OAuth user
            const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
              modulusLength: 2048,
              publicKeyEncoding: { type: 'spki', format: 'der' },
              privateKeyEncoding: { type: 'pkcs8', format: 'der' },
            });

            user = await User.create({
              fullName: profile.displayName || 'Google User',
              username: `g_${profile.id.substring(0, 8)}`,
              email: profile.emails?.[0]?.value || `g_${profile.id}@gmail.com`,
              googleId: profile.id,
              receiverId,
              publicKey: publicKey.toString('base64'),
              encryptedPrivateKey: privateKey.toString('base64'),
              salt: keyGen,
              role: 'user',
              isVerified: true,
              avatarUrl: profile.photos?.[0]?.value,
            });
          } else {
            if (!user.googleId) {
              user.googleId = profile.id;
            }
            if (user.publicKey.startsWith('GOOGLE_') || user.publicKey.startsWith('MOCK_')) {
              const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
                modulusLength: 2048,
                publicKeyEncoding: { type: 'spki', format: 'der' },
                privateKeyEncoding: { type: 'pkcs8', format: 'der' },
              });
              user.publicKey = publicKey.toString('base64');
              user.encryptedPrivateKey = privateKey.toString('base64');
            }
            await user.save();
          }


          return done(null, user);
        } catch (err: any) {
          return done(err, undefined);
        }
      }
    )
  );
}

export default passport;

