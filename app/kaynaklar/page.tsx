'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Image from 'next/image';

import { useLanguage } from '@/src/contexts/LanguageContext';
import { useAuth } from 'src/context/AuthContext';
import Link from 'next/link';

// Kaynak kategorileri
// Çok dilli kategori anahtarları
const categoryKeys = [
  'resourceCategory.notes',
  'resourceCategory.books',
  'resourceCategory.articles',
  'resourceCategory.videos',
  'resourceCategory.presentations',
  'resourceCategory.examQuestions',
  'resourceCategory.projects',
  'resourceCategory.other'
];

// Örnek kaynak formatları
// Çok dilli format anahtarları
const formatKeys = [
  'resourceFormat.pdf',
  'resourceFormat.doc',
  'resourceFormat.ppt',
  'resourceFormat.xls',
  'resourceFormat.video',
  'resourceFormat.audio',
  'resourceFormat.image',
  'resourceFormat.link',
  'resourceFormat.other'
];

// Üniversite listesini data klasöründen import ediyoruz
import { universities } from '@/data/universities';

// Akademik seviye seçenekleri
// academicLevels will be defined inside the component below.

// Kaynak tipi tanımlama
type Resource = {
  _id?: string;
  id: number;
  title: string;
  description: string;
  author: string;
  category: string;
  format: string;
  university: string;
  department: string;
  course?: string;
  academicLevel: string;
  uploadDate: string;
  createdAt: string;
  downloadCount: number;
  viewCount: number;
  fileSize: string;
  tags: string[];
  url: string;
  fileData?: string; // Base64 formatında dosya verisi
  fileName?: string; // Dosya adı
  fileType?: string; // Dosya tipi (MIME type)
};

