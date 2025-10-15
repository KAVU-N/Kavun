import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IEvent extends Document {
  title: string;
  description: string;
  date: Date;
  category?: string;
  location?: string;
  photoUrl?: string;
  resources?: string[];
  clubs: mongoose.Types.ObjectId[];
  universities: string[];
  createdAt: Date;
  updatedAt: Date;
}

const eventSchema = new Schema<IEvent>(
  {
    title: { type: String, required: [true, 'Etkinlik başlığı zorunludur'] },
    description: { type: String, required: [true, 'Etkinlik açıklaması zorunludur'] },
    date: { type: Date, required: [true, 'Etkinlik tarihi zorunludur'] },
    category: { type: String },
    location: { type: String },
    photoUrl: { type: String },
    resources: [{ type: String }],
    clubs: [{ type: Schema.Types.ObjectId, ref: 'Club', required: true }],
    universities: [{ type: String }],
  },
  { timestamps: true }
);

const Event: Model<IEvent> =
  (mongoose.models.Event as Model<IEvent>) || mongoose.model<IEvent>('Event', eventSchema);

export default Event;
