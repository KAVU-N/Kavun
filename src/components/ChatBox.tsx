'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import io, { Socket } from 'socket.io-client';
import { useAuth } from '@/contexts/AuthContext';

type Message = {
  _id?: string;
  sender: string;
  receiver: string;
  content: string;
  createdAt: Date;
  read: boolean;
};

type Instructor = {
  _id: string;
  name: string;
  email: string;
  university: string;
  role: string;
};

interface ChatBoxProps {
  instructor: Instructor;
  onClose?: () => void;
  containerStyles?: React.CSSProperties;
  embedded?: boolean;
}

const ChatBox = ({ instructor, onClose, containerStyles, embedded = false }: ChatBoxProps) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const [socketConnected, setSocketConnected] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Socket.io bağlantısını kurma
  useEffect(() => {
    const setupSocket = async () => {
      await fetch('/api/socket');
      
      if (!socketRef.current) {
        socketRef.current = io({
          path: '/api/socket',
        });

        socketRef.current.on('connect', () => {
          console.log('Socket connected:', socketRef.current?.id);
          setSocketConnected(true);
          
          // Kullanıcı kimliğiyle odaya katıl
          if (user?.id) {
            socketRef.current?.emit('join', user.id);
          }
        });

        // Yeni mesaj alma
        socketRef.current.on('receive-message', (message: Message) => {
          if (
            (message.sender === instructor._id && message.receiver === user?.id) ||
            (message.sender === user?.id && message.receiver === instructor._id)
          ) {
            setMessages((prevMessages) => [...prevMessages, message]);
            setIsMinimized(false); // Yeni mesaj geldiğinde kutuyu otomatik aç
          }
        });

        // Yazıyor bildirimi
        socketRef.current.on('typing', (typingUser: string) => {
          if (typingUser === instructor._id) {
            setIsTyping(true);
            // 3 saniye sonra yazıyor bildirimini kaldır
            setTimeout(() => setIsTyping(false), 3000);
          }
        });
      }
    };

    if (user && instructor._id) {
      setupSocket();
      fetchMessages();
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [user, instructor._id]);

  // Mesajları getirme
  const fetchMessages = async () => {
    try {
      setLoading(true);
      
      // localStorage'dan token'ı al
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('Token bulunamadı');
        setLoading(false);
        return;
      }
      
      const response = await fetch(`/api/messages?userId=${instructor._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      } else {
        const errorData = await response.json();
        console.error('Mesajları getirme hatası:', errorData);
      }
    } catch (error) {
      console.error('Mesajlar getirilemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  // Otomatik kaydırma
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Mesaj gönderme
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !user) return;
    
    const messageData = {
      receiver: instructor._id,
      content: newMessage
    };
    
    try {
      // localStorage'dan token'ı al - ÖNEMLİ: JWT tabanlı auth sistemi
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('Token bulunamadı. Lütfen tekrar giriş yapın.');
        return;
      }
      
      console.log('Mesaj gönderiliyor:', messageData);
      console.log('Authorization token var mı:', !!token);
      
      // Mesajı veritabanına kaydet
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(messageData)
      });
      
      if (response.ok) {
        const savedMessage = await response.json();
        console.log('Mesaj başarıyla kaydedildi:', savedMessage);
        
        // Mesajı socket ile gönder
        if (socketRef.current) {
          socketRef.current.emit('send-message', savedMessage);
        }
        
        // Mesajı UI'a ekle
        setMessages((prevMessages) => [...prevMessages, savedMessage]);
        setNewMessage('');
      } else {
        const errorData = await response.json();
        console.error('Mesaj gönderme hatası:', errorData);
        
        // Hata durumunda token yenilemesi gerekebilir
        if (errorData.error === 'Oturum açmanız gerekiyor' || 
            errorData.error === 'Kullanıcı kimliği bulunamadı') {
          alert('Oturumunuz sonlanmış olabilir. Lütfen tekrar giriş yapın.');
        }
      }
    } catch (error) {
      console.error('Mesaj gönderilirken hata:', error);
    }
  };

  // Yazıyor bildirimi gönderme
  const handleTyping = () => {
    if (socketRef.current && user?.id) {
      socketRef.current.emit('typing', user.id);
    }
  };

  // Küçültme/büyütme toggle
  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  // Mesajları işleme ve görüntüleme
  const renderMessages = () => {
    return messages.map((message, index) => {
      const isCurrentUser = message.sender === user?.id;
      const messageDate = new Date(message.createdAt);
      
      return (
        <div 
          key={message._id || index}
          className={`flex mb-4 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
        >
          {!isCurrentUser && (
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#FFB996] to-[#FF8B5E] flex items-center justify-center mr-2">
              <span className="text-white font-medium">{instructor.name.charAt(0)}</span>
            </div>
          )}
          
          <div 
            className={`max-w-[75%] p-3 rounded-xl ${
              isCurrentUser 
                ? 'bg-gradient-to-r from-[#FFB996] to-[#FF8B5E] text-white rounded-tr-none' 
                : 'bg-gray-100 text-gray-800 rounded-tl-none'
            }`}
          >
            <p className="text-sm">{message.content}</p>
            <p className={`text-xs mt-1 ${isCurrentUser ? 'text-white/70' : 'text-gray-500'}`}>
              {messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          
          {isCurrentUser && (
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#FFB996] to-[#FF8B5E] flex items-center justify-center ml-2">
              <span className="text-white font-medium">{user.name.charAt(0)}</span>
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div 
      className={`fixed ${embedded ? 'absolute' : 'bottom-4 right-4'} w-96 bg-white rounded-xl shadow-xl overflow-hidden z-50 flex flex-col border border-[#FFE5D9]`}
      style={containerStyles}
    >
      {/* Chat Header */}
      <div 
        className="bg-gradient-to-r from-[#FFB996] to-[#FF8B5E] p-3 flex items-center justify-between cursor-pointer"
        onClick={toggleMinimize}
      >
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mr-3 relative">
            <span className="text-[#FF8B5E] font-bold">{instructor.name.charAt(0)}</span>
            {messages.filter(msg => !msg.read && msg.sender === instructor._id).length > 0 && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs text-white font-bold">
                {messages.filter(msg => !msg.read && msg.sender === instructor._id).length}
              </div>
            )}
          </div>
          <div>
            <h3 className="text-white font-medium">{instructor.name}</h3>
            <p className="text-white/70 text-xs">{instructor.university}</p>
          </div>
        </div>
        <div className="flex">
          <button className="text-white/80 hover:text-white mr-2">
            {isMinimized ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onClose?.();
            }}
            className="text-white/80 hover:text-white transition-colors duration-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Chat Messages */}
      {!isMinimized && (
        <>
          <div className="flex-1 p-4 overflow-y-auto max-h-96 bg-[#FFFBF8]">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#FF8B5E]"></div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                <Image 
                  src="/chat-empty.svg" 
                  alt="No messages" 
                  width={100} 
                  height={100} 
                  className="mb-4 opacity-50"
                />
                <p className="text-sm">Henüz mesaj yok. Sohbeti başlatmak için bir mesaj gönder!</p>
              </div>
            ) : (
              <>
                {renderMessages()}
                {isTyping && (
                  <div className="flex items-center text-gray-500 text-sm mt-2">
                    <div className="flex space-x-1 mr-2">
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                    <span>{instructor.name} yazıyor...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>
          
          {/* Chat Input */}
          <form onSubmit={sendMessage} className="p-3 border-t border-[#FFE5D9] bg-white">
            <div className="flex items-center">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleTyping}
                placeholder="Mesajınızı yazın..."
                className="flex-1 border border-[#FFE5D9] rounded-l-xl py-2 px-4 focus:outline-none focus:border-[#FF8B5E] transition-colors duration-300"
              />
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="bg-gradient-to-r from-[#FFB996] to-[#FF8B5E] text-white p-2 rounded-r-xl disabled:opacity-50"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
};

export default ChatBox;
