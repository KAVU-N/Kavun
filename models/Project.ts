import mongoose, { Document, Model } from 'mongoose';

export interface IProject extends Document {
  title: string;
  description: string;
  shortDescription?: string;
  requirements?: string;
  benefits?: string;
  category: 'Web' | 'Mobil' | 'Masaüstü' | 'Yapay Zeka' | 'Genel' | 'Diğer';
  ownerId: string;
  contact: string;
  isApproved: boolean;
  linkedinUrl: string;
  projectUrl?: string;
  technologies?: string[];
  githubUrl?: string;
  liveUrl?: string;
  status: 'Devam Ediyor' | 'Tamamlandı' | 'Planlanıyor';
  createdAt: Date;
  updatedAt: Date;
}

const projectSchema = new mongoose.Schema<IProject>({
  title: {
    type: String,
    required: [true, 'Başlık zorunludur']
  },
  description: {
    type: String,
    required: [true, 'Açıklama zorunludur']
  },
  shortDescription: {
    type: String
  },
  requirements: {
    type: String
  },
  benefits: {
    type: String
  },
  category: {
    type: String,
    enum: ['Web', 'Mobil', 'Masaüstü', 'Yapay Zeka', 'Genel', 'Diğer'],
    required: [true, 'Kategori zorunludur'],
    default: 'Genel'
  },

  ownerId: {
    type: String,
    required: [true, 'Kullanıcı zorunludur']
  },
  contact: {
    type: String,
    required: [true, 'İletişim bilgisi zorunludur']
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  linkedinUrl: {
    type: String,
    required: [true, 'LinkedIn URL zorunludur']
  },
  projectUrl: {
    type: String // eski alan ile geriye uyum
  },
  technologies: [{
    type: String
  }],
  githubUrl: {
    type: String
  },
  liveUrl: {
    type: String
  },
  status: {
    type: String,
    enum: ['Devam Ediyor', 'Tamamlandı', 'Planlanıyor'],
    default: 'Devam Ediyor'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Güncelleme tarihini otomatik güncelle
projectSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Project: Model<IProject> = (mongoose.models.Project as Model<IProject>) || mongoose.model<IProject>('Project', projectSchema);

export default Project; 