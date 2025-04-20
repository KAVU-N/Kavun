'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FaCalendarAlt, FaClock, FaMoneyBillWave, FaChalkboardTeacher, FaArrowLeft, FaCreditCard, FaCheckCircle } from 'react-icons/fa';
import { format, addDays, startOfDay, addHours, isBefore, isAfter, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';

interface Teacher {
  _id: string;
  name: string;
  email: string;
  university: string;
  expertise: string;
}

interface Ilan {
  _id: string;
  title: string;
  description: string;
  price: number;
  method: string;
  duration: number;
  frequency: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  teacher: Teacher;
}

export default function RandevuAlPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const ilanId = searchParams.get('ilanId');
  const teacherId = searchParams.get('teacherId');
  
  const [ilan, setIlan] = useState<Ilan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Randevu bilgileri
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [step, setStep] = useState(1); // 1: Tarih seçimi, 2: Saat seçimi, 3: Ödeme
  
  // Ödeme bilgileri
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchIlanDetay = async () => {
      if (!ilanId) return;
      
      try {
        setIsLoading(true);
        
        // API endpoint'e istek at
        const response = await fetch(`/api/ilanlar/${ilanId}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'İlan detayları getirilirken bir hata oluştu');
        }
        
        const data = await response.json();
        setIlan(data);
        setError('');
      } catch (err: any) {
        console.error('İlan detayları yüklenirken hata oluştu:', err);
        setError('İlan detayları yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
      } finally {
        setIsLoading(false);
      }
    };

    if (ilanId) {
      fetchIlanDetay();
    }
  }, [ilanId]);

  // Tarih seçildiğinde uygun saatleri getir
  useEffect(() => {
    if (selectedDate) {
      // Gerçek uygulamada API'den uygun saatleri alabilirsiniz
      // Burada örnek olarak 09:00 - 17:00 arası saatleri gösteriyoruz
      const times = [];
      const startHour = 9;
      const endHour = 17;
      
      for (let hour = startHour; hour <= endHour; hour++) {
        times.push(`${hour.toString().padStart(2, '0')}:00`);
      }
      
      setAvailableTimes(times);
    }
  }, [selectedDate]);

  // Sonraki adıma geç
  const handleNextStep = () => {
    if (step === 1 && selectedDate) {
      setStep(2);
    } else if (step === 2 && selectedTime) {
      setStep(3);
    }
  };

  // Önceki adıma dön
  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  // Ödeme işlemini gerçekleştir
  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDate || !selectedTime || !ilan) return;
    
    // Kart bilgilerini kontrol et
    if (!cardNumber || !cardName || !expiryDate || !cvv) {
      setPaymentError('Lütfen tüm kart bilgilerini doldurun.');
      return;
    }
    
    try {
      setIsProcessing(true);
      setPaymentError('');
      
      // Gerçek uygulamada ödeme API'sine istek atılır
      // Burada simüle ediyoruz
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Randevu oluşturma API'sine istek at
      const appointmentData = {
        ilanId: ilan._id,
        teacherId: ilan.teacher._id,
        studentId: user?.id,
        date: format(selectedDate, 'yyyy-MM-dd'),
        time: selectedTime,
        price: ilan.price,
        duration: ilan.duration,
        method: ilan.method,
        status: 'confirmed',
        paymentStatus: 'completed'
      };
      
      // Gerçek uygulamada API'ye istek atılır
      // const response = await fetch('/api/appointments', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${localStorage.getItem('token')}`
      //   },
      //   body: JSON.stringify(appointmentData)
      // });
      
      // if (!response.ok) {
      //   throw new Error('Randevu oluşturulurken bir hata oluştu');
      // }
      
      setPaymentSuccess(true);
    } catch (err: any) {
      console.error('Ödeme işlemi sırasında hata oluştu:', err);
      setPaymentError('Ödeme işlemi sırasında bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Kredi kartı numarasını formatlı göster
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  // Son kullanma tarihini formatlı göster
  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    
    if (v.length >= 3) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }
    
    return value;
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-white pt-20">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center py-12">
            <div className="w-12 h-12 border-4 border-[#FFB996] border-t-[#FF8B5E] rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <button 
              onClick={() => router.back()} 
              className="flex items-center text-[#994D1C] hover:text-[#6B3416] mb-4 transition-colors"
            >
              <FaArrowLeft className="mr-2" />
              <span>Geri Dön</span>
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-[#FFB996] to-[#FF8B5E] p-6 text-white">
              <h1 className="text-3xl font-bold mb-3">Randevu Al</h1>
              <p className="text-white/80">
                {ilan ? ilan.title : 'Ders için randevu oluşturun'}
              </p>
            </div>
            
            {isLoading ? (
              <div className="p-8 flex justify-center">
                <div className="w-12 h-12 border-4 border-[#FFB996] border-t-[#FF8B5E] rounded-full animate-spin"></div>
              </div>
            ) : error ? (
              <div className="p-8 text-center">
                <p className="text-red-500 mb-4">{error}</p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                >
                  Yeniden Dene
                </button>
              </div>
            ) : !ilan ? (
              <div className="p-8 text-center">
                <p className="text-[#994D1C] mb-4">İlan bulunamadı.</p>
                <Link 
                  href="/ilanlar"
                  className="px-4 py-2 bg-gradient-to-r from-[#FFB996] to-[#FF8B5E] text-white rounded-lg hover:shadow-md transition-all"
                >
                  İlanlara Dön
                </Link>
              </div>
            ) : (
              <div className="p-6">
                {/* Adım göstergesi */}
                <div className="mb-8">
                  <div className="flex items-center justify-between">
                    <div className={`flex flex-col items-center ${step >= 1 ? 'text-[#FF8B5E]' : 'text-gray-400'}`}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${step >= 1 ? 'bg-[#FF8B5E] text-white' : 'bg-gray-200'}`}>
                        <FaCalendarAlt />
                      </div>
                      <span className="text-sm">Tarih Seç</span>
                    </div>
                    <div className="flex-1 h-1 mx-4 bg-gray-200">
                      <div className={`h-full bg-[#FF8B5E] transition-all ${step >= 2 ? 'w-full' : 'w-0'}`}></div>
                    </div>
                    <div className={`flex flex-col items-center ${step >= 2 ? 'text-[#FF8B5E]' : 'text-gray-400'}`}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${step >= 2 ? 'bg-[#FF8B5E] text-white' : 'bg-gray-200'}`}>
                        <FaClock />
                      </div>
                      <span className="text-sm">Saat Seç</span>
                    </div>
                    <div className="flex-1 h-1 mx-4 bg-gray-200">
                      <div className={`h-full bg-[#FF8B5E] transition-all ${step >= 3 ? 'w-full' : 'w-0'}`}></div>
                    </div>
                    <div className={`flex flex-col items-center ${step >= 3 ? 'text-[#FF8B5E]' : 'text-gray-400'}`}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${step >= 3 ? 'bg-[#FF8B5E] text-white' : 'bg-gray-200'}`}>
                        <FaMoneyBillWave />
                      </div>
                      <span className="text-sm">Ödeme</span>
                    </div>
                  </div>
                </div>

                {/* Ders bilgileri özeti */}
                <div className="bg-[#FFF9F5] p-4 rounded-lg mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center">
                      <FaChalkboardTeacher className="text-[#FF8B5E] mr-2" />
                      <div>
                        <p className="text-sm text-gray-500">Eğitmen</p>
                        <p className="font-medium">{ilan.teacher.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <FaClock className="text-[#FF8B5E] mr-2" />
                      <div>
                        <p className="text-sm text-gray-500">Süre</p>
                        <p className="font-medium">{ilan.duration} Saat</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <FaMoneyBillWave className="text-[#FF8B5E] mr-2" />
                      <div>
                        <p className="text-sm text-gray-500">Ücret</p>
                        <p className="font-medium">{ilan.price} ₺</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Adım 1: Tarih Seçimi */}
                {step === 1 && (
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-[#6B3416] mb-4">Tarih Seçin</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-6">
                      {Array.from({ length: 14 }).map((_, index) => {
                        const date = addDays(startOfDay(new Date()), index + 1);
                        const isSelected = selectedDate && 
                          selectedDate.getDate() === date.getDate() && 
                          selectedDate.getMonth() === date.getMonth() && 
                          selectedDate.getFullYear() === date.getFullYear();
                        
                        return (
                          <button
                            key={index}
                            onClick={() => setSelectedDate(date)}
                            className={`p-3 rounded-lg text-center transition-all ${
                              isSelected 
                                ? 'bg-[#FF8B5E] text-white shadow-md' 
                                : 'bg-gray-100 hover:bg-[#FFE5D9] text-gray-700'
                            }`}
                          >
                            <p className="text-sm font-medium">{format(date, 'EEEE', { locale: tr })}</p>
                            <p className="text-lg font-bold">{format(date, 'd', { locale: tr })}</p>
                            <p className="text-xs">{format(date, 'MMMM', { locale: tr })}</p>
                          </button>
                        );
                      })}
                    </div>
                    <div className="flex justify-end">
                      <button
                        onClick={handleNextStep}
                        disabled={!selectedDate}
                        className={`px-6 py-3 rounded-lg font-medium ${
                          selectedDate 
                            ? 'bg-gradient-to-r from-[#FFB996] to-[#FF8B5E] text-white hover:shadow-md' 
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        Devam Et
                      </button>
                    </div>
                  </div>
                )}

                {/* Adım 2: Saat Seçimi */}
                {step === 2 && (
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-[#6B3416] mb-4">Saat Seçin</h2>
                    <p className="text-gray-600 mb-4">
                      {selectedDate && format(selectedDate, 'd MMMM EEEE', { locale: tr })} tarihi için uygun saatler:
                    </p>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 mb-6">
                      {availableTimes.map((time, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedTime(time)}
                          className={`p-3 rounded-lg text-center transition-all ${
                            selectedTime === time 
                              ? 'bg-[#FF8B5E] text-white shadow-md' 
                              : 'bg-gray-100 hover:bg-[#FFE5D9] text-gray-700'
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                    <div className="flex justify-between">
                      <button
                        onClick={handlePrevStep}
                        className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200"
                      >
                        Geri
                      </button>
                      <button
                        onClick={handleNextStep}
                        disabled={!selectedTime}
                        className={`px-6 py-3 rounded-lg font-medium ${
                          selectedTime 
                            ? 'bg-gradient-to-r from-[#FFB996] to-[#FF8B5E] text-white hover:shadow-md' 
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        Devam Et
                      </button>
                    </div>
                  </div>
                )}

                {/* Adım 3: Ödeme */}
                {step === 3 && (
                  <div className="mb-6">
                    {paymentSuccess ? (
                      <div className="text-center py-8">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <FaCheckCircle className="text-green-500 text-4xl" />
                        </div>
                        <h2 className="text-2xl font-bold text-[#6B3416] mb-2">Ödeme Başarılı</h2>
                        <p className="text-gray-600 mb-6">
                          Randevunuz başarıyla oluşturuldu. Randevu detaylarınız e-posta adresinize gönderildi.
                        </p>
                        <div className="bg-[#FFF9F5] p-4 rounded-lg mb-6 max-w-md mx-auto">
                          <h3 className="font-medium text-[#6B3416] mb-2">Randevu Bilgileri</h3>
                          <div className="grid grid-cols-2 gap-2 text-left">
                            <p className="text-gray-500">Tarih:</p>
                            <p className="font-medium">{selectedDate && format(selectedDate, 'd MMMM yyyy', { locale: tr })}</p>
                            <p className="text-gray-500">Saat:</p>
                            <p className="font-medium">{selectedTime}</p>
                            <p className="text-gray-500">Eğitmen:</p>
                            <p className="font-medium">{ilan.teacher.name}</p>
                            <p className="text-gray-500">Ders:</p>
                            <p className="font-medium">{ilan.title}</p>
                            <p className="text-gray-500">Ücret:</p>
                            <p className="font-medium">{ilan.price} ₺</p>
                          </div>
                        </div>
                        <div className="flex justify-center gap-4">
                          <Link 
                            href="/ilanlar"
                            className="px-6 py-3 bg-[#FFE5D9] text-[#6B3416] rounded-lg hover:bg-[#FFDAC1] transition-colors"
                          >
                            İlanlara Dön
                          </Link>
                          <Link 
                            href="/derslerim"
                            className="px-6 py-3 bg-gradient-to-r from-[#FFB996] to-[#FF8B5E] text-white rounded-lg hover:shadow-md transition-all"
                          >
                            Derslerime Git
                          </Link>
                        </div>
                      </div>
                    ) : (
                      <>
                        <h2 className="text-xl font-bold text-[#6B3416] mb-4">Ödeme Bilgileri</h2>
                        <div className="bg-[#FFF9F5] p-4 rounded-lg mb-6">
                          <h3 className="font-medium text-[#6B3416] mb-2">Randevu Özeti</h3>
                          <div className="grid grid-cols-2 gap-2">
                            <p className="text-gray-500">Tarih:</p>
                            <p className="font-medium">{selectedDate && format(selectedDate, 'd MMMM yyyy', { locale: tr })}</p>
                            <p className="text-gray-500">Saat:</p>
                            <p className="font-medium">{selectedTime}</p>
                            <p className="text-gray-500">Eğitmen:</p>
                            <p className="font-medium">{ilan.teacher.name}</p>
                            <p className="text-gray-500">Ders:</p>
                            <p className="font-medium">{ilan.title}</p>
                            <p className="text-gray-500">Toplam Tutar:</p>
                            <p className="font-bold text-[#FF8B5E]">{ilan.price} ₺</p>
                          </div>
                        </div>
                        
                        <form onSubmit={handlePayment} className="mb-6">
                          <div className="mb-4">
                            <label htmlFor="cardNumber" className="block text-gray-700 mb-2">Kart Numarası</label>
                            <div className="relative">
                              <FaCreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                              <input
                                type="text"
                                id="cardNumber"
                                value={cardNumber}
                                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                                placeholder="1234 5678 9012 3456"
                                maxLength={19}
                                className="w-full px-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFB996]"
                                required
                              />
                            </div>
                          </div>
                          
                          <div className="mb-4">
                            <label htmlFor="cardName" className="block text-gray-700 mb-2">Kart Üzerindeki İsim</label>
                            <input
                              type="text"
                              id="cardName"
                              value={cardName}
                              onChange={(e) => setCardName(e.target.value)}
                              placeholder="AD SOYAD"
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFB996]"
                              required
                            />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                              <label htmlFor="expiryDate" className="block text-gray-700 mb-2">Son Kullanma Tarihi</label>
                              <input
                                type="text"
                                id="expiryDate"
                                value={expiryDate}
                                onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
                                placeholder="AA/YY"
                                maxLength={5}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFB996]"
                                required
                              />
                            </div>
                            <div>
                              <label htmlFor="cvv" className="block text-gray-700 mb-2">CVV</label>
                              <input
                                type="text"
                                id="cvv"
                                value={cvv}
                                onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                                placeholder="123"
                                maxLength={3}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFB996]"
                                required
                              />
                            </div>
                          </div>
                          
                          {paymentError && (
                            <div className="mb-4 p-3 bg-red-100 text-red-600 rounded-lg">
                              {paymentError}
                            </div>
                          )}
                          
                          <div className="flex justify-between">
                            <button
                              type="button"
                              onClick={handlePrevStep}
                              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200"
                              disabled={isProcessing}
                            >
                              Geri
                            </button>
                            <button
                              type="submit"
                              disabled={isProcessing}
                              className={`px-6 py-3 rounded-lg font-medium ${
                                isProcessing 
                                  ? 'bg-gray-400 text-white cursor-not-allowed' 
                                  : 'bg-gradient-to-r from-[#FFB996] to-[#FF8B5E] text-white hover:shadow-md'
                              }`}
                            >
                              {isProcessing ? 'İşleniyor...' : 'Ödeme Yap'}
                            </button>
                          </div>
                        </form>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
