'use client';
export const dynamic = "force-dynamic";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import ReviewsList from '@/components/reviews/ReviewsList';
import StarRating from '@/components/reviews/StarRating';

export default function DegerlendirmelerimPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [ratingDistribution, setRatingDistribution] = useState<{[key: number]: number}>({
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0
  });

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    // Yalnızca eğitmenler için bu sayfaya erişim sağla
    if (user.role !== 'teacher') {
      router.push('/profil');
      return;
    }

    fetchReviewStats();
  }, [user, router]);

  const fetchReviewStats = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(`/api/reviews/stats`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAverageRating(data.averageRating || 0);
        setTotalReviews(data.totalReviews || 0);
        
        if (data.distribution) {
          setRatingDistribution(data.distribution);
        }
      }
    } catch (err) {
      console.error('Değerlendirme istatistikleri yüklenirken hata:', err);
    } finally {
      setLoading(false);
    }
  };

  // Değerlendirme dağılımı yüzdesini hesaplama
  const calculatePercentage = (count: number) => {
    if (totalReviews === 0) return 0;
    return Math.round((count / totalReviews) * 100);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-10 pt-24 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF8B5E]"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 pt-24">
      <h1 className="text-3xl font-bold text-[#994D1C] mb-8">Değerlendirmelerim</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sol Sütun - İstatistikler */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center mb-6">
              <h2 className="text-lg font-medium text-gray-600 mb-2">Ortalama Puanınız</h2>
              <div className="flex justify-center items-center">
                <span className="text-4xl font-bold text-[#994D1C] mr-2">
                  {averageRating.toFixed(1)}
                </span>
                <StarRating rating={Math.round(averageRating)} readonly size="lg" />
              </div>
              <p className="mt-2 text-gray-500">Toplam {totalReviews} değerlendirme</p>
            </div>
            
            <div className="mt-6">
              <h3 className="text-md font-medium text-gray-600 mb-4">Puan Dağılımı</h3>
              
              <div className="space-y-3">
                {[5, 4, 3, 2, 1].map((rating) => (
                  <div key={rating} className="flex items-center space-x-2">
                    <div className="flex items-center w-16">
                      <span className="text-sm font-medium text-gray-700">{rating}</span>
                      <svg className="h-4 w-4 text-[#FFB996] ml-1" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                      </svg>
                    </div>
                    
                    <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#FFB996] rounded-full"
                        style={{ width: `${calculatePercentage(ratingDistribution[rating] || 0)}%` }}
                      ></div>
                    </div>
                    
                    <div className="w-10 text-right">
                      <span className="text-sm text-gray-500">{calculatePercentage(ratingDistribution[rating] || 0)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-md font-medium text-gray-600 mb-2">Neler Öğrenebilirsiniz</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>Hangi konularda daha iyi olduğunuzu</li>
                <li>Öğrencilerinizin beklentilerini</li>
                <li>İyileştirmeniz gereken alanları</li>
                <li>Öğretim stilinizin etkinliğini</li>
              </ul>
              
              <p className="mt-4 text-sm text-gray-500">
                Değerlendirmeler size daha iyi bir eğitmen olmanız için geri bildirim sağlar. Düşük puanlar alıyorsanız, öğrencilerinizin yorumlarını dikkate alarak kendinizi geliştirebilirsiniz.
              </p>
            </div>
          </div>
        </div>
        
        {/* Sağ Sütun - Değerlendirmeler Listesi */}
        <div className="lg:col-span-2">
          {totalReviews > 0 ? (
            <ReviewsList teacherId={user?.id || ''} limit={10} showPagination={true} />
          ) : (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="w-20 h-20 mx-auto bg-[#FFE5D9] rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-[#FF8B5E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">Henüz değerlendirme yok</h3>
              <p className="text-gray-600 mb-6">
                Öğrencileriniz tamamlanan dersler sonrasında sizi değerlendirebilirler. Değerlendirmeler burada görünecektir.
              </p>
              <p className="text-sm text-gray-500">
                İpucu: Öğrencilerinize ders sonrası değerlendirme yapmalarını hatırlatabilirsiniz.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
