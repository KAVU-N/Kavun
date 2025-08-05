'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/src/contexts/LanguageContext';
import { useAuth } from 'src/context/AuthContext';
import Link from 'next/link';

// Resource type definition (same as in kaynaklar page)
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
  fileData?: string;
  fileName?: string;
  fileType?: string;
};

export default function FavorilerimPage() {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [favoriteResources, setFavoriteResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Load favorites from localStorage
  useEffect(() => {
    if (mounted && user) {
      const savedFavorites = localStorage.getItem(`favorites_${user.id}`);
      if (savedFavorites) {
        setFavorites(JSON.parse(savedFavorites));
      }
    }
  }, [mounted, user]);

  // Fetch favorite resources when favorites list changes
  useEffect(() => {
    const fetchFavoriteResources = async () => {
      if (favorites.length === 0) {
        setFavoriteResources([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch('/api/resources');
        if (response.ok) {
          const allResources = await response.json();
          const favoriteResourcesData = allResources.filter((resource: Resource) => 
            favorites.includes(resource._id || resource.id.toString())
          );
          setFavoriteResources(favoriteResourcesData);
        }
      } catch (error) {
        console.error('Error fetching favorite resources:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFavoriteResources();
  }, [favorites]);

  // Remove from favorites
  const removeFromFavorites = (resourceId: string) => {
    const updatedFavorites = favorites.filter(id => id !== resourceId);
    setFavorites(updatedFavorites);
    localStorage.setItem(`favorites_${user?.id}`, JSON.stringify(updatedFavorites));
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format file size
  const formatFileSize = (size: string) => {
    if (!size || size === '-') return '-';
    const sizeNum = parseFloat(size);
    if (sizeNum < 1024) return `${sizeNum} B`;
    if (sizeNum < 1024 * 1024) return `${(sizeNum / 1024).toFixed(1)} KB`;
    return `${(sizeNum / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Handle download
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
      
      if (!response.ok) {
        alert('Bir hata oluştu.');
        return;
      }
      
      // Start file download
      if (resource.fileData) {
        const link = document.createElement('a');
        link.href = resource.fileData;
        const fileName = resource.fileName || `${resource.title}.${resource.format.toLowerCase()}`;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('Download error:', error);
      alert('İndirme sırasında bir hata oluştu.');
    }
  };

  if (!mounted) {
    return null;
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 mt-20">
        <div className="text-center py-20">
          <h1 className="text-3xl font-bold text-[#994D1C] mb-4">
            {language === 'en' ? 'Login Required' : 'Giriş Gerekli'}
          </h1>
          <p className="text-[#6B3416] mb-6">
            {language === 'en' 
              ? 'Please login to view your favorite resources.' 
              : 'Favori kaynaklarınızı görüntülemek için lütfen giriş yapın.'}
          </p>
          <Link 
            href="/auth/login"
            className="inline-flex items-center px-6 py-3 bg-[#994D1C] text-white rounded-lg hover:bg-[#7a3d16] transition-colors"
          >
            {language === 'en' ? 'Login' : 'Giriş Yap'}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 mt-20">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#994D1C] mb-2">
              {language === 'en' ? 'My Favorites' : 'Favorilerim'}
            </h1>
            <p className="text-[#6B3416]">
              {language === 'en' 
                ? 'Your favorite resources in one place' 
                : 'Favori kaynaklarınız tek yerde'}
            </p>
          </div>
          <Link 
            href="/kaynaklar"
            className="px-6 py-3 bg-gradient-to-r from-[#FFB996] to-[#FF8B5E] text-white font-medium rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-[#FFB996]/20 hover:scale-105 flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {language === 'en' ? 'Browse Resources' : 'Kaynakları Gözat'}
          </Link>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF8B5E]"></div>
          </div>
        ) : favoriteResources.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favoriteResources.map((resource: Resource) => (
              <div key={resource._id || resource.id} className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-[#994D1C] line-clamp-2 flex-1 mr-2">{resource.title}</h3>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {/* Remove from favorites button */}
                      <button
                        onClick={() => removeFromFavorites(resource._id || resource.id.toString())}
                        className="p-1 hover:bg-red-100 rounded-full transition-colors duration-200"
                        title={language === 'en' ? 'Remove from favorites' : 'Favorilerden çıkar'}
                      >
                        <svg 
                          className="w-5 h-5 text-red-500 hover:text-red-600 transition-colors duration-200"
                          fill="none"
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
                          />
                        </svg>
                      </button>
                      <div className="bg-[#FF8B5E] text-white text-xs px-2 py-1 rounded-lg">
                        {t(resource.format) || resource.format}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-[#6B3416] mb-3 line-clamp-2">{resource.description}</p>
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
                        {language === 'en' ? 'View' : 'Görüntüle'}
                      </div>
                    </Link>
                    <button
                      onClick={() => handleDownload(resource)}
                      className="flex-1 px-4 py-2 bg-[#FF8B5E] text-white text-center rounded-lg hover:bg-[#FF7A45] transition-colors duration-300 text-sm cursor-pointer"
                    >
                      {language === 'en' ? 'Download' : 'İndir'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {language === 'en' ? 'No favorites yet' : 'Henüz favori yok'}
            </h3>
            <p className="text-gray-500 mb-6">
              {language === 'en' 
                ? 'Start adding resources to your favorites by clicking the star icon on any resource.'
                : 'Herhangi bir kaynaktaki yıldız simgesine tıklayarak favorilerinize kaynak eklemeye başlayın.'}
            </p>
            <Link 
              href="/kaynaklar"
              className="inline-flex items-center px-4 py-2 bg-[#994D1C] text-white rounded-lg hover:bg-[#7a3d16] transition-colors"
            >
              {language === 'en' ? 'Browse Resources' : 'Kaynakları Gözat'}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
