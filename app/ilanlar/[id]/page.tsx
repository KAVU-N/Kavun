'use client';

import { useState, useEffect } from 'react';
import { useAuth } from 'src/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { FaArrowLeft, FaCalendarAlt, FaClock, FaMoneyBillWave, FaChalkboardTeacher, FaUniversity, FaUser } from 'react-icons/fa';

interface Teacher {
  _id: string;
  name: string;
  email: string;
  university: string;
  expertise: string;
  grade?: number; // Kaçıncı sınıf olduğu bilgisi
  profilePhotoUrl?: string;
}

interface Ilan {
  _id: string;
  title: string;
  description: string;
  price: number;
  method: string;
  duration: number;
  frequency: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  teacher: Teacher;
  instructorFrom: string;
}

export default function IlanDetayPage({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const router = useRouter();
  const [ilan, setIlan] = useState<Ilan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [photoError, setPhotoError] = useState(false);

  useEffect(() => {
    // user null olduğunda login sayfasına yönlendir
    if (user === null) {
      router.push('/auth/login');
    }
  }, [user, router]);

  useEffect(() => {
    const fetchIlanDetay = async () => {
      if (!params.id) return;
      
      try {
        setIsLoading(true);
        
        // API endpoint'e istek at
        const response = await fetch(`/api/ilanlar/${params.id}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'İlan detayları getirilirken bir hata oluştu');
        }
        
        const data = await response.json();
        console.log('[ILAN DETAY] data:', data);
        // Önce ilanı set et
        setIlan(data);
        setPhotoError(false);
        setError('');

        // Ardından öğretmenin en güncel profilini public endpoint'ten çek
        const teacherId = data?.userId || data?.teacher?._id || data?.teacher?.id;
        console.log('[ILAN DETAY] teacherId computed:', teacherId);
        if (teacherId) {
          try {
            const tuRes = await fetch(`/api/users/public/${teacherId}`);
            if (tuRes.ok) {
              const teacherPublic = await tuRes.json();
              console.log('[ILAN DETAY] public teacher:', teacherPublic);
              setIlan((prev) => prev ? { ...prev, teacher: teacherPublic } as Ilan : prev);
              // Foto URL güncellenmiş olabilir; hata durumunu sıfırla
              setPhotoError(false);
            }
          } catch (e) {
            console.warn('Öğretmen public profili alınamadı:', e);
          }
        }
      } catch (err: any) {
        console.error('İlan detayları yüklenirken hata oluştu:', err);
        setError('İlan detayları yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchIlanDetay();
    }
  }, [params.id]);

  // Foto URL’si değiştiğinde hata durumunu sıfırla
  useEffect(() => {
    if (ilan?.teacher?.profilePhotoUrl) {
      setPhotoError(false);
    }
  }, [ilan?.teacher?.profilePhotoUrl]);

  // Frekans bilgisini Türkçe'ye çevir
  const getFrequencyText = (frequency: string) => {
    switch (frequency) {
      case 'daily':
        return 'Günlük';
      case 'weekly':
        return 'Haftalık';
      case 'monthly':
        return 'Aylık';
      case 'flexible':
        return 'Esnek';
      default:
        return frequency;
    }
  };

  // Tarih formatla
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Görsel URL’i: öğretmenin URL’i yoksa ve ilan kullanıcı ID’si oturumdaki kullanıcıya eşitse, AuthContext’teki kullanıcı fotoğrafını kullan
  const fallbackUserPhoto = user?.id && ilan?.userId === user.id ? (user as any)?.profilePhotoUrl : undefined;
  const displayPhotoUrl = !photoError ? (ilan?.teacher?.profilePhotoUrl || fallbackUserPhoto) : undefined;

  if (isLoading || !user) {
    return (
      <div className="relative min-h-screen overflow-hidden pt-28 pb-12">
        <div className="max-w-5xl mx-auto px-4 relative z-10">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex justify-center items-center py-8">
              <div className="w-12 h-12 border-4 border-[#FFB996] border-t-[#FF8B5E] rounded-full animate-spin"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden pt-28 pb-12">
      <div className="max-w-5xl mx-auto px-4 relative z-10">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* İçerik */}
          {error ? (
            <div className="p-6">
              <p className="text-red-600 text-center">{error}</p>
            </div>
          ) : !ilan ? (
            <div className="p-8 text-center">
              <p className="text-[#994D1C] mb-4">İlan bulunamadı.</p>
              <Link 
                href="/ilanlar"
                className="px-4 py-2 bg-gradient-to-r from-[#FFB996] to-[#FF8B5E] text-white rounded-lg text-sm font-medium hover:shadow-md transition-all duration-300"
              >
                Tüm İlanlara Dön
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              <h1 className="text-3xl font-bold text-[#994D1C] -mt-2">{ilan.title}</h1>

              {/* Eğitmen Bilgisi */}
              <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                {displayPhotoUrl ? (
                  <Image
                    src={displayPhotoUrl}
                    alt={(ilan.teacher?.name || 'Eğitmen') + ' profil fotoğrafı'}
                    width={64}
                    height={64}
                    className="w-16 h-16 rounded-full object-cover mr-4"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    onError={() => setPhotoError(true)}
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#FFB996] to-[#FF8B5E] flex items-center justify-center text-white text-xl font-bold mr-4">
                    {ilan.teacher?.name?.charAt(0)?.toUpperCase()}
                  </div>
                )}
                <div>
                  <h2 className="text-xl font-semibold text-[#6B3416]">{ilan.teacher?.name}</h2>
                  <p className="text-[#994D1C]">{ilan.teacher?.grade ? `${ilan.teacher.grade}. Sınıf` : ''} {ilan.teacher?.expertise || 'Belirtilmemiş'}</p>
                  <p className="text-gray-600 flex items-center mt-1">
                    <FaUniversity className="mr-1 text-sm" />
                    {ilan.teacher?.university}
                  </p>
                </div>
              </div>

              {/* Ders Detayları */}
              <div>
                <h3 className="font-semibold mb-3 text-[#994D1C]">Ders Detayları</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <FaMoneyBillWave className="text-green-600 text-xl mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Saatlik Ücret</p>
                      <p className="font-semibold text-gray-800">{ilan.price} ₺</p>
                    </div>
                  </div>
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <FaClock className="text-blue-600 text-xl mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Ders Süresi</p>
                      <p className="font-semibold text-gray-800">{ilan.duration} Saat</p>
                    </div>
                  </div>
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <FaChalkboardTeacher className="text-purple-600 text-xl mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Ders Yöntemi</p>
                      <p className="font-semibold text-gray-800 capitalize">{ilan.method}</p>
                    </div>
                  </div>
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <FaCalendarAlt className="text-orange-600 text-xl mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Ders Sıklığı</p>
                      <p className="font-semibold text-gray-800">{getFrequencyText(ilan.frequency)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Açıklama */}
              <div>
                <h3 className="font-semibold mb-3 text-[#994D1C]">Ders Açıklaması</h3>
                <p className="text-[#6B3416] whitespace-pre-line leading-relaxed">{ilan.description}</p>
              </div>

              {/* Ek Bilgiler */}
              <div>
                <h3 className="font-semibold mb-3 text-[#994D1C]">Ek Bilgiler</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-[#FFF9F5] rounded-lg">
                    <p className="text-sm font-medium text-[#994D1C] mb-1">Eğitim Aldığı Öğretmen:</p>
                    <p className="font-semibold text-gray-800">{ilan.instructorFrom || 'Belirtilmemiş'}</p>
                  </div>
                </div>
              </div>

              {/* İlan Tarihi */}
              <div className="text-sm text-gray-500">İlan Tarihi: {formatDate(ilan.createdAt)}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
