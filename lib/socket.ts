import { Server as NetServer } from 'http';
import { NextApiRequest } from 'next';
import { Server as ServerIO } from 'socket.io';
import { NextApiResponse } from 'next';

export type NextApiResponseServerIO = NextApiResponse & {
  socket: {
    server: NetServer & {
      io: ServerIO;
    };
  };
};

export const config = {
  api: {
    bodyParser: false,
  },
};

export default function initSocket(req: NextApiRequest, res: NextApiResponseServerIO) {
  if (!res.socket.server.io) {
    console.log('*Yeni Socket.io sunucusu başlatılıyor...');
    // Socket.io sunucusu oluşturma
    const io = new ServerIO(res.socket.server);
    
    // Socket.io olaylarını dinleme
    io.on('connection', (socket) => {
      console.log(`Kullanıcı bağlandı: ${socket.id}`);
      
      // Kullanıcı kimliğini belirleme
      socket.on('identity', (userId) => {
        socket.join(userId);
        console.log(`Kullanıcı odaya katıldı: ${userId}`);
      });
      
      // Mesaj gönderme
      socket.on('sendMessage', (data) => {
        const { receiverId, message, senderId } = data;
        console.log(`Mesaj gönderildi: ${senderId} -> ${receiverId}`);
        io.to(receiverId).emit('receiveMessage', { 
          message,
          senderId
        });
      });
      
      // Yazıyor bildirimi
      socket.on('typing', (data) => {
        const { receiverId, senderId } = data;
        io.to(receiverId).emit('userTyping', { senderId });
      });
      
      // Yazma durduruldu bildirimi
      socket.on('stopTyping', (data) => {
        const { receiverId, senderId } = data;
        io.to(receiverId).emit('userStoppedTyping', { senderId });
      });
      
      // Bağlantı kesildiğinde
      socket.on('disconnect', () => {
        console.log(`Kullanıcı ayrıldı: ${socket.id}`);
      });
    });
    
    // Socket.io sunucusunu res.socket.server'a ata
    res.socket.server.io = io;
  }
  return res.socket.server.io;
}
