import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Review from '@/models/Review';
import User from '@/models/User';
import jwt from 'jsonwebtoken';

// Veritabanı bağlantısı
connectDB();

// Eğitmen değerlendirme istatistiklerini getir
export async function GET(request: NextRequest) {
  try {
    // JWT doğrulama
    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Yetkilendirme hatası: Token bulunamadı' }, { status: 401 });
    }

    let decoded;
    try {
      const jwtSecret = process.env.JWT_SECRET || 'default_secret';
      decoded = jwt.verify(token, jwtSecret) as {
        userId?: string;
        id?: string;
        _id?: string;
        email: string;
        role: string;
      };
      
      if (!decoded) {
        return NextResponse.json({ error: 'Yetkilendirme hatası: Geçersiz token' }, { status: 401 });
      }
    } catch (error) {
      console.error('Token doğrulama hatası:', error);
      return NextResponse.json({ error: 'Yetkilendirme hatası: Geçersiz token' }, { status: 401 });
    }

    // Kullanıcı ID'sini standartlaştır
    const userId = decoded.userId || decoded.id || decoded._id;
    if (!userId) {
      return NextResponse.json({ error: 'Kullanıcı ID bilgisi bulunamadı' }, { status: 400 });
    }
    
    // Kullanıcıyı bul
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });
    }

    // URL parametrelerini al
    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get('teacherId') || userId;
    
    // Eğitmen rolü kontrolü
    if (teacherId === userId && user.role !== 'teacher') {
      return NextResponse.json({ error: 'Yalnızca eğitmenler kendi istatistiklerini görüntüleyebilir' }, { status: 403 });
    }

    // Ortalama puanı hesapla
    const averageRatingResult = await Review.aggregate([
      { $match: { teacherId } },
      { $group: { _id: null, average: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);
    
    // Puan dağılımını hesapla
    const ratingDistribution = await Review.aggregate([
      { $match: { teacherId } },
      { $group: { _id: '$rating', count: { $sum: 1 } } }
    ]);
    
    // Dağılım sonuçlarını daha kullanışlı bir formata dönüştür
    const distribution: { [key: number]: number } = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0
    };
    
    ratingDistribution.forEach((item) => {
      distribution[item._id] = item.count;
    });
    
    // Son 30 gündeki değerlendirme sayısını hesapla
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentReviewsCount = await Review.countDocuments({
      teacherId,
      createdAt: { $gte: thirtyDaysAgo }
    });
    
    return NextResponse.json({
      averageRating: averageRatingResult.length > 0 ? averageRatingResult[0].average : 0,
      totalReviews: averageRatingResult.length > 0 ? averageRatingResult[0].count : 0,
      distribution,
      recentReviews: recentReviewsCount
    });
    
  } catch (error) {
    console.error('Değerlendirme istatistikleri getirme hatası:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
