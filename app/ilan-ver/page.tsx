'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { FaPaperPlane } from 'react-icons/fa';
import { useLanguage } from '@/src/contexts/LanguageContext';

export default function IlanVerPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    method: 'online', // 'online', 'yüzyüze' veya 'hibrit'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Sadece eğitmen (instructor) veya öğretmen (teacher) rolüne sahip kullanıcıların erişimine izin ver
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    } else if (!loading && user && !['instructor', 'teacher'].includes(user.role)) {
      router.push('/');
    }
  }, [user, loading, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Yasaklı kelimeler listesi
  const bannedWords = [
    "amk", "aq", "orospu", "piç", "sik", "sikerim", "siktir", "yarrak", "ananı", "anan",
    "babanı", "baban", "göt", "got", "götveren", "pezevenk", "kahpe", "ibne", "ibneyim", "ibneler",
    "ibnelik", "döl", "bok", "boktan", "boklu", "sikik", "sikilmiş", "amına", "koyayım", "koydum",
    "koyarım", "kodum", "koduğum", "koyduğum", "koyduklarım", "siktiğim", "siktiğimin", "siktiğiminin",
    "siktirgit", "siktir ol", "siktir et", "siktirip", "siktiriboktan", "siktirola", "siktiribok",
    "amcık", "amcıklar", "amcığa", "amcığı", "amcığın", "amcığım", "amcığına", "amcığından",
    "amcığını", "amcığınına", "amcığınından", "amcığınından", "amcığınından", "amcığınından",
    "yarrağımı", "yarrağımın", "yarrağımda", "yarrağımdan", "yarrağımla", "yarrağımsı", "yarrağımsın",
    "yarrağımsına", "yarrağımsınız", "yarrağımsınlar", "götlek", "götleğim", "götleğin", "götleği",
    "götleğine", "götleğimi", "götleğimin", "götleğimde", "götleğimden", "götleğimle", "götleğimsi",
    "götleğimsin", "götleğimsi", "götleğimsiniz", "götleğimsinler", "pezevenk", "pezevengim",
    "pezevengin", "pezevengi", "pezevengine", "pezevengimi", "pezevengimin", "pezevengimde",
    "pezevengimden", "pezevengimle", "pezevengimsi", "pezevengimsin", "pezevengimsi", "pezevengimsiniz",
    "pezevengimsinler", "kaltak", "kaltaklık", "kaltaklar", "kaltaklığı", "kaltaklığa", "kaltaklıkta",
    "kaltaklıktan", "kaltaklıkla", "kaltaklıksı", "kaltaklıksın", "kaltaklıksınız", "kaltaklıklar",
    "sikik", "sikiklik", "sikikler", "sikikliği", "sikikliğe", "sikiklikte", "sikiklikten", "sikiklikle",
    "sikikliksi", "sikikliksin", "sikikliksiniz", "sikiklikler", "sikiklikleri", "sikikliklere"
  ];

  function containsBannedWords(text: string) {
    const lower = text.toLocaleLowerCase('tr');
    return bannedWords.some(word => lower.includes(word));
  }

  // Ekstra güvenlik fonksiyonları
  function hasRepeatedChars(text: string, count = 3) {
    // aaa, !!!, ??? gibi tekrarları engelle
    const regex = new RegExp(`(.)\\1{${count-1},}`);
    return regex.test(text);
  }
  function isAllUpperCase(text: string) {
    return text.length > 2 && text === text.toLocaleUpperCase('tr');
  }
  function containsSpamPhrases(text: string) {
    const spamWords = [
      'whatsapp', 'telegram', 'acil', 'satılık', 'bedava', 'ücretsiz', 'takipçi', 'takipci', 'instagram', 'tiktok', 'hemen ulaş', 'hemen ulas', 'hemen yaz', 'direkt mesaj', 'dm', 'wp', 'numaram', 'bana ulaş', 'bana ulas'
    ];
    const lower = text.toLocaleLowerCase('tr');
    return spamWords.some(word => lower.includes(word));
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError(t('errors.titleRequired') || 'Lütfen bir başlık girin');
      return;
    }
    if (formData.title.length > 100) {
      setError('Başlık 100 karakterden uzun olamaz!');
      return;
    }
    if (hasRepeatedChars(formData.title)) {
      setError('Başlıkta çok fazla tekrar eden karakter kullanılamaz!');
      return;
    }
    if (isAllUpperCase(formData.title)) {
      setError('Başlık tamamen büyük harf olamaz!');
      return;
    }
    if (containsSpamPhrases(formData.title)) {
      setError('Başlıkta spam veya iletişim amaçlı kelime kullanılamaz!');
      return;
    }
    if (containsBannedWords(formData.title)) {
      setError(t('errors.bannedWordTitle') || 'Başlıkta uygunsuz kelime kullanılamaz!');
      return;
    }
    
    if (!formData.description.trim()) {
      setError(t('errors.descriptionRequired') || 'Lütfen bir açıklama girin');
      return;
    }
    if (formData.description.length > 1000) {
      setError('Açıklama 1000 karakterden uzun olamaz!');
      return;
    }
    if (hasRepeatedChars(formData.description)) {
      setError('Açıklamada çok fazla tekrar eden karakter kullanılamaz!');
      return;
    }
    if (isAllUpperCase(formData.description)) {
      setError('Açıklama tamamen büyük harf olamaz!');
      return;
    }
    if (containsSpamPhrases(formData.description)) {
      setError('Açıklamada spam veya iletişim amaçlı kelime kullanılamaz!');
      return;
    }
    if (containsBannedWords(formData.description)) {
      setError(t('errors.bannedWordDescription') || 'Açıklamada uygunsuz kelime kullanılamaz!');
      return;
    }
    
    if (!formData.price.trim()) {
      setError(t('errors.priceRequired') || 'Lütfen ücret bilgisi girin');
      return;
    }
    
    // instructorFrom validation removed
    
    
    try {
      setIsSubmitting(true);
      setError('');
      
      // Kullanıcı bilgisini kontrol et
      if (!user || !user.id) {
        setError(t('errors.userIdNotFound') || 'Kullanıcı kimliği bulunamadı. Lütfen tekrar giriş yapın.');
        setIsSubmitting(false);
        return;
      }
      
      // Token al
      const token = localStorage.getItem('token');
      if (!token) {
        setError(t('errors.sessionNotFound') || 'Oturum bilgisi bulunamadı. Lütfen tekrar giriş yapın.');
        setIsSubmitting(false);
        return;
      }
      
      console.log('Listing creation data:', {
        ...formData,
        userId: user.id
      });
      

      const response = await fetch('/api/ilanlar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          userId: user.id
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || t('errors.listingCreationError') || 'İlan oluşturulurken bir hata oluştu');
      }
      
      const data = await response.json();
      
      setSuccess(t('general.listingCreated') || 'İlanınız başarıyla oluşturuldu!');
      setFormData({
        title: '',
        description: '',
        price: '',
        method: 'online',
      });
      
      // İlan oluşturulduktan sonra ilanlarım sayfasına yönlendir
      setTimeout(() => {
        router.push('/ilanlarim?refresh=true');
      }, 1500);
      
    } catch (err: any) {
      console.error(t('logs.listingCreationError') || 'İlan oluşturulurken hata:', err);
      // Daha detaylı hata mesajı göster
      setError(err.message || t('errors.listingCreationErrorTryAgain') || 'İlan oluşturulurken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
      
      // Hata detaylarını konsola yazdır
      if (err.response) {
        try {
          const errorData = await err.response.json();
          console.error('API error details:', errorData);
        } catch (e) {
          console.error('Error parsing API error:', e);
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF5F0] pt-20">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center py-12">
            <div className="w-12 h-12 border-4 border-[#FFB996] border-t-[#FF8B5E] rounded-full animate-spin"></div>
            <p className="mt-4 text-[#6B3416]">{t('general.loading')}</p>
          </div>
        </div>
      </div>
    );
  }
  
  // Kullanıcı giriş yapmamış veya eğitmen değilse içeriği gösterme
  if (!user || user.role !== 'instructor' && user.role !== 'teacher') {
    return (
      <div className="min-h-screen bg-[#FFF5F0] pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-3xl font-bold text-[#6B3416] mb-4">{t('general.accessDenied')}</h1>
            <p className="text-[#994D1C] mb-6">{t('general.accessDeniedMessage')}</p>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-3 bg-gradient-to-r from-[#FFB996] to-[#FF8B5E] text-white font-medium rounded-lg"
            >
              {t('general.goToHomepage')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF5F0] pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-[#6B3416] mb-8">{t('general.createListingTitle')}</h1>
          
          {success ? (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-6">
              {success}
            </div>
          ) : null}
          
          {error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
              {error}
            </div>
          ) : null}
          
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-md">
            <div className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-[#6B3416] font-medium mb-2">
                  {t('general.listingTitle')}
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder={t('general.listingTitlePlaceholder')}
                  className="w-full px-4 py-2 border border-[#FFE5D9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFB996]"
                />
              </div>
              
              <div>
                <label htmlFor="description" className="block text-[#6B3416] font-medium mb-2">
                  {t('general.listingDescription')}
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder={t('general.listingDescriptionPlaceholder')}
                  className="w-full px-4 py-2 border border-[#FFE5D9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFB996] min-h-[150px]"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="price" className="block text-[#6B3416] font-medium mb-2">
                    {t('general.hourlyPrice')}
                  </label>
                  <input
                    type="text"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder={t('general.hourlyPricePlaceholder')}
                    className="w-full px-4 py-2 border border-[#FFE5D9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFB996]"
                  />
                </div>
                
                <div>
                  <label htmlFor="method" className="block text-[#6B3416] font-medium mb-2">
                    {t('general.lessonMethod')}
                  </label>
                  <select
                    id="method"
                    name="method"
                    value={formData.method}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-[#FFE5D9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFB996]"
                  >
                    <option value="online">{t('general.online')}</option>
                    <option value="yüzyüze">{t('general.faceToFace')}</option>
                    <option value="hibrit">{t('general.hybrid')}</option>
                  </select>
                </div>
                

                
                {/* instructorFrom field removed */}
              </div>
              
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full px-6 py-3 bg-gradient-to-r from-[#FFB996] to-[#FF8B5E] text-white font-medium rounded-lg flex items-center justify-center space-x-2 
                    transition-all duration-300 hover:shadow-lg hover:shadow-[#FFB996]/20 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-[#FF8B5E] rounded-full animate-spin"></div>
                      <span>{t('general.processing')}</span>
                    </>
                  ) : (
                    <>
                      <FaPaperPlane />
                      <span>{t('general.publishListing')}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 