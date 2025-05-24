import { NextRequest, NextResponse } from 'next/server';

// Iyzico veya ödeme entegrasyonu kullanılmıyorsa build'i kırmamak için koruma:
const IYZICO_DISABLED = !process.env.IYZICO_API_KEY || process.env.IYZICO_API_KEY === 'dummy';

import { connectDB } from '@/lib/db';
import Payment from '@/models/Payment';
import Lesson from '@/models/Lesson';
import Wallet from '@/models/Wallet';
import { complete3DSecurePayment } from '@/lib/payment';
import mongoose from 'mongoose';

// Veritabanı bağlantısı
connectDB();

// 3D Secure ödeme sonrası callback işlemi
export async function POST(request: NextRequest) {
  if (IYZICO_DISABLED) {
    return NextResponse.json({ error: 'Ödeme servisi devre dışı' }, { status: 503 });
  }

  try {
    // Form verilerini al
    const formData = await request.formData();
    const paymentId = formData.get('paymentId') as string;
    const status = formData.get('status') as string;
    const mdStatus = formData.get('mdStatus') as string;
    const conversationId = formData.get('conversationId') as string;
    const conversationData = formData.get('conversationData') as string;
    
    // Ödeme ID'sini doğrula
    if (!paymentId || !mongoose.isValidObjectId(paymentId)) {
      return NextResponse.json({ error: 'Geçersiz ödeme ID formatı' }, { status: 400 });
    }

    // Ödemeyi bul
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return NextResponse.json({ error: 'Ödeme kaydı bulunamadı' }, { status: 404 });
    }

    // Dersi bul
    const lesson = await Lesson.findById(payment.lessonId);
    if (!lesson) {
      return NextResponse.json({ error: 'Ders bulunamadı' }, { status: 404 });
    }

    // 3D doğrulama başarılı mı kontrol et
    if (mdStatus === '1' && status === 'success') {
      try {
        // 3D doğrulama sonrası ödemeyi tamamla
        const result = await complete3DSecurePayment(conversationData, conversationId) as any;
        
        // Sonucu kontrol et
        if (result.status === 'success') {
          // Ödeme başarılı
          await Payment.findByIdAndUpdate(
            paymentId,
            {
              status: 'completed',
              paymentId: result.paymentId,
              completedAt: new Date()
            }
          );
          
          // Öğretmenin cüzdanını bul veya oluştur
          let teacherWallet = await Wallet.findOne({ userId: lesson.teacherId });
          if (!teacherWallet) {
            teacherWallet = await Wallet.create({
              userId: lesson.teacherId,
              balance: 0,
              transactions: []
            });
          }
          
          // Komisyon miktarını hesapla
          const commission = payment.commission;
          const teacherAmount = payment.amount - commission;
          
          // Öğretmen cüzdanına ödemeyi ekle
          await Wallet.findByIdAndUpdate(
            teacherWallet._id,
            {
              $inc: { balance: teacherAmount },
              $push: {
                transactions: {
                  amount: teacherAmount,
                  type: 'lesson_earning',
                  status: 'completed',
                  description: `${lesson.title} dersinden kazanç`,
                  referenceId: lesson._id,
                  createdAt: new Date()
                }
              },
              lastUpdated: new Date()
            }
          );
          
          // Yönlendirme URL'i
          const redirectUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success?paymentId=${paymentId}`;
          
          // HTML ile yönlendirme yapan bir sayfa döndür
          return new NextResponse(
            `<!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8">
                <title>Ödeme Başarılı</title>
                <meta http-equiv="refresh" content="0;url=${redirectUrl}">
              </head>
              <body>
                <p>Ödeme başarıyla tamamlandı. Yönlendiriliyorsunuz...</p>
                <script>window.location.href = "${redirectUrl}";</script>
              </body>
            </html>`,
            {
              headers: {
                'Content-Type': 'text/html; charset=utf-8',
              },
            }
          );
        } else {
          // Ödeme başarısız
          await Payment.findByIdAndUpdate(
            paymentId,
            { status: 'failed' }
          );
          
          // Hata sayfasına yönlendir
          const errorUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/payment/error?paymentId=${paymentId}&errorCode=${result.errorCode}`;
          
          return new NextResponse(
            `<!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8">
                <title>Ödeme Başarısız</title>
                <meta http-equiv="refresh" content="0;url=${errorUrl}">
              </head>
              <body>
                <p>Ödeme işlemi başarısız oldu. Yönlendiriliyorsunuz...</p>
                <script>window.location.href = "${errorUrl}";</script>
              </body>
            </html>`,
            {
              headers: {
                'Content-Type': 'text/html; charset=utf-8',
              },
            }
          );
        }
      } catch (error) {
        console.error('3D doğrulama hatası:', error);
        
        // Ödeme durumunu güncelle
        await Payment.findByIdAndUpdate(
          paymentId,
          { status: 'failed' }
        );
        
        // Hata sayfasına yönlendir
        const errorUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/payment/error?paymentId=${paymentId}&errorMessage=3D Doğrulama Hatası`;
        
        return new NextResponse(
          `<!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <title>Ödeme Hatası</title>
              <meta http-equiv="refresh" content="0;url=${errorUrl}">
            </head>
            <body>
              <p>Ödeme işlemi sırasında bir hata oluştu. Yönlendiriliyorsunuz...</p>
              <script>window.location.href = "${errorUrl}";</script>
            </body>
          </html>`,
          {
            headers: {
              'Content-Type': 'text/html; charset=utf-8',
            },
          }
        );
      }
    } else {
      // 3D doğrulama başarısız
      await Payment.findByIdAndUpdate(
        paymentId,
        { status: 'failed' }
      );
      
      // Hata sayfasına yönlendir
      const errorUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/payment/error?paymentId=${paymentId}&mdStatus=${mdStatus}`;
      
      return new NextResponse(
        `<!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Ödeme Doğrulama Hatası</title>
            <meta http-equiv="refresh" content="0;url=${errorUrl}">
          </head>
          <body>
            <p>3D Secure doğrulama başarısız oldu. Yönlendiriliyorsunuz...</p>
            <script>window.location.href = "${errorUrl}";</script>
          </body>
        </html>`,
        {
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
          },
        }
      );
    }
  } catch (error) {
    console.error('Ödeme callback hatası:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
