import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  instructor: {
    type: String,
    required: true
  },
  duration: {
    type: String,
    required: true // Örnek: "2 saat 30 dakika"
  },
  level: {
    type: String,
    enum: ['Başlangıç', 'Orta', 'İleri'],
    required: true
  },
  topics: [{
    type: String,
    required: true
  }],
  requirements: [{
    type: String,
    required: true
  }],
  price: {
    type: Number,
    required: true
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  rating: {
    average: {
      type: Number,
      default: 0
    },
    count: {
      type: Number,
      default: 0
    }
  },
  enrollmentCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Güncelleme tarihini otomatik güncelle
courseSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Course = mongoose.models.Course || mongoose.model('Course', courseSchema);

export default Course; 