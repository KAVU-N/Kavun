import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Wallet from '@/models/Wallet';
import { verifyJwt } from '@/lib/jwt';

// Veritabanı bağlantısı
connectDB();

// Kullanıcının cüzdan bakiyesini getir
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

    // Cüzdanı bul
    let wallet = await Wallet.findOne({ userId: decoded.userId });

    // Cüzdan yoksa oluştur
    if (!wallet) {
      wallet = await Wallet.create({
        userId: decoded.userId,
        balance: 0,
        transactions: [],
        lastUpdated: new Date()
      });
    }

    return NextResponse.json({
      userId: wallet.userId,
      balance: wallet.balance,
      lastUpdated: wallet.lastUpdated
    });

  } catch (error) {
    console.error('Bakiye sorgulama hatası:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
