'use client';

import { useState, useEffect } from 'react';
import { useAuth } from 'src/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaUniversity, FaClock, FaMoneyBillWave, FaChalkboardTeacher, FaArrowLeft } from 'react-icons/fa';

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

export default function OgretmenIlanlariPage({ params }: { params: { teacherId: string } }) {
  const { user, loading } = useAuth();
  const router = useRouter();
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
        
        // API endpoint'e istek at
        const response = await fetch(`/api/ilanlar/teacher?teacherId=${params.teacherId}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'İlanlar getirilirken bir hata oluştu');
        }
        
        const data = await response.json();
        setIlanlar(data);
        
        // Öğretmen bilgisini al (ilk ilandan)
        if (data.length > 0 && data[0].teacher) {
          setTeacher(data[0].teacher);
        }
        
        setError('');
      } catch (err: any) {
        console.error('Öğretmen ilanları yüklenirken hata oluştu:', err);
        setError('İlanlar yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchTeacherIlanlar();
    }
  }, [user, params.teacherId]);

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
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <button 
              onClick={() => router.back()} 
              className="flex items-center text-[#994D1C] hover:text-[#6B3416] mb-4 transition-colors"
            >
              <FaArrowLeft className="mr-2" />
              <span>Geri Dön</span>
            </button>
          </div>

          {teacher && (
            <div className="mb-8">
              <div className="inline-block mb-3 px-4 py-1 bg-[#FFF5F0] rounded-full text-[#994D1C] text-sm font-medium">
                <FaUniversity className="inline-block mr-2" />
                {teacher.university}
              </div>
              <h1 className="text-4xl font-bold text-[#6B3416] mb-3">{teacher.name} - Tüm İlanlar</h1>
              <p className="text-[#994D1C] max-w-2xl">
                <FaChalkboardTeacher className="inline-block mr-2" />
                Uzmanlık: {teacher.expertise || 'Belirtilmemiş'}
              </p>
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="w-12 h-12 border-4 border-[#FFB996] border-t-[#FF8B5E] rounded-full animate-spin"></div>
            </div>
          ) : error ? (
            <div className="bg-white p-6 rounded-xl shadow-md">
              <p className="text-red-500 text-center">{error}</p>
            </div>
          ) : ilanlar.length === 0 ? (
            <div className="bg-white p-8 rounded-xl shadow-md text-center">
              <p className="text-[#994D1C] mb-4">Bu öğretmene ait aktif ilan bulunamadı.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ilanlar.map((ilan) => (
                <div key={ilan._id} className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 flex flex-col h-full">
                  <h2 className="text-xl font-bold text-[#6B3416] mb-2">{ilan.title}</h2>
                  <p className="text-[#994D1C] mb-4 line-clamp-3 flex-grow">{ilan.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center">
                      <FaMoneyBillWave className="text-[#FFB996] mr-2" />
                      <div>
                        <p className="text-sm text-gray-600">Ücret</p>
                        <p className="font-medium text-[#6B3416]">{ilan.price} ₺/Saat</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <FaClock className="text-[#FFB996] mr-2" />
                      <div>
                        <p className="text-sm text-gray-600">Süre</p>
                        <p className="font-medium text-[#6B3416]">{ilan.duration} Saat</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center mt-auto">
                    <span className="px-3 py-1 bg-[#FFF5F0] text-[#994D1C] text-sm rounded-full capitalize">
                      {ilan.method}
                    </span>
                    <Link 
                      href={`/ilan/${ilan._id}`}
                      className="px-4 py-2 bg-gradient-to-r from-[#FFB996] to-[#FF8B5E] text-white rounded-lg text-sm hover:shadow-md transition-all duration-300"
                    >
                      Detayları Gör
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
