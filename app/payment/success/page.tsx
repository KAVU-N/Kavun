'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from 'src/context/AuthContext';
import Link from 'next/link';

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div>Yükleniyor...</div>}>
      <PaymentSuccessContent />
    </Suspense>
  );
}

function PaymentSuccessContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const paymentId = searchParams?.get('paymentId');
  
  const [payment, setPayment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Kullanıcı giriş yapmamışsa login sayfasına yönlendir
    if (!user) {
      router.push('/auth/login');
      return;
    }

    // Ödeme ID'si yoksa ana sayfaya yönlendir
    if (!paymentId) {
      router.push('/');
      return;
    }

    // Ödeme detaylarını getir
    const fetchPaymentDetails = async () => {
      try {
        const response = await fetch(`/api/payments/${paymentId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setPayment(data);
        } else {
          setError('Ödeme bilgileri alınamadı');
        }
      } catch (error) {
        setError('Sunucu hatası');
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentDetails();
  }, [user, paymentId, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF8F2] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF8B5E]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF8F2] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-8">
        {error ? (
          <div className="text-center">
            <div className="bg-red-100 p-4 rounded-full inline-flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Hata</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link 
              href="/" 
              className="bg-gradient-to-r from-[#FF8B5E] to-[#FFB996] text-white font-semibold py-2 px-6 rounded-md hover:from-[#994D1C] hover:to-[#FF8B5E] transition-all duration-300 inline-block"
            >
              Ana Sayfaya Dön
            </Link>
          </div>
        ) : (
          <div className="text-center">
            <div className="bg-green-100 p-4 rounded-full inline-flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-[#994D1C] mb-2">Ödeme Başarılı!</h2>
            <p className="text-gray-600 mb-6">Ders ücretiniz başarıyla ödenmiştir. Ödeme işlemi tamamlandı.</p>
            
            {payment && (
              <div className="bg-[#FFF8F2] p-4 rounded-lg mb-6 text-left">
                <h3 className="font-semibold text-[#994D1C] mb-2">Ödeme Detayları</h3>
                <p className="text-sm"><span className="font-medium">Ödeme ID:</span> {payment._id}</p>
                {payment.lesson && (
                  <>
                    <p className="text-sm"><span className="font-medium">Ders:</span> {payment.lesson.title}</p>
                    <p className="text-sm"><span className="font-medium">Tarih:</span> {new Date(payment.lesson.scheduledAt).toLocaleString('tr-TR')}</p>
                  </>
                )}
                <p className="text-sm"><span className="font-medium">Tutar:</span> {payment.amount} TL</p>
                <p className="text-sm"><span className="font-medium">Durum:</span> Ödendi</p>
              </div>
            )}
            
            <div className="flex flex-col space-y-2">
              <Link 
                href="/derslerim" 
                className="bg-gradient-to-r from-[#FF8B5E] to-[#FFB996] text-white font-semibold py-2 px-6 rounded-md hover:from-[#994D1C] hover:to-[#FF8B5E] transition-all duration-300"
              >
                Derslerime Git
              </Link>
              <Link 
                href="/" 
                className="border border-[#FF8B5E] text-[#FF8B5E] font-semibold py-2 px-6 rounded-md hover:bg-[#FFF8F2] transition-all duration-300"
              >
                Ana Sayfaya Dön
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}