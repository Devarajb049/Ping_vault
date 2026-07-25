import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
  fullName: string;
  username: string;
  email: string;
  passwordHash?: string;
  googleId?: string;
  receiverId: string; // Unique format PV-XXXXX
  publicKey: string; // RSA-4096 PEM Public Key
  encryptedPrivateKey: string; // AES-256-GCM Encrypted Private Key
  salt: string;
  role: 'user' | 'admin';
  isVerified: boolean;
  securityScore: number;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    fullName: { type: String, required: true, trim: true },
    username: { type: String, required: true, unique: true, trim: true, index: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true, index: true },
    passwordHash: { type: String },
    googleId: { type: String, index: true },
    receiverId: { type: String, required: true, unique: true, index: true },
    publicKey: { type: String, required: true },
    encryptedPrivateKey: { type: String, required: true },
    salt: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    isVerified: { type: Boolean, default: true },
    securityScore: { type: Number, default: 95 },
    avatarUrl: { type: String },
  },
  { timestamps: true }
);

export const User = model<IUser>('User', userSchema);
