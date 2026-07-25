import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { User } from '../models/User';
import { ENV } from './env';
import { CryptoServer } from '../security/cryptoServer';

if (ENV.GOOGLE_CLIENT_ID && ENV.GOOGLE_CLIENT_ID !== 'mock-google-client-id') {
  passport.use(
    new GoogleStrategy(
      {
        clientID: ENV.GOOGLE_CLIENT_ID,
        clientSecret: ENV.GOOGLE_CLIENT_SECRET,
        callbackURL: 'http://localhost:5000/api/v1/auth/google/callback',
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = await User.findOne({ googleId: profile.id });

          if (!user && profile.emails?.[0]?.value) {
            user = await User.findOne({ email: profile.emails[0].value });
          }

          if (!user) {
            const rawUsername = profile.displayName ? profile.displayName.split(' ')[0] : 'googleuser';
            const receiverId = CryptoServer.generateReceiverId(rawUsername);
            const keyGen = await CryptoServer.calculateSHA256(profile.id + Date.now());

            user = await User.create({
              fullName: profile.displayName || 'Google User',
              username: `g_${profile.id.substring(0, 8)}`,
              email: profile.emails?.[0]?.value || `g_${profile.id}@gmail.com`,
              googleId: profile.id,
              receiverId,
              publicKey: 'GOOGLE_OAUTH_PUBLIC_KEY_' + keyGen,
              encryptedPrivateKey: 'GOOGLE_OAUTH_PRIV_KEY_' + keyGen,
              salt: keyGen,
              role: 'user',
              isVerified: true,
              avatarUrl: profile.photos?.[0]?.value,
            });
          } else if (!user.googleId) {
            user.googleId = profile.id;
            await user.save();
          }

          return done(null, user);
        } catch (err) {
          return done(err, undefined);
        }
      }
    )
  );
}

export default passport;