export default function KaynaklarPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const { user } = useAuth();
  useEffect(() => {
    // Kullanıcı değiştiğinde logla
    console.log('[KaynaklarPage] user:', user);
  }, [user]);
  const [showPremiumBlock, setShowPremiumBlock] = useState(false);
  
  // Favorites state
  const [favorites, setFavorites] = useState<string[]>([]);
  
  // Load favorites from localStorage on mount
  useEffect(() => {
    if (mounted && user) {
      const savedFavorites = localStorage.getItem(`favorites_${user.id}`);
      if (savedFavorites) {
        setFavorites(JSON.parse(savedFavorites));
      }
    }
  }, [mounted, user]);
  
  // Save favorites to localStorage whenever favorites change
  useEffect(() => {
    if (mounted && user && favorites.length >= 0) {
      localStorage.setItem(`favorites_${user.id}`, JSON.stringify(favorites));
    }
  }, [favorites, mounted, user]);
  
  // Toggle favorite status
  const toggleFavorite = (resourceId: string) => {
    if (!user) {
      window.location.href = '/auth/login';
      return;
    }
    
    setFavorites(prev => {
      const isFavorited = prev.includes(resourceId);
      if (isFavorited) {
        return prev.filter(id => id !== resourceId);
      } else {
        return [...prev, resourceId];
      }
    });
  };
  
  // Check if resource is favorited
  const isFavorited = (resourceId: string) => {
    return favorites.includes(resourceId);
  };

  // Kaynakları indir
  const handleDownload = async (resource: Resource) => {
    if (!user) {
      window.location.href = '/auth/login';
      return;
    }
    try {
      const response = await fetch(`/api/resources/${resource._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'download', userId: user.id })
      });
      if (response.status === 403) {
        setShowPreviewModal(true);
        setPreviewResource(resource);
        setShowPremiumBlock(true);
        return;
      }
      if (!response.ok) {
        alert('Bir hata oluştu.');
        return;
      }
      // Başarılı yanıt: kaynağı indir veya yeni sekmede aç
      if (resource.fileData) {
        const link = document.createElement('a');
        link.href = resource.fileData;
        const fileName = resource.fileName || `${resource.title}.${resource.format.toLowerCase()}`;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else if (resource.url && resource.url !== '#') {
        window.open(resource.url, '_blank');
      }
    } catch (error) {
      alert('Bir hata oluştu.');
    }
  };

  // Kaynakları önizle
  const handlePreview = async (resource: Resource) => {
    if (!user) {
      window.location.href = '/auth/login';
      return;
    }
    try {
      const response = await fetch(`/api/resources/${resource._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'preview', userId: user.id })
      });
      if (response.status === 403) {
        setShowPreviewModal(true);
        setPreviewResource(resource);
        setShowPremiumBlock(true);
        return;
      }
      if (!response.ok) {
        alert('Bir hata oluştu.');
        return;
      }
      setPreviewResource(resource);
      setShowPreviewModal(true);
    } catch (error) {
      alert('Bir hata oluştu.');
    }
  };

  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewResource, setPreviewResource] = useState<Resource | null>(null);
  const { t, language } = useLanguage();
  const academicLevels = language === 'en'
    ? ['All', 'Associate Degree', 'Bachelors', 'Masters', 'PhD']
    : ['Hepsi', 'Ön Lisans', 'Lisans', 'Yüksek Lisans', 'Doktora'];
  
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [universitySearchTerm, setUniversitySearchTerm] = useState('');
  const [showUniversityDropdown, setShowUniversityDropdown] = useState(false);
  const universityDropdownRef = useRef<HTMLDivElement>(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('');
  const [selectedUniversity, setSelectedUniversity] = useState<string>('all');
  const [selectedAcademicLevel, setSelectedAcademicLevel] = useState<string>('Hepsi');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [courseTerm, setCourseTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  // Favoriler
  const [showFavorites, setShowFavorites] = useState(false);
  // 'favorites' state ve toggleFavorite fonksiyonu daha önce tanımlandı
  const [sortOrder, setSortOrder] = useState('desc');
  const [showFilters, setShowFilters] = useState(false);

  // Filtreleme ve sıralama işlemlerini useMemo ile optimize et
  // Pagination için state
  const [currentPage, setCurrentPage] = useState(1);
  const resourcesPerPage = 9;
  const [totalResourceCount, setTotalResourceCount] = useState(0);

  // Filtrelenmiş kaynakları hesapla
  const fetchTotalResourceCount = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedCategory) params.append('category', selectedCategory);
      if (selectedFormat) params.append('format', selectedFormat);
      if (selectedUniversity && selectedUniversity !== 'all') params.append('university', selectedUniversity);
      if (selectedAcademicLevel && selectedAcademicLevel !== 'Hepsi' && selectedAcademicLevel !== 'All') params.append('academicLevel', selectedAcademicLevel);
      if (selectedDepartment) params.append('department', selectedDepartment);
      if (courseTerm) params.append('course', courseTerm);
      const query = params.toString() ? `?${params.toString()}` : '';
      const response = await fetch(`/api/resources/count${query}`);
      if (!response.ok) throw new Error('API hatası');
      const data = await response.json();
      setTotalResourceCount(data.count || 0);
    } catch (error) {
      setTotalResourceCount(0);
    }
  }, [searchTerm, selectedCategory, selectedFormat, selectedUniversity, selectedAcademicLevel, selectedDepartment, courseTerm]);
  useEffect(() => {
    fetchTotalResourceCount();
  }, [fetchTotalResourceCount]);

  const filteredResources = useMemo(() => {
    let filtered = [...resources];
    if (searchTerm) {
      filtered = filtered.filter(r => r.title.toLowerCase().includes(searchTerm.toLowerCase()) || r.description.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    if (selectedCategory) {
      filtered = filtered.filter(r => r.category === selectedCategory);
    }
    if (selectedFormat) {
      filtered = filtered.filter(r => r.format === selectedFormat);
    }
    if (selectedUniversity && selectedUniversity !== 'all') {
      filtered = filtered.filter(r => r.university === selectedUniversity);
    }
    if (selectedAcademicLevel && selectedAcademicLevel !== 'Hepsi' && selectedAcademicLevel !== 'All') {
      filtered = filtered.filter(r => r.academicLevel === selectedAcademicLevel);
    }
    if (selectedDepartment) {
      filtered = filtered.filter(r => (r as any).department === selectedDepartment);
    }
    if (courseTerm) {
      const term = courseTerm.toLowerCase();
      filtered = filtered.filter(r => {
        const courseStr = ((r as any).course || '').toString().toLowerCase();
        const tagsMatch = Array.isArray(r.tags) && r.tags.some(tag => (tag || '').toLowerCase().includes(term));
        return courseStr.includes(term) || tagsMatch;
      });
    }
    // Sıralama
    filtered.sort((a, b) => {
      if (sortBy === 'date') {
        return sortOrder === 'asc'
          ? new Date(a.uploadDate).getTime() - new Date(b.uploadDate).getTime()
          : new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
      } else if (sortBy === 'download') {
        return sortOrder === 'asc' ? a.downloadCount - b.downloadCount : b.downloadCount - a.downloadCount;
      } else if (sortBy === 'view') {
        return sortOrder === 'asc' ? a.viewCount - b.viewCount : b.viewCount - a.viewCount;
      }
      return 0;
    });
    // Favori filtrele
    if (showFavorites) {
      filtered = filtered.filter(r => favorites.includes(r._id || ''));
    }
    return filtered;
  }, [resources, searchTerm, selectedCategory, selectedFormat, selectedUniversity, selectedAcademicLevel, selectedDepartment, courseTerm, sortBy, sortOrder, favorites, showFavorites]);

  // Toplam sayfa sayısı
  const totalPages = Math.ceil(totalResourceCount / resourcesPerPage);

  // Sadece aktif sayfanın kaynakları

  // Sayfa veya filtre değişince otomatik olarak en başa dön
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedFormat, selectedUniversity, selectedAcademicLevel, selectedDepartment, courseTerm]);

  // Eğer mevcut sayfa, toplam sayfa sayısından büyükse düzelt
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  // Kaynakları getir (arama, filtre ve sayfa/pagination'a göre)
  const fetchResources = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Query parametrelerini oluştur
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedCategory) params.append('category', selectedCategory);
      if (selectedFormat) params.append('format', selectedFormat);
      if (selectedUniversity && selectedUniversity !== 'all') params.append('university', selectedUniversity);
      if (selectedAcademicLevel && selectedAcademicLevel !== 'Hepsi' && selectedAcademicLevel !== 'All') params.append('academicLevel', selectedAcademicLevel);
      if (selectedDepartment) params.append('department', selectedDepartment);
      if (courseTerm) params.append('course', courseTerm);
      params.append('page', currentPage.toString());
      params.append('limit', resourcesPerPage.toString());
      const query = params.toString() ? `?${params.toString()}` : '';
      const response = await fetch(`/api/resources${query}`);
      if (!response.ok) throw new Error('API hatası');
      const data = await response.json();
      setResources(data.resources);
      setTotalResourceCount(data.totalCount || 0);
    } catch (error) {
      console.error('Kaynaklar yüklenirken hata:', error);
      setError('Kaynaklar yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
      setResources([]);
      setTotalResourceCount(0);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedCategory, selectedFormat, selectedUniversity, selectedAcademicLevel, selectedDepartment, courseTerm, currentPage]);


  // Sayfa yüklendiğinde ve filtre/arama veya sayfa değiştiğinde kaynakları getir
  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  // Formatı insan tarafından okunabilir hale getir
  const formatFileSize = (sizeInMB: string): string => {
    const size = parseFloat(sizeInMB);
    if (size < 1) {
      return `${(size * 1000).toFixed(0)} KB`;
    }
    return `${size.toFixed(1)} MB`;
  };

  // Tarihi formatla
  const formatDate = (dateString: string): string => {
    if (!dateString) return '-';
    // Eğer dateString yoksa veya boşsa, createdAt kullan
    const date = dateString !== '-' ? new Date(dateString) : null;
    if (date && !isNaN(date.getTime())) {
      return new Intl.DateTimeFormat(language === 'tr' ? 'tr-TR' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(date);
    }
    return '-';
  };
  
  // Türkçe karakterler için özel dönüşüm fonksiyonu
  const turkishToLower = (text: string): string => {
    return text
      .replace(/\u0130/g, 'i') // İ = 'İ'
      .replace(/I/g, 'ı')  // I -> ı = 'ı'
      .toLowerCase();
  };

  // Önizleme türü tespiti: PDF | Image | Video | Audio
  const detectKind = (r: Resource): 'pdf' | 'image' | 'video' | 'audio' | null => {
    if (!r) return null;
    const fileType = (r.fileType || '').toLowerCase();
    const format = (r.format || '').toLowerCase();
    const url = (r.url || r.fileData || '').toLowerCase();
    const extMatch = url.match(/\.([a-z0-9]+)(?:\?|#|$)/);
    const ext = extMatch ? extMatch[1] : '';

    // PDF
    if (fileType.includes('pdf') || format.includes('pdf') || ext === 'pdf') return 'pdf';

    // Image
    if (
      fileType.startsWith('image/') ||
      ['png','jpg','jpeg','gif','webp','bmp','tiff'].includes(ext) ||
      format.includes('image') || format.includes('resim')
    ) return 'image';

    // Video
    if (
      fileType.startsWith('video/') ||
      ['mp4','webm','ogg','mov','mkv'].includes(ext) ||
      format.includes('video')
    ) return 'video';

    // Audio
    if (
      fileType.startsWith('audio/') ||
      ['mp3','wav','ogg','m4a','flac'].includes(ext) ||
      format.includes('audio') || format.includes('ses')
    ) return 'audio';

    return null;
  };

  // Kullanıcının kaynak görme hakkı ile ilgili kısıtlama kaldırıldı.

  return (
    <div className="relative min-h-screen overflow-hidden pt-24 pb-12">
      <div className="container mx-auto px-4 py-8 relative z-10">
      <div className="bg-white/80 backdrop-blur-sm border border-[var(--brand-border)] rounded-2xl shadow-sm p-6 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#994D1C] mb-2">{t('nav.resources')}</h1>
          <p className="text-[#6B3416] mb-4">
            {t('general.allResources')}
          </p>
        </div>
        <button
  onClick={() => {
    if (user) {
      window.location.href = '/kaynaklar/paylas';
    } else {
      window.location.href = '/auth/register';
    }
  }}
  className="px-6 py-3 bg-gradient-to-r from-[#FFB996] to-[#FF8B5E] text-white font-medium rounded-xl \
    transition-all duration-300 hover:shadow-lg hover:shadow-[#FFB996]/20 hover:scale-105 flex items-center"
>
  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
  </svg>
  {t('general.shareResource')}
</button>
      </div>
      
      {/* Arama ve Filtreleme */}
      <div className="bg-white rounded-xl shadow-md p-4 mb-8">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('general.searchResources')}
                className="w-full px-4 py-3 pr-10 rounded-xl border-[#FFB996] focus:border-[#FF8B5E] focus:ring focus:ring-[#FF8B5E] focus:ring-opacity-50"
              />
              <div className="absolute right-3 top-3 text-[#994D1C]">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setShowFavorites(!showFavorites)}
              className={`px-4 py-2 rounded-xl border transition-colors duration-300 flex items-center ${showFavorites ? 'bg-[#FF8B5E] text-white border-[#FF8B5E]' : 'bg-[#FFF5F0] text-[#994D1C] border-[#FFB996] hover:bg-[#FFE5D9]'}`}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
              {showFavorites ? t('general.showAll') : t('general.showFavorites')}
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 bg-[#FFF5F0] text-[#994D1C] rounded-xl border border-[#FFB996] hover:bg-[#FFE5D9] transition-colors duration-300 flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              {t('general.filterResources')}
            </button>
          </div>
        </div>
        
        {/* Genişletilmiş Filtreler */}
        {showFilters && (
          <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-[#FFE5D9]">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-[#6B3416] mb-1">
                {t('general.resourceCategory')}
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border-[#FFB996] focus:border-[#FF8B5E] focus:ring focus:ring-[#FF8B5E] focus:ring-opacity-50"
              >
                <option value="">{t('general.allResources')}</option>
                {categoryKeys.map((key) => (
                  <option key={key} value={key}>
                    {t(key)}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-[#6B3416] mb-1">
                {t('general.resourceFormat')}
              </label>
              <select
                value={selectedFormat}
                onChange={(e) => setSelectedFormat(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border-[#FFB996] focus:border-[#FF8B5E] focus:ring focus:ring-[#FF8B5E] focus:ring-opacity-50"
              >
                <option value="">{t('general.allResources')}</option>
                {formatKeys.map((key) => (
                  <option key={key} value={key}>
                    {t(key)}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-[#6B3416] mb-1">
                {t('general.university')}
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder={t('general.allUniversities')}
                  value={universitySearchTerm}
                  onChange={(e) => {
                    setUniversitySearchTerm(e.target.value);
                    if (e.target.value === '') {
                      setSelectedUniversity('all');
                    }
                  }}
                  onFocus={() => setShowUniversityDropdown(true)}
                  className="w-full px-3 py-2 pr-10 rounded-lg border-[#FFB996] focus:border-[#FF8B5E] focus:ring focus:ring-[#FF8B5E] focus:ring-opacity-50"
                />
                <div className="absolute inset-y-0 right-3 flex items-center">
                  <svg className="w-5 h-5 text-[#994D1C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                {showUniversityDropdown && (
                  <div 
                    ref={universityDropdownRef}
                    className="absolute z-10 w-full mt-1 bg-white border border-[#FFE5D9] rounded-lg shadow-lg max-h-60 overflow-y-auto"
                  >
                    <div 
                      className="px-4 py-2 cursor-pointer hover:bg-[#FFF5F0] text-[#6B3416] font-medium"
                      onClick={() => {
                        setSelectedUniversity('all');
                        setUniversitySearchTerm('');
                        setShowUniversityDropdown(false);
                      }}
                    >
                      {t('general.allUniversities')}
                    </div>
                    {universities
                      .filter(uni => 
                        universitySearchTerm === '' || 
                        turkishToLower(uni).includes(turkishToLower(universitySearchTerm))
                      )
                      .map((uni) => (
                        <div 
                          key={uni}
                          className="px-4 py-2 cursor-pointer hover:bg-[#FFF5F0] text-[#6B3416]"
                          onClick={() => {
                            setSelectedUniversity(uni);
                            setUniversitySearchTerm(uni);
                            setShowUniversityDropdown(false);
                          }}
                        >
                          {uni}
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-[#6B3416] mb-1">
                {t('general.academicLevel')}
              </label>
              <select
                value={selectedAcademicLevel}
                onChange={(e) => setSelectedAcademicLevel(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border-[#FFB996] focus:border-[#FF8B5E] focus:ring focus:ring-[#FF8B5E] focus:ring-opacity-50"
              >
                {academicLevels.map((level) => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-[#6B3416] mb-1">
                {t('general.department')}
              </label>
              <input
                type="text"
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                placeholder={t('general.allDepartments')}
                className="w-full px-3 py-2 rounded-lg border-[#FFB996] focus:border-[#FF8B5E] focus:ring focus:ring-[#FF8B5E] focus:ring-opacity-50"
              />
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-[#6B3416] mb-1">
                {t('general.course')}
              </label>
              <input
                type="text"
                value={courseTerm}
                onChange={(e) => setCourseTerm(e.target.value)}
                placeholder={t('general.coursePlaceholder')}
                className="w-full px-3 py-2 rounded-lg border-[#FFB996] focus:border-[#FF8B5E] focus:ring focus:ring-[#FF8B5E] focus:ring-opacity-50"
              />
            </div>
          </div>
        )}
      </div>
      {/* Sonuç Sayısı */}
      
      {/* Kaynaklar Listesi */}
      {/* Kaynak Önizleme Modalı */}
      {/* Pagination */}
      
      

      {showPreviewModal && previewResource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          {/* Ana içerik: Kaynağı kaydırılabilir şekilde göster */}
          <div className="bg-white rounded-xl shadow-lg max-w-6xl w-full max-h-[96vh] flex flex-col overflow-hidden sm:max-w-lg sm:max-h-[90vh] md:max-w-2xl md:max-h-[90vh]">
            <div className="flex-1 overflow-auto p-8 relative">
              {/* Kapatma butonu */}
              <button
                onClick={() => setShowPreviewModal(false)}
                className="absolute top-4 right-4 text-[#A85A1A] hover:text-[#FFB066] text-2xl font-bold bg-transparent border-none p-0 m-0 cursor-pointer z-50"
                style={{lineHeight:'1'}}
                aria-label="Close preview modal"
              >
                ×
              </button>
              {/* Eğer premium engel aktifse, önizleme üstüne etkileşimi tamamen engelleyen bir katman ekle */}
              {showPremiumBlock && (
                <div
                  className="absolute inset-0 z-40 pointer-events-auto cursor-not-allowed bg-transparent"
                  style={{}}
                />
              )}
              {/* PDF Önizleme */}
              {/* PDF ve PNG/Resim dosyaları için önizleme desteği */}
              {detectKind(previewResource!) === 'pdf' && (
                <div className="relative w-full h-[60vh] sm:h-[40vh] md:h-[50vh]">
                  {/* PDF dosyası için iframe ile önizleme */}
                  <iframe
                    src={previewResource!.fileData || previewResource!.url}
                    title="PDF Önizleme"
                    className="w-full h-full border rounded"
                    frameBorder="0"
                  ></iframe>
                  {/* %75 gölgeli overlay (sadece premium engel aktifse) */}
                  {showPremiumBlock && <div className="absolute inset-0 bg-black/75 pointer-events-none"></div>}
                </div>
              )}
              {detectKind(previewResource!) === 'image' && (
                <div className="relative w-full h-[60vh] sm:h-[40vh] md:h-[50vh] flex justify-center items-center bg-white rounded shadow-md">
                  {/* PNG veya genel resim dosyası için merkezi ve şık önizleme */}
                  <div className="relative w-full h-full">
                    <Image
                      src={previewResource!.fileData || previewResource!.url}
                      alt={previewResource!.title}
                      fill
                      sizes="100vw"
                      className="object-contain bg-white"
                      style={{ background: '#fff' }}
                    />
                  </div>
                  {/* %75 gölgeli overlay (sadece premium engel aktifse) */}
                  {showPremiumBlock && <div className="absolute inset-0 bg-black/75 pointer-events-none rounded"></div>}
                </div>
              )}
              {/* Video Önizleme */}
              {detectKind(previewResource!) === 'video' && (
                <div className="relative w-full h-[60vh] sm:h-[40vh] md:h-[50vh]">
                  <video 
                    src={previewResource!.fileData || previewResource!.url}
                    controls
                    className="w-full h-full border rounded"
                  ></video>
                  {/* %75 gölgeli overlay (sadece premium engel aktifse) */}
                  {showPremiumBlock && <div className="absolute inset-0 bg-black/75 pointer-events-none"></div>}
                </div>
              )}
              {/* Ses Önizleme */}
              {detectKind(previewResource!) === 'audio' && (
                <div className="relative w-full">
                  <audio 
                    src={previewResource!.fileData || previewResource!.url}
                    controls
                    className="w-full border rounded p-4"
                  ></audio>
                  {/* %75 gölgeli overlay (sadece premium engel aktifse) */}
                  {showPremiumBlock && <div className="absolute inset-0 bg-black/75 pointer-events-none"></div>}
                </div>
              )}
              {/* Diğer Dosya Türleri */}
              {/* Sadece desteklenmeyen dosya türlerinde "desteklenmiyor" mesajı göster */}
              {detectKind(previewResource!) === null && (
                <div className="text-center py-10">
                  <div className="text-[#994D1C] text-5xl mb-4">
                    <svg className="w-20 h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="text-lg font-bold text-[#994D1C] mb-4">{t('general.noResources')}</div>
                  <p className="text-sm text-[#6B3416] mb-6">{t('general.noResourcesDesc')}</p>
                  <button
                    onClick={() => {
                      if (user) {
                        window.location.href = '/kaynaklar/paylas';
                      } else {
                        window.location.href = '/auth/register';
                      }
                    }}
                    className="px-6 py-3 bg-[#FF8B5E] text-white font-medium rounded-lg transition-all duration-300 hover:bg-[#FF7A45]"
                  >
                    {t('general.shareResource')}
                  </button>
                </div>
              )}
              {/* Premium kutusu sadece üstte ve sabit olarak gelsin */}
              {showPremiumBlock && (
                <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
                  <div className="relative bg-[#FFF6E6] rounded-2xl shadow-xl px-10 py-6 max-w-xl w-full flex flex-col items-center text-[#A85A1A] text-center pointer-events-auto border-none" style={{boxShadow:'0 4px 16px rgba(168,90,26,0.13)'}}>
                    {/* Kapatma butonu */}
                    <button
                      onClick={() => setShowPreviewModal(false)}
                      className="absolute top-4 right-4 text-[#A85A1A] hover:text-[#FFB066] text-2xl font-bold bg-transparent border-none p-0 m-0 cursor-pointer z-10"
                      style={{lineHeight:'1'}}
                      aria-label="Close preview modal"
                    >
                      ×
                    </button>
                    <div className="mb-3 flex flex-col items-center">
                      <div className="bg-[#FFF3E0] rounded-full p-2 mb-2 flex items-center justify-center">
                        <svg className="w-8 h-8" fill="none" stroke="#A85A1A" strokeWidth="2.5" viewBox="0 0 24 24"><rect width="20" height="14" x="2" y="5" rx="3" fill="#FFF3E0"/><path d="M12 9v4m0 2h.01" stroke="#A85A1A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </div>
                      <h2 className="text-2xl font-extrabold mb-1 text-[#FFB066] drop-shadow">{t('premiumBlock.title')}</h2>
                    </div>
                    <p className="mb-4 text-base font-medium text-[#A85A1A]">
                      {t('premiumBlock.desc1')} <span className='font-bold text-[#FFB066]'>{t('premiumBlock.desc2')}</span> {t('premiumBlock.desc3')}
                    </p>
                    <div className="flex flex-row gap-3 w-full mb-3 justify-center">
                      <Link href="/kaynaklar/paylas" className="w-full">
                      <button
                          className="w-full bg-[#FFB066] hover:bg-[#FFD7A8] text-[#A85A1A] font-bold py-3 rounded-full flex items-center justify-center gap-2 text-base shadow transition border-2 border-[#A85A1A]"
                          onClick={() => {
                            setShowPreviewModal(false);
                            window.location.href = '/kaynaklar/paylas';
                          }}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="#A85A1A" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                          {t('premiumBlock.uploadBtn')}
                        </button>
                        <div className="text-xs text-[#A85A1A] mt-1">{t('premiumBlock.shareToUnlock')}</div>
                      </Link>
                    </div>
                    <div className="mt-1 text-base text-[#A85A1A]">{t('premiumBlock.alreadyUser')} <a className="underline font-bold text-[#FFB066]" href="/login">{t('premiumBlock.login')}</a></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF8B5E]"></div>
        </div>
      ) : filteredResources.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((resource: Resource) => (
            <div key={resource._id || resource.id} className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-[#994D1C] line-clamp-2 flex-1 mr-2">{resource.title}</h3>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Favorite Star Button */}
                    <button
                      onClick={() => toggleFavorite(resource._id || resource.id.toString())}
                      className="p-1 hover:bg-gray-100 rounded-full transition-colors duration-200"
                      title={isFavorited(resource._id || resource.id.toString()) ? 'Favorilerden çıkar' : 'Favorilere ekle'}
                    >
                      <svg 
                        className={`w-5 h-5 transition-colors duration-200 ${
                          isFavorited(resource._id || resource.id.toString()) 
                            ? 'text-yellow-500 fill-yellow-500' 
                            : 'text-gray-400 hover:text-yellow-500'
                        }`}
                        fill={isFavorited(resource._id || resource.id.toString()) ? 'currentColor' : 'none'}
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" 
                        />
                      </svg>
                    </button>
                    <div className="bg-[#FF8B5E] text-white text-xs px-2 py-1 rounded-lg">
                      {t(resource.format) || resource.format}
                    </div>
                  </div>
                </div>
                <p className="text-sm text-[#6B3416] mb-3 line-clamp-2">{resource.description}</p>
                {(resource as any).course && (
                  <div className="text-xs text-[#6B3416] mb-2">
                    <span className="font-medium">{t('general.course')}:</span> {(resource as any).course}
                  </div>
                )}
                <div className="flex flex-wrap gap-1 mb-3">
                  {resource.tags.slice(0, 3).map((tag: string, index: number) => (
                    <span key={index} className="bg-[#FFE5D9] text-[#994D1C] text-xs px-2 py-1 rounded-full">
                      {tag}
                    </span>
                  ))}
                  {resource.tags.length > 3 && (
                    <span className="bg-[#FFE5D9] text-[#994D1C] text-xs px-2 py-1 rounded-full">
                      +{resource.tags.length - 3}
                    </span>
                  )}
                </div>
                <div className="flex justify-between items-center text-xs text-[#6B3416] mb-3">
                  <div>{resource.author}</div>
                  <div>
                    <span className="text-xs text-gray-500">
                      {formatDate(resource.uploadDate || resource.createdAt)}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center text-xs text-[#6B3416] mb-4">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    {resource.viewCount}
                  </div>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    {resource.downloadCount}
                  </div>
                  <div>{formatFileSize(resource.fileSize)}</div>
                </div>
                <div className="flex justify-between gap-2">
                  <Link key={resource._id || resource.id} href={`/kaynaklar/${resource._id || resource.id}`}>
                    <div className="flex-1 px-4 py-2 bg-[#FFF5F0] text-[#994D1C] text-center rounded-lg border border-[#FFB996] hover:bg-[#FFE5D9] transition-colors duration-300 text-sm">
                      {t('general.resourceView')}
                    </div>
                  </Link>
                  <button
                    onClick={() => handlePreview(resource)}
                    className="flex-1 px-4 py-2 bg-[#FFB996] text-white text-center rounded-lg hover:bg-[#FF8B5E] transition-colors duration-300 text-sm hidden md:block"
                  >
                    {t('general.preview')}
                  </button>
                  <button
                    onClick={() => handleDownload(resource)}
                    className="flex-1 px-4 py-2 bg-[#FF8B5E] text-white text-center rounded-lg hover:bg-[#FF7A45] transition-colors duration-300 text-sm cursor-pointer"
                  >
                    {t('general.resourceDownload')}
                  </button>
                </div>
              </div>
            </div>
          ))}
          
        </div>
      ) : (
        <div className="flex justify-center items-center py-20">
          <h2 className="text-2xl font-bold text-[#994D1C]">{t('general.resourceSearchNoResults')}</h2>
        </div>
      )}
      {/* Pagination sadece kartların ALTINDA */}
      {(totalPages > 1) && (
        <div className="flex flex-col items-center mt-8">
          <nav className="inline-flex rounded-md shadow-sm" aria-label="Pagination">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage <= 1 || totalPages === 0}
              className={`px-3 py-2 rounded-l-md border border-[#FFB996] bg-white text-[#994D1C] hover:bg-[#FFE5D9] transition-colors duration-200 ${currentPage <= 1 || totalPages === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              &lt;
            </button>
            {[...Array(totalPages)].map((_, idx) => (
              <button
                key={idx + 1}
                onClick={() => setCurrentPage(idx + 1)}
                className={`px-3 py-2 border-t border-b border-[#FFB996] bg-white text-[#994D1C] hover:bg-[#FFE5D9] transition-colors duration-200 ${currentPage === idx + 1 ? 'bg-[#FFB996] text-[#FC905A] font-bold' : ''}`}
              >
                {idx + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage >= totalPages || totalPages === 0}
              className={`px-3 py-2 rounded-r-md border border-[#FFB996] bg-white text-[#994D1C] hover:bg-[#FFE5D9] transition-colors duration-200 ${currentPage >= totalPages || totalPages === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              &gt;
            </button>
          </nav>
        </div>
      )}
      </div>
      </div>
    </div>
  );
}
