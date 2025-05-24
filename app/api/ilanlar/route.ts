export const dynamic = "force-dynamic";
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
    default: 1, // Default to 1 hour
  },
  durationHours: {
    type: Number,
    default: 0,
  },
  durationMinutes: {
    type: Number,
    default: 0,
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
  // instructorFrom field has been removed
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
    
    console.log('API GET ilanlar - Requested userId:', userId);
    
    let query = {};
    if (userId) {
      // userId'yi string olarak kullan ve MongoDB ObjectId formatında olabileceğini dikkate al
      // Hem direkt eşleşme hem de string içerme durumlarını kontrol et
      query = { 
        $or: [
          { userId: userId.toString() },
          { userId: { $regex: userId, $options: 'i' } }
        ]
      };
      
      console.log('GET ilanlar - Sorgu:', JSON.stringify(query));
    }
    
    // Hata ayıklama için tüm ilanları kontrol et
    const allIlanlar = await Ilan.find({}).sort({ createdAt: -1 });
    console.log('API GET ilanlar - Tüm ilanlar:', allIlanlar.map(ilan => ({
      id: ilan._id,
      title: ilan.title,
      userId: ilan.userId
    })));
    
    // Kullanıcının ilanlarını getir
    const ilanlar = await Ilan.find(query).sort({ createdAt: -1 });
    console.log('API GET ilanlar - Bulunan ilanlar:', ilanlar.length);
    
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
    const { title, description, price, method, duration, durationHours, durationMinutes, frequency } = body;
    
    // Debug için tüm body'i kontrol et
    console.log('API received body:', body);
    
    // Token'dan kullanıcı bilgisini al
    async function getUserFromToken(req: Request) {
      const headersList = req.headers;
      let token = headersList.get('authorization')?.replace('Bearer ', '');
      // Eğer header'daki token geçersiz bir placeholder ise, yok say
      if (!token || token === '{%Authorization%}' || token.toLowerCase().includes('authoriz')) {
        token = undefined;
      }
      // Cookie'den de token oku
      if (!token) {
        const cookieHeader = headersList.get('cookie');
        if (cookieHeader) {
          const match = cookieHeader.match(/token=([^;]+)/);
          if (match) {
            token = match[1];
          }
        }
      }
      if (!token) return null;
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret');
        return decoded && (decoded.userId || decoded.id || decoded._id);
      } catch (e) {
        return null;
      }
    }
    // ---
    const userId = await getUserFromToken(req);
    if (!userId) {
      return NextResponse.json(
        { error: 'Yetkilendirme başarısız' },
        { status: 401 }
      );
    }
    // Kullanıcı kimliği client'tan alınmaz, token'dan çıkarılır

    // Yeni ilan oluştur
    const yeniIlan = await Ilan.create({
      title,
      description,
      price: Number(price),
      method,
      duration: 1, // Default to 1 hour since we removed this field from the UI
      durationHours: 1,
      durationMinutes: 0,
      frequency,
      status: 'active',
      userId: userId.toString(), // Convert to string to avoid ObjectId issues
    });
    
    console.log('POST ilan - Oluşturulan ilan:', {
      id: yeniIlan._id,
      title: yeniIlan.title,
      userId: yeniIlan.userId
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
