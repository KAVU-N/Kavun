'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ReviewsList from '@/components/reviews/ReviewsList';
import StarRating from '@/components/reviews/StarRating';

interface PageProps {
  params: { id: string };
}

export default function EgitmenProfilPage({ params }: PageProps) {
  const { id } = params;
  const { user } = useAuth();
  const router = useRouter();
  
  const [teacher, setTeacher] = useState<any>(null);
  const [openLessons, setOpenLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    fetchTeacherDetails();
    fetchTeacherLessons();
    fetchTeacherRating();
    fetchNotifications();
  }, [id]);

  const fetchTeacherDetails = async () => {
    try {
      const response = await fetch(`/api/users/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Öğretmen bilgileri getirilemedi');
      }

      const data = await response.json();
      setTeacher(data);
    } catch (err) {
      console.error('Öğretmen bilgileri getirme hatası:', err);
      setError('Öğretmen bilgileri yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const fetchTeacherLessons = async () => {
    try {
      const response = await fetch(`/api/lessons?teacherId=${id}&status=open`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Dersler getirilemedi');
      }

      const data = await response.json();
      setOpenLessons(data);
    } catch (err) {
      console.error('Dersler getirme hatası:', err);
    }
  };

  const fetchTeacherRating = async () => {
    try {
      const response = await fetch(`/api/reviews?teacherId=${id}&limit=1`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Değerlendirmeler getirilemedi');
      }

      const data = await response.json();
      setAverageRating(data.averageRating);
      setTotalReviews(data.pagination.total);
    } catch (err) {
      console.error('Değerlendirmeler getirme hatası:', err);
    }
  };

  // Bildirimleri getir
  const fetchNotifications = async () => {
    try {
      // Gerçek uygulamada API'den bildirimleri çekeceksiniz
      // Burada örnek bildirimler oluşturuyoruz
      const mockNotifications = [
        {
          _id: '1',
          title: 'Yeni Ders Talebi',
          message: 'Matematik dersi için yeni bir talebiniz var.',
          date: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 dakika önce
          read: false,
          type: 'lesson_request'
        },
        {
          _id: '2',
          title: 'Randevu Hatırlatması',
          message: 'Yarın saat 14:00\'da Fizik dersiniz var.',
          date: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 saat önce
          read: true,
          type: 'appointment_reminder'
        },
        {
          _id: '3',
          title: 'Yeni Değerlendirme',
          message: 'Bir öğrenciniz size 5 yıldız verdi!',
          date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 gün önce
          read: false,
          type: 'new_review'
        }
      ];
      
      setNotifications(mockNotifications);
    } catch (err) {
      console.error('Bildirimler getirme hatası:', err);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-10 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF8B5E]"></div>
      </div>
    );
  }

  if (error || !teacher) {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="bg-red-100 text-red-600 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-2">Hata</h2>
          <p className="mb-4">{error || 'Öğretmen bilgileri bulunamadı'}</p>
          <Link
            href="/egitmenler"
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors inline-block"
          >
            Eğitmenler Sayfasına Dön
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/egitmenler" className="text-[#994D1C] hover:underline inline-flex items-center">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
          </svg>
          Eğitmenler Sayfasına Dön
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Sol Sütun - Öğretmen Bilgileri */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6 text-center">
              <div className="w-24 h-24 rounded-full bg-[#FFB996] flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4 overflow-hidden">
                {teacher.profilePhotoUrl ? (
                  <img src={teacher.profilePhotoUrl} alt={teacher.name || 'Eğitmen'} className="w-full h-full object-cover rounded-full" />
                ) : (
                  teacher.name?.charAt(0) || '?'
                )}
              </div>
              <h1 className="text-2xl font-bold text-[#994D1C] mb-2">{teacher.name || 'İsimsiz Öğretmen'}</h1>
              
              <div className="flex justify-center items-center mb-4">
                <StarRating rating={Math.round(averageRating)} readonly size="md" />
                <span className="ml-2 text-gray-500">({totalReviews})</span>
              </div>
              
              <p className="text-gray-600">{teacher.expertise || 'Uzmanlık alanı belirtilmemiş'}</p>
              <p className="text-gray-500 text-sm mt-1">{teacher.university || 'Üniversite belirtilmemiş'}</p>
              
              {/* Bildirimler Butonu */}
              <div className="mt-4">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative inline-flex items-center justify-center px-4 py-2 bg-[#FFF5F0] text-[#994D1C] rounded-md hover:bg-[#FFE5D9] transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  Bildirimler
                  {notifications.filter(n => !n.read).length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {notifications.filter(n => !n.read).length}
                    </span>
                  )}
                </button>
              </div>
              
              {/* Bildirimler Paneli */}
              {showNotifications && (
                <div className="mt-4 bg-white rounded-lg shadow-lg border border-gray-200 max-h-80 overflow-y-auto">
                  <div className="p-3 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="font-medium text-[#994D1C]">Bildirimler</h3>
                    <button 
                      onClick={() => setShowNotifications(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      Bildirim bulunmuyor
                    </div>
                  ) : (
                    <div>
                      {notifications.map((notification) => {
                        // Tarih formatını ayarla
                        const date = new Date(notification.date);
                        const now = new Date();
                        const diffMs = now.getTime() - date.getTime();
                        const diffMins = Math.round(diffMs / 60000);
                        const diffHours = Math.round(diffMs / 3600000);
                        const diffDays = Math.round(diffMs / 86400000);
                        
                        let timeAgo;
                        if (diffMins < 60) {
                          timeAgo = `${diffMins} dakika önce`;
                        } else if (diffHours < 24) {
                          timeAgo = `${diffHours} saat önce`;
                        } else {
                          timeAgo = `${diffDays} gün önce`;
                        }
                        
                        // Bildirim tipine göre ikon belirle
                        let icon;
                        switch(notification.type) {
                          case 'lesson_request':
                            icon = (
                              <div className="bg-blue-100 p-2 rounded-full">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                              </div>
                            );
                            break;
                          case 'appointment_reminder':
                            icon = (
                              <div className="bg-green-100 p-2 rounded-full">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </div>
                            );
                            break;
                          case 'new_review':
                            icon = (
                              <div className="bg-yellow-100 p-2 rounded-full">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                </svg>
                              </div>
                            );
                            break;
                          default:
                            icon = (
                              <div className="bg-gray-100 p-2 rounded-full">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </div>
                            );
                        }
                        
                        return (
                          <div 
                            key={notification._id} 
                            className={`p-4 border-b border-gray-100 flex items-start hover:bg-gray-50 cursor-pointer ${!notification.read ? 'bg-[#FFF9F5]' : ''}`}
                          >
                            <div className="mr-3">
                              {icon}
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between items-start">
                                <h4 className={`font-medium ${!notification.read ? 'text-[#994D1C]' : 'text-gray-700'}`}>
                                  {notification.title}
                                </h4>
                                <span className="text-xs text-gray-500">{timeAgo}</span>
                              </div>
                              <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                            </div>
                            {!notification.read && (
                              <div className="ml-2 w-2 h-2 bg-[#FF8B5E] rounded-full"></div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                  
                  <div className="p-3 border-t border-gray-200 text-center">
                    <button className="text-sm text-[#FF8B5E] hover:text-[#994D1C] font-medium">
                      Tüm Bildirimleri Gör
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <div className="border-t border-gray-200 p-6">
              <h2 className="text-lg font-bold text-[#994D1C] mb-4">İletişim</h2>
              
              {user ? (
                <Link
                  href={`/mesajlarim?recipient=${teacher._id}`}
                  className="w-full block text-center bg-gradient-to-r from-[#FF8B5E] to-[#FFB996] text-white font-medium py-3 px-4 rounded-md hover:from-[#994D1C] hover:to-[#FF8B5E] transition-all duration-300"
                >
                  Mesaj Gönder
                </Link>
              ) : (
                <Link
                  href="/auth/login"
                  className="w-full block text-center bg-gray-200 text-gray-600 font-medium py-3 px-4 rounded-md hover:bg-gray-300 transition-all duration-300"
                >
                  Mesaj göndermek için giriş yapın
                </Link>
              )}
            </div>
          </div>
        </div>
        
        {/* Sağ Sütun - Dersler ve Değerlendirmeler */}
        <div className="md:col-span-2">
          {/* Açık Dersler */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-[#994D1C] mb-6">Açık Dersler</h2>
            
            {openLessons.length === 0 ? (
              <div className="bg-gray-100 p-6 rounded-md text-center">
                <p className="text-gray-500">Bu öğretmenin şu anda açık dersi bulunmuyor.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {openLessons.map((lesson) => (
                  <div key={lesson._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <h3 className="text-lg font-medium text-[#994D1C]">{lesson.title}</h3>
                    <p className="text-gray-600 mb-3 line-clamp-2">{lesson.description}</p>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-gray-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <span className="text-gray-500">{lesson.duration} dakika</span>
                      </div>
                      
                      <div className="font-bold text-[#FF8B5E]">{lesson.price} TL</div>
                    </div>
                    
                    <div className="mt-4">
                      {user ? (
                        user.role === 'student' ? (
                          <Link
                            href={`/dersler/${lesson._id}/rezervasyon`}
                            className="block text-center bg-gradient-to-r from-[#FF8B5E] to-[#FFB996] text-white font-medium py-2 px-4 rounded-md hover:from-[#994D1C] hover:to-[#FF8B5E] transition-all duration-300"
                          >
                            Rezervasyon Yap
                          </Link>
                        ) : (
                          <span className="block text-center bg-gray-200 text-gray-600 font-medium py-2 px-4 rounded-md">
                            Yalnızca öğrenciler rezervasyon yapabilir
                          </span>
                        )
                      ) : (
                        <Link
                          href="/auth/login"
                          className="block text-center bg-gray-200 text-gray-600 font-medium py-2 px-4 rounded-md hover:bg-gray-300 transition-all duration-300"
                        >
                          Rezervasyon için giriş yapın
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Değerlendirmeler */}
          <ReviewsList teacherId={id} limit={5} showPagination={true} />
        </div>
      </div>
    </div>
  );
}
