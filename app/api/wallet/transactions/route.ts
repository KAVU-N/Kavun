import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Wallet from '@/models/Wallet';
import { verifyJwt } from '@/lib/jwt';

// Veritabanı bağlantısı
connectDB();

// Kullanıcının cüzdan işlem geçmişini getir
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
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '20');
    const page = parseInt(searchParams.get('page') || '1');

    // Cüzdanı bul
    const wallet = await Wallet.findOne({ userId: decoded.userId });

    // Cüzdan yoksa boş liste döndür
    if (!wallet) {
      return NextResponse.json({
        transactions: [],
        pagination: {
          total: 0,
          page,
          limit,
          totalPages: 0,
          hasNextPage: false,
          hasPrevPage: false
        }
      });
    }

    // İşlemleri filtrele
    let transactions = wallet.transactions || [];
    
    // Türe göre filtrele
    if (type) {
      transactions = transactions.filter(t => t.type === type);
    }
    
    // Duruma göre filtrele
    if (status) {
      transactions = transactions.filter(t => t.status === status);
    }
    
    // En yeni işlemler önce gelecek şekilde sırala
    transactions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    // Toplam işlem sayısı
    const totalTransactions = transactions.length;
    
    // Sayfalama
    const skip = (page - 1) * limit;
    const paginatedTransactions = transactions.slice(skip, skip + limit);
    
    // Sayfalama bilgilerini hazırla
    const totalPages = Math.ceil(totalTransactions / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      transactions: paginatedTransactions,
      pagination: {
        total: totalTransactions,
        page,
        limit,
        totalPages,
        hasNextPage,
        hasPrevPage
      }
    });

  } catch (error) {
    console.error('İşlem geçmişi hatası:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
