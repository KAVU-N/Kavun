import mongoose, { Schema, Document, models, model } from 'mongoose';

export interface IResourceActivity extends Document {
  resourceId: mongoose.Types.ObjectId | string;
  activityType: 'view' | 'download' | 'preview';
  userId: mongoose.Types.ObjectId | string | null;
  userAgent: string;
  ipAddress: string;
  timestamp: Date;
}

const ResourceActivitySchema = new Schema<IResourceActivity>({
  resourceId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Resource', 
    required: true 
  },
  activityType: { 
    type: String, 
    enum: ['view', 'download', 'preview'], 
    required: true 
  },
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    default: null 
  },
  userAgent: { 
    type: String, 
    default: 'unknown' 
  },
  ipAddress: { 
    type: String, 
    default: 'unknown' 
  },
  timestamp: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true
});

// İndeksleme ekle
ResourceActivitySchema.index({ resourceId: 1 });
ResourceActivitySchema.index({ activityType: 1 });
ResourceActivitySchema.index({ timestamp: 1 });
ResourceActivitySchema.index({ userId: 1 });

export default models.ResourceActivity || model<IResourceActivity>('ResourceActivity', ResourceActivitySchema);
