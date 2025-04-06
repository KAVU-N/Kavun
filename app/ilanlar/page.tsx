'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { FaSearch, FaFilter, FaUniversity, FaClock, FaMoneyBillWave, FaChalkboardTeacher } from 'react-icons/fa';

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

export default function IlanlarPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [ilanlar, setIlanlar] = useState<Ilan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    method: '',
    priceMin: '',
    priceMax: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchIlanlar = async () => {
      if (!user || !user.university) return;
      
      try {
        setIsLoading(true);
        
        // URL'den search parametresini kontrol et
        const searchParams = new URLSearchParams(window.location.search);
        const searchFromUrl = searchParams.get('search');
        
        if (searchFromUrl) {
          setSearchTerm(searchFromUrl);
        }
        
        // API endpoint'e istek at
        const url = searchTerm 
          ? `/api/ilanlar/university?university=${encodeURIComponent(user.university)}&search=${encodeURIComponent(searchTerm)}` 
          : `/api/ilanlar/university?university=${encodeURIComponent(user.university)}`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'İlanlar getirilirken bir hata oluştu');
        }
        
        const data = await response.json();
        setIlanlar(data);
        setError('');
      } catch (err: any) {
        console.error('İlanlar yüklenirken hata oluştu:', err);
        setError('İlanlar yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
      } finally {
        setIsLoading(false);
      }
    };

    if (user && user.university) {
      fetchIlanlar();
    }
  }, [user, searchTerm]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Arama işlemi zaten useEffect içinde yapılıyor
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const filteredIlanlar = ilanlar.filter(ilan => {
    // Metod filtresi
    if (filters.method && ilan.method !== filters.method) {
      return false;
    }
    
    // Fiyat aralığı filtresi
    if (filters.priceMin && ilan.price < Number(filters.priceMin)) {
      return false;
    }
    
    if (filters.priceMax && ilan.price > Number(filters.priceMax)) {
      return false;
    }
    
    return true;
  });

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
          <div className="mb-8 text-center md:text-left">
            <div className="inline-block mb-3 px-4 py-1 bg-[#FFF5F0] rounded-full text-[#994D1C] text-sm font-medium">
              <FaUniversity className="inline-block mr-2" />
              {user.university}
            </div>
            <h1 className="text-4xl font-bold text-[#6B3416] mb-3">Üniversitenizdeki İlanlar</h1>
            <p className="text-[#994D1C] max-w-2xl md:mx-0 mx-auto">
              Üniversitenizdeki öğretmenlerin verdiği dersleri keşfedin ve ihtiyacınıza en uygun olanı seçin.
            </p>
          </div>

          {/* Arama ve Filtre */}
          <div className="mb-8">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 mb-4">
                <div className="flex-1 relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#FFB996]">
                    <FaSearch size={18} />
                  </div>
                  <input
                    type="text"
                    placeholder="İlan ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-4 pl-12 rounded-xl border border-gray-200 bg-[#FAFAFA] focus:outline-none focus:ring-2 focus:ring-[#FFB996] focus:bg-white transition-all duration-200"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setShowFilters(!showFilters)}
                  className={`px-5 py-4 rounded-xl flex items-center justify-center md:w-auto transition-all duration-200 ${showFilters ? 'bg-[#FFB996] text-white' : 'bg-[#FFE5D9] text-[#6B3416] hover:bg-[#FFDAC1]'}`}
                >
                  <FaFilter className="mr-2" />
                  Filtreler {showFilters ? '(Açık)' : ''}
                </button>
                <button
                  type="submit"
                  className="px-6 py-4 bg-gradient-to-r from-[#FFB996] to-[#FF8B5E] text-white rounded-xl font-medium hover:shadow-md hover:shadow-[#FFB996]/20 transition-all duration-200"
                >
                  Ara
                </button>
              </form>
            </div>

            {showFilters && (
              <div className="mt-4 bg-[#FFF9F5] p-6 rounded-xl border border-[#FFE5D9] mb-6">
                <h3 className="text-[#6B3416] font-medium mb-4 flex items-center">
                  <FaFilter className="mr-2" />
                  Filtreleme Seçenekleri
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-[#994D1C] mb-2">Ders Yöntemi</label>
                    <select
                      name="method"
                      value={filters.method}
                      onChange={handleFilterChange}
                      className="w-full px-4 py-3 rounded-lg bg-white border border-[#FFE5D9] focus:outline-none focus:ring-2 focus:ring-[#FFB996] focus:border-[#FFB996] transition-all duration-200"
                    >
                      <option value="">Tüm yöntemler</option>
                      <option value="online">Online</option>
                      <option value="yüzyüze">Yüz yüze</option>
                      <option value="hibrit">Hibrit</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#994D1C] mb-2">Minimum Ücret (₺)</label>
                    <input
                      type="number"
                      name="priceMin"
                      value={filters.priceMin}
                      onChange={handleFilterChange}
                      placeholder="Minimum fiyat"
                      className="w-full px-4 py-3 rounded-lg bg-white border border-[#FFE5D9] focus:outline-none focus:ring-2 focus:ring-[#FFB996] focus:border-[#FFB996] transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#994D1C] mb-2">Maksimum Ücret (₺)</label>
                    <input
                      type="number"
                      name="priceMax"
                      value={filters.priceMax}
                      onChange={handleFilterChange}
                      placeholder="Maksimum fiyat"
                      className="w-full px-4 py-3 rounded-lg bg-white border border-[#FFE5D9] focus:outline-none focus:ring-2 focus:ring-[#FFB996] focus:border-[#FFB996] transition-all duration-200"
                    />
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <button 
                    type="button"
                    onClick={() => {
                      setFilters({ method: '', priceMin: '', priceMax: '' });
                    }}
                    className="px-4 py-2 text-[#994D1C] hover:text-[#6B3416] font-medium transition-colors duration-200"
                  >
                    Filtreleri Temizle
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sonuç Bilgisi */}
          {!isLoading && !error && filteredIlanlar.length > 0 && (
            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between">
              <p className="text-[#6B3416] font-medium mb-2 md:mb-0">
                <span className="text-[#FF8B5E] font-bold">{filteredIlanlar.length}</span> ilan bulundu
                {searchTerm && <span> "{searchTerm}" araması için</span>}
                {filters.method && <span>, {filters.method} yöntemi ile</span>}
                {(filters.priceMin || filters.priceMax) && <span>, fiyat aralığı: {filters.priceMin || '0'} - {filters.priceMax || '∞'} ₺</span>}
              </p>
              <div className="text-sm text-gray-500">
                <span className="mr-2">Sıralama:</span>
                <select 
                  className="px-2 py-1 rounded border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#FFB996]"
                  onChange={(e) => {
                    // Burada sıralama işlemi yapılabilir
                    console.log(e.target.value);
                  }}
                >
                  <option value="newest">En Yeni</option>
                  <option value="priceAsc">Fiyat (Artan)</option>
                  <option value="priceDesc">Fiyat (Azalan)</option>
                </select>
              </div>
            </div>
          )}
          
          {/* İçerik */}
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
              <p className="text-red-500 font-medium text-lg mb-2">Bir Hata Oluştu</p>
              <p className="text-gray-600 mb-4">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors duration-200"
              >
                Yeniden Dene
              </button>
            </div>
          ) : filteredIlanlar.length === 0 ? (
            <div className="bg-white p-10 rounded-xl shadow-md text-center border border-[#FFE5D9]">
              <div className="text-[#FFB996] text-5xl mb-6 flex justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-20 h-20">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-[#6B3416] text-xl font-bold mb-2">
                {searchTerm || filters.method || filters.priceMin || filters.priceMax
                  ? 'Arama Sonuçları Bulunamadı'
                  : 'Henüz İlan Bulunmuyor'}
              </h3>
              <p className="text-[#994D1C] mb-6 max-w-md mx-auto">
                {searchTerm 
                  ? `"${searchTerm}" araması için sonuç bulunamadı.` 
                  : 'Üniversitenizdeki öğretmenler ilan verdikçe burada görüntülenecektir.'}
              </p>
              {(searchTerm || filters.method || filters.priceMin || filters.priceMax) && (
                <button 
                  onClick={() => {
                    setSearchTerm('');
                    setFilters({ method: '', priceMin: '', priceMax: '' });
                  }}
                  className="px-6 py-3 bg-[#FFE5D9] text-[#6B3416] rounded-xl hover:bg-[#FFDAC1] transition-colors duration-200"
                >
                  Tüm İlanları Göster
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredIlanlar.map((ilan) => (
                <div key={ilan._id} className="group bg-white p-6 rounded-xl shadow-sm hover:shadow-xl border border-gray-100 hover:border-[#FFE5D9] transition-all duration-300">
                  {/* Üst Kısım - Başlık ve Fiyat */}
                  <div className="flex justify-between items-start mb-3">
                    <h2 className="text-xl font-bold text-[#6B3416] line-clamp-1 group-hover:text-[#FF8B5E] transition-colors duration-200">
                      {ilan.title}
                    </h2>
                    <div className="bg-[#FFF5F0] px-3 py-1 rounded-full text-[#FF8B5E] font-bold text-sm">
                      {ilan.price} ₺
                    </div>
                  </div>
                  
                  {/* Açıklama */}
                  <p className="text-gray-600 mb-4 line-clamp-2 text-sm">{ilan.description}</p>
                  
                  {/* Çizgi */}
                  <div className="border-t border-gray-100 my-4"></div>
                  
                  {/* Öğretmen Bilgisi */}
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#FFB996] to-[#FF8B5E] flex items-center justify-center text-white font-medium mr-3 shadow-sm group-hover:shadow-md transition-all duration-300">
                      {ilan.teacher?.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{ilan.teacher?.name}</p>
                      <p className="text-xs text-gray-500">{ilan.teacher?.expertise || 'Öğretmen'}</p>
                    </div>
                  </div>
                  
                  {/* Özellikler */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="flex items-center bg-gray-50 p-2 rounded-lg">
                      <FaMoneyBillWave className="text-green-600 mr-2" />
                      <span className="text-gray-800 text-sm">{ilan.price} ₺/Saat</span>
                    </div>
                    <div className="flex items-center bg-gray-50 p-2 rounded-lg">
                      <FaClock className="text-blue-600 mr-2" />
                      <span className="text-gray-800 text-sm">{ilan.duration} Saat</span>
                    </div>
                    <div className="flex items-center bg-gray-50 p-2 rounded-lg">
                      <FaChalkboardTeacher className="text-purple-600 mr-2" />
                      <span className="text-gray-800 text-sm capitalize">{ilan.method}</span>
                    </div>
                    <div className="flex items-center bg-gray-50 p-2 rounded-lg">
                      <FaUniversity className="text-orange-600 mr-2" />
                      <span className="text-gray-800 text-sm line-clamp-1">{user.university}</span>
                    </div>
                  </div>
                  
                  {/* Buton */}
                  <Link 
                    href={`/ilanlar/${ilan._id}`}
                    className="block w-full text-center py-3 bg-gradient-to-r from-[#FFB996] to-[#FF8B5E] text-white rounded-lg font-medium hover:shadow-md hover:shadow-[#FFB996]/20 transition-all duration-300 transform group-hover:translate-y-[-2px]"
                  >
                    Detayları Gör
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
