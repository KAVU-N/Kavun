'use client';

import { useState, useEffect } from 'react';
import Notification from './Notification';
import { useAuth } from 'src/context/AuthContext';
import Link from 'next/link';
import Image from 'next/image';
import ChatBox from '@/src/components/ChatBox';
import { useLanguage } from '@/src/contexts/LanguageContext';

interface Conversation {
  _id: string;
  name: string;
  lastMessage: string;
  date: string;
  unread: number;
  avatar?: string;
  userId?: string; // Chat partner's user ID for profile linking
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
  const [searchTerm, setSearchTerm] = useState('');
  const [mounted, setMounted] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user, mounted]);

  const fetchConversations = async () => {
    try {
      if (typeof window === 'undefined') return; // Sunucu tarafında çalışmayı engelle
      
      setLoading(true);
      // Artık token kontrolü yapılmıyor, kimlik doğrulama cookie ile gerçekleşiyor.
      console.log(t('logs.fetchingConversations') || 'Konuşmalar getiriliyor, kimlik doğrulama cookie ile.');
      
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

      // API isteği
      const response = await fetch('/api/conversations', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        credentials: 'include' // Cookie ile kimlik doğrulama
      });

      console.log('API yanıtı status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          errorData = { error: errorText || t('errors.unknownError') || 'Bilinmeyen hata' };
        }
        
        console.error('API Hatası:', errorData);
        throw new Error(errorData.error || t('errors.httpError', { status: response.status }) || `HTTP hata: ${response.status}`);
      }

      const data = await response.json();
      console.log('Alınan konuşmalar:', data);
      
      if (Array.isArray(data)) {
        setConversations(data);
      } else {
        console.error('Beklenen dizi formatında veri alınamadı:', data);
        setConversations([]);
      }
      
      setLoading(false);
    } catch (err: any) {
      console.error(t('errors.loadingConversations') || 'Konuşmalar yüklenirken hata oluştu:', err);
      setError(`${t('errors.loadingConversationsDetail') || 'Konuşmalar yüklenirken bir hata oluştu:'} ${err.message || t('errors.unknownError') || 'Bilinmeyen hata'}`);
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
          university: t('general.unknown') || 'Bilinmiyor',
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
      console.error(t('errors.fetchingUserDetails') || 'Kullanıcı detayları alınırken hata oluştu:', err);
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
          <h1 className="text-2xl font-bold text-[#994D1C] mb-4">{t('messages.loginRequired') || 'Mesajlarınızı görmek için giriş yapmalısınız'}</h1>
          <Link href="/auth/login" className="inline-block px-6 py-2 rounded-xl bg-gradient-to-r from-[#FFB996] to-[#FF8B5E] text-white font-medium transition-all duration-300 hover:shadow-lg hover:shadow-[#FFB996]/20 hover:scale-105">
            {t('auth.login')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="container mx-auto px-4 py-8 pt-24 flex-shrink-0">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">{t('messages.myMessages')}</h1>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF8B5E]"></div>
          </div>
        ) : error ? (
          <Notification type="error" message={error || ''} onClose={() => setError(null)} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
            {/* Konuşmalar Listesi */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden lg:col-span-1 h-full flex flex-col">
              <div className="p-4 bg-[#FFE5D9] font-medium flex flex-col gap-2">
                <span>{t('messages.conversations')}</span>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={t('messages.searchPlaceholder') || 'Ara...'}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#FF8B5E] focus:border-transparent text-sm"
                />
              </div>
              
              {conversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                  <div className="w-20 h-20 bg-[#FFE5D9] rounded-full flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-[#FF8B5E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">{t('messages.noMessages') || 'Henüz mesajınız yok'}</h3>
                  <p className="text-gray-600 mb-4">{t('messages.visitInstructors') || 'Eğitmenlerle mesajlaşmaya başlamak için profillerini ziyaret edebilirsiniz.'}</p>
                  <Link href="/egitmenler" className="bg-[#FF8B5E] text-white px-4 py-2 rounded hover:bg-[#FF7F50] transition-colors">
                    {t('messages.exploreInstructors') || 'Eğitmenleri Keşfet'}
                  </Link>
                </div>
              ) : (
                <div className="overflow-y-auto flex-grow">
                  {conversations
                    .filter(c => {
                      if (!searchTerm) return true;
                      const lower = searchTerm.toLocaleLowerCase();
                      return c.name.toLocaleLowerCase().includes(lower) || c.lastMessage.toLocaleLowerCase().includes(lower);
                    })
                    .map((conversation) => (
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
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">{conversation.unread > 9 ? '9+' : conversation.unread}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <h3 
                            className="text-sm font-medium text-gray-900 truncate hover:text-[#FF8B5E] cursor-pointer transition-colors duration-200"
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent conversation selection
                              if (conversation.userId) {
                                window.open(`/egitmenler/${conversation.userId}`, '_blank');
                              }
                            }}
                            title="Profili görüntüle"
                          >
                            {conversation.name}
                          </h3>
                          <span className="text-xs text-gray-500">{conversation.date}</span>
                        </div>
                        <p className={`text-xs truncate ${conversation.unread > 0 ? 'font-medium text-gray-900' : 'text-gray-500'}`}>
                          {conversation.lastMessage}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sağ Panel */}
            <div className="lg:col-span-2 h-full flex flex-col overflow-hidden">
              {selectedUser ? (
                <div className="bg-white rounded-lg shadow-md h-full flex flex-col overflow-hidden">
                  <ChatBox 
                    instructor={{
                      _id: selectedUser._id,
                      name: selectedUser.name,
                      email: selectedUser.email,
                      university: selectedUser.university,
                      role: selectedUser.role
                    }}
                    onClose={handleChatClose}
                    embedded={true}
                  />
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-md h-full flex flex-col items-center justify-center p-6 text-center">
                  <div className="w-24 h-24 bg-[#FFE5D9] rounded-full flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-[#FF8B5E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-medium text-gray-900 mb-2">{t('messages.startMessaging')}</h2>
                  <p className="text-gray-600 max-w-md mb-6">
                    {t('messages.selectConversation')}
                  </p>
                  <Link href="/egitmenler" className="bg-[#FF8B5E] text-white px-6 py-2 rounded-lg hover:bg-[#FF7F50] transition-colors">
                    {t('messages.exploreInstructors') || 'Eğitmenleri Keşfet'}
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
