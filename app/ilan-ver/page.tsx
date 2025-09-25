'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/src/context/AuthContext';
import { useRouter } from 'next/navigation';
import { FaPaperPlane } from 'react-icons/fa';
import { useLanguage } from '@/src/contexts/LanguageContext';
import Link from 'next/link';

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

  // 1) useEffect bloğunu sadeleştirin
useEffect(() => {
  if (!loading && !user) {
    router.push('/auth/login');
  }
}, [user, loading, router]);

// 2) Rol kontrolü yapan return bloğunu giriş kontrolüyle değiştirin
if (!user) {
  return null;
}

  if (loading) {
    return <div className="flex justify-center items-center h-96 text-xl">Yükleniyor...</div>;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Yasaklı kelimeler listesi
  // +18 ve uygunsuz kelimeler, spam ve anlamsız içerikler dahil
  const bannedWords = [
    // Küfür ve argo
    "amk", "aq", "orospu", "piç", "sik", "sikerim", "siktir", "yarrak", "ananı", "anan",
    "babanı", "baban", "göt", "got", "götveren", "pezevenk", "kahpe", "ibne", "ibneyim", "ibneler",
    "ibnelik", "döl", "bok", "boktan", "boklu", "sikik", "sikilmiş", "amına", "koyayım", "koydum",
    "koyarım", "kodum", "koduğum", "koyduğum", "koyduklarım", "siktiğim", "siktiğimin", "siktiğiminin",
    "siktirgit", "siktir ol", "siktir et", "siktirip", "siktiriboktan", "siktirola", "siktiribok",
    "amcık", "amcıklar", "amcığa", "amcığı", "amcığın", "amcığım", "amcığına", "amcığından",
    "amcığını", "amcığınına", "yarrağımı", "yarrağımın", "yarrağımda", "yarrağımdan",
    "yarrağımla", "yarrağımsı", "yarrağımsın", "yarrağımsına", "yarrağımsınız", "yarrağımsınlar",
    "götlek", "götleğim", "götleğin", "götleği", "götleğine", "götleğimi", "götleğimin", "götleğimde",
    "götleğimden", "götleğimle", "götleğimsi", "götleğimsin", "götleğimsi", "götleğimsiniz", "götleğimsinler",
    "pezevenk", "pezevengim", "pezevengin", "pezevengi", "pezevengine", "pezevengimi", "pezevengimin", "pezevengimde",
    "pezevengimden", "pezevengimle", "pezevengimsi", "pezevengimsin", "pezevengimsi", "pezevengimsiniz", "pezevengimsinler",
    "kaltak", "kaltaklık", "kaltaklar", "kaltaklığı", "kaltaklığa", "kaltaklıkta", "kaltaklıktan", "kaltaklıkla", "kaltaklıksı", "kaltaklıksın", "kaltaklıksınız", "kaltaklıklar",
    "sikik", "sikiklik", "sikikler", "sikikliği", "sikikliğe", "siklikte", "siklikten", "siklikle", "sikliksi", "sikliksin", "sikliksiniz", "siklikler", "siklikleri", "sikliklere",
    // +18, müstehcen
    "porn", "porno", "pornografi", "seks", "sex", "seksüel", "erotik", "mastürb", "masturb", "vajina", "penis", "göğüs", "memeler", "anal", "dildo", "vajinal", "vajin", "vajina", "vajinismus", "vajinal",
    "fetish", "fetis", "fetishist", "fetisist", "fetiş", "fetişist", "fetişizm", "fetişistlik", "fetişizmci", "fetişistlik",
    // Rastgele, anlamsız, spam
    "asdasd", "qweqwe", "qwerty", "asdfgh", "lorem", "ipsum", "test", "deneme", "123456", "654321", "111111", "222222", "333333", "abcdef", "ghijkl", "zxczxc", "xcvbnm"
  ];

  // Anlamsız içerik tespiti fonksiyonu (tekil ve globalde tanımlı)
  function isNonsense(text: string) {
    const patterns = [
      /^(a{3,}|s{3,}|d{3,}|w{3,}|q{3,}|z{3,}|x{3,}|c{3,}|v{3,}|b{3,}|n{3,}|m{3,})$/i,
      /^(123456|654321|111111|222222|333333|abcdef|ghijkl|zxczxc|xcvbnm)$/i,
      /^(asdasd|qweqwe|qwerty|asdfgh|lorem|ipsum|test|deneme)$/i
    ];
    return patterns.some(re => re.test(text.trim().toLowerCase()));
  }

  function containsBannedWords(text: string) {
    const lower = text.toLocaleLowerCase('tr');
    return bannedWords.some(word => lower.includes(word));
  }

  function hasRepeatedChars(text: string, count = 3) {
    // aaa, !!!, ??? gibi tekrarları engelle
    const regex = new RegExp(`(.)\\1{${count-1},}`);
    return regex.test(text);
  }

  function isAllUpperCase(text: string) {
    return text.length > 2 && text === text.toLocaleUpperCase('tr');
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      setError(t('errors.titleRequired') || 'Lütfen bir başlık girin');
      return;
    }
    if (isNonsense(formData.title)) {
      setError('Başlıkta anlamsız veya rastgele karakter dizisi kullanılamaz!');
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
    if (containsBannedWords(formData.title)) {
      setError(t('errors.bannedWordTitle') || 'Başlıkta uygunsuz kelime kullanılamaz!');
      return;
    }

    if (!formData.description.trim()) {
      setError(t('errors.descriptionRequired') || 'Lütfen bir açıklama girin');
      return;
    }
    if (isNonsense(formData.description)) {
      setError('Açıklamada anlamsız veya rastgele karakter dizisi kullanılamaz!');
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
    if (containsBannedWords(formData.description)) {
      setError(t('errors.bannedWordDescription') || 'Açıklamada uygunsuz kelime kullanılamaz!');
      return;
    }

    if (!formData.price.trim()) {
      setError(t('errors.priceRequired') || 'Lütfen ücret bilgisi girin');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      // Kullanıcı bilgisini kontrol et
      if (!user || !user.id) {
        setError(t('errors.userIdNotFound') || 'Kullanıcı kimliği bulunamadı. Lütfen tekrar giriş yapın.');
        setIsSubmitting(false);
        return;
      }
      
      // Token al (localStorage ya da cookie üzerinden)
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      // Eğer localStorage'da yoksa sorun değil; sunucu tarafı çerezden okuyabilir
      
      console.log('Listing creation data:', {
        ...formData,
        userId: user.id
      });
      

      const response = await fetch('/api/ilanlar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        credentials: 'include', // çerezdeki JWT gönderilsin
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
      setError(err.message || t('errors.listingCreationErrorTryAgain') || 'İlan oluşturulurken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
    } finally {
      setIsSubmitting(false);
    }
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
          
          <div className="relative">
            <Link
              href="/ilanlar"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[#994D1C]/30 text-[#994D1C] bg-white/80 backdrop-blur-sm shadow-sm hover:bg-white hover:shadow-md hover:border-[#6B3416]/40 transition-all duration-300 absolute top-0 -left-3 -translate-x-full"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="font-medium">Geri Dön</span>
            </Link>
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
    </div>
  );
}