import { NextResponse } from 'next/server';
import { Server as NetServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

// Global değişken olarak Socket.io sunucusunu tutuyoruz
let io: SocketIOServer;

// Socket.io sunucusunu başlatmak için bir yardımcı fonksiyon
function initSocketServer(server: any) {
  if (!io) {
    console.log('Socket.io sunucusu başlatılıyor...');
    
    // Socket.io sunucusunu oluştur
    io = new SocketIOServer(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });
    
    // Socket.io olaylarını dinle
    io.on('connection', (socket) => {
      console.log('Kullanıcı bağlandı:', socket.id);
      
      // Kullanıcının kendi odasına katılması
      socket.on('join', (userId: string) => {
        socket.join(userId);
        console.log(`Kullanıcı ${userId} odasına katıldı`);
      });
      
      // Mesaj gönderme
      socket.on('send-message', (data: { sender: string, receiver: string, content: string }) => {
        console.log('Mesaj alındı:', data);
        io.to(data.receiver).emit('receive-message', data);
      });
      
      // Yazıyor bildirimi
      socket.on('typing', (data: { sender: string, receiver: string }) => {
        console.log('Yazıyor bildirimi:', data);
        io.to(data.receiver).emit('user-typing', { sender: data.sender });
      });
      
      // Bağlantı kesildiğinde
      socket.on('disconnect', () => {
        console.log('Kullanıcı ayrıldı:', socket.id);
      });
    });
  }
  
  return io;
}

export async function GET(req: Request) {
  try {
    // Socket.io sunucusu zaten başlatılmışsa, başarılı yanıt dön
    if (io) {
      return NextResponse.json({ 
        socketServer: true, 
        status: 'running',
        message: 'Socket.io sunucusu zaten çalışıyor'
      });
    }
    
    // Socket.io sunucusu henüz başlatılmamışsa, bilgi mesajı dön
    return NextResponse.json({ 
      socketServer: false, 
      status: 'not_initialized',
      message: 'Socket.io sunucusu henüz başlatılmadı. Sunucu ilk bağlantıda otomatik olarak başlatılacaktır.'
    });
  } catch (error) {
    console.error('Socket.io API hatası:', error);
    return NextResponse.json({ 
      error: 'Socket.io sunucusu başlatılırken bir hata oluştu' 
    }, { status: 500 });
  }
}
