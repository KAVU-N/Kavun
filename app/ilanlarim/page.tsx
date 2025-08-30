'use client';

import { useState, useEffect } from 'react';
import Notification from './Notification';
import { useAuth } from 'src/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { useLanguage } from '@/src/contexts/LanguageContext';

interface Ilan {
  _id: string;
  title: string;
  description: string;
  price: number;
  method: string;
  frequency: string;
  instructorFrom?: string;
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'inactive';
  userId: string;
}

export default function IlanlarimPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { t, language } = useLanguage();
  const [ilanlar, setIlanlar] = useState<Ilan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Sadece eğitmen (instructor) rolüne sahip kullanıcıların erişimine izin ver
  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
    } else if (user && user.role !== 'instructor' && user.role !== 'teacher') {
      router.push('/');
    }
  }, [user, router]);

  useEffect(() => {
    const fetchIlanlar = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        
        // URL'den refresh parametresini kontrol et
        const searchParams = new URLSearchParams(window.location.search);
        const refresh = searchParams.get('refresh');
        
        if (refresh === 'true') {
          // URL'den refresh parametresini kaldır
          const newUrl = window.location.pathname;
          window.history.replaceState({}, '', newUrl);
        }
        
        // Token al
        const token = localStorage.getItem('token') || '';
        
        // Token'ı kontrol et
        try {
          if (token) {
            const tokenData = JSON.parse(atob(token.split('.')[1]));
          console.log('Token içeriği:', tokenData);
          }
        } catch (e) {
          console.error('Token çözümlenirken hata:', e);
        }
        
        // Kullanıcı bilgilerini kontrol et
        console.log('Kullanıcı bilgileri:', {
          id: user.id,
          email: user.email,
          role: user.role
        });
        
        // API endpoint'e istek at
        console.log('API isteği yapılıyor - userId:', user.id);
        const response = await fetch(`/api/ilanlar?userId=${user.id}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'İlanlar getirilirken bir hata oluştu');
        }
        
        const data = await response.json();
        console.log('API yanıtı - alınan ilanlar:', data.length);
        
        if (data.length === 0) {
          console.log('Dikkat: Hiç ilan bulunamadı');
        } else {
          console.log('Alınan ilk ilan örneği:', data[0]);
        }
        
        setIlanlar(data);
        setError('');
      } catch (err) {
        console.error('İlanlar yüklenirken hata oluştu:', err);
        setError('İlanlar yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
      } finally {
        setIsLoading(false);
      }
    };

    if (user && (user.role === 'instructor' || user.role === 'teacher')) {
      fetchIlanlar();
    }
  }, [user, router]);

  // Modal için state
  const [deleteModalIlanId, setDeleteModalIlanId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // İlan silme işlemi (modal üzerinden)
  const handleDelete = async (ilanId: string) => {
    setDeleting(true);
    try {
      const token = localStorage.getItem('token') || '';
      const response = await fetch(`/api/ilanlar/${ilanId}?userId=${user?.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('İlan silinirken bir hata oluştu');
      }
      setIlanlar(prev => prev.filter(ilan => ilan._id !== ilanId));
      setDeleteModalIlanId(null);
    } catch (err) {
      console.error('İlan silme hatası:', err);
      alert('İlan silinirken bir hata oluştu');
    } finally {
      setDeleting(false);
    }
  };



  // Kullanıcı giriş yapmamış veya eğitmen değilse içeriği gösterme
  if (!user || user.role !== 'instructor' && user.role !== 'teacher') {
    return (
      <div className="min-h-screen bg-white pt-24 pb-16 relative z-[1]">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-3xl font-bold text-[#6B3416] mb-4">{t('general.accessDenied')}</h1>
            <p className="text-[#994D1C] mb-6">{t('general.accessDeniedMessage')}</p>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-3 bg-gradient-to-r from-[#FFB996] to-[#FF8B5E] text-white font-medium rounded-lg"
            >
              {t('general.goToHomepage')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-24 pb-16 relative z-[1]">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-[#6B3416]">{t('myListings.myListings')}</h1>
            <button 
              onClick={() => router.push('/ilan-ver')}
              className="px-4 py-2 bg-gradient-to-r from-[#FFB996] to-[#FF8B5E] text-white rounded-lg flex items-center gap-2 hover:shadow-lg transition-all duration-300"
            >
              <FaPlus />
              <span>{t('myListings.addNewListing')}</span>
            </button>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="w-12 h-12 border-4 border-[#FFB996] border-t-[#FF8B5E] rounded-full animate-spin"></div>
            </div>
          ) : error ? (
            <Notification type="error" message={error || ''} onClose={() => setError('')} />
          ) : ilanlar.length === 0 ? (
            <div className="bg-white p-8 rounded-xl shadow-md text-center">
              <p className="text-[#994D1C] mb-4">{t('myListings.noListingsYet')}</p>
              <button 
                onClick={() => router.push('/ilan-ver')}
                className="px-4 py-2 bg-gradient-to-r from-[#FFB996] to-[#FF8B5E] text-white rounded-lg inline-flex items-center gap-2 hover:shadow-lg transition-all duration-300"
              >
                <FaPlus />
                <span>{t('myListings.addYourFirstListing')}</span>
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {ilanlar.map((ilan) => (
                <div key={ilan._id} className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-xl font-bold text-[#6B3416] mb-2">{ilan.title}</h2>
                      <p className="text-[#994D1C] mb-4 block break-all whitespace-pre-line">{ilan.description}</p>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600">{t('general.priceLabel')}</p>
                          {(() => {
                            const locale = language === 'en' ? 'en-US' : 'tr-TR';
                            const currency = language === 'en' ? 'USD' : 'TRY';
                            const formatted = new Intl.NumberFormat(locale, { style: 'currency', currency }).format(ilan.price);
                            return (
                              <p className="font-medium text-[#6B3416]">{formatted} {t('general.perHour')}</p>
                            );
                          })()}
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">{t('general.methodLabel')}</p>
                          <p className="font-medium text-[#6B3416] capitalize">{
                            ilan.method === 'online' || ilan.method === 'Online'
                              ? t('general.online')
                              : ilan.method === 'face-to-face' || ilan.method === 'face_to_face' || ilan.method === 'Yüz Yüze'
                                ? t('general.faceToFace')
                                : ilan.method === 'hybrid' ? t('general.hybrid') : ilan.method
                          }</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">{t('general.frequencyLabel')}</p>
                          <p className="font-medium text-[#6B3416] capitalize">{
                            ilan.frequency === 'daily' || ilan.frequency === 'Daily'
                              ? t('frequency.daily')
                              : ilan.frequency === 'weekly' || ilan.frequency === 'Weekly'
                                ? t('frequency.weekly')
                                : ilan.frequency === 'monthly' || ilan.frequency === 'Monthly'
                                  ? t('frequency.monthly')
                                  : ilan.frequency === 'flexible' || ilan.frequency === 'Flexible'
                                    ? t('frequency.flexible')
                                    : ilan.frequency
                          }</p>
                        </div>
                        {ilan.instructorFrom && (
                          <div>
                            <p className="text-sm text-gray-600">{t('general.instructorFromLabel')}</p>
                            <p className="font-medium text-[#6B3416]">{ilan.instructorFrom}</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="text-sm text-gray-500">
                        <span>{t('general.createdAt')}: {new Date(ilan.createdAt).toLocaleDateString(language === 'en' ? 'en-US' : 'tr-TR')}</span>
                        <span className="mx-2">•</span>
                        <span>{t('general.updatedAt')}: {new Date(ilan.updatedAt).toLocaleDateString(language === 'en' ? 'en-US' : 'tr-TR')}</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => router.push(`/ilan-duzenle/${ilan._id}`)}
                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-full transition-colors duration-300"
                      >
                        <FaEdit />
                      </button>
                      <button 
                        onClick={() => setDeleteModalIlanId(ilan._id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors duration-300"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-between items-center">
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                      ilan.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {ilan.status === 'active' ? t('status.active') : t('status.inactive')}
                    </div>
                    <button
                      className="px-4 py-1.5 bg-[#FFE5D9] text-[#994D1C] rounded-lg text-sm hover:bg-[#FFB996] hover:text-white transition-colors duration-300"
                      onClick={() => router.push(`/ilanlarim/basvurular/${ilan._id}`)}
                    >
                      {t('myListings.viewApplications')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    {/* Silme Onay Modalı */}
    {deleteModalIlanId && (
      <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-sm w-full">
          <h2 className="text-xl font-bold mb-4 text-[#6B3416]">{t('myListings.deleteConfirmTitle')}</h2>
          <p className="mb-6 text-[#994D1C]">{t('myListings.deleteConfirmDesc')}</p>
          <div className="flex justify-end gap-3">
            <button
              className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition disabled:opacity-60"
              onClick={() => handleDelete(deleteModalIlanId)}
              disabled={deleting}
            >
              {deleting ? t('myListings.deleting') : t('myListings.deleteYes')}
            </button>
            <button
              className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
              onClick={() => setDeleteModalIlanId(null)}
              disabled={deleting}
            >
              {t('myListings.deleteNo')}
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
  );
}
 