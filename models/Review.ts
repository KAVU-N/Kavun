import mongoose, { Document } from 'mongoose';
import { Schema } from 'mongoose';

// Review interface
export interface IReview extends Document {
  lessonId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  teacherId: mongoose.Types.ObjectId;
  rating: number;
  comment: string;
  createdAt: Date;
}

// Şema tanımı
const reviewSchema = new Schema({
  lessonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson',
    required: [true, 'Ders ID alanı zorunludur']
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Öğrenci ID alanı zorunludur']
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Öğretmen ID alanı zorunludur']
  },
  rating: {
    type: Number,
    required: [true, 'Puan zorunludur'],
    min: [1, 'Puan en az 1 olmalıdır'],
    max: [5, 'Puan en fazla 5 olabilir']
  },
  comment: {
    type: String,
    required: [true, 'Yorum zorunludur'],
    trim: true,
    minlength: [3, 'Yorum en az 3 karakter olmalıdır'],
    maxlength: [1000, 'Yorum en fazla 1000 karakter olabilir']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  strict: true,
  strictQuery: true,
  collection: 'reviews' // Koleksiyon adını açıkça belirt
});

// Indeksleri oluştur
reviewSchema.index({ lessonId: 1 });
reviewSchema.index({ studentId: 1 });
reviewSchema.index({ teacherId: 1 });
reviewSchema.index({ rating: 1 });
reviewSchema.index({ createdAt: 1 });

// Bir öğrenci bir dersi sadece bir kez değerlendirebilir
reviewSchema.index({ lessonId: 1, studentId: 1 }, { unique: true });

// Modeli oluşturmadan önce koleksiyonun varlığını kontrol et
let Review: mongoose.Model<IReview>;

// Modeli oluştur
try {
  // Önce mevcut modeli temizle
  mongoose.deleteModel('Review');
} catch (error) {
  // Model zaten silinmiş olabilir, hatayı yoksay
}

// Yeni model oluştur
Review = mongoose.model<IReview>('Review', reviewSchema);

export default Review;
