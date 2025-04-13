'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ProfileEditPage() {
  const { user, loading, setUser } = useAuth();
  const router = useRouter();
  
  const [expertise, setExpertise] = useState('');
  const [grade, setGrade] = useState<number | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
      return;
    }
    
    if (user) {
      // Mevcut kullanıcı bilgilerini form alanlarına doldur
      setExpertise(user.expertise || '');
      setGrade(user.grade);
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('Kullanıcı bilgisi bulunamadı');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError('');
      setSuccess('');
      
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Oturum bilgisi bulunamadı');
        return;
      }
      
      const response = await fetch('/api/auth/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: user.id,
          expertise,
          grade: grade === undefined ? undefined : Number(grade)
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Profil güncellenirken bir hata oluştu');
      }
      
      // Kullanıcı bilgilerini güncelle
      setUser(data.user);
      
      // LocalStorage'daki kullanıcı bilgilerini güncelle
      localStorage.setItem('user', JSON.stringify(data.user));
      
      setSuccess('Profil bilgileriniz başarıyla güncellendi');
      
      // 2 saniye sonra profil sayfasına yönlendir
      setTimeout(() => {
        router.push('/profil');
      }, 2000);
      
    } catch (err: any) {
      console.error('Profil güncelleme hatası:', err);
      setError(err.message || 'Profil güncellenirken bir hata oluştu');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF5F0] pt-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-[#FFE5D9]">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FFB996]"></div>
              <span className="ml-3 text-[#994D1C]">Yükleniyor...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#FFF5F0] pt-20">
      <div className="max-w-4xl mx-auto px-6">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-[#FFE5D9]">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-[#6B3416]">Profil Düzenle</h1>
            <Link 
              href="/profil" 
              className="px-4 py-2 bg-gray-100 text-[#6B3416] rounded-lg hover:bg-gray-200 transition-colors"
            >
              Vazgeç
            </Link>
          </div>
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-600 rounded-lg">
              {success}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="expertise" className="block text-sm font-medium text-[#6B3416] mb-1">
                Okuduğu Bölüm
              </label>
              <input
                id="expertise"
                type="text"
                value={expertise}
                onChange={(e) => setExpertise(e.target.value)}
                placeholder="Örn: Bilgisayar Mühendisliği, Psikoloji, Tıp..."
                className="block w-full rounded-md border-[#FFB996] shadow-sm focus:border-[#FF8B5E] focus:ring focus:ring-[#FF8B5E] focus:ring-opacity-50 px-3 py-1.5"
              />
            </div>
            
            <div>
              <label htmlFor="grade" className="block text-sm font-medium text-[#6B3416] mb-1">
                Kaçıncı Sınıf
              </label>
              <select
                id="grade"
                value={grade === undefined ? '' : grade}
                onChange={(e) => setGrade(e.target.value ? Number(e.target.value) : undefined)}
                className="block w-full rounded-md border-[#FFB996] shadow-sm focus:border-[#FF8B5E] focus:ring focus:ring-[#FF8B5E] focus:ring-opacity-50 px-3 py-1.5 appearance-none bg-white"
              >
                <option value="">Seçiniz</option>
                <option value="1">1. Sınıf</option>
                <option value="2">2. Sınıf</option>
                <option value="3">3. Sınıf</option>
                <option value="4">4. Sınıf</option>
                <option value="5">5. Sınıf</option>
                <option value="6">6. Sınıf</option>
                <option value="0">Mezun</option>
              </select>
            </div>
            
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#FF9B6A] text-white font-semibold py-2 px-4 rounded-md hover:bg-[#FF8B5E] transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50"
              >
                {isSubmitting ? 'Güncelleniyor...' : 'Profili Güncelle'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
