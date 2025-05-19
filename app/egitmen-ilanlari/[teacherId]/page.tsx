'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaUniversity, FaClock, FaMoneyBillWave, FaChalkboardTeacher, FaArrowLeft } from 'react-icons/fa';
import { useLanguage } from '@/src/contexts/LanguageContext';

interface Teacher {
  _id: string;
  name: string;
  email: string;
  university: string;
  expertise: string;
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
}

export default function EgitmenIlanlariPage({ params }: { params: { teacherId: string } }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { t } = useLanguage();
  const [ilanlar, setIlanlar] = useState<Ilan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [teacher, setTeacher] = useState<Teacher | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchTeacherIlanlar = async () => {
      if (!user || !params.teacherId) return;
      
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/ilanlar?teacherId=${params.teacherId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error(t('general.errorLoadingListings'));
        }

        const data = await response.json();
        setIlanlar(data);
        
        // Eğitmen bilgisini al (ilk ilandan)
        if (data.length > 0 && data[0].teacher) {
          setTeacher(data[0].teacher);
        }
      } catch (err) {
        console.error(t('general.errorLoadingTeacherListings'), err);
        setError(t('general.errorLoadingListings'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeacherIlanlar();
  }, [params.teacherId, user]);

  if (loading || isLoading) {
    return (
      <div className="container mx-auto px-4 pt-28 pb-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF8B5E]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 pt-28 pb-8">
      <div className="mb-6">
        <Link href="/ilanlar" className="text-[#994D1C] hover:underline inline-flex items-center">
          <FaArrowLeft className="mr-2" />
          {t('general.backToListings')}
        </Link>
      </div>
      
      {teacher && (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-[#FFB996] to-[#FF8B5E] p-6 text-white">
            <div className="flex items-center">
              <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-[#FF8B5E] text-2xl font-bold mr-4 shadow-md">
                {teacher.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl font-bold">{teacher.name}</h1>
                <div className="flex items-center mt-1">
                  <FaUniversity className="mr-1" />
                  <span>{teacher.university}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <h2 className="text-xl font-bold text-[#994D1C] mb-4">{t('general.expertise')}</h2>
            <p className="text-gray-700">{teacher.expertise || t('general.notSpecified')}</p>
          </div>
        </div>
      )}
      
      <h2 className="text-2xl font-bold text-[#994D1C] mb-6">{t('general.openListings')}</h2>
      
      {error ? (
        <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
          {error}
        </div>
      ) : ilanlar.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-4 bg-[#FFF5F0] rounded-full flex items-center justify-center">
            <FaChalkboardTeacher className="text-[#FF8B5E] text-3xl" />
          </div>
          <h3 className="text-[#994D1C] mb-4">{t('general.noActiveListingsForTeacher')}</h3>
          <Link 
            href="/ilanlar" 
            className="inline-block px-6 py-3 bg-[#FFE5D9] text-[#994D1C] rounded-lg hover:bg-[#FFDAC1] transition-colors duration-200"
          >
            {t('general.viewAllListings')}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ilanlar.map((ilan) => (
            <div key={ilan._id} className="bg-white rounded-xl shadow-sm hover:shadow-lg border border-gray-100 hover:border-[#FFE5D9] transition-all duration-300 overflow-hidden">
              <div className="p-6">
                <h3 className="text-xl font-bold text-[#6B3416] mb-2">{ilan.title}</h3>
                <p className="text-gray-600 mb-4 line-clamp-2">{ilan.description}</p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  <div className="bg-[#FFF5F0] px-3 py-1 rounded-full text-[#FF8B5E] text-sm flex items-center">
                    <FaMoneyBillWave className="mr-1" />
                    {ilan.price} {t('general.currency')}
                  </div>
                  <div className="bg-[#FFF5F0] px-3 py-1 rounded-full text-[#FF8B5E] text-sm flex items-center">
                    <FaClock className="mr-1" />
                    {ilan.duration} {t('general.minutes')}
                  </div>
                </div>
                
                <Link 
                  href={`/ilan/${ilan._id}`}
                  className="block w-full text-center py-2 bg-gradient-to-r from-[#FFB996] to-[#FF8B5E] text-white rounded-lg hover:from-[#FF8B5E] hover:to-[#FF6B1A] transition-all duration-300"
                >
                  {t('general.viewDetails')}
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
