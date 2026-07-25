import { Schema, model, Document, Types } from 'mongoose';

export interface IActivityLog extends Document {
  userId?: Types.ObjectId;
  receiverId?: string;
  vaultId?: Types.ObjectId;
  action: 'CREATED' | 'OPENED' | 'DOWNLOADED' | 'EXPIRED' | 'REVOKED' | 'LOGIN' | 'LOGOUT' | 'FAILED_LOGIN';
  userAgent: string;
  deviceInfo?: string;
  location?: string;
  status: 'SUCCESS' | 'FAILED';
  details?: string;
  createdAt: Date;
}

const activityLogSchema = new Schema<IActivityLog>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    receiverId: { type: String, index: true },
    vaultId: { type: Schema.Types.ObjectId, ref: 'Vault', index: true },
    action: {
      type: String,
      enum: ['CREATED', 'OPENED', 'DOWNLOADED', 'EXPIRED', 'REVOKED', 'LOGIN', 'LOGOUT', 'FAILED_LOGIN'],
      required: true,
    },
    userAgent: { type: String, default: 'Unknown' },
    deviceInfo: { type: String },
    location: { type: String, default: 'Global / Local' },
    status: { type: String, enum: ['SUCCESS', 'FAILED'], default: 'SUCCESS' },
    details: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const ActivityLog = model<IActivityLog>('ActivityLog', activityLogSchema);
