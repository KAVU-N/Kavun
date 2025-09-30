import mongoose, { Schema, Document, models, model } from 'mongoose';

export interface IResource extends Document {
  title: string;
  description: string;
  author: string;
  category: string;
  format: string;
  level?: string;
  university?: string;
  department?: string;
  course?: string;
  fileSize?: string;
  tags: string[];
  url?: string;
  fileData?: string;
  fileName?: string;
  fileType?: string;
  downloadCount: number;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const ResourceSchema = new Schema<IResource>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  author: { type: String, required: true },
  category: { type: String, required: true },
  format: { type: String, required: true },
  level: { type: String },
  university: { type: String },
  department: { type: String },
  course: { type: String },
  fileSize: { type: String },
  tags: { type: [String], default: [] },
  url: { type: String },
  fileData: { type: String },
  fileName: { type: String },
  fileType: { type: String },
  downloadCount: { type: Number, default: 0 },
  viewCount: { type: Number, default: 0 },
}, {
  timestamps: true
});

// createdAt alanına index ekle
ResourceSchema.index({ createdAt: -1 });

export default models.Resource || model<IResource>('Resource', ResourceSchema);
