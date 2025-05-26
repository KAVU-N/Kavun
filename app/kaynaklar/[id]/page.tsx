'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLanguage } from '@/src/contexts/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import type { User } from '../../../src/types/User';
import Link from 'next/link';

// Kaynak tipi tanımlama
type Resource = {
  _id?: string;
  id: number;
  title: string;
  description: string;
  author: string;
  category: string;
  format: string;
  level: string;
  university: string;
  department: string;
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


export default function KaynakDetayPage() {
  const { t, language } = useLanguage();
  const { user } = useAuth() as { user: User | null };
  const params = useParams();
  const router = useRouter();
  const resourceId = params?.id;
  
  const [resource, setResource] = useState<Resource | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [relatedResources, setRelatedResources] = useState<Resource[]>([]);
  
  // Kaynağı getir
  useEffect(() => {
    if (!resourceId || resourceId === 'undefined') {
      setError('Kaynak ID bulunamadı.');
      setLoading(false);
      return;
    }
    const fetchResource = async () => {
      setLoading(true);
      try {
        // API'den kaynağı çek
        const response = await fetch(`/api/resources/${resourceId}`);
        const data = await response.json();
        
        // API yanıtı localStorage kullanmamızı söylüyorsa
        if (data.message === 'localStorage') {
          // localStorage'dan kaynakları al
          const storedResources = localStorage.getItem('sharedResources');
          if (storedResources) {
            const parsedResources = JSON.parse(storedResources) as Resource[];
            const foundResource = parsedResources.find(r => r.id.toString() === resourceId);
            
            if (foundResource) {
              // Görüntülenme sayısını artır
              foundResource.viewCount = (foundResource.viewCount || 0) + 1;
              localStorage.setItem('sharedResources', JSON.stringify(parsedResources));
              setResource(foundResource);
              
              // İlgili kaynakları bul
              const related = parsedResources
                .filter(r => r.id !== foundResource.id)
                .filter(r => 
                  r.category === foundResource.category || 
                  (r.tags && foundResource.tags && r.tags.some(tag => foundResource.tags.includes(tag)))
                )
                .slice(0, 3);
              
              setRelatedResources(related);
            } else {
              throw new Error('Kaynak bulunamadı');
            }
          } else {
            throw new Error('Kaynak bulunamadı');
          }
        } else {
          // Eğer API veritabanından veri döndüyse, doğrudan kullan
          setResource(data);
          
          // İlgili kaynakları getir
          const relatedResponse = await fetch('/api/resources');
          if (relatedResponse.ok) {
            let allResources = await relatedResponse.json();
            // Eğer API'den obje dönerse (ör: {resources: [...]}) diziye eriş
            if (allResources && !Array.isArray(allResources) && allResources.resources && Array.isArray(allResources.resources)) {
              allResources = allResources.resources;
            }
            // İlgili kaynakları bul (aynı kategori veya etiketlere sahip)
            const related = allResources
              .filter((r: Resource) => r.id !== data.id)
              .filter((r: Resource) => 
                r.category === data.category || 
                (r.tags && data.tags && r.tags.some((tag: string) => data.tags.includes(tag)))
              )
              .slice(0, 3);
            
            setRelatedResources(related);
          }
        }
      } catch (error) {
        console.error('Kaynak yüklenirken hata oluştu:', error);
        setError(error instanceof Error ? error.message : 'Kaynak yüklenirken bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchResource();
  }, [resourceId]);
  
  // Görüntülenme sayısı otomatik olarak API tarafında artırılıyor
  // Kaynağı getirdiğimizde görüntülenme sayısı zaten artırılmış oluyor
  
  // İndirme işlemi
  const handleDownload = async () => {
    if (!resource || !user) {
      alert(t('errors.loginRequired'));
      return;
    }
    
    const hasDownloadRight = (user as any).downloadRight >= 1;
    if (!hasDownloadRight) {
      alert(t('errors.noDownloadPermission'));
      return;
    }
    
    try {
      // API'ye istek gönder
      const response = await fetch(`/api/resources/${resourceId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          action: 'download',
          userId: user?.id || null
        })
      });
      const data = await response.json();
      
      // API yanıtı localStorage kullanmamızı söylüyorsa
      if (data.message === 'localStorage') {
        // localStorage'dan kaynakları al ve indirme sayısını artır
        const storedResources = localStorage.getItem('sharedResources');
        if (storedResources) {
          const parsedResources = JSON.parse(storedResources) as Resource[];
          const resourceIndex = parsedResources.findIndex(r => r.id.toString() === resourceId);
          
          if (resourceIndex !== -1) {
            // İndirme sayısını artır
            parsedResources[resourceIndex].downloadCount = (parsedResources[resourceIndex].downloadCount || 0) + 1;
            localStorage.setItem('sharedResources', JSON.stringify(parsedResources));
            
            // Güncellenmiş kaynağı state'e kaydet
            setResource(parsedResources[resourceIndex]);
          }
        }
      }
      
      // Kaynak URL'sini kontrol et
      if (resource.url && resource.url !== '#') {
        // Eğer bu bir harici bağlantıysa, yeni sekmede aç
        window.open(resource.url, '_blank');
      } else if (resource.fileData) {
        // Eğer dosya verisi varsa (Base64 formatında)
        try {
          // Base64 verisini kullanarak dosyayı indir
          const link = document.createElement('a');
          link.href = resource.fileData; // Base64 veri URL'si
          
          // Dosya adını belirle
          const fileName = resource.fileName || `${resource.title}.${resource.format.toLowerCase()}`;
          link.download = fileName;
          
          // Dosyayı indir
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } catch (error) {
          console.error('Dosya indirme hatası:', error);
          alert(t('general.downloadError'));
        }
      } else {
        // Dosya verisi yoksa hata mesajı göster
        alert(t('general.fileNotFound'));
      }
    } catch (error) {
      console.error('Dosya indirme hatası:', error);
      alert(t('general.downloadError'));
    }
  };
  
  // Tarihi formatla
  const formatDate = (dateString: string): string => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    return new Intl.DateTimeFormat(language === 'tr' ? 'tr-TR' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF8B5E]"></div>
      </div>
    );
  }
  
  if (error || !resource) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-md p-8">
          <div className="text-[#994D1C] text-5xl mb-4">
            <svg className="w-20 h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-[#994D1C] mb-4">{t('general.resourceSearchNoResults')}</h2>
          <p className="text-[#6B3416] mb-6">
            {error || t('general.noResultsForSearch')}
          </p>
          <Link
            href="/kaynaklar"
            className="px-6 py-3 bg-[#FF8B5E] text-white font-medium rounded-xl 
              transition-all duration-300 hover:bg-[#FF7A45]"
          >
            {t('general.goBack')}
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/kaynaklar" className="text-[#994D1C] hover:text-[#6B3416] transition-colors duration-300 flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          {t('general.goBack')}
        </Link>
      </div>
      
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl md:text-3xl font-bold text-[#994D1C]">{resource.title}</h1>
                <span className="bg-[#FF8B5E] text-white text-sm px-3 py-1 rounded-lg">
                  {resource.format}
                </span>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {(resource.tags || []).map((tag, index) => (
                  <span key={index} className="bg-[#FFE5D9] text-[#994D1C] text-xs px-2 py-1 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
              
              <div className="text-sm text-[#6B3416] mb-2">
                <span className="font-medium">{t('general.resourceAuthor')}:</span> {resource.author}
              </div>
              
              {resource.university && (
                <div className="text-sm text-[#6B3416] mb-2">
                  <span className="font-medium">{t('general.university')}:</span> {resource.university}
                </div>
              )}
              
              {resource.department && (
                <div className="text-sm text-[#6B3416] mb-2">
                  <span className="font-medium">{t('general.department')}:</span> {resource.department}
                </div>
              )}
              
              <div className="text-sm text-[#6B3416] mb-2">
                <span className="font-medium">{t('general.resourceCategory')}:</span> {resource.category}
              </div>
              
              <div className="text-sm text-[#6B3416] mb-2">
                <span className="font-medium">{t('general.resourceLevel')}:</span> {resource.level}
              </div>
              
              <div className="text-sm text-[#6B3416] mb-2">
                <span className="font-medium">{t('general.resourceDate')}:</span> <span className="text-xs text-gray-500">{formatDate(resource?.uploadDate || resource?.createdAt)}</span>
              </div>
            </div>
            
            <div className="flex flex-col gap-3 w-full md:w-auto">
              <button
                onClick={(user?.downloadRight ?? 0) === 0 ? undefined : handleDownload}
                className={`px-6 py-3 bg-gradient-to-r from-[#FFB996] to-[#FF8B5E] text-white font-medium rounded-xl transition-all duration-300 flex items-center justify-center ${(user?.downloadRight ?? 0) === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg hover:shadow-[#FFB996]/20'}`}
                disabled={(user?.downloadRight ?? 0) === 0}
                title={(user?.downloadRight ?? 0) === 0 ? 'İndirme hakkınız yok' : ''}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                {(user?.downloadRight ?? 0) === 0 ? 'İndirme hakkınız yok' : t('general.resourceDownload')}
              </button>
              
              {resource.url && resource.url !== '#' && (
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 border border-[#FFB996] text-[#994D1C] font-medium rounded-xl 
                    transition-all duration-300 hover:bg-[#FFF5F0] text-center"
                >
                  <svg className="w-5 h-5 mr-2 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  {t('general.resourceView')}
                </a>
              )}
              
              <div className="bg-[#FFF5F0] rounded-lg p-3 mt-2">
                <div className="flex justify-between text-sm text-[#6B3416] mb-2">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    {resource.viewCount} {t('general.resourceViews')}
                  </div>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    {resource.downloadCount} {t('general.resourceDownloads')}
                  </div>
                </div>
                <div className="text-sm text-[#6B3416]">
                  <span className="font-medium">{t('general.resourceSize')}:</span> {resource.fileSize}
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-[#FFE5D9] pt-6 mt-6">
            <h2 className="text-xl font-semibold text-[#994D1C] mb-4">{t('general.resourceDescription')}</h2>
            <div className="text-[#6B3416] whitespace-pre-line">
              {resource.description}
            </div>
          </div>
        </div>
      </div>
      
      {relatedResources.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-semibold text-[#994D1C] mb-6">{t('general.resourceRelated')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedResources.map((related) => (
              <div key={related.id} className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-[#994D1C] line-clamp-2">{related.title}</h3>
                    <div className="bg-[#FF8B5E] text-white text-xs px-2 py-1 rounded-lg ml-2 flex-shrink-0">
                      {related.format}
                    </div>
                  </div>
                  
                  <p className="text-sm text-[#6B3416] mb-3 line-clamp-2">{related.description}</p>
                  
                  <div className="flex flex-wrap gap-1 mb-3">
                    {(related.tags || []).slice(0, 3).map((tag, index) => (
                      <span key={index} className="bg-[#FFE5D9] text-[#994D1C] text-xs px-2 py-1 rounded-full">
                        {tag}
                      </span>
                    ))}
                    {(related.tags || []).length > 3 && (
                      <span className="bg-[#FFE5D9] text-[#994D1C] text-xs px-2 py-1 rounded-full">
                        +{(related.tags || []).length - 3}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex justify-between items-center text-xs text-[#6B3416] mb-4">
                    <div>{related.author}</div>
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      {related.downloadCount}
                    </div>
                  </div>
                  
                  <Link
                    href={`/kaynaklar/${related.id}`}
                    className="w-full px-4 py-2 bg-[#FF8B5E] text-white text-center rounded-lg hover:bg-[#FF7A45] transition-colors duration-300 text-sm block"
                  >
                    {t('general.resourceView')}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
