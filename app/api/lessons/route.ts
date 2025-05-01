import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Lesson from '@/models/Lesson';
import User from '@/models/User';
import { verifyToken } from '@/lib/jwt';
import mongoose from 'mongoose';

// Veritabanı bağlantısı
connectDB();

// Ders oluşturma (eğitmen ve öğrenci)
export async function POST(request: NextRequest) {
  try {
    // JWT doğrulama
    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Yetkilendirme hatası: Token bulunamadı' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Yetkilendirme hatası: Geçersiz token' }, { status: 401 });
    }

    // Kullanıcı rolünü kontrol et
    const user = await User.findById(decoded.id);
    if (!user) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });
    }

    // İstek gövdesinden veri al
    const data = await request.json();

    if (user.role === 'instructor') {
      // Eğitmen yeni ders açıyor
      // Gerekli alanları doğrula
      if (!data.title || !data.description || !data.price || !data.duration) {
        return NextResponse.json({ error: 'Lütfen tüm gerekli alanları doldurun' }, { status: 400 });
      }
      // Yeni ders oluştur
      const newLesson = await Lesson.create({
        teacherId: user._id,
        title: data.title,
        description: data.description,
        price: data.price,
        duration: data.duration,
        status: 'open'
      });
      return NextResponse.json({ 
        message: 'Ders başarıyla oluşturuldu', 
        lesson: newLesson 
      }, { status: 201 });
    } else if (user.role === 'student') {
      // Öğrenci rezervasyon ile ders oluşturuyor
      // Gerekli alanları doğrula
      if (!data.title || !data.description || !data.price || !data.duration || !data.teacherId || !data.scheduledAt) {
        return NextResponse.json({ error: 'Lütfen tüm gerekli alanları doldurun (öğrenci rezervasyonu)' }, { status: 400 });
      }
      try {
        const teacherObjectId = new mongoose.Types.ObjectId(data.teacherId);
        const newLesson = await Lesson.create({
          teacherId: teacherObjectId,
          studentId: user._id,
          title: data.title,
          description: data.description,
          price: data.price,
          duration: data.duration,
          status: 'scheduled',
          scheduledAt: data.scheduledAt,
          lessonType: data.lessonType || 'individual',
          groupSize: data.groupSize || undefined
        });
        return NextResponse.json({
          message: 'Ders rezervasyonu başarıyla oluşturuldu',
          lesson: newLesson
        }, { status: 201 });
      } catch (err) {
        console.error('Öğrenci rezervasyonunda hata:', err);
        return NextResponse.json({ error: 'Ders rezervasyonunda sunucu hatası', details: err instanceof Error ? err.message : err }, { status: 500 });
      }
    } else {
      return NextResponse.json({ error: 'Bu işlem için yetkiniz yok' }, { status: 403 });
    }

  } catch (error) {
    console.error('Ders oluşturma hatası:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

// Tüm dersleri getir (filtreleme ile)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Filtre parametreleri
    const status = searchParams.get('status');
    const teacherId = searchParams.get('teacherId');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    
    // Filtre objesini oluştur
    const filter: any = {};
    
    if (status) filter.status = status;
    if (teacherId) filter.teacherId = teacherId;
    if (minPrice) filter.price = { $gte: parseFloat(minPrice) };
    if (maxPrice) {
      if (filter.price) {
        filter.price.$lte = parseFloat(maxPrice);
      } else {
        filter.price = { $lte: parseFloat(maxPrice) };
      }
    }
    
    // Açık durumundaki dersleri göster
    if (!status) {
      filter.status = 'open';
    }
    
    // Dersleri getir
    const lessons = await Lesson.find(filter)
      .populate('teacherId', 'name email university expertise')
      .sort({ createdAt: -1 })
      .limit(50);
    
    return NextResponse.json(lessons);
    
  } catch (error) {
    console.error('Dersleri getirme hatası:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
