export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Message from '@/models/Message';
import { headers } from 'next/headers';
import jwt from 'jsonwebtoken';

// JWT ile user bilgisini al
async function getUserFromToken(req: NextRequest) {
  // Authorization header'dan token'ı al
  const headersList = headers();
  const allHeaders = Object.fromEntries(headersList.entries());
  console.log('[DEBUG] Tüm headerlar:', allHeaders);

  let token = headersList.get('Authorization')?.replace('Bearer ', '');
  // Eğer header'daki token geçersiz bir placeholder ise, yok say
  if (!token || token === '{%Authorization%}' || token.toLowerCase().includes('authoriz')) {
    token = undefined;
    console.log('[DEBUG] Authorization header geçersiz placeholder, cookie kontrol edilecek.');
  } else {
    console.log('[DEBUG] Authorization header ile bulunan token:', token);
  }

  // Vercel prod için: Cookie'den de token oku
  if (!token) {
    try {
      const cookieHeader = headersList.get('cookie');
      console.log('[DEBUG] Cookie header:', cookieHeader);
      if (cookieHeader) {
        const match = cookieHeader.match(/token=([^;]+)/);
        if (match) {
          token = match[1];
          console.log('[DEBUG] Cookie içinden bulunan token:', token);
        } else {
          console.log('[DEBUG] Cookie içinde token bulunamadı.');
        }
      } else {
        console.log('[DEBUG] Cookie header yok.');
      }
    } catch (e) {
      console.error('[DEBUG] Cookie token okuma hatası:', e);
    }
  }

  if (!token) {
    console.error('[DEBUG] Token bulunamadı (header ve cookie)');
    return null;
  }
  
  try {
    // JWT_SECRET değeri .env dosyasından okunmalıdır
    console.log('[DEBUG] JWT_SECRET env (ilk 10 karakter):', (process.env.JWT_SECRET || '').substring(0, 10));
console.log('[DEBUG] Gelen token (uzunluk):', token.length, 'İlk 10:', token.substring(0, 10));
const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret') as {
      id?: string;
      _id?: string;
      userId?: string;
      email: string;
      name?: string;
      role: string;
      university?: string;
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

// Okunmamış mesajların sayısını getir
export async function GET(request: NextRequest) {
  console.log('[DEBUG] /api/messages/unread endpointi çağrıldı');
  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Oturum açmanız gerekiyor' }, { status: 401 });
    }

    console.log('GET Unread Messages Count - User info from token:', user);

    // User ID kontrolü
    if (!user.id) {
      return NextResponse.json({ error: 'Kullanıcı kimliği bulunamadı' }, { status: 400 });
    }

    try {
      await connectDB();
      console.log('MongoDB bağlantısı başarılı');
    } catch (dbError) {
      console.error('MongoDB bağlantı hatası:', dbError);
      return NextResponse.json({ error: 'Veritabanı bağlantı hatası' }, { status: 500 });
    }

    // Kullanıcının alıcı olduğu ve okunmamış mesajların sayısını bul
    const unreadCount = await Message.countDocuments({
      receiver: user.id,
      read: false
    });

    return NextResponse.json({ count: unreadCount });
  } catch (error) {
    console.error('Okunmamış mesaj sayısı getirilemedi:', error);
    return NextResponse.json(
      { error: 'Okunmamış mesaj sayısı getirilemedi' },
      { status: 500 }
    );
  }
}
