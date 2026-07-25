import { Schema, model, Document, Types } from 'mongoose';

export interface ISharedVault extends Document {
  vaultId: Types.ObjectId;
  senderId: Types.ObjectId;
  receiverIdHash: string; // HMAC blind index (zero-knowledge receiver lookup)
  receiverIdEncrypted: string; // Encrypted receiver string (AES-256-GCM)
  encryptedSymmetricKey: string;
  status: 'pending' | 'opened' | 'expired' | 'revoked';
  viewsCount: number;
  lastViewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const sharedVaultSchema = new Schema<ISharedVault>(
  {
    vaultId: { type: Schema.Types.ObjectId, ref: 'Vault', required: true, index: true },
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    receiverIdHash: { type: String, required: true, index: true },
    receiverIdEncrypted: { type: String, required: true },
    encryptedSymmetricKey: { type: String, required: true },
    status: { type: String, enum: ['pending', 'opened', 'expired', 'revoked'], default: 'pending', index: true },
    viewsCount: { type: Number, default: 0 },
    lastViewedAt: { type: Date },
  },
  { timestamps: true }
);

export const SharedVault = model<ISharedVault>('SharedVault', sharedVaultSchema);
