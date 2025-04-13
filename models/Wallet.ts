import mongoose, { Document } from 'mongoose';
import { Schema } from 'mongoose';

// Transaction interface (alt şema için)
export interface ITransaction {
  amount: number;
  type: 'deposit' | 'withdraw' | 'lesson_payment' | 'lesson_earning' | 'refund';
  status: 'pending' | 'completed' | 'failed';
  description: string;
  referenceId?: mongoose.Types.ObjectId; // Ödeme veya ders ID'si
  createdAt: Date;
}

// Transaction şeması
const transactionSchema = new Schema({
  amount: {
    type: Number,
    required: [true, 'Tutar zorunludur'],
  },
  type: {
    type: String,
    required: [true, 'İşlem tipi zorunludur'],
    enum: {
      values: ['deposit', 'withdraw', 'lesson_payment', 'lesson_earning', 'refund'],
      message: 'Geçerli bir işlem tipi seçiniz'
    }
  },
  status: {
    type: String,
    required: [true, 'Durum zorunludur'],
    enum: {
      values: ['pending', 'completed', 'failed'],
      message: 'Geçerli bir işlem durumu seçiniz'
    },
    default: 'pending'
  },
  description: {
    type: String,
    required: [true, 'Açıklama zorunludur'],
    trim: true
  },
  referenceId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Wallet interface
export interface IWallet extends Document {
  userId: mongoose.Types.ObjectId;
  balance: number;
  transactions: ITransaction[];
  lastUpdated: Date;
}

// Wallet şeması
const walletSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Kullanıcı ID alanı zorunludur'],
    unique: true
  },
  balance: {
    type: Number,
    required: [true, 'Bakiye zorunludur'],
    default: 0,
    min: [0, 'Bakiye 0 veya daha büyük olmalıdır']
  },
  transactions: [transactionSchema],
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  strict: true,
  strictQuery: true,
  collection: 'wallets' // Koleksiyon adını açıkça belirt
});

// Indeksleri oluştur
walletSchema.index({ userId: 1 }, { unique: true });
walletSchema.index({ 'transactions.status': 1 });
walletSchema.index({ 'transactions.type': 1 });
walletSchema.index({ 'transactions.createdAt': 1 });

// Modeli oluşturmadan önce koleksiyonun varlığını kontrol et
let Wallet: mongoose.Model<IWallet>;

// Modeli oluştur
try {
  // Önce mevcut modeli temizle
  mongoose.deleteModel('Wallet');
} catch (error) {
  // Model zaten silinmiş olabilir, hatayı yoksay
}

// Yeni model oluştur
Wallet = mongoose.model<IWallet>('Wallet', walletSchema);

export default Wallet;
