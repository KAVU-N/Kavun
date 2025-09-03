import mongoose, { Document, Model } from 'mongoose';

export interface IClub extends Document {
  name: string;
  university: string;
  category?: string;
  description?: string;
  logoUrl?: string;
  ownerId: string;
  isApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const clubSchema = new mongoose.Schema<IClub>({
  name: { type: String, required: [true, 'İsim zorunludur'] },
  university: { type: String, required: [true, 'Üniversite zorunludur'] },
  category: { type: String },
  description: { type: String },
  logoUrl: { type: String },
  ownerId: { type: String, required: [true, 'Kullanıcı zorunludur'] },
  isApproved: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

// Kullanıcı başına tek kulüp: ownerId benzersiz
clubSchema.index({ ownerId: 1 }, { unique: true });

clubSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Club: Model<IClub> = (mongoose.models.Club as Model<IClub>) || mongoose.model<IClub>('Club', clubSchema);
export default Club;
