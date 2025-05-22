import mongoose, { Document } from 'mongoose';
import { Schema } from 'mongoose';

// Lesson interface
export interface ILesson extends Document {
  teacherId: mongoose.Types.ObjectId;
  courseId?: mongoose.Types.ObjectId;
  studentId?: mongoose.Types.ObjectId;
  title: string;
  description: string;
  price: number;
  duration: number; // dakika cinsinden
  status: 'open' | 'scheduled' | 'completed' | 'cancelled';
  scheduledAt?: Date;
  createdAt: Date;
  completedAt?: Date;
  notified?: boolean; // Bildirim gönderildi mi?
  studentConfirmed?: boolean; // Öğrenci dersi onayladı mı?
}

// Şema tanımı
const lessonSchema = new Schema({
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Öğretmen ID alanı zorunludur']
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: false,
    default: null
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  title: {
    type: String,
    required: [true, 'Ders başlığı zorunludur'],
    trim: true,
    minlength: [3, 'Başlık en az 3 karakter olmalıdır'],
    maxlength: [100, 'Başlık en fazla 100 karakter olabilir']
  },
  description: {
    type: String,
    required: [true, 'Açıklama zorunludur'],
    trim: true,
    minlength: [10, 'Açıklama en az 10 karakter olmalıdır'],
    maxlength: [2000, 'Açıklama en fazla 2000 karakter olabilir']
  },
  price: {
    type: Number,
    required: [true, 'Fiyat zorunludur'],
    min: [0, 'Fiyat 0 veya daha büyük olmalıdır']
  },
  duration: {
    type: Number,
    required: [true, 'Süre zorunludur'],
    min: [15, 'Süre en az 15 dakika olmalıdır'],
    max: [480, 'Süre en fazla 8 saat (480 dakika) olabilir']
  },
  status: {
    type: String,
    required: true,
    enum: {
      values: ['open', 'scheduled', 'completed', 'cancelled'],
      message: 'Geçerli bir durum seçiniz'
    },
    default: 'open'
  },
  scheduledAt: {
    type: Date,
    default: null
  },
  completedAt: {
    type: Date,
    default: null
  },
  studentConfirmed: {
    type: Boolean,
    default: false
  },
  notified: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  strict: true,
  strictQuery: true,
  collection: 'lessons' // Koleksiyon adını açıkça belirt
});

// Indeksleri oluştur
lessonSchema.index({ teacherId: 1 });
lessonSchema.index({ studentId: 1 });
lessonSchema.index({ status: 1 });
lessonSchema.index({ scheduledAt: 1 });

// Modeli oluşturmadan önce koleksiyonun varlığını kontrol et
let Lesson: mongoose.Model<ILesson>;

// Modeli oluştur
try {
  // Önce mevcut modeli temizle
  mongoose.deleteModel('Lesson');
} catch (error) {
  // Model zaten silinmiş olabilir, hatayı yoksay
}

// Yeni model oluştur
Lesson = mongoose.model<ILesson>('Lesson', lessonSchema);

export default Lesson;
