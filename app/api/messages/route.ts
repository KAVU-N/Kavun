import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Message from '@/models/Message';
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
      university?: string;
    };
    
    // Debug için token içeriği
    console.log('JWT token decoded:', decoded);
    
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

// Belirli bir konuşmadaki mesajları getir
export async function GET(request: Request) {
  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Oturum açmanız gerekiyor' }, { status: 401 });
    }

    console.log('GET Messages - User info from token:', user);

    // User ID kontrolü
    if (!user.id) {
      return NextResponse.json({ error: 'Kullanıcı kimliği bulunamadı' }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: 'Kullanıcı ID gereklidir' }, { status: 400 });
    }

    try {
      await connectDB();
      console.log('MongoDB bağlantısı başarılı');
    } catch (dbError) {
      console.error('MongoDB bağlantı hatası:', dbError);
      return NextResponse.json({ error: 'Veritabanı bağlantı hatası' }, { status: 500 });
    }

    // İki kullanıcı arasındaki mesajları bul
    const messages = await Message.find({
      $or: [
        { sender: user.id, receiver: userId },
        { sender: userId, receiver: user.id }
      ]
    }).sort({ createdAt: 1 });

    // Kullanıcının alıcı olduğu okunmamış mesajları okundu olarak işaretle
    await Message.updateMany(
      { sender: userId, receiver: user.id, read: false },
      { read: true }
    );

    return NextResponse.json(messages);
  } catch (error) {
    console.error('Mesajlar getirilemedi:', error);
    return NextResponse.json(
      { error: 'Mesajlar getirilemedi' },
      { status: 500 }
    );
  }
}

// Yeni mesaj gönder
export async function POST(request: Request) {
  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Oturum açmanız gerekiyor' }, { status: 401 });
    }

    console.log('POST Message - User info from token:', user);

    // User ID kontrolü
    if (!user.id) {
      console.error('Kullanıcı ID bulunamadı:', user);
      return NextResponse.json({ error: 'Kullanıcı kimliği bulunamadı' }, { status: 400 });
    }

    try {
      await connectDB();
      console.log('MongoDB bağlantısı başarılı');
    } catch (dbError) {
      console.error('MongoDB bağlantı hatası:', dbError);
      return NextResponse.json({ error: 'Veritabanı bağlantı hatası' }, { status: 500 });
    }

    let data;
    try {
      data = await request.json();
      console.log('İstek verisi:', data);
    } catch (parseError) {
      console.error('İstek verisi çözümlemede hata:', parseError);
      return NextResponse.json({ error: 'İstek verisi çözümlenemedi' }, { status: 400 });
    }
    
    if (!data.receiver || !data.content) {
      return NextResponse.json(
        { error: 'Alıcı ve mesaj içeriği gereklidir' },
        { status: 400 }
      );
    }

    console.log('Mesaj oluşturuluyor:', {
      sender: user.id,
      receiver: data.receiver,
      content: data.content
    });

    // Yeni mesaj oluştur
    try {
      const message = await Message.create({
        sender: user.id,
        receiver: data.receiver,
        content: data.content
      });

      console.log('Mesaj başarıyla oluşturuldu:', message);
      
      return NextResponse.json(message);
    } catch (createError: any) {
      console.error('Mesaj oluşturma hatası:', createError);
      
      // MongoDB validation hatası detaylarını göster
      if (createError.name === 'ValidationError') {
        const validationErrors: {[key: string]: string} = {};
        
        for (const field in createError.errors) {
          validationErrors[field] = createError.errors[field].message;
        }
        
        console.error('Validasyon hataları:', validationErrors);
        return NextResponse.json({ error: 'Validasyon hatası', details: validationErrors }, { status: 400 });
      }
      
      // Mongoose cast error - genellikle ObjectId hatası
      if (createError.name === 'CastError') {
        console.error('Cast hatası:', {
          path: createError.path,
          value: createError.value, 
          kind: createError.kind
        });
        return NextResponse.json({ 
          error: 'Geçersiz veri formatı', 
          details: `${createError.path} için geçersiz değer: ${createError.value}` 
        }, { status: 400 });
      }
      
      return NextResponse.json({ error: 'Mesaj oluşturulamadı', details: createError.message }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Mesaj gönderilemedi - Genel hata:', error);
    return NextResponse.json(
      { error: 'Mesaj gönderilemedi', details: error.message },
      { status: 500 }
    );
  }
}
