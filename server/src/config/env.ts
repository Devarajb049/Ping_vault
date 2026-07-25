import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  PORT: process.env.PORT || '5000',
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGO_URI: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/pingvault',
  JWT_SECRET: process.env.JWT_SECRET || 'pingvault_super_secret_jwt_key_2026_x8491k',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'pingvault_refresh_jwt_key_2026_m821k',
  JWT_EXPIRES_IN: '15m',
  REFRESH_EXPIRES_IN: '7d',
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || 'mock-google-client-id',
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || 'mock-google-client-secret',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',
};
