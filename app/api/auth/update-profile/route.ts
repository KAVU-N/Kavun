import { NextResponse } from 'next/server';
import User, { IUser } from '@/models/User';
import connectDB from '@/lib/mongodb';
import { verifyToken } from '@/lib/jwt';

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

export async function PUT(req: Request) {
  try {
    // Token doğrulama
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Yetkilendirme başarısız' },
        { 
          status: 401,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': 'true'
          }
        }
      );
    }

    const token = authHeader.split(' ')[1];
    const decoded = await verifyToken(token);
    
    if (!decoded || !(decoded.userId || decoded.id)) {
      return NextResponse.json(
        { error: 'Geçersiz token' },
        { 
          status: 401,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': 'true'
          }
        }
      );
    }

    // Request body'i parse et
    const { userId, expertise, grade, profilePhotoUrl } = await req.json();
    const userIdFromToken = decoded.userId || decoded.id;

    // Kullanıcı ID kontrolü
    if (userIdFromToken !== userId) {
      return NextResponse.json(
        { error: 'Yetkilendirme hatası' },
        { 
          status: 403,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': 'true'
          }
        }
      );
    }

    // MongoDB bağlantısı
    await connectDB();

    // Kullanıcıyı bul
    const user = await User.findById(userId) as IUser | null;
    if (!user) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { 
          status: 404,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': 'true'
          }
        }
      );
    }

    // Kullanıcı bilgilerini güncelle
    if (expertise !== undefined) {
      user.expertise = expertise;
    }
    
    if (grade !== undefined) {
      user.grade = grade;
    }

    if (profilePhotoUrl !== undefined) {
      user.profilePhotoUrl = profilePhotoUrl;
    }

    // Değişiklikleri kaydet
    await user.save();

    // Güncellenmiş kullanıcı bilgilerini döndür
    return NextResponse.json(
      { 
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          university: user.university,
          expertise: user.expertise,
          grade: user.grade,
          isVerified: user.isVerified,
          profilePhotoUrl: user.profilePhotoUrl
        },
        message: 'Profil bilgileri başarıyla güncellendi'
      },
      { 
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': 'true'
        }
      }
    );

  } catch (error: any) {
    console.error('Profil güncelleme hatası:', error);
    return NextResponse.json(
      { error: error?.message || 'Profil güncellenirken bir hata oluştu', stack: error?.stack },
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
