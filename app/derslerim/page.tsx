'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import LessonCalendar from '@/components/calendar/LessonCalendar';
import Link from 'next/link';

// Ders detay modalı
interface EventDetailModalProps {
  event: any;
  onClose: () => void;
  onCompleteLesson?: () => void;
  onCancelLesson?: () => void;
  userRole: string;
}

const EventDetailModal: React.FC<EventDetailModalProps> = ({
  event,
  onClose,
  onCompleteLesson,
  onCancelLesson,
  userRole
}) => {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'open': return 'Açık';
      case 'scheduled': return 'Planlandı';
      case 'completed': return 'Tamamlandı';
      case 'cancelled': return 'İptal Edildi';
      default: return status;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'open': return 'bg-yellow-100 text-yellow-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Ders iptal etme veya tamamlama butonları
  const renderActionButtons = () => {
    if (event.status === 'scheduled') {
      return (
        <div className="flex space-x-2 mt-4">
          {userRole === 'teacher' && (
            <button
              onClick={onCompleteLesson}
              className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
            >
              Dersi Tamamla
            </button>
          )}
          <button
            onClick={onCancelLesson}
            className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
          >
            Dersi İptal Et
          </button>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
        <div className="flex justify-between items-start">
          <h3 className="text-xl font-bold text-[#994D1C]">{event.title}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-600 font-medium">Durum:</span>
            <span className={`px-3 py-1 rounded-full text-sm ${getStatusClass(event.status)}`}>
              {getStatusText(event.status)}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-gray-600 font-medium">Başlangıç:</span>
            <span>{formatDate(event.start)}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-gray-600 font-medium">Bitiş:</span>
            <span>{formatDate(event.end)}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-gray-600 font-medium">
              {userRole === 'teacher' ? 'Öğrenci:' : 'Öğretmen:'}
            </span>
            <span className="font-medium">
              {userRole === 'teacher' ? event.studentName : event.teacherName}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-gray-600 font-medium">Ücret:</span>
            <span className="font-medium text-[#FF8B5E]">{event.price} TL</span>
          </div>
        </div>
        
        {renderActionButtons()}
        
        <div className="mt-4 pt-4 border-t border-gray-200">
          <Link 
            href={`/derslerim/${event.id}`}
            className="w-full block text-center bg-gradient-to-r from-[#FF8B5E] to-[#FFB996] text-white font-medium py-2 px-4 rounded-md hover:from-[#994D1C] hover:to-[#FF8B5E] transition-all duration-300"
          >
            Ders Detaylarını Görüntüle
          </Link>
        </div>
      </div>
    </div>
  );
};

export default function DerslerimPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lessonStats, setLessonStats] = useState({
    total: 0,
    upcoming: 0,
    completed: 0,
    cancelled: 0,
    pending: 0
  });

  useEffect(() => {
    // Komponent mount edildiğinde yükleme durumunu kontrol et
    const checkAuth = async () => {
      // Kullanıcı bilgisi henüz yüklenmediyse bekle
      if (user === null) {
        // Burada hiçbir şey yapma, useAuth hook'u kullanıcı bilgisini yükleyecek
        return;
      }
      
      // Kullanıcı giriş yapmamışsa yönlendir
      if (!user || !user.id) {
        console.log('Kullanıcı girişi yapılmamış, yönlendiriliyor...');
        router.push('/auth/login');
        return;
      }
      
      // Token kontrolü - sadece ek güvenlik için
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('Token bulunamadı, yönlendiriliyor...');
        router.push('/auth/login');
        return;
      }
      
      console.log('Kullanıcı girişi yapılmış, ders istatistikleri getiriliyor...');
      await fetchLessonStats();
    };
    
    checkAuth();
  }, [user, router]);

  const fetchLessonStats = async () => {
    try {
      // Kullanıcı yoksa veya token yoksa işlem yapma
      if (!user || !user.id) {
        console.error('Kullanıcı bilgisi bulunamadı');
        return;
      }
      
      // localStorage'dan token'i güvenli bir şekilde al
      let token = '';
      if (typeof window !== 'undefined') {
        token = localStorage.getItem('token') || '';
        if (!token) {
          console.error('Token bulunamadı');
          return;
        }
      }

      const endpoint = user.role === 'teacher' 
        ? `/api/lessons/stats?teacherId=${user.id}` 
        : `/api/lessons/stats?studentId=${user.id}`;
      
      console.log('API isteği gönderiliyor:', endpoint);
      console.log('Token mevcut:', !!token);
      
      setLoading(true);
      setError(null);
      
      const response = await fetch(endpoint, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const stats = await response.json();
        setLessonStats(stats);
        console.log('Ders istatistikleri alındı:', stats);
      } else {
        console.error('API hatası:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('Hata detayı:', errorText);
        setError('Ders istatistikleri alınırken bir hata oluştu');
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Ders istatistikleri getirme hatası:', err);
    }
  };

  const handleEventSelect = (event: any) => {
    setSelectedEvent(event);
  };

  const handleCompleteLesson = async () => {
    if (!selectedEvent) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/lessons/${selectedEvent.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: 'completed' })
      });

      if (response.ok) {
        // Takvimi yenile
        setSelectedEvent(null);
        window.location.reload();
      } else {
        const data = await response.json();
        setError(data.error || 'Ders tamamlama işlemi başarısız oldu');
      }
    } catch (err) {
      setError('Sunucu hatası');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelLesson = async () => {
    if (!selectedEvent) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/lessons/${selectedEvent.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: 'cancelled' })
      });

      if (response.ok) {
        // Takvimi yenile
        setSelectedEvent(null);
        window.location.reload();
      } else {
        const data = await response.json();
        setError(data.error || 'Ders iptal işlemi başarısız oldu');
      }
    } catch (err) {
      setError('Sunucu hatası');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null; // Yönlendirme yapılıyor
  }

  return (
    <div className="container mx-auto px-4 py-8 mt-16">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#994D1C]">Derslerim</h1>
        <p className="text-gray-600 mt-2">
          {user.role === 'teacher'
            ? 'Tüm derslerinizi bu sayfadan yönetebilirsiniz.'
            : 'Kayıtlı olduğunuz tüm dersleri bu sayfadan görüntüleyebilirsiniz.'}
        </p>
      </div>
      
      {error && (
        <div className="bg-red-100 text-red-600 p-4 rounded-md mb-6">
          {error}
        </div>
      )}
      
      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-sm font-medium text-gray-500 mb-1">Toplam Ders</div>
          <div className="text-2xl font-bold text-[#994D1C]">{lessonStats.total || 0}</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-sm font-medium text-gray-500 mb-1">Planlanan Dersler</div>
          <div className="text-2xl font-bold text-blue-600">{lessonStats.upcoming || 0}</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-sm font-medium text-gray-500 mb-1">Tamamlanan Dersler</div>
          <div className="text-2xl font-bold text-green-600">{lessonStats.completed || 0}</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-sm font-medium text-gray-500 mb-1">İptal Edilen Dersler</div>
          <div className="text-2xl font-bold text-red-600">{lessonStats.cancelled || 0}</div>
        </div>
      </div>
      
      {/* Takvim Görünümü */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-[#994D1C] mb-4">Ders Takvimi</h2>
        <LessonCalendar onSelectEvent={handleEventSelect} />
      </div>
      
      {/* Ders Detay Modalı */}
      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onCompleteLesson={handleCompleteLesson}
          onCancelLesson={handleCancelLesson}
          userRole={user.role}
        />
      )}
    </div>
  );
}
