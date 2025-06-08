'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FaCalendarAlt, FaClock, FaMoneyBillWave, FaChalkboardTeacher, FaArrowLeft, FaCreditCard, FaCheckCircle } from 'react-icons/fa';
import { format, addDays, startOfDay, addHours, isBefore, isAfter, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useLanguage } from '@/src/contexts/LanguageContext';

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
  lessonId: string;
}

export default function RandevuAlPage() {
  // Get language context
  const { language } = useLanguage();
  // Content based on language
  const content = {
    tr: {
      title: 'Çok Yakında',
      description: 'Randevu alma sistemi çok yakında hizmetinizde olacak.',
      buttonText: 'Ana Sayfaya Dön'
    },
    en: {
      title: 'Coming Soon',
      description: 'The appointment booking system will be available very soon for you. Stay tuned for updates!',
      buttonText: 'Return to Home Page'
    }
  };
  const currentContent = language === 'en' ? content.en : content.tr;

  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const ilanId = searchParams?.get('ilanId');
  const teacherId = searchParams?.get('teacherId');
  
  const [ilan, setIlan] = useState<Ilan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Randevu bilgileri
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [lessonType, setLessonType] = useState<'individual' | 'group'>('individual');
  const [groupSize, setGroupSize] = useState<number>(2);
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
        const response = await fetch(`/api/ilanlar/${ilanId}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'İlan detayları getirilirken bir hata oluştu');
        }
        const data = await response.json();
        setIlan(data);
        setError('');
      } catch (err: any) {
        setError('İlan detayları yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
      } finally {
        setIsLoading(false);
      }
    };
    if (ilanId) {
      fetchIlanDetay();
    }
  }, [ilanId]);

  useEffect(() => {
    if (selectedDate) {
      const times = [];
      const startHour = 9;
      const endHour = 17;
      const now = new Date();
      const isToday = selectedDate.getFullYear() === now.getFullYear() &&
        selectedDate.getMonth() === now.getMonth() &&
        selectedDate.getDate() === now.getDate();
      let minHour = startHour;
      if (isToday) {
        minHour = Math.max(startHour, now.getHours() + 1);
      }
      for (let hour = minHour; hour <= endHour; hour++) {
        times.push(`${hour.toString().padStart(2, '0')}:00`);
      }
      setAvailableTimes(times);
    }
  }, [selectedDate]);

  const handleNextStep = () => {
    if (step === 1 && selectedDate) {
      setStep(2);
    } else if (step === 2 && selectedTime) {
      setStep(3);
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime || !ilan) return;
    if (!cardNumber || !cardName || !expiryDate || !cvv) {
      setPaymentError('Lütfen tüm kart bilgilerini doldurun.');
      return;
    }
    try {
      setIsProcessing(true);
      setPaymentError('');
      const description = ilan.description && ilan.description.length < 10 ? (ilan.description + ' - detay') : ilan.description;
      const duration = ilan.duration && ilan.duration < 15 ? 15 : ilan.duration;
      let displayDuration = duration;
      let durationText = '';
      if (duration % 60 === 0) {
        displayDuration = duration / 60;
        durationText = `${displayDuration} saat`;
      } else {
        durationText = `${duration} dakika`;
      }
      const lessonCreateResponse = await fetch('/api/lessons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          title: ilan.title,
          description,
          price: ilan.price,
          duration,
          teacherId: ilan.teacher._id,
          studentId: user?.id,
          scheduledAt: new Date(selectedDate!.setHours(Number(selectedTime!.split(':')[0]), 0, 0, 0)).toISOString(),
          status: 'scheduled',
          lessonType,
          groupSize: lessonType === 'group' ? groupSize : undefined
        })
      });
      if (!lessonCreateResponse.ok) {
        throw new Error('Ders rezervasyonu sırasında bir hata oluştu');
      }
      const lessonData = await lessonCreateResponse.json();
      const lessonId = lessonData.lesson._id;

      // Bildirimleri oluştur
      const notifications = [
        {
          title: 'Yeni Ders Rezervasyonu',
          message: `${user?.name} adlı öğrenci ${ilan.title} dersiniz için rezervasyon yaptı.\nDers Süresi: ${durationText}`,
          type: 'lesson_booking',
          userId: ilan.teacher._id,
          relatedId: lessonId,
          read: false,
          createdAt: new Date().toISOString(),
          actionUrl: `/derslerim/${lessonId}`
        },
        {
          title: 'Randevu Onayı Gerekli',
          message: `Randevunuzun başarılı geçtiğini doğrulamak için tıklayın.\nDers Süresi: ${durationText}`,
          type: 'lesson_confirm',
          userId: user?.id,
          relatedId: lessonId,
          read: false,
          createdAt: new Date().toISOString(),
          actionUrl: `/derslerim/${lessonId}#confirm`
        }
      ];

      try {
        // Bildirimleri tek tek oluştur
        for (const notif of notifications) {
          const notificationResponse = await fetch('/api/notifications', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(notif)
          });
          if (!notificationResponse.ok) {
            throw new Error('Bildirimler oluşturulurken bir hata oluştu');
          }
        }
        setPaymentSuccess(true);
      } catch (err: any) {
        console.error('Bildirim oluşturma hatası:', err);
        setPaymentError('Bildirimler oluşturulurken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
      }
      
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
            ) : (
              <div>
                {/* Ders bilgileri özeti */}
                <div className="bg-[#FFF9F5] p-4 rounded-lg mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center">
                      <FaChalkboardTeacher className="text-[#FF8B5E] mr-2" />
                      <div>
                        <p className="text-sm text-gray-500">Eğitmen</p>
                        <p className="font-medium">{ilan?.teacher?.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <FaClock className="text-[#FF8B5E] mr-2" />
                      <div>
                        <p className="text-sm text-gray-500">Süre</p>
                        <p className="font-medium">{ilan?.duration} Saat</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <FaMoneyBillWave className="text-[#FF8B5E] mr-2" />
                      <div>
                        <p className="text-sm text-gray-500">Ücret</p>
                        <p className="font-medium">{ilan?.price} ₺</p>
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
                        const date = addDays(startOfDay(new Date()), index);
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

                    {/* Ders Tipi Seçimi */}
                    <div className="mb-6">
                      <h3 className="font-medium text-[#6B3416] mb-3">Ders Tipi</h3>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <button
                          type="button"
                          onClick={() => setLessonType('individual')}
                          className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center ${
                            lessonType === 'individual'
                              ? 'border-[#FF8B5E] bg-[#FFF5F0]'
                              : 'border-gray-200 hover:border-[#FFE5D9] hover:bg-[#FFF9F5]'
                          }`}
                        >
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                            lessonType === 'individual'
                              ? 'bg-[#FF8B5E] text-white'
                              : 'bg-gray-200 text-gray-500'
                          }`}>
                            <FaChalkboardTeacher size={18} />
                          </div>
                          <p className="font-medium">Bireysel Ders</p>
                          <p className="text-sm text-gray-500">Sadece sizin için</p>
                        </button>
                        <button
                          type="button"
                          onClick={() => setLessonType('group')}
                          className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center ${
                            lessonType === 'group'
                              ? 'border-[#FF8B5E] bg-[#FFF5F0]'
                              : 'border-gray-200 hover:border-[#FFE5D9] hover:bg-[#FFF9F5]'
                          }`}
                        >
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                            lessonType === 'group'
                              ? 'bg-[#FF8B5E] text-white'
                              : 'bg-gray-200 text-gray-500'
                          }`}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                            </svg>
                          </div>
                          <p className="font-medium">Grup Dersi</p>
                          <p className="text-sm text-gray-500">Arkadaşlarınızla birlikte</p>
                        </button>
                      </div>
                      
                      {/* Grup dersi seçildiğinde kişi sayısı seçimi */}
                      {lessonType === 'group' && (
                        <div className="bg-[#FFF9F5] p-4 rounded-lg">
                          <label htmlFor="groupSize" className="block text-[#6B3416] font-medium mb-2">
                            Grup Büyüklüğü (kişi sayısı)
                          </label>
                          <div className="flex items-center">
                            <button
                              type="button"
                              onClick={() => setGroupSize(prev => Math.max(2, prev - 1))}
                              className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-700 hover:bg-gray-200"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              id="groupSize"
                              min="2"
                              max="10"
                              value={groupSize}
                              onChange={(e) => setGroupSize(Math.max(2, Math.min(10, parseInt(e.target.value) || 2)))}
                              className="w-16 mx-3 px-3 py-2 text-center border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFB996]"
                            />
                            <button
                              type="button"
                              onClick={() => setGroupSize(prev => Math.min(10, prev + 1))}
                              className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-700 hover:bg-gray-200"
                            >
                              +
                            </button>
                            <p className="ml-4 text-gray-600">kişi</p>
                          </div>
                          <p className="text-sm text-gray-500 mt-2">
                            Not: Grup derslerinde kişi başı ücret, bireysel derse göre daha uygun olabilir.
                          </p>
                        </div>
                      )}
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
                            <p className="font-medium">{ilan?.teacher?.name}</p>
                            <p className="text-gray-500">Ders:</p>
                            <p className="font-medium">{ilan?.title}</p>
                            <p className="text-gray-500">Ders Tipi:</p>
                            <p className="font-medium">{lessonType === 'individual' ? 'Bireysel' : `Grup (${groupSize} kişi)`}</p>
                            <p className="text-gray-500">Ücret:</p>
                            <p className="font-medium">{ilan?.price} ₺</p>
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
                      <div>
                        <h2 className="text-xl font-bold text-[#6B3416] mb-4">Ödeme Bilgileri</h2>
                        <div className="bg-[#FFF9F5] p-4 rounded-lg mb-6">
                          <h3 className="font-medium text-[#6B3416] mb-2">Randevu Özeti</h3>
                          <div className="grid grid-cols-2 gap-2">
                            <p className="text-gray-500">Tarih:</p>
                            <p className="font-medium">{selectedDate && format(selectedDate, 'd MMMM yyyy', { locale: tr })}</p>
                            <p className="text-gray-500">Saat:</p>
                            <p className="font-medium">{selectedTime}</p>
                            <p className="text-gray-500">Eğitmen:</p>
                            <p className="font-medium">{ilan?.teacher?.name}</p>
                            <p className="text-gray-500">Ders:</p>
                            <p className="font-medium">{ilan?.title}</p>
                            <p className="text-gray-500">Ders Tipi:</p>
                            <p className="font-medium">{lessonType === 'individual' ? 'Bireysel' : `Grup (${groupSize} kişi)`}</p>
                            <p className="text-gray-500">Toplam Tutar:</p>
                            <p className="font-bold text-[#FF8B5E]">{ilan?.price} ₺</p>
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
                      </div>
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
