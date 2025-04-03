import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Conversation from '@/models/Conversation';
import Message from '@/models/Message';
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

// Tarih formatını düzenle
function formatDate(date: Date): string {
  const now = new Date();
  const messageDate = new Date(date);
  
  // Bugün
  if (messageDate.toDateString() === now.toDateString()) {
    return messageDate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  }
  
  // Dün
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (messageDate.toDateString() === yesterday.toDateString()) {
    return 'Dün';
  }
  
  // Bu haftaki gün
  const daysDiff = Math.floor((now.getTime() - messageDate.getTime()) / (1000 * 3600 * 24));
  if (daysDiff < 7) {
    const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
    return days[messageDate.getDay()];
  }
  
  // Diğer
  return messageDate.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// Kullanıcının tüm konuşmalarını getir
export async function GET(request: Request) {
  console.log('GET /api/conversations isteği alındı');
  
  try {
    // Kullanıcı kimliğini doğrula
    const user = await getUserFromToken(request);
    if (!user) {
      console.error('Geçersiz veya eksik token');
      return NextResponse.json({ error: 'Oturum açmanız gerekiyor' }, { status: 401 });
    }
    
    console.log('GET Conversations - User info from token:', user);

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

    // Kullanıcının dahil olduğu tüm konuşmaları bul
    console.log(`Kullanıcı ID: ${user.id} için konuşmalar aranıyor...`);
    
    // Veritabanındaki kullanıcıyı kontrol et
    const userExists = await User.findById(user.id);
    console.log('Kullanıcı veritabanında mevcut mu:', !!userExists);
    
    if (!userExists) {
      console.log('Kullanıcı veritabanında bulunamadı, alternatif ID formatı deneniyor...');
      // Alternatif ID formatlarını dene
      const userByEmail = await User.findOne({ email: user.email });
      if (userByEmail) {
        console.log('Kullanıcı email ile bulundu, ID:', userByEmail._id);
        user.id = userByEmail._id.toString();
      } else {
        console.log('Kullanıcı hiçbir şekilde bulunamadı');
      }
    }
    
    const conversations = await Conversation.find({
      participants: user.id
    })
    .populate('participants', 'name email university role profilePicture')
    .sort({ updatedAt: -1 });
    
    console.log('Bulunan konuşma sayısı:', conversations.length);
    
    // Hiç konuşma bulunamadıysa örnek veri döndür
    if (conversations.length === 0) {
      console.log('Kullanıcı için konuşma bulunamadı:', user.id);
      
      // Veritabanında hiç konuşma olup olmadığını kontrol et
      const allConversations = await Conversation.countDocuments();
      console.log('Veritabanındaki toplam konuşma sayısı:', allConversations);
      
      // Kullanıcının mesajları var mı kontrol et
      const userMessages = await Message.find({ 
        $or: [{ sender: user.id }, { receiver: user.id }] 
      }).limit(5);
      console.log('Kullanıcının mesaj sayısı:', userMessages.length);
      
      // Geliştirme ortamında test amaçlı örnek veri döndür
      if (process.env.NODE_ENV === 'development') {
        console.log('Geliştirme ortamında test verisi döndürülüyor');
        
        // Rastgele bir kullanıcı bul (kendisi dışında)
        const randomUser = await User.findOne({ _id: { $ne: user.id } });
        
        if (randomUser) {
          // Otomatik olarak bir konuşma oluştur
          const newConversation = new Conversation({
            participants: [user.id, randomUser._id],
            createdAt: new Date(),
            updatedAt: new Date()
          });
          
          await newConversation.save();
          console.log('Test için yeni konuşma oluşturuldu:', newConversation._id);
          
          // Test mesajı ekle
          const testMessage = new Message({
            conversation: newConversation._id,
            sender: randomUser._id,
            receiver: user.id,
            content: 'Merhaba! Bu bir test mesajıdır.',
            read: false,
            createdAt: new Date()
          });
          
          await testMessage.save();
          console.log('Test mesajı eklendi');
          
          // Test verisi döndür
          return NextResponse.json([{
            _id: randomUser._id,
            name: randomUser.name,
            email: randomUser.email,
            lastMessage: 'Merhaba! Bu bir test mesajıdır.',
            date: formatDate(new Date()),
            unread: 1,
            avatar: randomUser.profilePicture
          }]);
        }
      }
      
      return NextResponse.json([]);
    }

    // Kullanıcının tüm konuşmalarını frontend için formatlayıp döndür
    console.log('Konuşmalar formatlanıyor...');
    
    const formattedConversations = await Promise.all(conversations.map(async (conversation) => {
      // Konuşmadaki diğer kullanıcıyı bul
      const otherParticipant = conversation.participants.find(
        (participant: any) => participant._id.toString() !== user.id
      );
      
      if (!otherParticipant) {
        console.log('Konuşmada diğer katılımcı bulunamadı:', conversation._id);
        return null; // Diğer kullanıcı bulunamadıysa atla
      }
      
      console.log('Diğer katılımcı bulundu:', otherParticipant.name);
      
      // Son mesajı bul
      const lastMessage = await Message.findOne({
        $or: [
          { sender: user.id, receiver: otherParticipant._id },
          { sender: otherParticipant._id, receiver: user.id }
        ]
      }).sort({ createdAt: -1 });
      
      console.log('Son mesaj bulundu mu:', !!lastMessage);
      
      // Okunmamış mesaj sayısını bul
      const unreadCount = await Message.countDocuments({
        sender: otherParticipant._id,
        receiver: user.id,
        read: false
      });
      
      console.log(`${otherParticipant.name} ile okunmamış mesaj sayısı:`, unreadCount);
      
      return {
        _id: otherParticipant._id,
        name: otherParticipant.name,
        email: otherParticipant.email,
        lastMessage: lastMessage ? lastMessage.content : '',
        date: lastMessage ? formatDate(lastMessage.createdAt) : formatDate(conversation.createdAt),
        unread: unreadCount,
        avatar: otherParticipant.profilePicture
      };
    }));
    
    // null değerleri filtrele
    const filteredConversations = formattedConversations.filter(conv => conv !== null);
    console.log('Formatlanmış konuşma sayısı:', filteredConversations.length);

    return NextResponse.json(filteredConversations);
  } catch (error: any) {
    console.error('Konuşmalar getirilemedi:', error);
    return NextResponse.json(
      { error: `Konuşmalar getirilemedi: ${error.message || 'Bilinmeyen hata'}` },
      { status: 500 }
    );
  }
}

// Yeni konuşma oluştur
export async function POST(request: Request) {
  console.log('POST /api/conversations isteği alındı');
  
  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Oturum açmanız gerekiyor' }, { status: 401 });
    }

    console.log('POST Conversation - User info from token:', user);

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

    let data;
    try {
      data = await request.json();
      console.log('İstek verisi:', data);
    } catch (parseError) {
      console.error('İstek verisi çözümlemede hata:', parseError);
      return NextResponse.json({ error: 'İstek verisi çözümlenemedi' }, { status: 400 });
    }
    
    // Gelen data'da participants olup olmadığını kontrol et
    if (!data.participants || !Array.isArray(data.participants) || data.participants.length < 1) {
      return NextResponse.json(
        { error: 'Geçersiz katılımcılar' },
        { status: 400 }
      );
    }

    // Kullanıcının kendisi de katılımcılardan biri mi?
    if (!data.participants.includes(user.id)) {
      data.participants.push(user.id);
    }

    // Katılımcıların sırasını önemsemeden bu katılımcılarla zaten bir konuşma var mı kontrol et
    const existingConversation = await Conversation.findOne({
      participants: { $all: data.participants, $size: data.participants.length }
    });

    if (existingConversation) {
      return NextResponse.json(existingConversation);
    }

    // Yeni konuşma oluştur
    const conversation = await Conversation.create({
      participants: data.participants,
      lastMessage: data.lastMessage || ''
    });

    return NextResponse.json(conversation, { status: 201 });
  } catch (error: any) {
    console.error('Konuşma oluşturulamadı:', error);
    return NextResponse.json(
      { error: `Konuşma oluşturulamadı: ${error.message || 'Bilinmeyen hata'}` },
      { status: 500 }
    );
  }
}
