'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/src/contexts/LanguageContext';
import Image from 'next/image';
import { FaChalkboardTeacher, FaGraduationCap, FaStar, FaSearch, FaUniversity } from 'react-icons/fa';
import { useAuth } from 'src/context/AuthContext';
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

const departments = [
  'departments.computer',
  'departments.dentistry',
  'departments.medicine',
  'departments.law',
  'departments.mechanical',
  'departments.electrical',
  'departments.business',
  'departments.psychology',
  'departments.architecture',
  'departments.industrial',
  'departments.civil',
  'departments.software',
];

export default function InstructorsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const { t } = useLanguage();
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeChat, setActiveChat] = useState<Instructor | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [selectedRating, setSelectedRating] = useState<string>('all');
  const { user, authChecked } = useAuth();
  const router = useRouter();

  // Sadece authChecked true olduğunda ve user yoksa login'e yönlendir
  useEffect(() => {
    if (authChecked && !user) {
      router.push('/auth/login');
    }
  }, [user, authChecked, router]);

  // Filtrelenmiş eğitmenler
  const filteredInstructors = instructors.filter((instructor) => {
    // Bölüm filtresi
    const departmentMatch = !selectedDepartment || (instructor.expertise && departments.includes(selectedDepartment) && selectedDepartment === instructor.expertise);
    // Puan filtresi (örnek: instructor.rating olmalı, yoksa varsayılan 0)
    let rating = (instructor as any).rating || 0;
    let ratingMatch = true;
    if (selectedRating !== 'all') {
      const min = parseInt(selectedRating, 10);
      ratingMatch = rating >= min;
    }
    return departmentMatch && ratingMatch;
  });

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

  // Eğer kullanıcı localStorage'dan yüklenmediyse loading göster
  if (!authChecked) {
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

  // Eğer localStorage kontrolü bitti ve user yoksa, yönlendirme zaten yapılacak
  if (authChecked && !user) return null;

  return (
    <div className="min-h-screen bg-white pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#6B3416] mb-2">{t('instructors.title')}</h1>
            <p className="text-[#994D1C]">
              <FaUniversity className="inline-block mr-2" />
              {user?.university
                ? t('instructors.universityDesc', { university: String(user.university).replace(/\s*Üniversitesi$|\s*University$/i, '') })
                : t('instructors.generalDesc')}
            </p>
          </div>

          {/* Arama ve Gelişmiş Filtreler */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder={t('instructors.searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 pl-10 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FFB996]"
                />
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
              <button
                onClick={() => {
                  setSelectedDepartment('');
                  setSelectedRating('all');
                }}
                className="px-6 py-3 bg-gradient-to-r from-[#FFB996] to-[#FF8B5E] text-white rounded-xl font-medium"
              >
                {t('general.clearFilters')}
              </button>
            </div>
            {/* Yeni filtre barı */}
            <div className="flex flex-wrap gap-4 mt-2">
              {/* Bölüm filtresi */}
              <div>
                <label className="block text-sm font-medium text-[#6B3416] mb-1">{t('instructors.departmentsTitle')}</label>
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="min-w-[160px] px-3 py-2 rounded-lg border-[#FFB996] focus:border-[#FF8B5E] focus:ring focus:ring-[#FF8B5E] focus:ring-opacity-50"
                >
                  <option value="">{t('general.allDepartments')}</option>
                  {departments.map((deptKey) => (
                    <option key={deptKey} value={deptKey}>{t(deptKey)}</option>
                  ))}
                </select>
              </div>
              {/* Puan filtresi */}
              <div>
                <label className="block text-sm font-medium text-[#6B3416] mb-1">Puan</label>
                <select
                  value={selectedRating}
                  onChange={(e) => setSelectedRating(e.target.value)}
                  className="min-w-[120px] px-3 py-2 rounded-lg border-[#FFB996] focus:border-[#FF8B5E] focus:ring focus:ring-[#FF8B5E] focus:ring-opacity-50"
                >
                  <option value="all">{t('general.allRatings')}</option>
                  <option value="5">5</option>
                  <option value="4">4+</option>
                  <option value="3">3+</option>
                  <option value="2">2+</option>
                  <option value="1">1+</option>
                </select>
              </div>
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
          ) : filteredInstructors.length === 0 ? (
            <div className="bg-white p-8 rounded-xl shadow-md text-center">
              <p className="text-[#994D1C] mb-4">
                {searchTerm || selectedDepartment || selectedRating !== 'all'
                  ? t('instructors.noMatch')
                  : t('instructors.noInstructors')}
              </p>
              <p className="text-gray-600">
                {t('instructors.tryDifferentSearch')}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredInstructors.map((instructor, index) => (
                <div key={instructor._id || index} className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#FFB996] to-[#FF8B5E] flex items-center justify-center text-white font-medium mr-3">
                      {instructor.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800">{instructor.name}</h3>
                      <p className="text-sm text-gray-600">{instructor.expertise ? t(instructor.expertise) : t('instructors.role')}</p>
                    </div>
                  </div>
                    
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="flex items-center">
                      <FaChalkboardTeacher className="text-purple-600 mr-2" />
                      <span className="text-gray-800">{t('instructors.expertise')}</span>
                    </div>
                    <div className="flex items-center">
                      <FaGraduationCap className="text-blue-600 mr-2" />
                      <span className="text-gray-800">{t('instructors.experience')}</span>
                    </div>
                    <div className="flex items-center">
                      <FaStar className="text-orange-600 mr-2" />
                      <span className="text-gray-800">{t('instructors.rating')}</span>
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
                      {t('general.sendMessage')}
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
