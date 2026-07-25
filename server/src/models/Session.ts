import { Schema, model, Document, Types } from 'mongoose';

export interface ISession extends Document {
  userId: Types.ObjectId;
  refreshToken: string;
  deviceFingerprint: string;
  ipAddress: string;
  userAgent: string;
  lastActive: Date;
  expiresAt: Date;
}

const sessionSchema = new Schema<ISession>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    refreshToken: { type: String, required: true, index: true },
    deviceFingerprint: { type: String, required: true },
    ipAddress: { type: String, default: '127.0.0.1' },
    userAgent: { type: String, default: 'Unknown' },
    lastActive: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Session = model<ISession>('Session', sessionSchema);
