'use client';

import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/src/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
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
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewResource, setPreviewResource] = useState<Resource | null>(null);
  const { t, language } = useLanguage();
  const academicLevels = language === 'en'
    ? ['All', 'Bachelors', 'Masters', 'PhD']
    : ['Hepsi', 'Lisans', 'Yüksek Lisans', 'Doktora'];
  const { user } = useAuth();
  const [resources, setResources] = useState<Resource[]>([]);
  const [filteredResources, setFilteredResources] = useState<Resource[]>([]);
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
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showFilters, setShowFilters] = useState(false);

  // --- 9'lu sayfalama için kaynakları böl ---
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 9;
  const pageCount = Math.ceil(filteredResources.length / pageSize);
  const paginatedResources = filteredResources.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // --- Kullanıcı önizlemeye 3. kez tıkladıysa paylaşım zorunlu premium modalı için sayaç ---
  const [previewClickCount, setPreviewClickCount] = useState(0);
  const [showPremiumBlock, setShowPremiumBlock] = useState(false);

  // Dropdown dışına tıklandığında kapat
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (universityDropdownRef.current && !universityDropdownRef.current.contains(event.target as Node)) {
        setShowUniversityDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [universityDropdownRef]);
  
  // ESC tuşuna basıldığında önizleme modalini kapat
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showPreviewModal) {
        setShowPreviewModal(false);
      }
    };
    
    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [showPreviewModal]);
  
  // Önizleme fonksiyonu - Backend'de önce hak kontrolü
  const handlePreview = async (resource: Resource) => {
    if (!user) return;
    try {
      const response = await fetch(`/api/resources/${resource._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'preview', userId: user.id })
      });
      if (response.status === 403) {
        // Hak yok, premium kutusu göster
        setShowPremiumBlock(true);
        setPreviewResource(resource);
        setShowPreviewModal(true);
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

  // İndirme fonksiyonu - Backend'de önce hak kontrolü
  const handleDownload = async (resource: Resource) => {
    if (!user) return;
    try {
      const response = await fetch(`/api/resources/${resource._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'download', userId: user.id })
      });
      if (response.status === 403) {
        setShowPremiumBlock(true);
        setPreviewResource(resource);
        setShowPreviewModal(true);
        return;
      }
      if (!response.ok) {
        alert('Bir hata oluştu.');
        return;
      }
      // Dosya indirme işlemini burada başlat (varsa)
      // ...
    } catch (error) {
      alert('Bir hata oluştu.');
    }
  };
  
  // Kaynakları getir
  const fetchResources = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/resources');
      if (!response.ok) throw new Error('API hatası');
      const data = await response.json();
      setResources(data);
    } catch (error) {
      console.error('Kaynaklar yüklenirken hata:', error);
      setError('Kaynaklar yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
      setResources([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Sayfa yüklenirken kaynakları getir
  useEffect(() => {
    fetchResources();
    
    // Her 30 saniyede bir güncel verileri çek
    const intervalId = setInterval(() => {
      fetchResources();
    }, 30000); // 30 saniye
    
    return () => clearInterval(intervalId);
  }, []);

  // Kaynakları filtrele
  useEffect(() => {
    let result = resources;
    
    // Arama terimine göre filtrele
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        resource => 
          resource.title.toLowerCase().includes(term) || 
          resource.description.toLowerCase().includes(term) || 
          resource.author.toLowerCase().includes(term) ||
          resource.tags.some(tag => tag.toLowerCase().includes(term))
      );
    }
    
    // Kategoriye göre filtrele
    if (selectedCategory) {
      result = result.filter(resource => resource.category === t(selectedCategory));
    }
    
    // Formata göre filtrele
    if (selectedFormat) {
      result = result.filter(resource => resource.format === t(selectedFormat));
    }
    
    // Üniversiteye göre filtrele
    if (selectedUniversity !== 'all') {
      result = result.filter(resource => 
        turkishToLower(resource.university).includes(turkishToLower(selectedUniversity))
      );
    }
    
    // Akademik seviyeye göre filtrele
    if (selectedAcademicLevel !== 'Hepsi' && selectedAcademicLevel !== 'All') {
      result = result.filter(resource =>
        resource.academicLevel &&
        resource.academicLevel.trim().toLowerCase() === selectedAcademicLevel.trim().toLowerCase()
      );
    }
    
    // Sıralama
    result = [...result].sort((a, b) => {
      if (sortBy === 'date') {
        return sortOrder === 'asc' 
          ? new Date(a.uploadDate).getTime() - new Date(b.uploadDate).getTime()
          : new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
      } else if (sortBy === 'downloads') {
        return sortOrder === 'asc' 
          ? a.downloadCount - b.downloadCount
          : b.downloadCount - a.downloadCount;
      } else if (sortBy === 'views') {
        return sortOrder === 'asc' 
          ? a.viewCount - b.viewCount
          : b.viewCount - a.viewCount;
      } else if (sortBy === 'title') {
        return sortOrder === 'asc'
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title);
      }
      return 0;
    });
    
    setFilteredResources(result);
  }, [resources, searchTerm, selectedCategory, selectedFormat, selectedUniversity, selectedAcademicLevel, sortBy, sortOrder]);

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

  // Kullanıcının kaynak görme hakkı kadar kaynağı göster
  const userViewQuota = user?.viewQuota ?? 2;
  const visibleResources = filteredResources.slice(0, userViewQuota);

  return (
    <div className="container mx-auto px-4 py-8 mt-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#994D1C] mb-2">{t('nav.resources')}</h1>
          <p className="text-[#6B3416] mb-4">
            {t('general.allResources')}
          </p>
        </div>
        
        {user && (
          <Link
            href="/kaynaklar/paylas"
            className="px-6 py-3 bg-gradient-to-r from-[#FFB996] to-[#FF8B5E] text-white font-medium rounded-xl 
              transition-all duration-300 hover:shadow-lg hover:shadow-[#FFB996]/20 hover:scale-105 flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            {t('general.shareResource')}
          </Link>
        )}
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
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex items-end ml-auto">
              <button
                onClick={() => {
                  setSelectedCategory('');
                  setSelectedFormat('');
                  setSelectedUniversity('all');
                  setSelectedAcademicLevel('Hepsi');
                  setSearchTerm('');
                  setUniversitySearchTerm('');
                }}
                className="px-4 py-2 text-[#994D1C] hover:text-[#6B3416] transition-colors duration-300"
              >
                {t('general.clearFilters')}
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Sonuç Sayısı */}
      <div className="mb-6">
        <p className="text-[#6B3416]">
          <span className="font-medium">{filteredResources.length}</span> {t('general.resourceSearchResults')}
        </p>
      </div>
      
      {/* Kaynaklar Listesi */}
      {/* Kaynak Önizleme Modalı */}
      {showPreviewModal && previewResource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
<<<<<<< Updated upstream
          {/* Ana içerik: Kaynağı kaydırılabilir şekilde göster */}
          <div className="bg-white rounded-xl shadow-lg max-w-6xl w-full max-h-[96vh] flex flex-col overflow-hidden">
            <div className="flex-1 overflow-auto p-8 relative">
=======
          <div className="bg-white rounded-xl shadow-lg max-w-3xl w-full max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-bold text-[#994D1C]">{previewResource.title} - {t('general.preview')}</h3>
              <button onClick={() => setShowPreviewModal(false)} className="text-[#994D1C] hover:text-[#FF8B5E] text-2xl font-bold">&times;</button>
            </div>
            <div className="flex-1 overflow-auto p-4">
>>>>>>> Stashed changes
              {/* PDF Önizleme */}
              {previewResource.format === 'PDF' && (
                <div className="relative w-full h-[85vh]">
                  <iframe
                    src={previewResource.fileData || previewResource.url}
                    title="PDF Preview"
                    className="w-full h-full border rounded"
                    frameBorder="0"
                  ></iframe>
                  {/* %75 gölgeli overlay (sadece premium engel aktifse) */}
                  {showPremiumBlock && <div className="absolute inset-0 bg-black/75 pointer-events-none"></div>}
                </div>
              )}
              {/* Resim Önizleme */}
              {previewResource.format === 'Resim' && (
                <div className="relative w-full flex justify-center">
                  <img 
                    src={previewResource.fileData || previewResource.url} 
                    alt={previewResource.title}
                    className="max-w-full max-h-[85vh] mx-auto border rounded"
                  />
                  {/* %75 gölgeli overlay (sadece premium engel aktifse) */}
                  {showPremiumBlock && <div className="absolute inset-0 bg-black/75 pointer-events-none"></div>}
                </div>
              )}
              {/* Video Önizleme */}
              {previewResource.format === 'Video' && (
                <div className="relative w-full">
                  <video 
                    src={previewResource.fileData || previewResource.url}
                    controls
                    className="w-full max-h-[85vh] border rounded"
                  ></video>
                  {/* %75 gölgeli overlay (sadece premium engel aktifse) */}
                  {showPremiumBlock && <div className="absolute inset-0 bg-black/75 pointer-events-none"></div>}
                </div>
              )}
              {/* Ses Önizleme */}
              {previewResource.format === 'Ses' && (
                <div className="relative w-full">
                  <audio 
                    src={previewResource.fileData || previewResource.url}
                    controls
                    className="w-full border rounded p-4"
                  ></audio>
                  {/* %75 gölgeli overlay (sadece premium engel aktifse) */}
                  {showPremiumBlock && <div className="absolute inset-0 bg-black/75 pointer-events-none"></div>}
                </div>
              )}
              {/* Diğer Dosya Türleri */}
              {!['PDF', 'Resim', 'Video', 'Ses'].includes(previewResource.format) && (
                <div className="text-center py-10">
                  <div className="text-[#994D1C] text-5xl mb-4">
                    <svg className="w-20 h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-[#994D1C] mb-2">{previewResource.format} formatında dosya</h2>
                  <p className="text-[#6B3416] mb-6">
                    Bu dosya türü için önizleme desteklenmiyor. Lütfen dosyayı indirin.
                  </p>
                  <button
                    onClick={() => {
                      setShowPreviewModal(false);
                      // Dosya indirme işlemini başlat
                      if (previewResource.fileData) {
                        const link = document.createElement('a');
                        link.href = previewResource.fileData;
                        const fileName = previewResource.fileName || `${previewResource.title}.${previewResource.format.toLowerCase()}`;
                        link.download = fileName;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      } else if (previewResource.url && previewResource.url !== '#') {
                        window.open(previewResource.url, '_blank');
                      }
                    }}
                    className="px-6 py-3 bg-[#FF8B5E] text-white font-medium rounded-xl transition-all duration-300 hover:bg-[#FF7A45]"
                  >
                    Dosyayı İndir
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
                      <h2 className="text-2xl font-extrabold mb-1 text-[#FFB066] drop-shadow">Upload your document and unlock access instantly!</h2>
                    </div>
                    <p className="mb-4 text-base font-medium text-[#A85A1A]">
                      Upload just one document and you’ll get <span className='font-bold text-[#FFB066]'>access to 3 resources</span> as a reward. Share more, unlock more!</p>
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
                          Upload
                        </button>
                        <div className="text-xs text-[#A85A1A] mt-1">Share to unlock</div>
                      </Link>
                    </div>
                    <div className="mt-1 text-base text-[#A85A1A]">Already user? <a className="underline font-bold text-[#FFB066]" href="/login">Log in</a></div>
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
      ) : paginatedResources.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedResources.map((resource) => (
            <div key={resource._id || resource.id} className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-[#994D1C] line-clamp-2">{resource.title}</h3>
                  <div className="bg-[#FF8B5E] text-white text-xs px-2 py-1 rounded-lg ml-2 flex-shrink-0">
                    {resource.format}
                  </div>
                </div>
                
                <p className="text-sm text-[#6B3416] mb-3 line-clamp-2">{resource.description}</p>
                
                <div className="flex flex-wrap gap-1 mb-3">
                  {resource.tags.slice(0, 3).map((tag, index) => (
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
                  
                  {/* Önizle Butonu - Tüm kaynak türleri için */}
                  <button
                    onClick={() => handlePreview(resource)}
                    className="flex-1 px-4 py-2 bg-[#FFB996] text-white text-center rounded-lg hover:bg-[#FF8B5E] transition-colors duration-300 text-sm"
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
        <div className="bg-white rounded-xl shadow-md p-8 text-center">
          <div className="text-[#994D1C] text-5xl mb-4">
            <svg className="w-20 h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-[#994D1C] mb-4">{t('general.resourceSearchNoResults')}</h2>
          <p className="text-[#6B3416] mb-6">
            {t('general.noResultsForSearch')}
          </p>
          {user && (
            <Link
              href="/kaynaklar/paylas"
              className="px-6 py-3 bg-[#FF8B5E] text-white font-medium rounded-xl 
                transition-all duration-300 hover:bg-[#FF7A45]"
            >
              {t('general.shareResource')}
            </Link>
          )}
        </div>
      )}
      {/* Sayfalama butonları */}
      <div className="pagination flex justify-center gap-2 mt-8">
        {[...Array(pageCount)].map((_, idx) => (
          <button
            key={idx}
            className={`px-3 py-1 rounded ${currentPage === idx + 1 ? 'bg-orange-400 text-white' : 'bg-gray-200'}`}
            onClick={() => setCurrentPage(idx + 1)}
          >
            {idx + 1}
          </button>
        ))}
      </div>
    </div>
  );
}
