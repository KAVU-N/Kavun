'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { FaPaperPlane } from 'react-icons/fa';

export default function IlanVerPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    method: 'online', // 'online', 'yüzyüze' veya 'hibrit'
    duration: '',
    frequency: 'weekly', // 'daily', 'weekly', 'monthly', 'flexible'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    } else if (!loading && user && user.role !== 'teacher') {
      router.push('/');
    }
  }, [user, loading, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError('Lütfen bir başlık girin');
      return;
    }
    
    if (!formData.description.trim()) {
      setError('Lütfen bir açıklama girin');
      return;
    }
    
    if (!formData.price.trim()) {
      setError('Lütfen ücret bilgisi girin');
      return;
    }
    
    if (!formData.duration.trim()) {
      setError('Lütfen süre bilgisi girin');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError('');
      
      // Kullanıcı bilgisini kontrol et
      if (!user || !user.id) {
        setError('Kullanıcı kimliği bulunamadı. Lütfen tekrar giriş yapın.');
        setIsSubmitting(false);
        return;
      }
      
      // Token al
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Oturum bilgisi bulunamadı. Lütfen tekrar giriş yapın.');
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
        throw new Error(errorData.error || 'İlan oluşturulurken bir hata oluştu');
      }
      
      const data = await response.json();
      
      setSuccess('İlanınız başarıyla oluşturuldu!');
      setFormData({
        title: '',
        description: '',
        price: '',
        method: 'online',
        duration: '',
        frequency: 'weekly',
      });
      
      // İlan oluşturulduktan sonra ilanlarım sayfasına yönlendir
      setTimeout(() => {
        router.push('/ilanlarim?refresh=true');
      }, 1500);
      
    } catch (err: any) {
      console.error('İlan oluşturulurken hata:', err);
      // Daha detaylı hata mesajı göster
      setError(err.message || 'İlan oluşturulurken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
      
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

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#FFF5F0] pt-20">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center py-12">
            <div className="w-12 h-12 border-4 border-[#FFB996] border-t-[#FF8B5E] rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  if (user && user.role !== 'teacher') {
    return null; // Yönlendirme yapıldığı için render etmeye gerek yok
  }

  return (
    <div className="min-h-screen bg-[#FFF5F0] pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-[#6B3416] mb-8">Yeni İlan Oluştur</h1>
          
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
                  İlan Başlığı
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Örn: Python Programlama Dersi"
                  className="w-full px-4 py-2 border border-[#FFE5D9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFB996]"
                />
              </div>
              
              <div>
                <label htmlFor="description" className="block text-[#6B3416] font-medium mb-2">
                  Detaylı Açıklama
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Ders içeriği ve kendiniz hakkında bilgi verin..."
                  className="w-full px-4 py-2 border border-[#FFE5D9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFB996] min-h-[150px]"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="price" className="block text-[#6B3416] font-medium mb-2">
                    Ders Ücreti (₺/Saat)
                  </label>
                  <input
                    type="text"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="Örn: 150"
                    className="w-full px-4 py-2 border border-[#FFE5D9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFB996]"
                  />
                </div>
                
                <div>
                  <label htmlFor="method" className="block text-[#6B3416] font-medium mb-2">
                    Ders Yöntemi
                  </label>
                  <select
                    id="method"
                    name="method"
                    value={formData.method}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-[#FFE5D9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFB996]"
                  >
                    <option value="online">Online</option>
                    <option value="yüzyüze">Yüz Yüze</option>
                    <option value="hibrit">Hibrit (Online + Yüz Yüze)</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="duration" className="block text-[#6B3416] font-medium mb-2">
                    Ders Süresi (Saat)
                  </label>
                  <input
                    type="text"
                    id="duration"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    placeholder="Örn: 1.5"
                    className="w-full px-4 py-2 border border-[#FFE5D9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFB996]"
                  />
                </div>
                
                <div>
                  <label htmlFor="frequency" className="block text-[#6B3416] font-medium mb-2">
                    Ders Sıklığı
                  </label>
                  <select
                    id="frequency"
                    name="frequency"
                    value={formData.frequency}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-[#FFE5D9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFB996]"
                  >
                    <option value="daily">Günlük</option>
                    <option value="weekly">Haftalık</option>
                    <option value="monthly">Aylık</option>
                    <option value="flexible">Esnek</option>
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
                      <span>İşleniyor...</span>
                    </>
                  ) : (
                    <>
                      <FaPaperPlane />
                      <span>İlanı Yayınla</span>
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