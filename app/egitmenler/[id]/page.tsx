'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from 'src/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ReviewsList from '@/components/reviews/ReviewsList';
import StarRating from '@/components/reviews/StarRating';
import ChatBox from 'src/components/ChatBox';
import ReviewForm from '@/components/reviews/ReviewForm';

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
  
  // Chat modal visibility
  const [showChat, setShowChat] = useState(false);
  
  // Review section state
  const [showReview, setShowReview] = useState(false);
  const [eligibleLessons, setEligibleLessons] = useState<any[]>([]);
  const [selectedLessonId, setSelectedLessonId] = useState<string>('');

  useEffect(() => {
    fetchTeacherDetails();
    fetchTeacherLessons();
    fetchTeacherRating();
  }, [id]);

  // When opening review section, fetch completed lessons with this teacher
  useEffect(() => {
    if (showReview && user?.id) {
      fetchEligibleLessons();
    }
  }, [showReview, user?.id]);

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

  // Get completed lessons for this teacher; if student filter to current student, if admin show all
  const fetchEligibleLessons = async () => {
    try {
      const res = await fetch(`/api/lessons?status=completed&teacherId=${id}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (!res.ok) return;
      const lessons = await res.json();
      const mine = Array.isArray(lessons)
        ? (user?.role === 'admin' 
            ? lessons 
            : lessons.filter((l: any) => l.studentId === user?.id || l?.studentId?._id === user?.id))
        : [];
      setEligibleLessons(mine);
      if (mine.length > 0) setSelectedLessonId(mine[0]._id);
    } catch (e) {
      console.error('Uygun dersler alınamadı', e);
    }
  };

  const fetchTeacherLessons = async () => {
    try {
      // Öğretmenin aktif ilanlarını getir
      const response = await fetch(`/api/ilanlar/teacher?teacherId=${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('İlanlar getirilemedi');
      }

      const data = await response.json();
      setOpenLessons(data);
    } catch (err) {
      console.error('İlanlar getirme hatası:', err);
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
    <div className="container mx-auto px-4 pt-24 pb-8">
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
              
              
            </div>
            
            <div className="border-t border-gray-200 p-6">
              <h2 className="text-lg font-bold text-[#994D1C] mb-4">İletişim</h2>
              
              {user ? (
                <button
                  type="button"
                  onClick={() => setShowChat(true)}
                  className="w-full block text-center bg-gradient-to-r from-[#FF8B5E] to-[#FFB996] text-white font-medium py-3 px-4 rounded-md hover:from-[#994D1C] hover:to-[#FF8B5E] transition-all duration-300"
                >
                  Mesaj Gönder
                </button>
              ) : (
                <Link
                  href="/auth/login"
                  className="w-full block text-center bg-gray-200 text-gray-600 font-medium py-3 px-4 rounded-md hover:bg-gray-300 transition-all duration-300"
                >
                  Mesaj göndermek için giriş yapın
                </Link>
              )}

              {/* Değerlendir butonu - Mesaj Gönder'in hemen altında */}
              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => {
                    if (!user) {
                      router.push('/auth/login');
                      return;
                    }
                    if (user.role === 'student' || user.role === 'admin') {
                      setShowReview(v => !v);
                    }
                  }}
                  className="w-full inline-flex items-center justify-center px-4 py-2 bg-[#FFF5F0] text-[#994D1C] rounded-md hover:bg-[#FFE5D9] transition-colors"
                >
                  {showReview ? 'Değerlendirmeyi Gizle' : 'Değerlendir'}
                </button>
                {user && user.role !== 'student' && user.role !== 'admin' && (
                  <p className="mt-2 text-xs text-gray-500 text-center">Değerlendirme yalnızca öğrenciler ve adminler tarafından yapılabilir.</p>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Sağ Sütun - İlanlar ve Değerlendirmeler */}
        <div className="md:col-span-2">
          {/* İlanlar */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-[#994D1C] mb-6">İlanlar</h2>
            
            {openLessons.length === 0 ? (
              <div className="bg-gray-100 p-6 rounded-md text-center">
                <p className="text-gray-500">Bu eğitmenin şu anda aktif ilanı bulunmuyor.</p>
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
          
          {/* Değerlendirme Paneli (buton solda) */}

          {showReview && user && (user.role === 'student' || user.role === 'admin') && (
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <h3 className="text-lg font-bold text-[#994D1C] mb-4">Eğitmeni Değerlendir</h3>
              {eligibleLessons.length === 0 ? (
                <div className="bg-gray-100 p-4 rounded-md text-gray-600">
                  Bu eğitmenle tamamlanmış dersiniz bulunamadı. Değerlendirme yapabilmek için tamamlanmış bir dersiniz olmalı.
                </div>
              ) : (
                <>
                  <label className="block text-sm text-gray-700 mb-2">Dersi seçin</label>
                  <select
                    value={selectedLessonId}
                    onChange={(e) => setSelectedLessonId(e.target.value)}
                    className="w-full mb-4 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF8B5E]"
                  >
                    {eligibleLessons.map((l) => (
                      <option key={l._id} value={l._id}>
                        {l.title} — {new Date(l.scheduledAt || l.createdAt).toLocaleDateString('tr-TR')}
                      </option>
                    ))}
                  </select>
                  {selectedLessonId && (
                    <ReviewForm
                      lessonId={selectedLessonId}
                      teacherId={id}
                      onSuccess={() => {
                        fetchTeacherRating();
                      }}
                    />
                  )}
                </>
              )}
            </div>
          )}

          {/* Değerlendirmeler */}
          <ReviewsList teacherId={id} limit={5} showPagination={true} />
        </div>
      </div>
      {/* Floating ChatBox (diğer chatboxlar gibi) */}
      {showChat && teacher && (
        <ChatBox
          instructor={{
            _id: teacher._id,
            name: teacher.name || 'Eğitmen',
            email: teacher.email || '',
            university: teacher.university || '',
            role: teacher.role || 'instructor',
            price: teacher.price
          }}
          onClose={() => setShowChat(false)}
        />
      )}
    </div>
  );
}
