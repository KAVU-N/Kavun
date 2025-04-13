import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { Server as HTTPSServer } from 'https';

type ServerType = HTTPServer | HTTPSServer;

// Kullanıcı socket bağlantılarını takip etmek için
const userSocketMap = new Map<string, string>();

export function initSocketServer(server: ServerType) {
  const io = new SocketIOServer(server, {
    cors: {
      origin: process.env.NEXT_PUBLIC_BASE_URL || "*",
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log('Yeni kullanıcı bağlandı:', socket.id);

    // Kullanıcı login olduğunda
    socket.on('login', (userId: string) => {
      console.log(`Kullanıcı giriş yaptı: ${userId}`);
      userSocketMap.set(userId, socket.id);
    });

    // Kullanıcı çıkış yaptığında
    socket.on('logout', (userId: string) => {
      console.log(`Kullanıcı çıkış yaptı: ${userId}`);
      userSocketMap.delete(userId);
    });

    // Mesaj gönderildiğinde
    socket.on('sendMessage', (data: any) => {
      console.log('Mesaj gönderildi:', data);
      const { receiverId, message } = data;

      // Alıcı online ise mesajı ilet
      const receiverSocketId = userSocketMap.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('receiveMessage', data);
      }
    });

    // Kullanıcı yazıyor...
    socket.on('typing', (data: any) => {
      const { receiverId, conversationId } = data;
      
      // Alıcı online ise yazıyor... bildirimi gönder
      const receiverSocketId = userSocketMap.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('userTyping', {
          senderId: data.senderId,
          conversationId
        });
      }
    });

    // Kullanıcı yazmayı bıraktı
    socket.on('stopTyping', (data: any) => {
      const { receiverId, conversationId } = data;
      
      // Alıcı online ise yazıyor... bildirimini durdur
      const receiverSocketId = userSocketMap.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('userStopTyping', {
          senderId: data.senderId,
          conversationId
        });
      }
    });

    // Bağlantı kesildiğinde
    socket.on('disconnect', () => {
      console.log('Kullanıcı bağlantısı kesildi:', socket.id);
      
      // userSocketMap'ten kullanıcıyı kaldır
      for (const [userId, socketId] of userSocketMap.entries()) {
        if (socketId === socket.id) {
          userSocketMap.delete(userId);
          break;
        }
      }
    });
  });

  return io;
}
