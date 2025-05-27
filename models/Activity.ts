import mongoose, { Schema, Document } from 'mongoose';

export interface IActivity extends Document {
  type: string; // 'user', 'resource', 'payment', 'lesson', etc.
  action: string; // 'created', 'updated', 'deleted', etc.
  userId?: string;
  userName?: string;
  description: string;
  createdAt: Date;
}

const ActivitySchema = new Schema<IActivity>({
  type: { type: String, required: true },
  action: { type: String, required: true },
  userId: { type: String },
  userName: { type: String },
  description: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Activity || mongoose.model<IActivity>('Activity', ActivitySchema);
