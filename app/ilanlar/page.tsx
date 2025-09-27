'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from 'src/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/src/contexts/LanguageContext';
import Link from 'next/link';
import { FaSearch, FaFilter, FaUniversity, FaClock, FaMoneyBillWave, FaChalkboardTeacher } from 'react-icons/fa';
import ListingCard from '@/src/components/ListingCard';


interface Teacher {
  _id: string;
  name: string;
  email: string;
  university: string;
  expertise: string;
  profilePhotoUrl?: string;
}

interface Ilan {
  _id: string;
  title: string;
  description: string;
  price: number;
  method: string;
  frequency: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  instructorFrom?: string;
  teacher: Teacher;
}

export default function IlanlarPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { t, language } = useLanguage();

  const [ilanlar, setIlanlar] = useState<Ilan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [photoErrors, setPhotoErrors] = useState<Record<string, boolean>>({});
  const [filters, setFilters] = useState({
    method: '',
    priceMin: '',
    priceMax: '',
    sortBy: 'en-yeni',
  });

  const onAvatarError = useCallback((id: string) => {
    setPhotoErrors(prev => ({ ...prev, [id]: true }));
  }, []);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  useEffect(() => {
    // user null olduğunda login sayfasına yönlendir
    if (user === null) {
      router.push('/auth/login');
    }
  }, [user, router]);

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
        const isAdmin = Boolean((user as any)?.isAdmin);
        let url: string;
        if (isAdmin) {
          url = searchTerm
            ? `/api/ilanlar?search=${encodeURIComponent(searchTerm)}`
            : `/api/ilanlar`;
        } else {
          url = searchTerm 
            ? `/api/ilanlar/university?university=${encodeURIComponent(user.university)}&search=${encodeURIComponent(searchTerm)}` 
            : `/api/ilanlar/university?university=${encodeURIComponent(user.university)}`;
        }
        
        console.log('Fetching listings from URL:', url);
        
        const response = await fetch(url);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'İlanlar getirilirken bir hata oluştu');
        }
        
        const data = await response.json();
        console.log('Received listings data:', data);
        console.log('Number of listings found:', data.length);

        // Öğretmenin en güncel profilini public endpoint'ten çek ve teacher alanını güncelle
        const enriched = await Promise.all(
          (data || []).map(async (ilan: Ilan) => {
            const teacherId = (ilan as any)?.userId || (ilan as any)?.teacher?._id || (ilan as any)?.teacher?.id;
            if (teacherId) {
              try {
                const tuRes = await fetch(`/api/users/public/${teacherId}`);
                if (tuRes.ok) {
                  const tPublic = await tuRes.json();
                  return { ...ilan, teacher: tPublic } as Ilan;
                }
              } catch (_) {}
            }
            return ilan;
          })
        );

        setIlanlar(enriched);
        setPhotoErrors({});
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

  const filteredIlanlar = useMemo(() => {
    const list = ilanlar.filter(ilan => {
      if (filters.method && ilan.method !== filters.method) return false;
      if (filters.priceMin && ilan.price < Number(filters.priceMin)) return false;
      if (filters.priceMax && ilan.price > Number(filters.priceMax)) return false;
      return true;
    });
    return list.sort((a, b) => {
      if (filters.sortBy === 'en-yeni') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (filters.sortBy === 'en-eski') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (filters.sortBy === 'fiyat-artan') return a.price - b.price;
      if (filters.sortBy === 'fiyat-azalan') return b.price - a.price;
      return 0;
    });
  }, [ilanlar, filters.method, filters.priceMin, filters.priceMax, filters.sortBy]);

  // Projeler/Kaynaklar ile tutarlılık için erken dönüş yapılmıyor; 
  // loading durumu içerikte gösterilecek.

  return (
    <div className="relative min-h-screen pt-24 pb-16 overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto bg-white/80 backdrop-blur-sm border border-[var(--brand-border)] rounded-2xl shadow-sm p-6 md:p-8">
          <div className="mb-8 text-center md:text-left">
            <div className="inline-block mb-3 px-4 py-1 bg-[#FFF5F0] rounded-full text-[#994D1C] text-sm font-medium">
              <FaUniversity className="inline-block mr-2" />
              {user?.university}
            </div>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-3 gap-3">
              <h1 className="text-4xl font-bold text-[#6B3416]">{t('listings.universityListings')}</h1>
              {user && (
                <Link
                  href="/ilan-ver"
                  className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#FFB996] to-[#FF8B5E] text-white font-semibold shadow-md hover:scale-105 transition-transform md:ml-4"
                >
                  <svg className="w-5 h-5 md:w-5 md:h-5 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>{t('nav.createListing')}</span>
                </Link>
              )}
            </div>
            <p className="text-[#994D1C] max-w-2xl md:mx-0 mx-auto">
              {t('listings.exploreTeacherLessons')}
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
                    placeholder={t('general.searchPlaceholder')}
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
                  {t('general.filters')} {showFilters ? (language === 'tr' ? '(Açık)' : '(Open)') : ''}
                </button>
                <button
                  type="submit"
                  className="px-6 py-4 bg-gradient-to-r from-[#FFB996] to-[#FF8B5E] text-white rounded-xl font-medium hover:shadow-md hover:shadow-[#FFB996]/20 transition-all duration-200"
                >
                  {t('general.search')}
                </button>
              </form>
            </div>

            {showFilters && (
              <div className="mt-4 bg-[#FFF9F5] p-6 rounded-xl border border-[#FFE5D9] mb-6">
                <h3 className="text-[#6B3416] font-medium mb-4 flex items-center">
                  <FaFilter className="mr-2" />
                  {t('general.filterOptions')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-[#994D1C] mb-2">{t('general.sort')}</label>
                    <select
                      name="sortBy"
                      value={filters.sortBy}
                      onChange={handleFilterChange}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#FFB996] transition-all duration-200"
                    >
                      <option value="en-yeni">{t('general.newest')}</option>
                      <option value="en-eski">{t('general.oldest')}</option>
                      <option value="fiyat-artan">{t('general.priceAsc')}</option>
                      <option value="fiyat-azalan">{t('general.priceDesc')}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#994D1C] mb-2">{t('general.lessonMethod')}</label>
                    <select
                      name="method"
                      value={filters.method}
                      onChange={handleFilterChange}
                      className="w-full px-4 py-3 rounded-lg bg-white border border-[#FFE5D9] focus:outline-none focus:ring-2 focus:ring-[#FFB996] focus:border-[#FFB996] transition-all duration-200"
                    >
                      <option value="">{t('general.allMethods')}</option>
                      <option value="online">{t('general.online')}</option>
                      <option value="yüzyüze">{t('general.faceToFace')}</option>
                      <option value="hibrit">{t('general.hybrid')}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#994D1C] mb-2">{t('general.minPrice')}</label>
                    <input
                      type="number"
                      name="priceMin"
                      value={filters.priceMin}
                      onChange={handleFilterChange}
                      placeholder={t('general.minPricePlaceholder')}
                      className="w-full px-4 py-3 rounded-lg bg-white border border-[#FFE5D9] focus:outline-none focus:ring-2 focus:ring-[#FFB996] focus:border-[#FFB996] transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#994D1C] mb-2">{t('general.maxPrice')}</label>
                    <input
                      type="number"
                      name="priceMax"
                      value={filters.priceMax}
                      onChange={handleFilterChange}
                      placeholder={t('general.maxPricePlaceholder')}
                      className="w-full px-4 py-3 rounded-lg bg-white border border-[#FFE5D9] focus:outline-none focus:ring-2 focus:ring-[#FFB996] focus:border-[#FFB996] transition-all duration-200"
                    />
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <button 
                    type="button"
                    onClick={() => {
                      setFilters({ method: '', priceMin: '', priceMax: '', sortBy: 'en-yeni' });
                    }}
                    className="px-4 py-2 text-[#994D1C] hover:text-[#6B3416] font-medium transition-colors duration-200"
                  >
                    {t('general.clearFilters')}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Filtre sonuçları */}
          {!isLoading && !error && filteredIlanlar.length > 0 && (
            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between">
              <p className="text-[#6B3416] font-medium mb-2 md:mb-0">
                <span className="text-[#FF8B5E] font-bold">{filteredIlanlar.length}</span> {t('general.resultsFound')}
                {searchTerm && (
                  <span> &quot;{searchTerm}&quot; {t('general.noResultsForSearch')}</span>
                )}
                {filters.method && (
                  <span>, {filters.method} {t('general.method')}</span>
                )}
                {(filters.priceMin || filters.priceMax) && (
                  <span>, {t('general.price')}: {filters.priceMin || '0'} - {filters.priceMax || '∞'} {t('general.currency')}</span>
                )}
              </p>
            </div>
          )}
          
          {/* İçerik */}
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF8B5E]"></div>
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
          ) : filteredIlanlar.length === 0 ? (
            <div className="bg-white p-10 rounded-xl shadow-md text-center border border-[#FFE5D9]">
              <div className="text-[#FFB996] text-5xl mb-6 flex justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-20 h-20">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-[#6B3416] text-xl font-bold mb-2">
                {searchTerm || filters.method || filters.priceMin || filters.priceMax
                  ? t('general.noSearchResults')
                  : t('general.noListingsYet')}
              </h3>
              
              {(searchTerm || filters.method || filters.priceMin || filters.priceMax) && (
                <button 
                  onClick={() => {
                    setSearchTerm('');
                    setFilters({ method: '', priceMin: '', priceMax: '', sortBy: 'en-yeni' });
                  }}
                  className="px-6 py-3 bg-[#FFE5D9] text-[#6B3416] rounded-xl hover:bg-[#FFDAC1] transition-colors duration-200"
                >
                  {t('general.showAllListings')}
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredIlanlar
                .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                .map((ilan) => (
                  <ListingCard
                    key={ilan._id}
                    ilan={ilan as any}
                    t={t as any}
                    userUniversity={user?.university}
                    photoError={!!photoErrors[ilan._id]}
                    onAvatarError={onAvatarError}
                  />
                ))}
            </div>
          )}

          {/* Pagination */}
          {!isLoading && !error && filteredIlanlar.length > itemsPerPage && (
            <div className="flex justify-center mt-8 space-x-2">
              {Array.from({ length: Math.ceil(filteredIlanlar.length / itemsPerPage) }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentPage(index + 1)}
                  className={`w-10 h-10 rounded-lg ${
                    currentPage === index + 1
                      ? 'bg-[#FF8B5E] text-white'
                      : 'bg-[#FFE5D9] text-[#6B3416] hover:bg-[#FFDAC1]'
                  } transition-colors duration-200`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
