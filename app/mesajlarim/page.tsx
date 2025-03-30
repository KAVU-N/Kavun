'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import Image from 'next/image';
import ChatBox from '@/src/components/ChatBox';

interface Conversation {
  _id: string;
  name: string;
  lastMessage: string;
  date: string;
  unread: number;
  avatar?: string;
}

interface ChatUser {
  _id: string;
  name: string;
  email: string;
  profilePicture?: string;
  university: string;
  role: string;
}

export default function MessagesPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (user && mounted) {
      fetchConversations();
    }
  }, [user, mounted]);

  const fetchConversations = async () => {
    try {
      if (typeof window === 'undefined') return; // Sunucu tarafında çalışmayı engelle
      
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('Token bulunamadı');
        setError('Oturumunuz sonlanmış görünüyor. Lütfen tekrar giriş yapın.');
        setLoading(false);
        return;
      }

      console.log('Konuşmalar getiriliyor, token:', token.substring(0, 10) + '...');
      
      const response = await fetch('/api/conversations', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Hatası:', errorData);
        throw new Error(errorData.error || 'Konuşmalar yüklenemedi');
      }

      const data = await response.json();
      console.log('Alınan konuşmalar:', data);
      setConversations(data);
      setLoading(false);
    } catch (err) {
      console.error('Konuşmalar yüklenirken hata oluştu:', err);
      setError('Konuşmalar yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
      setLoading(false);
    }
  };

  const handleUserSelect = async (userId: string, userName: string, profilePicture?: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`/api/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        setSelectedUser({
          _id: userId,
          name: userName,
          email: '',
          profilePicture,
          university: 'Bilinmiyor',
          role: 'user'
        });
        return;
      }

      const userData = await response.json();
      setSelectedUser({
        _id: userData._id,
        name: userData.name,
        email: userData.email || '',
        profilePicture: userData.profilePicture,
        university: userData.university || 'Bilinmiyor',
        role: userData.role || 'user'
      });
    } catch (err) {
      console.error('Kullanıcı detayları alınırken hata oluştu:', err);
      setSelectedUser({
        _id: userId,
        name: userName,
        email: '',
        profilePicture,
        university: 'Bilinmiyor',
        role: 'user'
      });
    }
  };

  const handleChatClose = () => {
    setSelectedUser(null);
    fetchConversations();
  };

  if (!user) {
    return (
      <div className="min-h-screen pt-24 px-4 flex flex-col items-center justify-center bg-[#FFF9F5]">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#994D1C] mb-4">Mesajlarınızı görmek için giriş yapmalısınız</h1>
          <Link href="/auth/login" className="inline-block px-6 py-2 rounded-xl bg-gradient-to-r from-[#FFB996] to-[#FF8B5E] text-white font-medium transition-all duration-300 hover:shadow-lg hover:shadow-[#FFB996]/20 hover:scale-105">
            Giriş Yap
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-[#FF8B5E] mb-8">Mesajlarım</h1>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF8B5E]"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
            {/* Konuşmalar Listesi */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden lg:col-span-1 h-full flex flex-col">
              <div className="p-4 bg-[#FFE5D9] font-medium">Konuşmalarım</div>
              
              {conversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                  <div className="w-20 h-20 bg-[#FFE5D9] rounded-full flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-[#FF8B5E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz mesajınız yok</h3>
                  <p className="text-gray-600 mb-4">Eğitmenlerle mesajlaşmaya başlamak için profillerini ziyaret edebilirsiniz.</p>
                  <Link href="/eğitmenler" className="bg-[#FF8B5E] text-white px-4 py-2 rounded hover:bg-[#FF7F50] transition-colors">
                    Eğitmenleri Keşfet
                  </Link>
                </div>
              ) : (
                <div className="overflow-y-auto flex-grow">
                  {conversations.map((conversation) => (
                    <div
                      key={conversation._id}
                      onClick={() => handleUserSelect(conversation._id, conversation.name, conversation.avatar)}
                      className={`p-4 flex items-center space-x-3 cursor-pointer hover:bg-[#FFF5F0] transition-colors duration-300 ${
                        selectedUser?._id === conversation._id ? 'bg-[#FFF5F0]' : ''
                      }`}
                    >
                      <div className="relative">
                        {conversation.avatar ? (
                          <Image
                            src={conversation.avatar}
                            alt={conversation.name}
                            width={48}
                            height={48}
                            className="rounded-full"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#FFB996] to-[#FF8B5E] flex items-center justify-center">
                            <span className="text-white font-medium">{conversation.name.charAt(0).toUpperCase()}</span>
                          </div>
                        )}
                        {conversation.unread > 0 && (
                          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs text-white">
                            {conversation.unread > 9 ? '9+' : conversation.unread}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-[#6B3416]">{conversation.name}</p>
                        <p className="text-sm text-[#994D1C] truncate">{conversation.lastMessage}</p>
                      </div>
                      <div className="text-xs text-[#994D1C]/70">
                        {conversation.date}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden lg:col-span-2 h-full flex flex-col">
              {selectedUser ? (
                <div className="h-full flex flex-col">
                  <div className="p-4 bg-[#FFE5D9] flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {selectedUser.profilePicture ? (
                        <Image
                          src={selectedUser.profilePicture}
                          alt={selectedUser.name}
                          width={40}
                          height={40}
                          className="rounded-full"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                          <span className="text-white font-medium">{selectedUser.name.charAt(0).toUpperCase()}</span>
                        </div>
                      )}
                      <h2 className="text-[#994D1C] font-medium">{selectedUser.name}</h2>
                    </div>
                    <button
                      onClick={handleChatClose}
                      className="text-[#994D1C] hover:bg-white/20 p-2 rounded-full transition-colors duration-300"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div className="flex-1 p-4">
                    <ChatBox
                      instructor={selectedUser}
                      containerStyles={{
                        position: 'relative',
                        bottom: 'auto',
                        right: 'auto',
                        maxWidth: '100%',
                        height: '500px',
                        boxShadow: 'none',
                        margin: 0,
                        border: 'none'
                      }}
                      embedded={true}
                    />
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center p-8 text-center">
                  <div>
                    <svg className="w-16 h-16 mx-auto text-[#994D1C] opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <h3 className="text-xl font-medium text-[#994D1C] mt-4 mb-2">Bir konuşma seçin</h3>
                    <p className="text-[#994D1C]/70">
                      Mesajlarınızı görüntülemek için sol taraftan bir konuşma seçin
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
