import { NextResponse } from 'next/server';
import { Server as NetServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

let io: SocketIOServer;

export async function GET(req: Request) {
  const res = NextResponse.next();
  
  if (!io) {
    // @ts-ignore - Bu satır Next.js sunucu objesine erişmek için gereklidir
    const httpServer = res.socket?.server as unknown as NetServer;
    
    io = new SocketIOServer(httpServer, {
      path: '/api/socket',
      addTrailingSlash: false,
    });
    
    io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);
      
      socket.on('join', (userId: string) => {
        socket.join(userId);
        console.log(`User ${userId} joined their room`);
      });
      
      socket.on('send-message', (data: { sender: string, receiver: string, content: string }) => {
        console.log('Message received:', data);
        io.to(data.receiver).emit('receive-message', data);
      });
      
      socket.on('typing', (data: { sender: string, receiver: string }) => {
        io.to(data.receiver).emit('user-typing', { sender: data.sender });
      });
      
      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });
  }
  
  return NextResponse.json({ success: true });
}
