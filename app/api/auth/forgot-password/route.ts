import { NextResponse } from 'next/server';
import User from '@/models/User';
import connectDB from '@/lib/mongodb';
import { generateVerificationCode, sendPasswordResetEmail } from '@/lib/mail';

export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true',
    }
  });
}

export async function POST(req: Request) {
  console.log('Şifre sıfırlama endpoint çağrıldı');
  try {
    // Request body'i parse et
    let body;
    try {
      console.log('Request body parse ediliyor...');
      body = await req.json();
      console.log('Request body:', { email: body.email });
    } catch (error) {
      console.error('Request body parse hatası:', error);
      return NextResponse.json(
        { error: 'Geçersiz istek formatı' },
        { 
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': 'true'
          }
        }
      );
    }

    const { email } = body;

    // Validasyon
    if (!email) {
      console.log('Email adresi eksik');
      return NextResponse.json(
        { error: 'Email adresi zorunludur' },
        { 
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': 'true'
          }
        }
      );
    }

    // MongoDB bağlantısı
    console.log('MongoDB bağlantısı kuruluyor...');
    try {
      await connectDB();
      console.log('MongoDB bağlantısı başarılı');
    } catch (error) {
      console.error('MongoDB bağlantı hatası:', error);
      return NextResponse.json(
        { error: 'Veritabanı bağlantı hatası' },
        { 
          status: 500,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': 'true'
          }
        }
      );
    }

    // Kullanıcıyı bul
    console.log('Kullanıcı aranıyor:', email);
    let user;
    try {
      user = await User.findOne({ email });
      if (!user) {
        console.log('Kullanıcı bulunamadı:', email);
        // Güvenlik için kullanıcı bulunamasa bile başarılı mesajı dön
        return NextResponse.json(
          { 
            message: 'Şifre sıfırlama talimatları email adresinize gönderildi',
            redirectUrl: `/auth/reset-password?email=${encodeURIComponent(email)}`
          },
          { 
            status: 200,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Credentials': 'true'
            }
          }
        );
      }

      // Doğrulama kodu oluştur
      console.log('Doğrulama kodu oluşturuluyor...');
      const resetCode = generateVerificationCode();
      const resetCodeExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 dakika

      // Kullanıcıyı güncelle
      user.resetPasswordCode = resetCode;
      user.resetPasswordExpires = resetCodeExpires;
      await user.save();

      // Şifre sıfırlama e-postası gönder
      console.log('Şifre sıfırlama e-postası gönderiliyor...');
      await sendPasswordResetEmail(email, resetCode);
      console.log('Şifre sıfırlama e-postası gönderildi');

      return NextResponse.json(
        { 
          message: 'Şifre sıfırlama talimatları email adresinize gönderildi',
          redirectUrl: `/auth/reset-password?email=${encodeURIComponent(email)}`
        },
        { 
          status: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': 'true'
          }
        }
      );

    } catch (error) {
      console.error('Şifre sıfırlama hatası:', error);
      return NextResponse.json(
        { error: 'Şifre sıfırlama işlemi sırasında bir hata oluştu' },
        { 
          status: 500,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': 'true'
          }
        }
      );
    }

  } catch (error: any) {
    console.error('Genel hata:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return NextResponse.json(
      { error: 'İşlem sırasında bir hata oluştu' },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': 'true'
        }
      }
    );
  }
}
