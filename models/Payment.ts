import mongoose, { Document } from 'mongoose';
import { Schema } from 'mongoose';

// Payment interface
export interface IPayment extends Document {
  lessonId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  teacherId: mongoose.Types.ObjectId;
  amount: number;
  commission: number;
  status: 'pending' | 'completed' | 'refunded' | 'disputed';
  paymentMethod: string;
  paymentId?: string; // Ödeme servisinden dönen id
  createdAt: Date;
  completedAt?: Date;
  refundedAt?: Date;
}

// Şema tanımı
const paymentSchema = new Schema({
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
  amount: {
    type: Number,
    required: [true, 'Tutar zorunludur'],
    min: [1, 'Tutar en az 1 TL olmalıdır']
  },
  commission: {
    type: Number,
    required: [true, 'Komisyon zorunludur'],
    min: [0, 'Komisyon 0 veya daha büyük olmalıdır']
  },
  status: {
    type: String,
    required: true,
    enum: {
      values: ['pending', 'completed', 'refunded', 'disputed'],
      message: 'Geçerli bir ödeme durumu seçiniz'
    },
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    required: [true, 'Ödeme yöntemi zorunludur'],
    enum: {
      values: ['credit_card', 'bank_transfer', 'wallet'],
      message: 'Geçerli bir ödeme yöntemi seçiniz'
    }
  },
  paymentId: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date,
    default: null
  },
  refundedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  strict: true,
  strictQuery: true,
  collection: 'payments' // Koleksiyon adını açıkça belirt
});

// Indeksleri oluştur
paymentSchema.index({ lessonId: 1 });
paymentSchema.index({ studentId: 1 });
paymentSchema.index({ teacherId: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ createdAt: 1 });

// Modeli oluşturmadan önce koleksiyonun varlığını kontrol et
let Payment: mongoose.Model<IPayment>;

// Modeli oluştur
try {
  // Önce mevcut modeli temizle
  mongoose.deleteModel('Payment');
} catch (error) {
  // Model zaten silinmiş olabilir, hatayı yoksay
}

// Yeni model oluştur
Payment = mongoose.model<IPayment>('Payment', paymentSchema);

export default Payment;
