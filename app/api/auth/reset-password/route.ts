import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import User from '@/models/User';
import connectDB from '@/lib/mongodb';

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
      console.log('Request body:', { email: body.email, code: body.code });
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

    const { email, code, password } = body;

    // Validasyon
    if (!email || !code || !password) {
      console.log('Eksik alan hatası:', { email: !!email, code: !!code, password: !!password });
      return NextResponse.json(
        { error: 'Tüm alanlar zorunludur' },
        { 
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': 'true'
          }
        }
      );
    }

    // Şifre validasyonu
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Şifre en az 8 karakter olmalıdır' },
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
      user = await User.findOne({ 
        email,
        resetPasswordCode: code,
        resetPasswordExpires: { $gt: Date.now() }
      });

      if (!user) {
        console.log('Geçersiz veya süresi dolmuş kod');
        return NextResponse.json(
          { error: 'Geçersiz veya süresi dolmuş kod' },
          { 
            status: 400,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Credentials': 'true'
            }
          }
        );
      }

      // Şifreyi hashle
      console.log('Şifre hashleniyor...');
      const hashedPassword = await bcrypt.hash(password, 10);

      // Kullanıcıyı güncelle
      user.password = hashedPassword;
      user.resetPasswordCode = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      console.log('Şifre başarıyla güncellendi');
      return NextResponse.json(
        { message: 'Şifreniz başarıyla güncellendi' },
        { 
          status: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': 'true'
          }
        }
      );

    } catch (error) {
      console.error('Şifre güncelleme hatası:', error);
      return NextResponse.json(
        { error: 'Şifre güncellenirken bir hata oluştu' },
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
