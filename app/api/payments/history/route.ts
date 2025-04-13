import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Payment from '@/models/Payment';
import { verifyJwt } from '@/lib/jwt';

// Veritabanı bağlantısı
connectDB();

// Kullanıcının ödeme geçmişini getir
export async function GET(request: NextRequest) {
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

    // URL parametrelerini al
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;

    // Filtreleme için kullanılacak nesne
    const filter: any = {};

    // Kullanıcı rolüne göre filtreleme
    if (decoded.role === 'student') {
      filter.studentId = decoded.userId;
    } else if (decoded.role === 'teacher') {
      filter.teacherId = decoded.userId;
    }

    // Duruma göre filtreleme
    if (status && ['pending', 'completed', 'refunded', 'failed'].includes(status)) {
      filter.status = status;
    }

    // Toplam ödeme sayısını hesapla
    const totalPayments = await Payment.countDocuments(filter);
    
    // Ödemeleri getir
    const payments = await Payment.find(filter)
      .populate({
        path: 'lessonId',
        select: 'title duration scheduledAt',
      })
      .populate({
        path: 'studentId',
        select: 'name email',
      })
      .populate({
        path: 'teacherId',
        select: 'name email',
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Sayfalama bilgilerini hazırla
    const totalPages = Math.ceil(totalPayments / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      payments,
      pagination: {
        total: totalPayments,
        page,
        limit,
        totalPages,
        hasNextPage,
        hasPrevPage
      }
    });

  } catch (error) {
    console.error('Ödeme geçmişi hatası:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
