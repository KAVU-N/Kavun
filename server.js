const { createServer } = require('http');
const { Server } = require('socket.io');

// Socket.io sunucusu için port
const SOCKET_PORT = 5000;

// Socket.io için HTTP sunucusu oluştur
const socketServer = createServer();

// Socket.io sunucusunu oluştur
const io = new Server(socketServer, {
  cors: {
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// Socket.io olaylarını dinle
io.on('connection', (socket) => {
  console.log('Kullanıcı bağlandı:', socket.id);
  
  // Kullanıcının kendi odasına katılması
  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`Kullanıcı ${userId} odasına katıldı`);
  });
  
  // Mesaj gönderme
  socket.on('send-message', (data) => {
    console.log('Mesaj alındı:', data);
    io.to(data.receiver).emit('receive-message', data);
  });
  
  // Yazıyor bildirimi
  socket.on('typing', (data) => {
    console.log('Yazıyor bildirimi:', data);
    io.to(data.receiver).emit('user-typing', { sender: data.sender });
  });
  
  // Bağlantı kesildiğinde
  socket.on('disconnect', () => {
    console.log('Kullanıcı ayrıldı:', socket.id);
  });
});

// Socket.io sunucusunu başlat
socketServer.listen(SOCKET_PORT, () => {
  console.log(`> Socket.io sunucusu http://localhost:${SOCKET_PORT} adresinde çalışıyor`);
});
