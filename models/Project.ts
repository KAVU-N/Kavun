import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Başlık zorunludur']
  },
  description: {
    type: String,
    required: [true, 'Açıklama zorunludur']
  },
  category: {
    type: String,
    enum: ['Web', 'Mobil', 'Masaüstü', 'Yapay Zeka', 'Genel', 'Diğer'],
    required: [true, 'Kategori zorunludur'],
    default: 'Genel'
  },
  imageUrl: {
    type: String,
    required: [true, 'Resim URL zorunludur'],
    default: '/images/default-project.jpg'
  },
  projectUrl: {
    type: String,
    required: [true, 'Proje URL zorunludur']
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

const Project = mongoose.models.Project || mongoose.model('Project', projectSchema);

export default Project; 