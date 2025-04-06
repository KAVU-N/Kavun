import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';

// İlan şeması
const ilanSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Başlık zorunludur'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Açıklama zorunludur'],
    trim: true,
  },
  price: {
    type: Number,
    required: [true, 'Ücret zorunludur'],
  },
  method: {
    type: String,
    enum: ['online', 'yüzyüze', 'hibrit'],
    default: 'online',
  },
  duration: {
    type: Number,
    required: [true, 'Süre zorunludur'],
  },
  frequency: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'flexible'],
    default: 'weekly',
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  },
  userId: {
    type: String,
    required: true,
  },
}, { timestamps: true });

// Model oluştur veya varsa kullan
const Ilan = mongoose.models.Ilan || mongoose.model('Ilan', ilanSchema);

// GET - Tüm ilanları veya belirli bir kullanıcının ilanlarını getir
export async function GET(req: Request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    
    let query = {};
    if (userId) {
      query = { userId };
    }
    
    const ilanlar = await Ilan.find(query).sort({ createdAt: -1 });
    
    return NextResponse.json(ilanlar);
  } catch (error: any) {
    console.error('İlanları getirme hatası:', error);
    return NextResponse.json(
      { error: error.message || 'İlanlar getirilirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// POST - Yeni ilan oluştur
export async function POST(req: Request) {
  try {
    await connectDB();
    
    const body = await req.json();
    const { title, description, price, method, duration, frequency } = body;
    
    // Token'dan kullanıcı bilgisini al
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Yetkilendirme başarısız' },
        { status: 401 }
      );
    }
    
    const token = authHeader.split(' ')[1];
    // Normalde token doğrulaması yapılır, burada basit bir örnek
    
    // Kullanıcı ID'sini al (gerçek uygulamada token'dan çıkarılır)
    const userId = body.userId; // Bu değer client tarafından gönderilmeli
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Kullanıcı kimliği bulunamadı' },
        { status: 400 }
      );
    }
    
    // Yeni ilan oluştur
    const yeniIlan = await Ilan.create({
      title,
      description,
      price: Number(price),
      method,
      duration: Number(duration),
      frequency,
      status: 'active',
      userId: userId.toString(), // Convert to string to avoid ObjectId issues
    });
    
    return NextResponse.json(yeniIlan, { status: 201 });
  } catch (error: any) {
    console.error('İlan oluşturma hatası:', error);
    return NextResponse.json(
      { error: error.message || 'İlan oluşturulurken bir hata oluştu' },
      { status: 500 }
    );
  }
}
