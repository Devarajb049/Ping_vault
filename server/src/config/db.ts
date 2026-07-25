import mongoose from 'mongoose';
import dns from 'dns';
import { ENV } from './env';

// Force Node.js to use Google & Cloudflare public DNS for SRV resolution
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // fallback if environment restricts DNS overriding
}

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(ENV.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`[MongoDB] Connected Successfully to Host: ${conn.connection.host}`);
  } catch (error: any) {
    console.error(`[MongoDB Error] Connection failed: ${error.message}`);
    console.warn(`[MongoDB Warning] Operating in fallback mode if database server is unavailable.`);
  }
};
