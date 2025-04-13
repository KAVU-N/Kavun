import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Lesson from '@/models/Lesson';
import User from '@/models/User';
import Payment from '@/models/Payment';
import { verifyJwt } from '@/lib/jwt';
import mongoose from 'mongoose';
import { create3DSecurePayment } from '@/lib/payment';

// Veritabanı bağlantısı
connectDB();

// Ödeme başlatma
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

    // Öğrenci kontrolü
    if (user.role !== 'student') {
      return NextResponse.json({ error: 'Bu işlem için öğrenci hesabı gereklidir' }, { status: 403 });
    }

    // İstek verilerini al
    const data = await request.json();
    const { lessonId, cardData } = data;

    // Gerekli verileri kontrol et
    if (!lessonId || !cardData) {
      return NextResponse.json({ error: 'Ders ID ve kart bilgileri gereklidir' }, { status: 400 });
    }

    // Kart verilerini kontrol et
    if (!cardData.cardHolderName || !cardData.cardNumber || !cardData.expireMonth || !cardData.expireYear || !cardData.cvc) {
      return NextResponse.json({ error: 'Tüm kart bilgilerini eksiksiz doldurun' }, { status: 400 });
    }

    // Geçerli bir ID mi kontrol et
    if (!mongoose.isValidObjectId(lessonId)) {
      return NextResponse.json({ error: 'Geçersiz ders ID formatı' }, { status: 400 });
    }

    // Dersi bul
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return NextResponse.json({ error: 'Ders bulunamadı' }, { status: 404 });
    }

    // Ders durumunu kontrol et
    if (lesson.status !== 'scheduled') {
      return NextResponse.json({ error: 'Bu ders ödeme için uygun değil' }, { status: 400 });
    }

    // Öğrencinin kendisine ait ders mi kontrol et
    if (lesson.studentId?.toString() !== user._id.toString()) {
      return NextResponse.json({ error: 'Bu ders size ait değil' }, { status: 403 });
    }

    // Komisyon hesapla (toplam ücretin %10'u)
    const commission = parseFloat((lesson.price * 0.1).toFixed(2));
    const totalAmount = lesson.price;

    // Ödeme kaydını oluştur
    const payment = await Payment.create({
      lessonId: lesson._id,
      studentId: user._id,
      teacherId: lesson.teacherId,
      amount: totalAmount,
      commission,
      status: 'pending',
      paymentMethod: 'credit_card',
      createdAt: new Date()
    });

    // Callback URL'i oluştur
    const callbackUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/payment/callback?paymentId=${payment._id}`;

    // 3D Secure ödeme başlat
    const result = await create3DSecurePayment(
      user,
      lesson,
      cardData,
      callbackUrl
    ) as any;

    if (result.status === 'success') {
      // HTML formunu döndür
      return NextResponse.json({
        message: 'Ödeme işlemi başlatıldı',
        paymentId: payment._id,
        htmlContent: result.threeDSHtmlContent
      });
    } else {
      // Ödeme başlatma başarısız
      await Payment.findByIdAndUpdate(payment._id, { status: 'failed' });
      
      return NextResponse.json({
        error: 'Ödeme işlemi başlatılamadı',
        errorCode: result.errorCode,
        errorMessage: result.errorMessage
      }, { status: 400 });
    }

  } catch (error) {
    console.error('Ödeme başlatma hatası:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
