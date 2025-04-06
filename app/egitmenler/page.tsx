'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { FaChalkboardTeacher, FaGraduationCap, FaStar, FaSearch, FaUniversity } from 'react-icons/fa';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import ChatBox from '@/src/components/ChatBox';

// Eğitmen tipi tanımı
interface Instructor {
  _id: string;
  name: string;
  email: string;
  university: string;
  role: string;
  createdAt: string;
  expertise: string; // Uzmanlık alanı/verdiği ders
}

export default function InstructorsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeChat, setActiveChat] = useState<Instructor | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
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
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#6B3416] mb-2">Eğitmenlerimiz</h1>
            <p className="text-[#994D1C]">
              <FaUniversity className="inline-block mr-2" />
              {user?.university ? `${user.university} üniversitesindeki eğitmenlerimizle tanışın ve ihtiyacınıza en uygun eğitmeni seçin.` : 'Alanında uzman eğitmenlerimizle tanışın ve ihtiyacınıza en uygun eğitmeni seçin.'}
            </p>
          </div>

          {/* Arama ve Filtre */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Eğitmen ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 pl-10 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FFB996]"
                />
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
              <button
                onClick={() => setSelectedDepartment(null)}
                className="px-6 py-3 bg-gradient-to-r from-[#FFB996] to-[#FF8B5E] text-white rounded-xl font-medium"
              >
                Ara
              </button>
            </div>
          </div>

          {/* Ders Filtreleri */}
          <div className="bg-white p-6 rounded-xl shadow-md mb-6">
            <h3 className="text-lg font-medium text-[#6B3416] mb-3">Uzmanlık Alanları</h3>
            <div className="flex flex-wrap gap-2">
              {[
                'Bilgisayar Mühendisliği',
                'Diş Hekimliği',
                'Tıp',
                'Hukuk',
                'Makine Mühendisliği',
                'Elektrik-Elektronik Mühendisliği',
                'İşletme',
                'Psikoloji',
                'Mimarlık',
                'Endüstri Mühendisliği',
                'İnşaat Mühendisliği',
                'Yazılım Mühendisliği'
              ].map((bolum) => (
                <button
                  key={bolum}
                  className={`px-4 py-2 rounded-lg text-sm transition-all duration-200
                    ${selectedDepartment === bolum 
                      ? 'bg-gradient-to-r from-[#FFB996] to-[#FF8B5E] text-white font-medium' 
                      : 'bg-[#FFE5D9] text-[#6B3416] hover:bg-[#FFB996] hover:text-white'
                    }`}
                  onClick={() => setSelectedDepartment(selectedDepartment === bolum ? null : bolum)}
                >
                  {bolum}
                </button>
              ))}
            </div>
          </div>

          {/* Eğitmenler Listesi */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="w-12 h-12 border-4 border-[#FFB996] border-t-[#FF8B5E] rounded-full animate-spin"></div>
            </div>
          ) : error ? (
            <div className="bg-white p-6 rounded-xl shadow-md">
              <p className="text-red-500 text-center">{error}</p>
            </div>
          ) : instructors.length === 0 ? (
            <div className="bg-white p-8 rounded-xl shadow-md text-center">
              <p className="text-[#994D1C] mb-4">
                {searchTerm || selectedDepartment
                  ? `Aradığınız kriterlere uygun eğitmen bulunamadı.`
                  : 'Henüz hiç eğitmen bulunmuyor.'}
              </p>
              <p className="text-gray-600">
                Farklı arama kriterleri deneyebilirsiniz.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {instructors.map((instructor, index) => (
                <div key={instructor._id || index} className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#FFB996] to-[#FF8B5E] flex items-center justify-center text-white font-medium mr-3">
                      {instructor.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800">{instructor.name}</h3>
                      <p className="text-sm text-gray-600">{instructor.expertise || 'Eğitmen'}</p>
                    </div>
                  </div>
                    
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="flex items-center">
                      <FaChalkboardTeacher className="text-purple-600 mr-2" />
                      <span className="text-gray-800">{instructor.expertise || 'Genel Eğitmen'}</span>
                    </div>
                    <div className="flex items-center">
                      <FaGraduationCap className="text-blue-600 mr-2" />
                      <span className="text-gray-800">3+ Yıl Deneyim</span>
                    </div>
                    <div className="flex items-center">
                      <FaStar className="text-orange-600 mr-2" />
                      <span className="text-gray-800">4.8/5 Puan</span>
                    </div>
                    <div className="flex items-center">
                      <FaUniversity className="text-green-600 mr-2" />
                      <span className="text-gray-800 line-clamp-1">{instructor.university}</span>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <button
                      className="px-4 py-2 bg-gradient-to-r from-[#FFB996] to-[#FF8B5E] text-white rounded-lg text-sm font-medium hover:shadow-md transition-all duration-300"
                      onClick={() => setActiveChat(instructor)}
                    >
                      Mesaj Gönder
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Sohbet kutusu */}
      {activeChat && (
        <ChatBox 
          instructor={activeChat} 
          onClose={() => setActiveChat(null)} 
        />
      )}
    </div>
  );
}
