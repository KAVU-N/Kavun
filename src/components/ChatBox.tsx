'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import io, { Socket } from 'socket.io-client';
import { useAuth } from 'src/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/src/contexts/LanguageContext';

// Akıllı tarih formatlama fonksiyonu
const formatSmartDate = (date: Date, t: (key: string) => string): string => {
  const now = new Date();
  const messageDate = new Date(date);
  
  // Bugün
  if (messageDate.toDateString() === now.toDateString()) {
    const timeStr = messageDate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    return `${t('messages.today')} ${timeStr}`;
  }
  
  // Dün
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (messageDate.toDateString() === yesterday.toDateString()) {
    const timeStr = messageDate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    return `${t('messages.yesterday')} ${timeStr}`;
  }
  
  // Diğer tarihler için tam tarih
  return messageDate.toLocaleDateString('tr-TR', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric',
    hour: '2-digit', 
    minute: '2-digit'
  });
};

type Message = {
  _id?: string;
  sender: string;
  receiver: string;
  content: string;
  createdAt: Date;
  read: boolean;
  isMine?: boolean;
};

type Instructor = {
  _id: string;
  name: string;
  email: string;
  university: string;
  role: string;
  price?: number;
};

interface ChatBoxProps {
  instructor: Instructor;
  onClose?: () => void;
  containerStyles?: React.CSSProperties;
  embedded?: boolean;
}

