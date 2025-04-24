import mongoose, { Document } from 'mongoose';
import { Schema } from 'mongoose';

// User interface
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'student' | 'instructor';
  university: string;
  grade?: number; // Kaçıncı sınıf olduğu bilgisi
  isVerified: boolean;
  verificationCode?: string;
  verificationCodeExpires?: Date;
  resetPasswordCode?: string;
  resetPasswordExpires?: Date;
  expertise?: string; // Okuduğu bölüm
  profilePhotoUrl?: string; // Profil fotoğrafı URL'si
  createdAt: Date;
  welcomeNotificationDeleted: boolean;
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
    // unique: true, // Buradaki unique'i kaldırıyoruz, aşağıda index olarak tanımlıyoruz
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
      values: ['student', 'instructor'],
      message: 'Geçerli bir rol seçiniz'
    }
  },
  university: {
    type: String,
    required: [true, 'Üniversite alanı zorunludur'],
    trim: true
  },
  grade: {
    type: Number,
    min: [1, 'Sınıf en az 1 olabilir'],
    max: [6, 'Sınıf en fazla 6 olabilir']
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationCode: String,
  verificationCodeExpires: Date,
  resetPasswordCode: String,
  resetPasswordExpires: Date,
  expertise: {
    type: String,
    default: '',
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
<<<<<<< Updated upstream
  welcomeNotificationDeleted: {
    type: Boolean,
    default: false
=======
  profilePhotoUrl: {
    type: String,
    default: ''
>>>>>>> Stashed changes
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