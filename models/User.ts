import mongoose, { Document } from 'mongoose';
import { Schema } from 'mongoose';

// User interface
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'student' | 'teacher';
  university: string;
  isVerified: boolean;
  verificationCode?: string;
  verificationCodeExpires?: Date;
  resetPasswordCode?: string;
  resetPasswordExpires?: Date;
  createdAt: Date;
}

// Şema tanımı
const userSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Ad alanı zorunludur'],
    trim: true,
    minlength: [2, 'Ad en az 2 karakter olmalıdır'],
    maxlength: [50, 'Ad en fazla 50 karakter olabilir']
  },
  email: {
    type: String,
    required: [true, 'Email alanı zorunludur'],
    unique: true,
    trim: true,
    lowercase: true,
    validate: {
      validator: function(v: string) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'Geçerli bir email adresi giriniz'
    }
  },
  password: {
    type: String,
    required: [true, 'Şifre alanı zorunludur'],
    minlength: [8, 'Şifre en az 8 karakter olmalıdır'],
    select: false
  },
  role: {
    type: String,
    required: [true, 'Rol alanı zorunludur'],
    enum: {
      values: ['student', 'teacher'],
      message: 'Geçerli bir rol seçiniz'
    }
  },
  university: {
    type: String,
    required: [true, 'Üniversite alanı zorunludur'],
    trim: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationCode: String,
  verificationCodeExpires: Date,
  resetPasswordCode: String,
  resetPasswordExpires: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  strict: true,
  strictQuery: true,
  collection: 'users' // Koleksiyon adını açıkça belirt
});

// Email için index oluştur
userSchema.index({ email: 1 }, { unique: true });

// Modeli oluşturmadan önce koleksiyonun varlığını kontrol et
let User: mongoose.Model<IUser>;

// Modeli oluştur
try {
  // Önce mevcut modeli temizle
  mongoose.deleteModel('User');
} catch (error) {
  // Model zaten silinmiş olabilir, hatayı yoksay
}

// Yeni model oluştur
User = mongoose.model<IUser>('User', userSchema);

export default User;