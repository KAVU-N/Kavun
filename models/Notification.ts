import mongoose, { Schema, Document, models, model } from 'mongoose';

export interface INotification extends Document {
  userId: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: Date;
  actionUrl?: string;
}

const NotificationSchema = new Schema<INotification>({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, required: true },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  actionUrl: { type: String },
});

export default models.Notification || model<INotification>('Notification', NotificationSchema);
