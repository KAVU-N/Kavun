'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from 'src/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ReviewForm from '@/components/reviews/ReviewForm';
import dynamic from 'next/dynamic';

interface PageProps {
  params: { id: string };
}

const VideoUploadAndComplete = dynamic(() => import('../VideoUploadAndComplete'), { ssr: false });

export default function DersDetayPage({ params }: PageProps) {
  const { id } = params;
  const { user } = useAuth();
  const router = useRouter();
  
  const [lesson, setLesson] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmingComplete, setConfirmingComplete] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmSuccess, setConfirmSuccess] = useState(false);

  

  useEffect(() => {
    if (!lesson || !user) return;
    // actionUrl ile gelme kontrolü veya öğrenci onaylamadıysa
    if (
      user.role === 'student' &&
      !lesson.studentConfirmed &&
      (typeof window !== 'undefined' && window.location.hash === '#confirm')
    ) {
      setShowConfirmModal(true);
    }
  }, [lesson, user]);

  const checkPaymentStatus = useCallback(async () => {
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
  }, [id]);

  const checkReviewStatus = useCallback(async () => {
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
  }, [id]);

  const fetchLessonDetails = useCallback(async () => {
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
  }, [id, user?.role, checkPaymentStatus, checkReviewStatus]);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    fetchLessonDetails();
  }, [user, router, fetchLessonDetails]);

  

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

  const handleStudentConfirm = async () => {
    setActionLoading(true);
    try {
      const response = await fetch(`/api/lessons/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Ders onaylanamadı');
      setConfirmSuccess(true);
      setShowConfirmModal(false);
      fetchLessonDetails();
    } catch (err) {
      setError('Ders onaylanırken bir hata oluştu');
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
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

  // Süreyi uygun formatta gösteren yardımcı fonksiyon
  const getFormattedDuration = (duration: number) => {
    if (duration % 60 === 0) {
      return `${duration / 60} saat`;
    } else if (duration > 60) {
      const hours = Math.floor(duration / 60);
      const minutes = duration % 60;
      return `${hours} saat ${minutes} dakika`;
    } else {
      return `${duration} dakika`;
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
          <h2 className="text-xl font-bold mb-2">Hata</h2>
          <p className="mb-4">{error}</p>
          <button
            onClick={fetchLessonDetails}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
          >
            Yeniden Dene
          </button>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="bg-yellow-100 text-yellow-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-2">Ders Bulunamadı</h2>
          <p className="mb-4">Görüntülemeye çalıştığınız ders bulunamadı veya erişim izniniz yok.</p>
          <Link 
            href="/derslerim"
            className="bg-[#FF8B5E] text-white px-4 py-2 rounded-md hover:bg-[#994D1C] transition-colors inline-block"
          >
            Derslerime Dön
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
  const otherUserRole = user?.role === 'instructor' ? 'Öğrenci' : 'Eğitmen';
  const otherUserEmail = user?.role === 'instructor' ? student.email : teacher.email;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/derslerim" className="text-[#994D1C] hover:underline inline-flex items-center">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
          </svg>
          Derslerime Dön
        </Link>
      </div>
      
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Durum bandı */}
        <div className={`p-3 ${getStatusClass(lesson.status)}`}>
          <div className="container mx-auto flex justify-between items-center">
            <span className="font-medium">{getStatusText(lesson.status)}</span>
            <span className="text-sm">
              {lesson.status === 'completed' && lesson.completedAt ? `Tamamlandı: ${formatDate(lesson.completedAt)}` : ''}
              {lesson.status === 'cancelled' ? 'İptal Edildi' : ''}
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
            {/* Süreyi uygun birimle göster */}
            <span>{getFormattedDuration(lesson.duration)}</span>
            <span className="mx-3">•</span>
            
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
            <span>{lesson.scheduledAt ? formatDate(lesson.scheduledAt) : 'Tarih belirtilmemiş'}</span>
          </div>
        </div>
        
        {/* Ders içeriği ve diğer bilgiler */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-lg font-bold text-[#994D1C] mb-4">Ders Detayları</h2>
              
              <div className="bg-[#FFF8F2] p-4 rounded-lg mb-6">
                <p className="text-gray-700 whitespace-pre-line">{lesson.description}</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Ücret</h3>
                  <p className="text-xl font-bold text-[#FF8B5E]">{lesson.price} TL</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Oluşturulma Tarihi</h3>
                  <p>{formatDate(lesson.createdAt)}</p>
                </div>
              </div>
            </div>
            
            <div>
              <h2 className="text-lg font-bold text-[#994D1C] mb-4">{otherUserRole} Bilgileri</h2>
              
              <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-[#FFB996] flex items-center justify-center text-white text-lg font-bold">
                    {otherUserName ? otherUserName.charAt(0).toUpperCase() : '?'}
                  </div>
                  <div>
                    <h3 className="font-medium">{otherUserName || 'İsim belirtilmemiş'}</h3>
                    <p className="text-sm text-gray-500">{otherUserEmail || 'E-posta belirtilmemiş'}</p>
                  </div>
                </div>
                
                {/* İletişim butonu */}
                <Link
                  href={`/mesajlarim?recipient=${user?.role === 'instructor' ? student._id : teacher._id}`}
                  className="mt-4 w-full block text-center bg-[#FFF8F2] text-[#FF8B5E] font-medium py-2 px-4 rounded-md hover:bg-[#FFE6D5] transition-all duration-300"
                >
                  Mesaj Gönder
                </Link>
              </div>
              
              {/* Ödeme bilgisi (yalnızca öğrenci ise) */}
              {user?.role === 'student' && (
                <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Ödeme Durumu</h3>
                  
                  {showPayment ? (
                    <div>
                      <p className="text-yellow-600 mb-2">Bu ders için henüz ödeme yapılmamış.</p>
                      <Link
                        href={`/payment?lessonId=${lesson._id}`}
                        className="w-full block text-center bg-gradient-to-r from-[#FF8B5E] to-[#FFB996] text-white font-medium py-2 px-4 rounded-md hover:from-[#994D1C] hover:to-[#FF8B5E] transition-all duration-300"
                      >
                        Ödeme Yap
                      </Link>
                    </div>
                  ) : (
                    <p className="text-green-600">Ödeme tamamlandı</p>
                  )}
                </div>
              )}
              
              {/* İşlem butonları */}
              {lesson.status === 'scheduled' && (
                <div className="space-y-3">
                  {/* Öğrenci onay modalı tetikleyici */}
                  {user?.role === 'student' && !lesson.studentConfirmed && (
                    <button
                      onClick={() => setShowConfirmModal(true)}
                      className="w-full block text-center bg-blue-100 text-blue-600 font-medium py-2 px-4 rounded-md hover:bg-blue-200 transition-all duration-300 mb-2"
                    >
                      Randevunuzun başarılı geçtiğini doğrulamak için tıklayın
                    </button>
                  )}
                  {/* Eğitmen için video yüklemeden dersi tamamla */}
                  {user?.role === 'instructor' && (
                    <VideoUploadAndComplete
                      lessonId={lesson._id}
                      onComplete={async () => {
                        setActionLoading(true);
                        try {
                          await handleCompleteLesson();
                          setConfirmingComplete(false);
                        } catch (err) {
                          setError('Ders tamamlanırken bir hata oluştu');
                        } finally {
                          setActionLoading(false);
                        }
                      }}
                      disabled={lesson.status !== 'scheduled'}
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Öğrenci Onay Modalı */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full text-center">
            <h2 className="text-xl font-bold mb-4 text-[#994D1C]">Dersi Onayla</h2>
            <p className="mb-6">Dersin başarılı geçtiğini onaylıyor musun?</p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={handleStudentConfirm}
                disabled={actionLoading}
                className="bg-[#FF8B5E] text-white px-6 py-2 rounded-md font-semibold hover:bg-[#994D1C] transition-all duration-300"
              >
                {actionLoading ? 'Onaylanıyor...' : 'Evet, Onayla'}
              </button>
              <button
                onClick={() => setShowConfirmModal(false)}
                disabled={actionLoading}
                className="bg-gray-200 text-gray-700 px-6 py-2 rounded-md font-semibold hover:bg-gray-300 transition-all duration-300"
              >
                Vazgeç
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Başarı mesajı */}
      {confirmSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full text-center">
            <h2 className="text-xl font-bold mb-4 text-green-700">Ders Onaylandı</h2>
            <p className="mb-4">Dersi başarıyla onayladınız.</p>
            <button
              onClick={() => setConfirmSuccess(false)}
              className="bg-green-500 text-white px-6 py-2 rounded-md font-semibold hover:bg-green-600 transition-all duration-300"
            >
              Kapat
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
