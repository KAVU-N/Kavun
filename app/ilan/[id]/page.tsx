'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/src/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaUniversity, FaClock, FaMoneyBillWave, FaChalkboardTeacher, FaCalendarAlt, FaArrowLeft, FaEnvelope, FaCalendarCheck } from 'react-icons/fa';
import ChatBox from '@/src/components/ChatBox';

interface Teacher {
  _id: string;
  name: string;
  email: string;
  university: string;
  expertise: string;
  role: string;
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
  const { t, language } = useLanguage();
  const { user, loading } = useAuth();
  const router = useRouter();
  const [ilan, setIlan] = useState<Ilan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeChat, setActiveChat] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

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
        setIlan(data);
        setError('');
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



  if (loading || !user) {
    return (
      <div className="min-h-screen bg-white pt-20">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center py-12">
            <div className="w-12 h-12 border-4 border-[#FFB996] border-t-[#FF8B5E] rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <button 
              onClick={() => router.back()} 
              className="flex items-center text-[#994D1C] hover:text-[#6B3416] mb-4 transition-colors"
            >
              <FaArrowLeft className="mr-2" />
              <span>{t('general.goBack')}</span>
            </button>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="w-12 h-12 border-4 border-[#FFB996] border-t-[#FF8B5E] rounded-full animate-spin"></div>
            </div>
          ) : error ? (
            <div className="bg-white p-8 rounded-xl shadow-md text-center border border-red-100">
              <div className="text-red-500 text-5xl mb-4 flex justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-16 h-16">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <p className="text-red-500 font-medium text-lg mb-2">{t('general.errorOccurred')}</p>
              <p className="text-gray-600 mb-4">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors duration-200"
              >
                {t('general.tryAgain')}
              </button>
            </div>
          ) : !ilan ? (
            <div className="bg-white p-8 rounded-xl shadow-md text-center border border-[#FFE5D9]">
              <p className="text-[#994D1C] mb-4">{t('general.noListingFound')}</p>
              <Link 
                href="/ilanlar"
                className="px-4 py-2 bg-gradient-to-r from-[#FFB996] to-[#FF8B5E] text-white rounded-lg hover:shadow-md transition-all duration-300"
              >
                {t('general.showAllListings')}
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              {/* Header Section */}
              <div className="bg-gradient-to-r from-[#FFB996] to-[#FF8B5E] p-6 text-white">
                <div className="flex items-center mb-2">
                  <FaUniversity className="mr-2" />
                  <span className="text-sm font-medium">{ilan.teacher?.university}</span>
                </div>
                <h1 className="text-3xl font-bold mb-3">{ilan.title}</h1>
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center">
                    <FaChalkboardTeacher className="mr-2" />
                    <span>{ilan.teacher?.name}</span>
                  </div>
                  <div className="flex items-center">
                    <FaCalendarAlt className="mr-2" />
                    <span>{t('general.createdAt')}: {new Date(ilan.createdAt).toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US')}</span>
                  </div>
                </div>
              </div>
              
              {/* Main Content */}
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-[#FFF9F5] p-4 rounded-lg flex flex-col items-center justify-center">
                    <FaMoneyBillWave className="text-[#FF8B5E] text-2xl mb-2" />
                    <p className="text-sm text-gray-600 mb-1">{t('general.price')}</p>
                    <p className="text-xl font-bold text-[#6B3416]">{ilan.price} ₺/{t('general.hour')}</p>
                  </div>
                  <div className="bg-[#FFF9F5] p-4 rounded-lg flex flex-col items-center justify-center">
                    <FaClock className="text-[#FF8B5E] text-2xl mb-2" />
                    <p className="text-sm text-gray-600 mb-1">{t('general.duration')}</p>
                    <p className="text-xl font-bold text-[#6B3416]">{ilan.duration} {t('general.hour')}</p>
                  </div>
                  <div className="bg-[#FFF9F5] p-4 rounded-lg flex flex-col items-center justify-center">
                    <FaChalkboardTeacher className="text-[#FF8B5E] text-2xl mb-2" />
                    <p className="text-sm text-gray-600 mb-1">{t('general.method')}</p>
                    <p className="text-xl font-bold text-[#6B3416] capitalize">{ilan.method}</p>
                  </div>
                </div>
                
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-[#6B3416] mb-4">{t('general.lessonDetails')}</h2>
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <p className="text-gray-700 whitespace-pre-line">{ilan.description}</p>
                  </div>
                </div>
                
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-[#6B3416] mb-4">{t('general.additionalInfo')}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-[#FFF9F5] p-4 rounded-lg">
                      <p className="text-sm font-medium text-[#994D1C] mb-1">{t('general.instructorFrom')}:</p>
                      <p className="text-gray-700 font-medium">{ilan.instructorFrom || t('general.notSpecified')}</p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">{t('general.expertise')}</p>
                      <p className="font-medium text-[#6B3416]">{ilan.teacher?.expertise || t('general.notSpecified')}</p>
                    </div>
                  </div>
                </div>
                
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-[#6B3416] mb-4">{t('general.teacherInfo')}</h2>
                  <div className="bg-[#FFF9F5] p-6 rounded-lg flex items-start">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#FFB996] to-[#FF8B5E] flex items-center justify-center text-white text-2xl font-bold mr-4">
                      {ilan.teacher?.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-[#6B3416] mb-1">{ilan.teacher?.name}</h3>
                      <p className="text-[#994D1C] mb-2">{ilan.teacher?.university}</p>
                      <p className="text-gray-600 mb-4">{ilan.teacher?.expertise || t('general.notSpecified')}</p>
                      <Link 
                        href={`/egitmen-ilanlari/${ilan.teacher?._id}`}
                        className="inline-flex items-center text-[#FF8B5E] hover:text-[#FF6B1A] font-medium"
                      >
                        <span>{t('general.showAllListings')}</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap justify-center gap-3">
                  <Link 
                    href="/ilanlar"
                    className="px-6 py-3 bg-[#FFE5D9] text-[#6B3416] rounded-lg hover:bg-[#FFDAC1] transition-colors duration-200"
                  >
                    {t('general.showAllListings')}
                  </Link>
                  <button 
                    onClick={() => setActiveChat(true)}
                    className="px-6 py-3 bg-gradient-to-r from-[#FFB996] to-[#FF8B5E] text-white rounded-lg hover:shadow-md transition-all duration-300 flex items-center"
                  >
                    <FaEnvelope className="mr-2" />
                    {t('general.contactTeacher')}
                  </button>
                  <Link 
                    href={`/randevu-al?ilanId=${ilan?._id}&teacherId=${ilan?.teacher?._id}`}
                    className="px-6 py-3 bg-gradient-to-r from-[#4CAF50] to-[#2E7D32] text-white rounded-lg hover:shadow-md transition-all duration-300 flex items-center"
                  >
                    <FaCalendarCheck className="mr-2" />
                    {t('general.bookAppointment')}
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
    {/* Sohbet kutusu */}
    {activeChat && ilan?.teacher && (
      <ChatBox 
        instructor={{
          _id: ilan.teacher._id,
          name: ilan.teacher.name,
          email: ilan.teacher.email,
          university: ilan.teacher.university,
          role: 'instructor'
        }} 
        onClose={() => setActiveChat(false)} 
      />
    )}
    </div>
  );
}