const ChatBox = ({ instructor, onClose, containerStyles, embedded = false }: ChatBoxProps) => {
  const { user } = useAuth();
  const router = useRouter();
  const { t } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const [socketConnected, setSocketConnected] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatBoxRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [chatBoxHeight, setChatBoxHeight] = useState(400); // Tam açık yükseklik
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [isMinimized, setIsMinimized] = useState(false);
  
  // Ders oluşturma ile ilgili state'ler
  const [showLessonModal, setShowLessonModal] = useState(false);

  // Mesajları yükleme
  useEffect(() => {
    if (instructor._id && user) {
      fetchMessages();
    }
  }, [instructor._id, user]);

  // Socket.io bağlantısını kurma
  useEffect(() => {
    // Kullanıcı yoksa socket bağlantısı kurma
    if (!user) return;
    
    try {
      console.log('Socket.io bağlantısı kuruluyor...');
      
      // Socket.io bağlantısını kur - 5000 portuna bağlan
      const socketUrl =
        process.env.NEXT_PUBLIC_SOCKET_URL ||
        (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5000');

      const socket = io(socketUrl, {
        transports: ['websocket', 'polling'], // Önce websocket, sonra polling dene
        secure: socketUrl.startsWith('https'), // HTTPS ise güvenli websocket
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 20000, // Bağlantı zaman aşımı süresini artır
        forceNew: true, // Her zaman yeni bir bağlantı kur
        autoConnect: true, // Otomatik bağlan
      });
      
      socketRef.current = socket;

      // Bağlantı kurulduğunda
      socket.on('connect', () => {
        console.log('Socket.io bağlantısı kuruldu, ID:', socket.id);
        
        // Kullanıcı odasına katıl
        if (user?.id) {
          socket.emit('join', user.id);
          console.log('Kullanıcı odasına katıldı:', user.id);
        }
      });

      // Bağlantı hatası
      socket.on('connect_error', (error) => {
        console.error('Socket.io bağlantı hatası:', error);
      });
      
      // Bağlantı zaman aşımı
      socket.on('connect_timeout', () => {
        console.error('Socket.io bağlantı zaman aşımı');
      });
      
      // Yeniden bağlanma
      socket.on('reconnect', (attemptNumber) => {
        console.log(`Socket.io yeniden bağlandı, deneme: ${attemptNumber}`);
      });
      
      // Yeniden bağlanma hatası
      socket.on('reconnect_error', (error) => {
        console.error('Socket.io yeniden bağlanma hatası:', error);
      });
      
      // Yeniden bağlanma başarısız
      socket.on('reconnect_failed', () => {
        console.error('Socket.io yeniden bağlanma başarısız');
      });

      // Yeni mesaj geldiğinde
      socket.on('receive-message', (data: { sender: string, receiver: string, content: string }) => {
        console.log('Yeni mesaj alındı:', data);
        
        // Mesaj bu konuşmaya ait mi kontrol et
        if (
          (data.sender === instructor._id && data.receiver === user?.id) ||
          (data.sender === user?.id && data.receiver === instructor._id)
        ) {
          // Mesajı kullanıcı perspektifinden işaretle
          const processedMessage = {
            sender: data.sender,
            receiver: data.receiver,
            content: data.content,
            createdAt: new Date(),
            read: false,
            isMine: data.sender === user?.id
          };
          
          setMessages(prev => [...prev, processedMessage]);
        }
      });

      // Yazıyor... bilgisi geldiğinde
      socket.on('user-typing', (data: { sender: string }) => {
        if (data.sender === instructor._id) {
          setIsTyping(true);
          
          // Önceki zamanlayıcıyı temizle
          if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
          }
          
          // 3 saniye sonra yazıyor... bilgisini kaldır
          typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
          }, 3000);
        }
      });

      // Komponent unmount olduğunda socket bağlantısını kapat
      return () => {
        if (socketRef.current) {
          console.log('Socket.io bağlantısı kapatılıyor...');
          socketRef.current.disconnect();
        }
      };
    } catch (error) {
      console.error('Socket.io bağlantısı kurulurken hata:', error);
    }
  }, [instructor._id, user]);

  // Tam yüksekliği hesapla
  useEffect(() => {
    if (chatBoxRef.current) {
      const height = chatBoxRef.current.scrollHeight;
      setChatBoxHeight(height);
    }
  }, [messages]);

  // Yerel depolamadan JWT token al
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  // Mesajları getirme
  const fetchMessages = async () => {
    if (instructor._id && user) {
      setLoading(true);
      try {
        const response = await fetch(`/api/messages?receiverId=${instructor._id}`, {
          credentials: 'include',
            headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        
        if (!response.ok) {
          throw new Error(`Mesajlar yüklenirken bir hata oluştu: ${response.status}`);
        }
        
        const data = await response.json();
        
        // API yanıtını kontrol et
        console.log('API yanıtı:', data);
        
        // Mesajları kullanıcı perspektifinden işaretle
        if (data && Array.isArray(data.messages)) {
          // API messages dizisi döndürüyorsa
          const processedMessages = data.messages.map((msg: any) => ({
            ...msg,
            isMine: msg.sender === user?.id
          }));
          setMessages(processedMessages);
        } else if (data && Array.isArray(data)) {
          // API doğrudan mesaj dizisi döndürüyorsa
          const processedMessages = data.map((msg: any) => ({
            ...msg,
            isMine: msg.sender === user?.id
          }));
          setMessages(processedMessages);
        } else {
          console.error('Beklenmeyen API yanıt formatı:', data);
          setMessages([]);
        }
        
        // Mesajlar yüklendikten sonra kaydırma işlemi
        setTimeout(scrollToBottom, 300);
      } catch (error) {
        console.error('Mesajlar yüklenirken hata oluştu:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  // Mesaj gönderme
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Sayfa kaydırmasını önlemek için event'i durdur
    setSendError(null);
    if (!newMessage.trim() || !user) return;
    
    // Mesajı önce UI'da göster
    const tempId = Math.random().toString(36).substr(2, 9);
    const tempMessage: Message = {
      _id: tempId,
      sender: user.id,
      receiver: instructor._id,
      content: newMessage.trim(),
      createdAt: new Date(),
      read: false,
      isMine: true
    };
    setMessages(prev => [...prev, tempMessage]);
    setNewMessage('');
    setTimeout(scrollToBottom, 100);

    // Socket.io ile mesajı gönder
    if (socketRef.current) {
      socketRef.current.emit('send-message', {
        sender: user.id,
        receiver: instructor._id,
        content: newMessage.trim(),
      });
    }

    // API'ye mesajı kaydet
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          receiver: instructor._id,
          content: tempMessage.content
        })
      });
      if (!response.ok) {
        setSendError('Mesaj gönderilemedi. Lütfen tekrar deneyin.');
        // Optimistic mesajı UI'dan kaldır
        setMessages(prev => prev.filter(m => m._id !== tempId));
      }
    } catch (error) {
      setSendError('Mesaj gönderilemedi. Lütfen tekrar deneyin.');
      setMessages(prev => prev.filter(m => m._id !== tempId));
    }
  };
  const handleTyping = () => {
    if (socketRef.current && user) {
      socketRef.current.emit('typing', {
        sender: user.id,
        receiver: instructor._id
      });
    }
  };

  // Mesajların sonuna otomatik kaydırma - Sadece mesaj container'ını kaydır, sayfayı değil
  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  // Enter tuşu ile mesaj gönderme
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      sendMessage(e as any);
    }
  };

  // Mesajları işleme ve görüntüleme
  const renderMessages = () => {
    return messages.map((message, index) => {
      const isFirstMessageOfGroup = index === 0 || messages[index - 1].sender !== message.sender;
      const isLastMessageOfGroup = index === messages.length - 1 || messages[index + 1].sender !== message.sender;
      
      return (
        <div 
          key={message._id || index} 
          className={`flex ${message.isMine ? 'justify-end' : 'justify-start'} mb-2`}
        >
          <div 
            className={`max-w-[75%] rounded-lg px-2 py-1 ${
              message.isMine 
                ? 'bg-gradient-to-r from-[#FFB996] to-[#FF8B5E] text-white rounded-tr-none' 
                : 'bg-white border border-[#FFE5D9] text-gray-800 rounded-tl-none'
            } ${isFirstMessageOfGroup ? 'mt-2' : 'mt-1'} ${isLastMessageOfGroup ? 'mb-2' : 'mb-1'}`}
          >
            <div className="text-sm">{message.content}</div>
            <div 
              className={`flex justify-end ${message.isMine ? 'text-white/70' : 'text-gray-500'}`}
              style={{ fontSize: '0.5rem', lineHeight: '0.7rem', marginTop: '3px' }}
            >
              {formatSmartDate(new Date(message.createdAt), t)}
              {message.isMine && <span className="ml-1">✓</span>}
            </div>
          </div>
        </div>
      );
    });
  };

  // Stil tanımlamaları
  const chatBoxStyle: React.CSSProperties = {
    position: embedded ? 'relative' : 'fixed',
    right: embedded ? undefined : '20px',
    bottom: embedded ? undefined : '20px',
    height: embedded ? '100%' : '350px',
    maxHeight: embedded ? '100%' : '350px',
    width: embedded ? '100%' : '384px', // w-96 = 24rem = 384px
    zIndex: 40, // z-index değerini 50'den 40'a düşürdük
    display: 'flex',
    flexDirection: 'column',
    borderRadius: embedded ? '0.5rem' : '0.75rem',
    overflow: 'hidden',
    boxShadow: embedded ? 'none' : '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    transition: 'all 0.3s ease',
    ...containerStyles
  };

  // ChatBox bileşenini render et
  return (
    <div 
      ref={chatBoxRef}
      style={{
        ...chatBoxStyle,
        display: 'flex',
        flexDirection: 'column',
        height: embedded ? 'calc(100vh - 200px)' : (isMinimized ? '50px' : '300px'), // Embedded ise tam yükseklik, değilse minimize durumuna göre
        maxHeight: embedded ? 'calc(100vh - 200px)' : (isMinimized ? '50px' : '300px'), // Maksimum yüksekliği de sınırladık
        transition: 'height 0.3s ease, max-height 0.3s ease' // Animasyon ekledik
      }}
      className="bg-white"
    >
      {/* Chat Header */}
      <div 
        className="bg-gradient-to-r from-[#FFB996] to-[#FF8B5E] p-2 flex items-center justify-between cursor-pointer"
        style={{ flexShrink: 0 }}
        onClick={() => !embedded && setIsMinimized(!isMinimized)} // Sadece embedded olmadığında minimize özelliği aktif
      >
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center mr-3 relative">
            <span className="text-[#FF8B5E] font-bold">{instructor.name.charAt(0)}</span>
            {Array.isArray(messages) && messages.filter(msg => !msg.read && msg.sender === instructor._id).length > 0 && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs text-white font-bold">
                {messages.filter(msg => !msg.read && msg.sender === instructor._id).length}
              </div>
            )}
          </div>
          <div>
            <h3
                className="text-white font-medium text-sm underline-offset-2 hover:underline cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation(); // minimize engelle
                  router.push(`/egitmenler/${instructor._id}`);
                }}
              >
                {instructor.name}
              </h3>
            <p className="text-white/70 text-xs">{instructor.university}</p>
          </div>
        </div>
        <div className="flex items-center">
          {!isMinimized && onClose && (
            <button 
              onClick={(e) => {
                e.stopPropagation(); // Tıklamanın üst öğeye yayılmasını engelle
                onClose();
              }} 
              className="text-white hover:text-white/80"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          {!embedded && ( // Sadece embedded olmadığında minimize/maximize ikonunu göster
            <div className="ml-2 text-white">
              {isMinimized ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mesaj Listesi ve Giriş Alanı - Embedded ise her zaman göster, değilse minimize durumuna göre göster */}
      {(embedded || !isMinimized) && (
        <>
          {/* Mesaj Listesi */}
          <div 
            ref={messagesContainerRef}
            className="overflow-y-auto p-4 bg-[#FFFBF8]"
            style={{ 
              flexGrow: 1,
              height: 'calc(100% - 90px)' // Header + Input alanı için yer bırak
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#FF8B5E]"></div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                <Image 
                  src="/images/chat-empty.svg" 
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
          
          {/* Chat Input - Sabit Alt Kısım */}
          <div 
            className="bg-white border-t border-[#FFE5D9] p-3" 
            style={{ 
              flexShrink: 0,
              minHeight: '70px',
              position: 'relative',
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 10,
              width: '100%'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {sendError && (
              <div className="mb-2 text-red-600 text-sm font-medium">{sendError}</div>
            )}
            {/* Ders Al butonu - Sadece öğrenci için göster ve eğitmen rolüne sahip kişilerle konuşurken */}
            {user?.role === 'student' && instructor.role === 'instructor' && (
              <div className="mb-3">
                <button 
                  onClick={() => router.push(`/derslerim/olustur?instructorId=${instructor._id}`)}
                  className="w-full py-2 bg-gradient-to-r from-[#FFB996] to-[#FF8B5E] text-white rounded-lg hover:opacity-90 transition-opacity font-medium text-sm flex items-center justify-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Ders Al
                </button>
              </div>
            )}
            {!user ? (
              <div className="w-full text-center text-red-500 font-medium py-3">
                Mesaj göndermek için giriş yapmalısınız.
              </div>
            ) : (
              <form onSubmit={sendMessage} className="w-full h-full">
                <div className="flex items-center w-full h-full space-x-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Mesajınızı yazın..."
                    className="flex-1 border border-[#FFE5D9] rounded-xl py-2 px-4 focus:outline-none focus:border-[#FF8B5E] transition-colors duration-300"
                    autoComplete="off"
                    onClick={(e) => e.stopPropagation()}
                    disabled={!user}
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || !user}
                    className="bg-gradient-to-r from-[#FFB996] to-[#FF8B5E] text-white p-2 rounded-xl disabled:opacity-50 flex items-center justify-center w-[42px] h-[42px] hover:shadow-md transition-all duration-300"
                    aria-label="Mesaj gönder"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </div>
              </form>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ChatBox;
