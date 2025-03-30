'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { FaChalkboardTeacher, FaGraduationCap, FaStar, FaSearch, FaUniversity } from 'react-icons/fa';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

// Eğitmen tipi tanımı
interface Instructor {
  _id: string;
  name: string;
  email: string;
  university: string;
  role: string;
  createdAt: string;
}

export default function InstructorsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const router = useRouter();

  // Kullanıcı giriş yapmamışsa login sayfasına yönlendir
  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
    }
  }, [user, router]);

  // Eğitmenleri getir
  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        setLoading(true);
        
        // Kullanıcının üniversitesi yoksa işlem yapma
        if (!user?.university) {
          setError('Üniversite bilginiz bulunamadı. Lütfen profilinizi güncelleyin.');
          setLoading(false);
          return;
        }
        
        // Kullanıcı ile aynı üniversitedeki eğitmenleri getir
        const url = searchTerm 
          ? `/api/instructors?university=${encodeURIComponent(user.university)}&search=${encodeURIComponent(searchTerm)}` 
          : `/api/instructors?university=${encodeURIComponent(user.university)}`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error('Eğitmenler getirilemedi');
        }
        
        const data = await response.json();
        setInstructors(data);
        setError('');
      } catch (err) {
        console.error('Eğitmenler yüklenirken hata oluştu:', err);
        setError('Eğitmenler yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchInstructors();
    }
  }, [searchTerm, user]);

  // Eğer kullanıcı henüz yüklenmemişse veya giriş yapmamışsa yükleniyor göster
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FFB996] to-[#FFECEC] flex items-center justify-center">
        <div className="text-center p-8 max-w-md mx-auto bg-white rounded-xl shadow-lg">
          <div className="w-12 h-12 border-4 border-[#FFB996] border-t-[#FF8B5E] rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-[#994D1C] mb-2">Yükleniyor...</h2>
          <p className="text-[#6B3416]">Giriş yapmanız gerekiyor.</p>
          <p className="text-[#6B3416] mt-2">Giriş sayfasına yönlendiriliyorsunuz.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF5F0] pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-[#6B3416] mb-4">Eğitmenlerimiz</h1>
            <p className="text-[#994D1C] max-w-2xl mx-auto">
              {user?.university ? `${user.university} üniversitesindeki eğitmenlerimizle tanışın ve ihtiyacınıza en uygun eğitmeni seçin.` : 'Alanında uzman eğitmenlerimizle tanışın ve ihtiyacınıza en uygun eğitmeni seçin.'}
            </p>
          </div>

          {/* Arama Bölümü */}
          <div className="max-w-xl mx-auto mb-12">
            <div className="relative">
              <input
                type="text"
                placeholder="Eğitmen ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border border-[#FFE5D9] rounded-full outline-none transition-all duration-200
                  hover:border-[#FFB996] focus:border-[#FFB996] focus:ring-2 focus:ring-[#FFB996]/20"
              />
              <div className="absolute inset-y-0 left-4 flex items-center">
                <FaSearch className="text-[#FFB996]" />
              </div>
            </div>
          </div>

          {/* Eğitmenler Listesi */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="w-12 h-12 border-4 border-[#FFB996] border-t-[#FF8B5E] rounded-full animate-spin"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-[#FF8B5E] font-medium">{error}</p>
            </div>
          ) : instructors.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[#994D1C] font-medium">Aradığınız kriterlere uygun eğitmen bulunamadı.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {instructors.map((instructor, index) => (
                <div key={instructor._id || index} className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:translate-y-[-5px]">
                  <div className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="w-16 h-16 bg-[#FFB996] rounded-full flex items-center justify-center text-white text-2xl font-bold mr-4">
                        {instructor.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-[#6B3416]">{instructor.name}</h3>
                        <div className="flex items-center text-[#994D1C]">
                          <FaUniversity className="mr-1" />
                          <span>{instructor.university}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border-t border-[#FFE5D9] pt-4 mt-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center">
                          <FaGraduationCap className="text-[#FFB996] mr-2" />
                          <span className="text-[#994D1C]">Eğitmen</span>
                        </div>
                        <div className="flex items-center">
                          <FaChalkboardTeacher className="text-[#FFB996] mr-2" />
                          <span className="text-[#994D1C]">Üye: {new Date(instructor.createdAt).toLocaleDateString('tr-TR')}</span>
                        </div>
                      </div>
                    </div>
                    
                    <button 
                      className="w-full mt-6 py-2 px-4 bg-[#FFB996] text-white rounded-lg hover:bg-[#FF8B5E] transition-colors duration-300"
                      onClick={() => {/* İletişim veya profil görüntüleme işlevi */}}
                    >
                      İletişime Geç
                    </button>
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
