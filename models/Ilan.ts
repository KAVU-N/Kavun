import mongoose, { Schema, Document, models, model } from 'mongoose';

type MethodType = 'online' | 'yüzyüze' | 'hibrit';
type FrequencyType = 'daily' | 'weekly' | 'monthly' | 'flexible';
type StatusType = 'active' | 'inactive';

export interface IIlan extends Document {
  title: string;
  description: string;
  price: number;
  method: MethodType;
  duration?: number;
  durationHours?: number;
  durationMinutes?: number;
  frequency: FrequencyType;
  status: StatusType;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

const IlanSchema = new Schema<IIlan>({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  price: { type: Number, required: true },
  method: { type: String, enum: ['online', 'yüzyüze', 'hibrit'], default: 'online' },
  duration: { type: Number, default: 1 },
  durationHours: { type: Number, default: 0 },
  durationMinutes: { type: Number, default: 0 },
  frequency: { type: String, enum: ['daily', 'weekly', 'monthly', 'flexible'], default: 'weekly' },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  userId: { type: String, required: true }
}, { timestamps: true });

export default models.Ilan || model<IIlan>('Ilan', IlanSchema);
