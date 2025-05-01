'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ReviewForm from '@/components/reviews/ReviewForm';
import { useLanguage } from '@/src/contexts/LanguageContext';

interface PageProps {
  params: { id: string };
}

export default function DersDetayPage({ params }: PageProps) {
  const { id } = params;
  const { user } = useAuth();
  const router = useRouter();
  const { t, language } = useLanguage();
  
  const [lesson, setLesson] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const [confirmingComplete, setConfirmingComplete] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    fetchLessonDetails();
  }, [user, router, id]);

  const fetchLessonDetails = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/lessons/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Ders detayları getirilemedi');
      }

      const data = await response.json();
      setLesson(data);
      
      // Ödeme durumunu kontrol et
      if (data.status === 'scheduled' && user?.role === 'student') {
        checkPaymentStatus();
      }
      
      // Tamamlanan dersler için değerlendirme kontrolü yap
      if (data.status === 'completed' && user?.role === 'student') {
        checkReviewStatus();
      }
    } catch (err) {
      console.error('Ders detayları getirme hatası:', err);
      setError('Ders detayları yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const checkPaymentStatus = async () => {
    try {
      const response = await fetch(`/api/payments/check?lessonId=${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        // Ödeme yapılmamışsa ödeme formunu göster
        if (!data.isPaid) {
          setShowPayment(true);
        }
      }
    } catch (err) {
      console.error('Ödeme durumu kontrol hatası:', err);
    }
  };
  
  const checkReviewStatus = async () => {
    try {
      const response = await fetch(`/api/reviews?lessonId=${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        // Kullanıcının bu derse daha önce değerlendirme yapıp yapmadığını kontrol et
        if (data.reviews && data.reviews.length > 0) {
          setHasReviewed(true);
        }
      }
    } catch (err) {
      console.error('Değerlendirme durumu kontrol hatası:', err);
    }
  };

  const handleCancelLesson = async () => {
    setActionLoading(true);
    try {
      const response = await fetch(`/api/lessons/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: 'cancelled' })
      });

      if (!response.ok) {
        throw new Error('Ders iptal edilemedi');
      }

      // Sayfayı yenile
      fetchLessonDetails();
      setConfirmingCancel(false);
    } catch (err) {
      console.error('Ders iptal hatası:', err);
      setError('Ders iptal edilirken bir hata oluştu');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteLesson = async () => {
    setActionLoading(true);
    try {
      const response = await fetch(`/api/lessons/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: 'completed' })
      });

      if (!response.ok) {
        throw new Error('Ders tamamlanamadı');
      }

      // Sayfayı yenile
      fetchLessonDetails();
      setConfirmingComplete(false);
    } catch (err) {
      console.error('Ders tamamlama hatası:', err);
      setError('Ders tamamlanırken bir hata oluştu');
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'open': return t('lessons.statusOpen');
      case 'scheduled': return t('lessons.statusScheduled');
      case 'completed': return t('lessons.statusCompleted');
      case 'cancelled': return t('lessons.statusCancelled');
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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-10 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF8B5E]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="bg-red-100 text-red-600 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-2">{t('general.error')}</h2>
          <p className="mb-4">{error}</p>
          <button
            onClick={fetchLessonDetails}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
          >
            {t('general.retry')}
          </button>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="bg-yellow-100 text-yellow-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-2">{t('lessons.notFound')}</h2>
          <p className="mb-4">{t('lessons.notFoundDesc')}</p>
          <Link 
            href="/derslerim"
            className="bg-[#FF8B5E] text-white px-4 py-2 rounded-md hover:bg-[#994D1C] transition-colors inline-block"
          >
            {t('nav.myLessons')}
          </Link>
        </div>
      </div>
    );
  }

  // Eğitmen ve öğrenci bilgilerini alma
  const teacher = lesson.teacherId || {};
  const student = lesson.studentId || {};
  
  // Kullanıcı rolüne göre karşı tarafın bilgilerini gösterme
  const otherUserName = user?.role === 'instructor' ? student.name : teacher.name;
  const otherUserRole = user?.role === 'instructor' ? t('lessons.student') : t('lessons.teacher');
  const otherUserEmail = user?.role === 'instructor' ? student.email : teacher.email;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/derslerim" className="text-[#994D1C] hover:underline inline-flex items-center">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
          </svg>
          {t('nav.myLessons')}
        </Link>
      </div>
      
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Durum bandı */}
        <div className={`p-3 ${getStatusClass(lesson.status)}`}>
          <div className="container mx-auto flex justify-between items-center">
            <span className="font-medium">{getStatusText(lesson.status)}</span>
            <span className="text-sm">
              {lesson.status === 'completed' && lesson.completedAt ? `${t('lessons.completedAt')}: ${formatDate(lesson.completedAt)}` : ''}
              {lesson.status === 'cancelled' ? t('lessons.statusCancelled') : ''}
            </span>
          </div>
        </div>
        
        {/* Ders başlığı */}
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold text-[#994D1C]">{lesson.title}</h1>
          <div className="flex items-center mt-2 text-gray-600">
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span>{lesson.duration} {t('lessons.minute')}</span>
            
            <span className="mx-3">•</span>
            
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
            <span>{lesson.scheduledAt ? formatDate(lesson.scheduledAt) : t('lessons.noDate')}</span>
          </div>
        </div>
        
        {/* Ders içeriği ve diğer bilgiler */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-lg font-bold text-[#994D1C] mb-4">{t('lessons.details')}</h2>
              
              <div className="bg-[#FFF8F2] p-4 rounded-lg mb-6">
                <p className="text-gray-700 whitespace-pre-line">{lesson.description}</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">{t('general.price')}</h3>
                  <p className="text-xl font-bold text-[#FF8B5E]">{lesson.price} TL</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">{t('lessons.createdAt')}</h3>
                  <p>{formatDate(lesson.createdAt)}</p>
                </div>
              </div>
            </div>
            
            <div>
              <h2 className="text-lg font-bold text-[#994D1C] mb-4">{user?.role === 'instructor' ? t('lessons.studentInfo') : t('lessons.teacherInfo')}</h2>
              
              <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-[#FFB996] flex items-center justify-center text-white text-lg font-bold">
                    {otherUserName ? otherUserName.charAt(0).toUpperCase() : '?'}
                  </div>
                  <div>
                    <h3 className="font-medium">{otherUserName || t('general.noName')}</h3>
                    <p className="text-sm text-gray-500">{otherUserEmail || t('general.noEmail')}</p>
                  </div>
                </div>
                
                {/* İletişim butonu */}
                <Link
                  href={`/mesajlarim?recipient=${user?.role === 'instructor' ? student._id : teacher._id}`}
                  className="mt-4 w-full block text-center bg-[#FFF8F2] text-[#FF8B5E] font-medium py-2 px-4 rounded-md hover:bg-[#FFE6D5] transition-all duration-300"
                >
                  {t('messages.sendMessage')}
                </Link>
              </div>
              
              {/* Ödeme bilgisi (yalnızca öğrenci ise) */}
              {user?.role === 'student' && (
                <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">{t('lessons.paymentStatus')}</h3>
                  
                  {showPayment ? (
                    <div>
                      <p className="text-yellow-600 mb-2">{t('lessons.notPaid')}</p>
                      <Link
                        href={`/payment?lessonId=${lesson._id}`}
                        className="w-full block text-center bg-gradient-to-r from-[#FF8B5E] to-[#FFB996] text-white font-medium py-2 px-4 rounded-md hover:from-[#994D1C] hover:to-[#FF8B5E] transition-all duration-300"
                      >
                        {t('lessons.payNow')}
                      </Link>
                    </div>
                  ) : (
                    <p className="text-green-600">{t('lessons.paid')}</p>
                  )}
                </div>
              )}
              
              {/* İşlem butonları */}
              {lesson.status === 'scheduled' && (
                <div className="space-y-3">
                  {/* İptal etme butonu (her iki taraf da yapabilir) */}
                  {!confirmingCancel ? (
                    <button
                      onClick={() => setConfirmingCancel(true)}
                      className="w-full block text-center bg-red-100 text-red-600 font-medium py-2 px-4 rounded-md hover:bg-red-200 transition-all duration-300"
                    >
                      Dersi İptal Et
                    </button>
                  ) : (
                    <div className="bg-red-50 border border-red-200 rounded-md p-3">
                      <p className="text-red-600 text-sm mb-2">Dersi iptal etmek istediğinize emin misiniz?</p>
                      <div className="flex space-x-2">
                        <button
                          onClick={handleCancelLesson}
                          disabled={actionLoading}
                          className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                        >
                          {actionLoading ? 'İşleniyor...' : 'Evet, İptal Et'}
                        </button>
                        <button
                          onClick={() => setConfirmingCancel(false)}
                          disabled={actionLoading}
                          className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
                        >
                          Vazgeç
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {/* Tamamlama butonu (yalnızca eğitmen) */}
                  {user?.role === 'instructor' && (
                    !confirmingComplete ? (
                      <button
                        onClick={() => setConfirmingComplete(true)}
                        className="w-full block text-center bg-green-100 text-green-600 font-medium py-2 px-4 rounded-md hover:bg-green-200 transition-all duration-300"
                      >
                        Dersi Tamamla
                      </button>
                    ) : (
                      <div className="bg-green-50 border border-green-200 rounded-md p-3">
                        <p className="text-green-600 text-sm mb-2">Dersi tamamlamak istediğinize emin misiniz?</p>
                        <div className="flex space-x-2">
                          <button
                            onClick={handleCompleteLesson}
                            disabled={actionLoading}
                            className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                          >
                            {actionLoading ? 'İşleniyor...' : 'Evet, Tamamla'}
                          </button>
                          <button
                            onClick={() => setConfirmingComplete(false)}
                            disabled={actionLoading}
                            className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
                          >
                            Vazgeç
                          </button>
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
