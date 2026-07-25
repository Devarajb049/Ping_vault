import { Schema, model, Document, Types } from 'mongoose';

export interface IVault extends Document {
  ownerId: Types.ObjectId;
  titleEncrypted: string;
  ciphertext: string;
  iv: string;
  authTag: string;
  fileMetadata?: {
    originalNameEncrypted?: string;
    mimeType: string;
    size: number;
    fileUrl?: string;
  };
  isPasswordProtected: boolean;
  passwordHash?: string;
  isOTPRequired: boolean;
  expiryTime?: Date;
  maxViews?: number;
  deleteAfterReading: boolean;
  options: {
    allowDownload: boolean;
    allowCopy: boolean;
    allowPrint: boolean;
    watermark: boolean;
    notifyOnOpen: boolean;
  };
  isArchived: boolean;
  isStarred: boolean;
  totalViews: number;
  createdAt: Date;
  updatedAt: Date;
}

const vaultSchema = new Schema<IVault>(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    titleEncrypted: { type: String, required: true },
    ciphertext: { type: String, required: true },
    iv: { type: String, required: true },
    authTag: { type: String, required: true },
    fileMetadata: {
      originalNameEncrypted: { type: String },
      mimeType: { type: String, default: 'text/plain' },
      size: { type: Number, default: 0 },
      fileUrl: { type: String },
    },
    isPasswordProtected: { type: Boolean, default: false },
    passwordHash: { type: String },
    isOTPRequired: { type: Boolean, default: false },
    expiryTime: { type: Date },
    maxViews: { type: Number },
    deleteAfterReading: { type: Boolean, default: false },
    options: {
      allowDownload: { type: Boolean, default: true },
      allowCopy: { type: Boolean, default: true },
      allowPrint: { type: Boolean, default: true },
      watermark: { type: Boolean, default: false },
      notifyOnOpen: { type: Boolean, default: true },
    },
    isArchived: { type: Boolean, default: false },
    isStarred: { type: Boolean, default: false },
    totalViews: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Single TTL Index on expiryTime
vaultSchema.index({ expiryTime: 1 }, { expireAfterSeconds: 0 });

export const Vault = model<IVault>('Vault', vaultSchema);
