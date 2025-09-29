'use client';

import { useState, useRef } from 'react';

import { useRouter } from 'next/navigation';
import { useLanguage } from '@/src/contexts/LanguageContext';
import { useAuth } from 'src/context/AuthContext';
import Link from 'next/link';

// Kaynak kategorileri (multilingual keys)
const categoryKeys: string[] = [
  'resourceCategory.notes',
  'resourceCategory.books',
  'resourceCategory.articles',
  'resourceCategory.videos',
  'resourceCategory.presentations',
  'resourceCategory.examQuestions',
  'resourceCategory.projects',
  'resourceCategory.other',
];

// Kaynak formatları
const formatKeys: string[] = [
  'resourceFormat.pdf',
  'resourceFormat.doc',
  'resourceFormat.ppt',
  'resourceFormat.jpg',
  'resourceFormat.jpeg',
  'resourceFormat.png',
];

// Akademik seviyeler (multilingual keys)
const academicLevelKeys: string[] = [
  'academicLevel.bachelor',
  'academicLevel.master',
  'academicLevel.phd',
];

export default function KaynakPaylasPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    format: '',
    level: '',
    course: '',
    tags: '',
    resourceType: 'file', // 'file' veya 'link'
    link: '',
  });
  
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Uygunsuz içerik anahtar kelimeleri
  const forbiddenWords = ['küfür1', 'küfür2', 'spam', 'hack', 'yasaklı'];

  // İçerik kontrol fonksiyonu
  function containsForbidden(text: string) {
    const lower = text.toLocaleLowerCase('tr');
    return forbiddenWords.some(word => lower.includes(word));
  }
  
  // Kullanıcı giriş yapmamışsa giriş sayfasına yönlendir
  if (!user) {
    return (
      <div className="relative min-h-screen pt-24 pb-16 overflow-hidden">
        <div className="relative z-10 container mx-auto px-4 text-center">
          <div className="max-w-md mx-auto bg-white rounded-xl shadow-md p-8">
          <div className="text-[#994D1C] text-5xl mb-4">
            <svg className="w-20 h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-[#994D1C] mb-4">{t('general.accessDenied')}</h2>
          <p className="text-[#6B3416] mb-6">
            {t('general.accessDeniedMessage')}
          </p>
          <div className="flex flex-col space-y-4">
            <Link
              href="/auth/login"
              className="px-6 py-3 bg-gradient-to-r from-[#FFB996] to-[#FF8B5E] text-white font-medium rounded-xl 
                transition-all duration-300 hover:shadow-lg hover:shadow-[#FFB996]/20"
            >
              {t('auth.login')}
            </Link>
            <Link
              href="/kaynaklar"
              className="px-6 py-3 border border-[#FFB996] text-[#994D1C] font-medium rounded-xl 
                transition-all duration-300 hover:bg-[#FFF5F0]"
            >
              {t('general.goBack')}
            </Link>
          </div>
          </div>
        </div>
      </div>
    );
  }
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'image/png',
      ];
      const allowedExtensions = ['.pdf','.doc','.docx','.ppt','.pptx','.png'];
      const fileName = selectedFile.name.toLowerCase();
      const isValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext));
      const isValidType = allowedTypes.includes(selectedFile.type);
      const isValidSize = selectedFile.size <= 5 * 1024 * 1024;
      if (!isValidExtension || !isValidType) {
        setError('Sadece PDF, DOC, DOCX, PPT, PPTX ve PNG dosyaları yüklenebilir.');
        setFile(null);
        return;
      }
      if (!isValidSize) {
        setError('Dosya boyutu en fazla 5MB olabilir.');
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setError('');
      if (fileName.endsWith('.pdf')) {
        setFormData(prev => ({ ...prev, format: 'resourceFormat.pdf' }));
      } else if (fileName.endsWith('.doc') || fileName.endsWith('.docx')) {
        setFormData(prev => ({ ...prev, format: 'resourceFormat.doc' }));
      } else if (fileName.endsWith('.ppt') || fileName.endsWith('.pptx')) {
        setFormData(prev => ({ ...prev, format: 'resourceFormat.ppt' }));
      } else if (fileName.endsWith('.png')) {
        setFormData(prev => ({ ...prev, format: 'resourceFormat.png' }));
      }
    }
  };

  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      // Form doğrulama
      if (!formData.title.trim()) throw new Error(t('errors.titleRequired') || 'Lütfen bir başlık girin');
      if (!formData.description.trim()) throw new Error(t('errors.descriptionRequired') || 'Lütfen bir açıklama girin');
      if (!formData.category) throw new Error('Lütfen bir kategori seçin');
      if (!formData.level) throw new Error('Lütfen bir seviye seçin');
      if (!formData.course.trim()) throw new Error(t('errors.courseRequired') || 'Lütfen ders adını girin');
      if (formData.resourceType === 'file' && !file) throw new Error('Lütfen bir dosya yükleyin');
      if (formData.resourceType === 'link' && !formData.link.trim()) throw new Error('Lütfen bir bağlantıyı girin');

      // Başlık, açıklama ve etiketlerde uygunsuz içerik kontrolü
      if (containsForbidden(formData.title)) throw new Error('Başlıkta uygunsuz içerik tespit edildi.');
      if (containsForbidden(formData.description)) throw new Error('Açıklamada uygunsuz içerik tespit edildi.');
      if (containsForbidden(formData.tags)) throw new Error('Etiketlerde uygunsuz içerik tespit edildi.');
      if (containsForbidden(formData.course)) throw new Error('Ders alanında uygunsuz içerik tespit edildi.');

      // Dosya varsa base64'e çevir
      let fileDataUrl = '';
      if (file && formData.resourceType === 'file') {
        try {
          fileDataUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
        } catch (error) {
          console.error('Dosya okuma hatası:', error);
          throw new Error('Dosya okunamadı. Lütfen tekrar deneyin.');
        }
      }

      // API'ye yeni kaynak ekle
      const newResource = {
        title: formData.title,
        description: formData.description,
        author: user?.name || 'Anonim',
        authorId: user?.id, 
        category: formData.category,
        format: formData.format,
        level: formData.level,
        course: formData.course.trim(),
        fileSize: file ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : 'N/A',
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== ''),
        url: formData.resourceType === 'link' ? formData.link : '#',
        fileData: fileDataUrl,
        fileName: file ? file.name : '',
        fileType: file ? file.type : ''
      };
      const response = await fetch('/api/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newResource)
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Kaynak eklenemedi. Lütfen tekrar deneyin.');
      }
      setSuccess(true);
      setTimeout(() => { router.push('/kaynaklar'); }, 2000);
    } catch (err: any) {
      // Sadece "uygunsuz içerik" kelimesi geçen çok özel bir hata varsa fail sayfasına yönlendir, diğer tüm hata mesajlarını ekranda göster
      if (
        err.message === 'uygunsuz içerik'
      ) {
        router.push('/kaynaklar/paylas/fail');
      } else {
        setError(err.message || 'Bir hata oluştu');
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (success) {
    return (
      <div className="relative min-h-screen pt-24 pb-16 overflow-hidden">
        <div className="relative z-10 container mx-auto px-4 text-center">
          <div className="max-w-md mx-auto bg-white rounded-xl shadow-md p-8">
          <div className="text-green-500 text-5xl mb-4">
            <svg className="w-20 h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-[#994D1C] mb-4">Kaynak Başarıyla Paylaşıldı!</h2>
          <p className="text-[#6B3416] mb-6">
            Kaynağınız başarıyla yüklendi ve diğer kullanıcılar tarafından görüntülenebilir.
          </p>
          <p className="text-[#6B3416] mb-6">
            Kaynaklar sayfasına yönlendiriliyorsunuz...
          </p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="relative min-h-screen pt-24 pb-16 overflow-hidden">
      <div className="relative z-10 container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
        <div className="flex items-center mb-8">
        <Link href="/kaynaklar" className="mr-4 text-[#994D1C] hover:text-[#6B3416] transition-colors duration-300">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>
        <h1 className="text-3xl font-bold text-[#994D1C]">{t('general.shareResource')}</h1>
      </div>
      
      <div className="bg-white rounded-xl shadow-md p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label htmlFor="title" className="block text-sm font-medium text-[#6B3416] mb-1">
                {t('general.resourceTitle')} *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="block w-full rounded-md border-[#FFB996] shadow-sm focus:border-[#FF8B5E] focus:ring focus:ring-[#FF8B5E] focus:ring-opacity-50 px-4 py-3"
              />
            </div>
            
            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-[#6B3416] mb-1">
                {t('general.resourceDescription')} *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows={4}
                className="block w-full rounded-md border-[#FFB996] shadow-sm focus:border-[#FF8B5E] focus:ring focus:ring-[#FF8B5E] focus:ring-opacity-50 px-4 py-3"
              />
            </div>
            
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-[#6B3416] mb-1">
                {t('general.resourceCategory')} *
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
                className="block w-full rounded-md border-[#FFB996] shadow-sm focus:border-[#FF8B5E] focus:ring focus:ring-[#FF8B5E] focus:ring-opacity-50 px-4 py-3"
              >
                <option value="">{t('general.selectOption')}</option>
                {categoryKeys.map((key) => (
                  <option key={key} value={key}>
                    {t(key)}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="level" className="block text-sm font-medium text-[#6B3416] mb-1">
                {t('general.academicLevel')} *
              </label>
              <select
                id="level"
                name="level"
                value={formData.level}
                onChange={handleInputChange}
                required
                className="block w-full rounded-md border-[#FFB996] shadow-sm focus:border-[#FF8B5E] focus:ring focus:ring-[#FF8B5E] focus:ring-opacity-50 px-4 py-3"
              >
                <option value="">{t('general.selectOption')}</option>
                {academicLevelKeys.map((key) => (
                  <option key={key} value={key}>{t(key)}</option>
                ))}
              </select>
            </div>
            
            <div className="md:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="tags" className="block text-sm font-medium text-[#6B3416] mb-1">
                    {t('general.resourceTags')} (virgülle ayırın)
                  </label>
                  <input
                    type="text"
                    id="tags"
                    name="tags"
                    value={formData.tags}
                    onChange={handleInputChange}
                    placeholder={t('general.tagsPlaceholder')}
                    className="block w-full rounded-md border-[#FFB996] shadow-sm focus:border-[#FF8B5E] focus:ring focus:ring-[#FF8B5E] focus:ring-opacity-50 px-4 py-3"
                  />
                </div>
                <div>
                  <label htmlFor="course" className="block text-sm font-medium text-[#6B3416] mb-1">
                    {t('general.course')} *
                  </label>
                  <input
                    type="text"
                    id="course"
                    name="course"
                    value={formData.course}
                    onChange={handleInputChange}
                    placeholder={t('general.coursePlaceholder')}
                    required
                    className="block w-full rounded-md border-[#FFB996] shadow-sm focus:border-[#FF8B5E] focus:ring focus:ring-[#FF8B5E] focus:ring-opacity-50 px-4 py-3"
                  />
                </div>
              </div>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[#6B3416] mb-3">
                {t('general.resourceType')} *
              </label>
              <div className="flex space-x-4 mb-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="resourceType"
                    value="file"
                    checked={formData.resourceType === 'file'}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-[#FF8B5E] focus:ring-[#FF8B5E]"
                  />
                  <span className="ml-2 text-[#6B3416]">{t('general.resourceFile')}</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="resourceType"
                    value="link"
                    checked={formData.resourceType === 'link'}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-[#FF8B5E] focus:ring-[#FF8B5E]"
                  />
                  <span className="ml-2 text-[#6B3416]">{t('general.resourceLink')}</span>
                </label>
              </div>
              
              {formData.resourceType === 'file' ? (
                <div>
                  <div className="flex items-center justify-center w-full">
                    <label
                      htmlFor="file-upload"
                      className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-[#FFB996] rounded-lg cursor-pointer bg-[#FFF5F0] hover:bg-[#FFE5D9] transition-colors duration-300"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg className="w-10 h-10 mb-3 text-[#994D1C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="mb-2 text-sm text-[#994D1C]">
                          <span className="font-semibold">Dosya yüklemek için tıklayın</span> veya sürükleyip bırakın
                        </p>
                        <p className="text-xs text-[#6B3416]">
                          PDF, DOC, DOCX, PPT, PPTX, PNG (Max 5MB)
                        </p>
                      </div>
                      <input
                        id="file-upload"
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </label>
                  </div>
                  
                  {file && (
                    <div className="mt-4 p-3 bg-[#FFF5F0] rounded-lg flex justify-between items-center">
                      <div className="flex items-center">
                        <svg className="w-6 h-6 text-[#994D1C] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <div>
                          <p className="text-sm font-medium text-[#994D1C]">{file.name}</p>
                          <p className="text-xs text-[#6B3416]">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setFile(null);
                          if (fileInputRef.current) {
                            fileInputRef.current.value = '';
                          }
                        }}
                        className="text-[#994D1C] hover:text-[#6B3416]"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )}
                  

                </div>
              ) : (
                <div>
                  <label htmlFor="link" className="block text-sm font-medium text-[#6B3416] mb-1">
                    {t('general.resourceLink')} *
                  </label>
                  <input
                    type="url"
                    id="link"
                    name="link"
                    value={formData.link}
                    onChange={handleInputChange}
                    placeholder="https://example.com/resource"
                    required={formData.resourceType === 'link'}
                    className="block w-full rounded-md border-[#FFB996] shadow-sm focus:border-[#FF8B5E] focus:ring focus:ring-[#FF8B5E] focus:ring-opacity-50 px-4 py-3"
                  />
                </div>
              )}
            </div>
          </div>
          
          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          <div className="flex justify-end space-x-4">
            <Link
              href="/kaynaklar"
              className="px-6 py-3 border border-[#FFB996] text-[#994D1C] font-medium rounded-xl 
                transition-all duration-300 hover:bg-[#FFF5F0]"
            >
              {t('general.cancel')}
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-gradient-to-r from-[#FFB996] to-[#FF8B5E] text-white font-medium rounded-xl 
                transition-all duration-300 hover:shadow-lg hover:shadow-[#FFB996]/20 disabled:opacity-50 flex items-center"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {t('general.processing')}
                </>
              ) : (
                t('general.uploadResource')
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
 </div>
);
}
