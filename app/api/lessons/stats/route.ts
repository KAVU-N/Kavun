import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Lesson from '@/models/Lesson';
import { extractTokenFromRequest, verifyToken } from '@/lib/jwt';

// Ders istatistiklerini getiren API endpoint'i
export async function GET(request: Request) {
  await connectDB();

  try {
    // Token'i çıkar ve doğrula
    const token = extractTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ error: 'Yetkilendirme başarısız: Token bulunamadı' }, { status: 401 });
    }
    
    // Token'i doğrula ve kullanıcı bilgilerini al
    let user;
    try {
      user = verifyToken(token);
      console.log('Doğrulanmış kullanıcı:', user);
    } catch (tokenError) {
      console.error('Token doğrulama hatası:', tokenError);
      return NextResponse.json({ error: 'Yetkilendirme başarısız: Geçersiz token' }, { status: 401 });
    }

    // URL'den sorgu parametrelerini al
    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get('teacherId');
    const studentId = searchParams.get('studentId');

    // Sorgu filtresi oluştur
    let filter: any = {};
    
    if (teacherId) {
      filter.teacherId = teacherId;
      
      // Öğretmen sadece kendi derslerini görebilir
      if (user.role === 'teacher' && user.id !== teacherId) {
        return NextResponse.json({ error: 'Bu derslere erişim izniniz yok' }, { status: 403 });
      }
    } else if (studentId) {
      filter.studentId = studentId;
      
      // Öğrenci sadece kendi derslerini görebilir
      if (user.role === 'student' && user.id !== studentId) {
        return NextResponse.json({ error: 'Bu derslere erişim izniniz yok' }, { status: 403 });
      }
    } else {
      return NextResponse.json({ error: 'Geçersiz sorgu parametreleri' }, { status: 400 });
    }

    // Ders sayılarını duruma göre hesapla
    const totalLessons = await Lesson.countDocuments(filter);
    const completedLessons = await Lesson.countDocuments({ ...filter, status: 'completed' });
    const pendingLessons = await Lesson.countDocuments({ ...filter, status: 'pending' });
    const cancelledLessons = await Lesson.countDocuments({ ...filter, status: 'cancelled' });
    const upcomingLessons = await Lesson.countDocuments({ 
      ...filter, 
      status: 'confirmed',
      startTime: { $gt: new Date() }
    });

    // Son 5 dersi getir
    const recentLessons = await Lesson.find(filter)
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // İstatistikleri döndür
    return NextResponse.json({
      total: totalLessons,
      completed: completedLessons,
      pending: pendingLessons,
      cancelled: cancelledLessons,
      upcoming: upcomingLessons,
      recentLessons
    });

  } catch (error: any) {
    console.error('Ders istatistikleri getirme hatası:', error);
    return NextResponse.json({ error: error.message || 'Sunucu hatası' }, { status: 500 });
  }
}
