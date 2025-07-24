import mongoose, { Schema, Document, models, model } from 'mongoose';

export interface IAnnouncement extends Document {
  title: string;
  content: string;
  date: Date;
  target: 'all' | 'student' | 'teacher' | 'admin';
  readBy: string[]; // kullanıcının ID listesi
}

const AnnouncementSchema = new Schema<IAnnouncement>({
  title: { type: String, required: true },
  content: { type: String, required: true },
  date: { type: Date, default: Date.now },
  target: { type: String, enum: ['all', 'student', 'teacher', 'admin'], default: 'all', required: true },
  readBy: { type: [String], default: [] }
});

export default models.Announcement || model<IAnnouncement>('Announcement', AnnouncementSchema);
