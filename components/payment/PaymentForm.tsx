import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface PaymentFormProps {
  lessonId: string;
  lessonTitle: string;
  teacherName: string;
  price: number;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  lessonId,
  lessonTitle,
  teacherName,
  price,
  onSuccess,
  onError
}) => {
  const { user } = useAuth();
  const router = useRouter();

  const [cardHolderName, setCardHolderName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expireMonth, setExpireMonth] = useState('');
  const [expireYear, setExpireYear] = useState('');
  const [cvc, setCvc] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Kart numarasını formatlama
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

  // Form doğrulama
  const validateForm = () => {
    if (!cardHolderName.trim()) {
      setError('Kart sahibinin adını giriniz');
      return false;
    }
    
    const cardNum = cardNumber.replace(/\s+/g, '');
    if (cardNum.length < 16) {
      setError('Geçerli bir kart numarası giriniz');
      return false;
    }
    
    if (expireMonth.length !== 2 || parseInt(expireMonth) < 1 || parseInt(expireMonth) > 12) {
      setError('Geçerli bir son kullanma ayı giriniz (01-12)');
      return false;
    }
    
    const currentYear = new Date().getFullYear() % 100;
    if (expireYear.length !== 2 || parseInt(expireYear) < currentYear) {
      setError('Geçerli bir son kullanma yılı giriniz');
      return false;
    }
    
    if (cvc.length < 3 || cvc.length > 4) {
      setError('Geçerli bir güvenlik kodu giriniz');
      return false;
    }
    
    return true;
  };

  // Ödeme işlemi
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Kart verilerini hazırla
      const cardData = {
        cardHolderName,
        cardNumber: cardNumber.replace(/\s+/g, ''),
        expireMonth,
        expireYear,
        cvc
      };
      
      // Ödeme isteği gönder
      const response = await fetch('/api/payments/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          lessonId,
          cardData
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // 3D Secure sayfasına yönlendir
        if (data.htmlContent) {
          // HTML içeriğini bir iframe veya yeni bir sayfada göster
          const newWindow = window.open('', '_blank');
          if (newWindow) {
            newWindow.document.write(data.htmlContent);
            newWindow.document.close();
            if (onSuccess) onSuccess();
          } else {
            // Yeni pencere açılamadıysa, HTML içeriğini sayfada göster
            document.open();
            document.write(data.htmlContent);
            document.close();
          }
        } else {
          // Başarılı ödeme sayfasına yönlendir
          router.push(`/payment/success?paymentId=${data.paymentId}`);
          if (onSuccess) onSuccess();
        }
      } else {
        setError(data.error || 'Ödeme işlemi sırasında bir hata oluştu');
        if (onError) onError(data.error);
      }
    } catch (error) {
      setError('Ödeme işlemi sırasında bir hata oluştu');
      if (onError) onError('Ödeme işlemi sırasında bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-[#994D1C] mb-6">Ödeme Bilgileri</h2>
      
      <div className="mb-6 bg-[#FFF8F2] p-4 rounded-md">
        <h3 className="text-lg font-medium text-[#994D1C] mb-2">Ders Bilgileri</h3>
        <p><span className="font-medium">Ders:</span> {lessonTitle}</p>
        <p><span className="font-medium">Eğitmen:</span> {teacherName}</p>
        <p className="mt-2 text-xl font-bold text-[#FF8B5E]">Toplam: {price} TL</p>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="cardHolderName" className="block text-sm font-medium text-gray-700 mb-1">
            Kart Sahibinin Adı Soyadı
          </label>
          <input
            type="text"
            id="cardHolderName"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF8B5E]"
            value={cardHolderName}
            onChange={(e) => setCardHolderName(e.target.value)}
            placeholder="Adı Soyadı"
            required
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">
            Kart Numarası
          </label>
          <input
            type="text"
            id="cardNumber"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF8B5E]"
            value={cardNumber}
            onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
            placeholder="1234 5678 9012 3456"
            maxLength={19}
            required
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="expireDate" className="block text-sm font-medium text-gray-700 mb-1">
              Son Kullanma Tarihi
            </label>
            <div className="flex">
              <input
                type="text"
                id="expireMonth"
                className="w-1/2 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-[#FF8B5E]"
                value={expireMonth}
                onChange={(e) => setExpireMonth(e.target.value.replace(/\D/g, '').slice(0, 2))}
                placeholder="AA"
                maxLength={2}
                required
              />
              <span className="flex items-center justify-center px-2 bg-gray-100 border-t border-b border-gray-300">
                /
              </span>
              <input
                type="text"
                id="expireYear"
                className="w-1/2 px-3 py-2 border border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-[#FF8B5E]"
                value={expireYear}
                onChange={(e) => setExpireYear(e.target.value.replace(/\D/g, '').slice(0, 2))}
                placeholder="YY"
                maxLength={2}
                required
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="cvc" className="block text-sm font-medium text-gray-700 mb-1">
              Güvenlik Kodu (CVC/CVV)
            </label>
            <input
              type="text"
              id="cvc"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF8B5E]"
              value={cvc}
              onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder="123"
              maxLength={4}
              required
            />
          </div>
        </div>
        
        <div className="mt-6">
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-[#FF8B5E] to-[#FFB996] text-white font-semibold py-3 px-6 rounded-md hover:from-[#994D1C] hover:to-[#FF8B5E] transition-all duration-300 shadow-md hover:shadow-lg"
            disabled={loading}
          >
            {loading ? 'İşleniyor...' : 'Ödemeyi Tamamla'}
          </button>
        </div>
        
        <p className="mt-4 text-sm text-gray-600 text-center">
          Bu ödeme işlemi güvenli bir şekilde gerçekleştirilecektir. Kart bilgileriniz bizimle paylaşılmaz.
        </p>
      </form>
    </div>
  );
};

export default PaymentForm;
