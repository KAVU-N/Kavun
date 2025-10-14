export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Ilan from '@/models/Ilan';

// GET - Tüm ilanları veya belirli bir kullanıcının ilanlarını getir
export async function GET(req: Request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const method = searchParams.get('method');
    
    console.log('API GET ilanlar - Requested userId:', userId);
    
    const query: Record<string, any> = {};
    if (userId) {
      query.$or = [
        { userId: userId.toString() },
        { userId: { $regex: userId, $options: 'i' } }
      ];
    }
    if (search) {
      query.$or = [
        ...(query.$or || []),
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (status) {
      query.status = status;
    }
    if (method) {
      query.method = method;
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
