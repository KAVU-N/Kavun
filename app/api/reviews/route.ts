import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Review from '@/models/Review';
import Lesson from '@/models/Lesson';
import User from '@/models/User';
import { verifyJwt } from '@/lib/jwt';
import mongoose from 'mongoose';

// Veritabanı bağlantısı
connectDB();

// Değerlendirme oluşturma
export async function POST(request: NextRequest) {
  try {
    // JWT doğrulama
    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Yetkilendirme hatası: Token bulunamadı' }, { status: 401 });
    }

    const decoded = await verifyJwt(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Yetkilendirme hatası: Geçersiz token' }, { status: 401 });
    }

    // Kullanıcıyı bul
    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });
    }

    // Rol kontrolü: öğrenci veya admin olabilir
    if (user.role !== 'student' && user.role !== 'admin') {
      return NextResponse.json({ error: 'Yalnızca öğrenciler ve adminler değerlendirme yapabilir' }, { status: 403 });
    }

    // İstek verilerini al
    const data = await request.json();
    const { lessonId, teacherId, rating, comment } = data;

    // Gerekli alanları kontrol et
    if (!lessonId || !teacherId || !rating || !comment) {
      return NextResponse.json({ error: 'Tüm alanlar doldurulmalıdır' }, { status: 400 });
    }

    // ID formatlarını kontrol et
    if (!mongoose.isValidObjectId(lessonId) || !mongoose.isValidObjectId(teacherId)) {
      return NextResponse.json({ error: 'Geçersiz ID formatı' }, { status: 400 });
    }

    // Dersi kontrol et
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return NextResponse.json({ error: 'Ders bulunamadı' }, { status: 404 });
    }

    // Öğretmeni kontrol et
    const teacher = await User.findById(teacherId);
    if (!teacher || teacher.role !== 'teacher') {
      return NextResponse.json({ error: 'Öğretmen bulunamadı' }, { status: 404 });
    }

    // Dersin öğrencisi olduğunu doğrula (sadece öğrenci rolü için)
    if (user.role === 'student') {
      if (!lesson.studentId || lesson.studentId.toString() !== String(user._id)) {
        return NextResponse.json({ error: 'Bu dersi değerlendirme yetkiniz yok' }, { status: 403 });
      }
    }

    // Dersin tamamlanmış olduğunu kontrol et
    if (lesson.status !== 'completed') {
      return NextResponse.json({ error: 'Yalnızca tamamlanmış dersler değerlendirilebilir' }, { status: 400 });
    }

    // Önceki değerlendirmeyi kontrol et
    const existingReview = await Review.findOne({
      lessonId,
      studentId: user._id
    });

    if (existingReview) {
      return NextResponse.json({ error: 'Bu ders için zaten bir değerlendirme yapmışsınız' }, { status: 400 });
    }

    // Değerlendirme puanını kontrol et
    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Değerlendirme puanı 1-5 arasında olmalıdır' }, { status: 400 });
    }

    // Yeni değerlendirme oluştur
    const newReview = await Review.create({
      lessonId,
      studentId: user._id, // admin ise adminin id'si yazılır
      teacherId,
      rating,
      comment
    });

    return NextResponse.json({
      message: 'Değerlendirme başarıyla oluşturuldu',
      review: newReview
    }, { status: 201 });

  } catch (error) {
    console.error('Değerlendirme oluşturma hatası:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

// Değerlendirmeleri getir
export async function GET(request: NextRequest) {
  try {
    // URL parametrelerini al
    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get('teacherId');
    const lessonId = searchParams.get('lessonId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    // Filtre oluştur
    const filter: any = {};
    
    // Öğretmen ID'sine göre filtrele
    if (teacherId) {
      if (!mongoose.isValidObjectId(teacherId)) {
        return NextResponse.json({ error: 'Geçersiz öğretmen ID formatı' }, { status: 400 });
      }
      filter.teacherId = teacherId;
    }
    
    // Ders ID'sine göre filtrele
    if (lessonId) {
      if (!mongoose.isValidObjectId(lessonId)) {
        return NextResponse.json({ error: 'Geçersiz ders ID formatı' }, { status: 400 });
      }
      filter.lessonId = lessonId;
    }
    
    // Sayfalama için değerleri hesapla
    const skip = (page - 1) * limit;
    
    // Değerlendirmeleri getir
    const reviews = await Review.find(filter)
      .populate('studentId', 'name email')
      .populate('teacherId', 'name email expertise')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    // Toplam değerlendirme sayısını hesapla
    const totalReviews = await Review.countDocuments(filter);
    
    // Ortalama puanı hesapla
    const averageRating = await Review.aggregate([
      { $match: filter },
      { $group: { _id: null, average: { $avg: '$rating' } } }
    ]);
    
    // Sayfalama bilgilerini hazırla
    const totalPages = Math.ceil(totalReviews / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;
    
    return NextResponse.json({
      reviews,
      pagination: {
        total: totalReviews,
        page,
        limit,
        totalPages,
        hasNextPage,
        hasPrevPage
      },
      averageRating: averageRating.length > 0 ? averageRating[0].average : 0
    });
    
  } catch (error) {
    console.error('Değerlendirmeleri getirme hatası:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
