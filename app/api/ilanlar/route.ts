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
  instructorFrom: {
    type: String,
    trim: true,
    required: [true, 'Dersi aldığınız eğitmen bilgisi zorunludur'],
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
    
    // Sadece gerekli alanları getirerek optimize et
    const ilanlar = await Ilan.find(query, {
      title: 1,
      description: 1,
      price: 1,
      method: 1,
      duration: 1,
      frequency: 1,
      status: 1,
      instructorFrom: 1,
      userId: 1,
      createdAt: 1,
      updatedAt: 1,
      // Büyük, gereksiz alanlar hariç
    }).sort({ createdAt: -1 });
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
    const { title, description, price, method, duration, frequency, instructorFrom } = body;
    
    // Debug için tüm body'i kontrol et
    console.log('API received body:', body);
    
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
    
    // Token'dan kullanıcı bilgilerini çıkar
    try {
      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      console.log('POST ilan - Token içeriği:', decodedToken);
    } catch (e) {
      console.error('POST ilan - Token çözümlenirken hata:', e);
    }
    
    console.log('POST ilan - Kullanıcı ID:', userId);
    
    // Yeni ilan oluştur
    const yeniIlan = await Ilan.create({
      title,
      description,
      price: Number(price),
      method,
      duration: Number(duration),
      frequency,
      instructorFrom,
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
