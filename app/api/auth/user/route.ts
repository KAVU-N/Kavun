import { NextResponse } from 'next/server';
import User, { IUser } from '@/models/User';
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

export async function GET(req: Request) {
  try {
    // URL'den id parametresini al
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Kullanıcı ID\'si gerekli' },
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
    await connectDB();

    // Kullanıcıyı bul
    const user = await User.findById(id) as IUser | null;
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

    // Debug için
    console.log('Found user:', {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      university: user.university,
      isVerified: user.isVerified
    });

    // Kullanıcı bilgilerini döndür
    return NextResponse.json(
      {
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          university: user.university,
          isVerified: user.isVerified
        }
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
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'Kullanıcı bilgileri alınırken bir hata oluştu' },
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
