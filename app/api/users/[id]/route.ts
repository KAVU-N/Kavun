import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { headers } from 'next/headers';
import jwt from 'jsonwebtoken';

// JWT ile user bilgisini al
async function getUserFromToken(req: Request) {
  // Authorization header'dan token'ı al
  const headersList = headers();
  const authorization = headersList.get('Authorization');
  const token = authorization?.replace('Bearer ', '');
  
  if (!token) {
    console.error('Token bulunamadı');
    return null;
  }
  
  try {
    // JWT_SECRET değeri .env dosyasından okunmalıdır
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret') as {
      id?: string;
      _id?: string;
      userId?: string;
      email: string;
      name?: string;
      role: string;
    };
    
    // Kullanıcı ID'sini standartlaştır - userId, id veya _id hangisi varsa onu kullan
    return {
      ...decoded,
      id: decoded.userId || decoded.id || decoded._id
    };
  } catch (error) {
    console.error('Token doğrulama hatası:', error);
    return null;
  }
}

// Belirli bir kullanıcı bilgilerini getir
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Oturum açmanız gerekiyor' }, { status: 401 });
    }

    console.log('GET User Detail - User info from token:', user);
    console.log('GET User Detail - Requested user ID:', params.id);

    try {
      await connectDB();
      console.log('MongoDB bağlantısı başarılı');
    } catch (dbError) {
      console.error('MongoDB bağlantı hatası:', dbError);
      return NextResponse.json({ error: 'Veritabanı bağlantı hatası' }, { status: 500 });
    }

    // Kullanıcıyı bul - hassas bilgileri hariç tut
    const userDetail = await User.findById(params.id)
      .select('name email role university profilePicture')
      .lean();

    if (!userDetail) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });
    }

    return NextResponse.json(userDetail);
  } catch (error) {
    console.error('Kullanıcı bilgileri getirilemedi:', error);
    return NextResponse.json(
      { error: 'Kullanıcı bilgileri getirilemedi' },
      { status: 500 }
    );
  }
}
