import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('MongoDB bağlantı adresi bulunamadı. Lütfen .env dosyasını kontrol edin.');
}

const dbConnect = async () => {
  try {
    // Global değişken, bağlantı zaten kurulduysa tekrar bağlanma
    if (mongoose.connection.readyState === 1) {
      return;
    }

    return await mongoose.connect(MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
  } catch (error) {
    console.error('MongoDB bağlantı hatası:', error);
    throw new Error('MongoDB bağlantısı başarısız oldu.');
  }
};

export default dbConnect; 