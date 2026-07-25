import { Schema, model, Document, Types } from 'mongoose';

export interface INotification extends Document {
  userId: Types.ObjectId;
  type: 'VAULT_RECEIVED' | 'VAULT_OPENED' | 'VAULT_EXPIRED' | 'VAULT_REVOKED' | 'SECURITY_ALERT';
  title: string;
  message: string;
  vaultId?: Types.ObjectId;
  senderReceiverId?: string;
  isRead: boolean;
  createdAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      enum: ['VAULT_RECEIVED', 'VAULT_OPENED', 'VAULT_EXPIRED', 'VAULT_REVOKED', 'SECURITY_ALERT'],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    vaultId: { type: Schema.Types.ObjectId, ref: 'Vault' },
    senderReceiverId: { type: String },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Notification = model<INotification>('Notification', notificationSchema);
