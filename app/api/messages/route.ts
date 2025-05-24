import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Message from '@/models/Message';
import User from '@/models/User';
import Conversation from '@/models/Conversation';
import { headers } from 'next/headers';
import jwt from 'jsonwebtoken';

// JWT ile user bilgisini al
async function getUserFromToken(req: Request) {
  // Authorization header'dan token'ı al
  const headersList = headers();
  let token = headersList.get('Authorization')?.replace('Bearer ', '');
  // Eğer header'daki token geçersiz bir placeholder ise, yok say
  if (!token || token === '{%Authorization%}' || token.toLowerCase().includes('authoriz')) {
    token = undefined;
  }
  // Vercel prod için: Cookie'den de token oku
  if (!token) {
    try {
      const cookieHeader = headersList.get('cookie');
      if (cookieHeader) {
        const match = cookieHeader.match(/token=([^;]+)/);
        if (match) {
          token = match[1];
        }
      }
    } catch (e) {
      console.error('Cookie token okuma hatası:', e);
    }
  }

  if (!token) {
    console.error('Token bulunamadı (header ve cookie)');
    return null;
  }
  
  try {
    console.log('Token doğrulanıyor...');
    
    // JWT_SECRET değeri .env dosyasından okunmalıdır
    const jwtSecret = process.env.JWT_SECRET || 'default_secret';
    console.log('JWT Secret kullanılıyor (ilk 5 karakter):', jwtSecret.substring(0, 5) + '...');
    
    const decoded = jwt.verify(token, jwtSecret) as {
      id?: string;
      _id?: string;
      userId?: string;
      email: string;
      name?: string;
      role: string;
      university?: string;
    };
    
    console.log('Token başarıyla doğrulandı:', {
      email: decoded.email,
      name: decoded.name,
      id: decoded.userId || decoded.id || decoded._id
    });
    
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
  console.log('GET /api/messages isteği alındı');
  
  try {
    // URL parametrelerini al
    const { searchParams } = new URL(request.url);
    const receiverId = searchParams.get('receiverId');
    
    console.log('Alınan parametreler:', { receiverId });
    
    if (!receiverId) {
      console.error('receiverId parametresi eksik');
      return NextResponse.json({ error: 'receiverId parametresi gerekli' }, { status: 400 });
    }
    
    // Kullanıcı kimliğini doğrula
    const user = await getUserFromToken(request);
    if (!user) {
      console.error('Geçersiz veya eksik token');
      return NextResponse.json({ error: 'Oturum açmanız gerekiyor' }, { status: 401 });
    }
    
    console.log('GET Messages - User info from token:', user);
    
    // User ID kontrolü
    if (!user.id) {
      console.error('Token içinde kullanıcı ID bilgisi yok');
      return NextResponse.json({ error: 'Kullanıcı kimliği bulunamadı' }, { status: 400 });
    }
    
    // MongoDB bağlantısı
    try {
      console.log('MongoDB bağlantısı kuruluyor...');
      await connectDB();
      console.log('MongoDB bağlantısı başarılı');
    } catch (dbError) {
      console.error('MongoDB bağlantı hatası:', dbError);
      return NextResponse.json({ error: 'Veritabanı bağlantı hatası' }, { status: 500 });
    }
    
    // İki kullanıcı arasındaki tüm mesajları bul
    console.log(`Kullanıcı ID: ${user.id} ve alıcı ID: ${receiverId} arasındaki mesajlar aranıyor...`);
    
    const messages = await Message.find({
      $or: [
        { sender: user.id, receiver: receiverId },
        { sender: receiverId, receiver: user.id }
      ]
    }).sort({ createdAt: 1 });
    
    console.log('Bulunan mesaj sayısı:', messages.length);
    
    // Karşı kullanıcının bilgilerini al
    const otherUser = await User.findById(receiverId, 'name email profilePicture');
    if (!otherUser) {
      console.error('Karşı kullanıcı bulunamadı:', receiverId);
      return NextResponse.json({ error: 'Karşı kullanıcı bulunamadı' }, { status: 404 });
    }
    
    console.log('Karşı kullanıcı bulundu:', otherUser.name);
    
    // Okunmamış mesajları okundu olarak işaretle
    await Message.updateMany(
      { sender: receiverId, receiver: user.id, read: false },
      { read: true }
    );
    
    // Mesajları frontend için formatlayıp döndür
    const formattedMessages = messages.map(message => ({
      _id: message._id,
      sender: message.sender,
      receiver: message.receiver,
      content: message.content,
      createdAt: message.createdAt,
      read: message.read,
      isMine: message.sender.toString() === user.id
    }));
    
    return NextResponse.json({
      messages: formattedMessages,
      user: otherUser
    });
  } catch (error: any) {
    console.error('Mesajlar getirilemedi:', error);
    return NextResponse.json(
      { error: `Mesajlar getirilemedi: ${error.message || 'Bilinmeyen hata'}` },
      { status: 500 }
    );
  }
}

// Yeni mesaj gönder
export async function POST(request: Request) {
  console.log('POST /api/messages isteği alındı');
  
  try {
    // Kullanıcı kimliğini doğrula
    const user = await getUserFromToken(request);
    if (!user) {
      console.error('Geçersiz veya eksik token');
      return NextResponse.json({ error: 'Oturum açmanız gerekiyor' }, { status: 401 });
    }
    
    console.log('POST Message - User info from token:', user);
    
    // User ID kontrolü
    if (!user.id) {
      console.error('Token içinde kullanıcı ID bilgisi yok');
      return NextResponse.json({ error: 'Kullanıcı kimliği bulunamadı' }, { status: 400 });
    }
    
    // MongoDB bağlantısı
    try {
      console.log('MongoDB bağlantısı kuruluyor...');
      await connectDB();
      console.log('MongoDB bağlantısı başarılı');
    } catch (dbError) {
      console.error('MongoDB bağlantı hatası:', dbError);
      return NextResponse.json({ error: 'Veritabanı bağlantı hatası' }, { status: 500 });
    }
    
    // İstek verilerini al
    let data;
    try {
      data = await request.json();
      console.log('İstek verisi:', { ...data, content: data.content?.substring(0, 20) + '...' });
    } catch (parseError) {
      console.error('İstek verisi çözümlemede hata:', parseError);
      return NextResponse.json({ error: 'İstek verisi çözümlenemedi' }, { status: 400 });
    }
    
    // Gerekli alanları kontrol et
    if (!data.receiver || !data.content) {
      console.error('Eksik alanlar:', { receiver: !!data.receiver, content: !!data.content });
      return NextResponse.json({ error: 'receiver ve content alanları zorunludur' }, { status: 400 });
    }
    
    // Alıcı kullanıcının var olup olmadığını kontrol et
    const receiverExists = await User.findById(data.receiver);
    if (!receiverExists) {
      console.error('Alıcı kullanıcı bulunamadı:', data.receiver);
      return NextResponse.json({ error: 'Alıcı kullanıcı bulunamadı' }, { status: 404 });
    }
    
    // Yeni mesaj oluştur
    const newMessage = await Message.create({
      sender: user.id,
      receiver: data.receiver,
      content: data.content,
      read: false
    });
    
    console.log('Yeni mesaj oluşturuldu:', newMessage._id);
    
    // İki kullanıcı arasında bir konuşma var mı kontrol et
    let conversation = await Conversation.findOne({
      participants: { $all: [user.id, data.receiver], $size: 2 }
    });
    
    // Konuşma yoksa yeni bir konuşma oluştur
    if (!conversation) {
      console.log('Yeni konuşma oluşturuluyor...');
      conversation = await Conversation.create({
        participants: [user.id, data.receiver],
        lastMessage: data.content
      });
    } else {
      // Varolan konuşmanın son mesajını güncelle
      conversation.lastMessage = data.content;
      conversation.updatedAt = new Date();
      await conversation.save();
    }
    
    console.log('Konuşma güncellendi:', conversation._id);
    
    // Mesajı frontend için formatlayıp döndür
    const formattedMessage = {
      _id: newMessage._id,
      sender: newMessage.sender,
      receiver: newMessage.receiver,
      content: newMessage.content,
      createdAt: newMessage.createdAt,
      read: newMessage.read,
      isMine: true
    };
    
    return NextResponse.json(formattedMessage, { status: 201 });
  } catch (error: any) {
    console.error('Mesaj gönderilemedi:', error);
    return NextResponse.json(
      { error: `Mesaj gönderilemedi: ${error.message || 'Bilinmeyen hata'}` },
      { status: 500 }
    );
  }
}
