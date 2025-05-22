'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

interface Instructor {
  _id: string;
  name: string;
  email: string;
  university?: string;
  price?: number;
  role: string;
}

interface LessonFormData {
  date: string;
  time: string;
  duration: number;
  notes: string;
}

export default function CreateLessonPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const instructorId = searchParams?.get('instructorId');
  
  const [instructor, setInstructor] = useState<Instructor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(1); // 1: Tarih/Saat Seçimi, 2: Ödeme
  const [formData, setFormData] = useState<LessonFormData>({
    date: '',
    time: '',
    duration: 60,
    notes: '',
  });
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Eğitmen bilgilerini getir
  useEffect(() => {
    if (!instructorId) {
      setError('Eğitmen bilgisi bulunamadı');
      setLoading(false);
      return;
    }

    const fetchInstructor = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/auth/login');
          return;
        }

        const response = await fetch(`/api/users/${instructorId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Eğitmen bilgileri alınamadı');
        }

        const data = await response.json();
        setInstructor(data);
      } catch (err) {
        setError('Eğitmen bilgileri yüklenirken bir hata oluştu');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchInstructor();
  }, [instructorId, router]);

  // Form verilerini güncelle
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Ders oluştur
  const createLesson = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const lessonData = {
        teacherId: instructorId,
        date: `${formData.date}T${formData.time}:00`,
        duration: formData.duration,
        notes: formData.notes,
        status: 'scheduled'
      };

      const response = await fetch('/api/lessons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(lessonData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ders oluşturulurken bir hata oluştu');
      }

      // Başarılı ise
      setPaymentSuccess(true);
      
      // 3 saniye sonra derslerim sayfasına yönlendir
      setTimeout(() => {
        router.push('/derslerim');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Ders oluşturulurken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // Ödeme işlemini simüle et ve ders oluştur
  const handlePayment = () => {
    // Burada gerçek ödeme entegrasyonu olacak
    // Şimdilik sadece ders oluşturuyoruz
    createLesson();
  };

  // Bir sonraki adıma geç
  const nextStep = () => {
    if (formData.date && formData.time) {
      setStep(2);
    } else {
      setError('Lütfen tarih ve saat seçin');
    }
  };

  // Önceki adıma dön
  const prevStep = () => {
    setStep(1);
    setError(null);
  };

  if (!user) {
    return (
      <div className="min-h-screen pt-24 px-4 flex flex-col items-center justify-center bg-[#FFF9F5]">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#994D1C] mb-4">Ders oluşturmak için giriş yapmalısınız</h1>
          <Link href="/auth/login" className="inline-block px-6 py-2 rounded-xl bg-gradient-to-r from-[#FFB996] to-[#FF8B5E] text-white font-medium transition-all duration-300 hover:shadow-lg hover:shadow-[#FFB996]/20 hover:scale-105">
            Giriş Yap
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF9F5] pt-24 pb-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-[#994D1C] mb-8">Ders Oluştur</h1>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF8B5E]"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <p>{error}</p>
          </div>
        ) : paymentSuccess ? (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6 text-center">
            <p className="font-bold mb-2">Ders başarıyla oluşturuldu!</p>
            <p>Derslerim sayfasına yönlendiriliyorsunuz...</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            {/* İlerleme Çubuğu */}
            <div className="bg-[#FFE5D9] p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-[#FF8B5E] text-white' : 'bg-gray-200 text-gray-500'}`}>
                    1
                  </div>
                  <div className={`h-1 w-16 mx-2 ${step >= 2 ? 'bg-[#FF8B5E]' : 'bg-gray-200'}`}></div>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-[#FF8B5E] text-white' : 'bg-gray-200 text-gray-500'}`}>
                    2
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  {step === 1 ? 'Ders Detayları' : 'Ödeme'}
                </div>
              </div>
            </div>
            
            {/* Eğitmen Bilgileri */}
            {instructor && (
              <div className="p-6 border-b border-[#FFE5D9]">
                <h2 className="text-xl font-semibold text-[#994D1C] mb-4">Eğitmen Bilgileri</h2>
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#FFB996] to-[#FF8B5E] flex items-center justify-center mr-4">
                    <span className="text-white font-bold">{instructor.name.charAt(0)}</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{instructor.name}</h3>
                    <p className="text-sm text-gray-600">{instructor.university || 'Üniversite bilgisi yok'}</p>
                    <p className="text-sm font-medium text-[#FF8B5E] mt-1">
                      {instructor.price ? `${instructor.price} ₺ / saat` : 'Fiyat bilgisi yok'}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Adım 1: Ders Detayları */}
            {step === 1 && (
              <div className="p-6">
                <h2 className="text-xl font-semibold text-[#994D1C] mb-4">Ders Detayları</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="date">
                      Tarih
                    </label>
                    <input
                      type="date"
                      id="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF8B5E] focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="time">
                      Saat
                    </label>
                    <input
                      type="time"
                      id="time"
                      name="time"
                      value={formData.time}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF8B5E] focus:border-transparent"
                      required
                    />
                  </div>
                </div>
                
                <div className="mb-6">
                  <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="duration">
                    Süre (dakika)
                  </label>
                  <select
                    id="duration"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF8B5E] focus:border-transparent"
                  >
                    <option value={30}>30 dakika</option>
                    <option value={60}>1 saat</option>
                    <option value={90}>1.5 saat</option>
                    <option value={120}>2 saat</option>
                  </select>
                </div>
                
                <div className="mb-6">
                  <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="notes">
                    Notlar (İsteğe bağlı)
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={4}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF8B5E] focus:border-transparent"
                    placeholder="Eğitmene iletmek istediğiniz notlar..."
                  ></textarea>
                </div>
                
                <div className="flex justify-end">
                  <button
                    onClick={nextStep}
                    className="px-6 py-3 bg-gradient-to-r from-[#FFB996] to-[#FF8B5E] text-white font-medium rounded-lg hover:opacity-90 transition-opacity"
                  >
                    Devam Et
                  </button>
                </div>
              </div>
            )}
            
            {/* Adım 2: Ödeme */}
            {step === 2 && (
              <div className="p-6">
                <h2 className="text-xl font-semibold text-[#994D1C] mb-4">Ödeme Bilgileri</h2>
                
                <div className="bg-[#FFFBF8] p-4 rounded-lg mb-6">
                  <h3 className="font-medium text-gray-900 mb-2">Ders Özeti</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-gray-600">Tarih:</div>
                    <div className="font-medium">{new Date(formData.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                    
                    <div className="text-gray-600">Saat:</div>
                    <div className="font-medium">{formData.time}</div>
                    
                    <div className="text-gray-600">Süre:</div>
                    <div className="font-medium">{formData.duration} dakika</div>
                    
                    <div className="text-gray-600">Eğitmen:</div>
                    <div className="font-medium">{instructor?.name}</div>
                    
                    <div className="text-gray-600 mt-4">Toplam Tutar:</div>
                    <div className="font-bold text-[#FF8B5E] mt-4">
                      {instructor?.price ? `${(instructor.price * (formData.duration / 60)).toFixed(2)} ₺` : 'Fiyat bilgisi yok'}
                    </div>
                  </div>
                </div>
                
                {/* Ödeme Formu */}
                <div className="mb-6">
                  <h3 className="font-medium text-gray-900 mb-4">Kart Bilgileri</h3>
                  
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="cardNumber">
                      Kart Numarası
                    </label>
                    <input
                      type="text"
                      id="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF8B5E] focus:border-transparent"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="expiry">
                        Son Kullanma Tarihi
                      </label>
                      <input
                        type="text"
                        id="expiry"
                        placeholder="MM/YY"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF8B5E] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="cvv">
                        CVV
                      </label>
                      <input
                        type="text"
                        id="cvv"
                        placeholder="123"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF8B5E] focus:border-transparent"
                      />
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="nameOnCard">
                      Kart Üzerindeki İsim
                    </label>
                    <input
                      type="text"
                      id="nameOnCard"
                      placeholder="Ad Soyad"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF8B5E] focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <button
                    onClick={prevStep}
                    className="px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Geri
                  </button>
                  <button
                    onClick={handlePayment}
                    className="px-6 py-3 bg-gradient-to-r from-[#FFB996] to-[#FF8B5E] text-white font-medium rounded-lg hover:opacity-90 transition-opacity"
                  >
                    Ödeme Yap ve Dersi Oluştur
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
