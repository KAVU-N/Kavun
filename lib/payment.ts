import Iyzipay from 'iyzipay';

// Build sırasında Iyzico dummy ise işlemleri devre dışı bırak
export const IYZICO_DISABLED = !process.env.IYZICO_API_KEY || process.env.IYZICO_API_KEY === 'dummy';

// İyzico yapılandırması (dummy ise oluşturma)
export const iyzipay = IYZICO_DISABLED ? null : new Iyzipay({
  apiKey: process.env.IYZICO_API_KEY || '',
  secretKey: process.env.IYZICO_SECRET_KEY || '',
  uri: process.env.NODE_ENV === 'production' 
    ? 'https://api.iyzipay.com' 
    : 'https://sandbox-api.iyzipay.com'
});

// Ödeme oluşturma
export const createPayment = async (
  user: any,
  lesson: any,
  cardData: any,
  callbackUrl: string
) => {
  if (IYZICO_DISABLED) throw new Error('Ödeme servisi devre dışı');
  try {
    // Buyer bilgilerini oluştur
    const buyer = {
      id: user._id.toString(),
      name: user.name.split(' ')[0] || 'İsim',
      surname: user.name.split(' ').slice(1).join(' ') || 'Soyisim',
      gsmNumber: user.phone || '+905555555555',
      email: user.email,
      identityNumber: '11111111111', // TC Kimlik no, test için sabit değer
      lastLoginDate: new Date().toISOString(),
      registrationDate: user.createdAt?.toISOString() || new Date().toISOString(),
      registrationAddress: 'Türkiye',
      ip: '85.34.78.112', // User IP adresi (örnek)
      city: 'İstanbul',
      country: 'Türkiye',
      zipCode: '34000'
    };

    // Adres bilgilerini oluştur
    const shippingAddress = {
      contactName: user.name,
      city: 'İstanbul',
      country: 'Türkiye',
      address: 'Türkiye',
      zipCode: '34000'
    };

    const billingAddress = {
      contactName: user.name,
      city: 'İstanbul',
      country: 'Türkiye',
      address: 'Türkiye',
      zipCode: '34000'
    };

    // Ders sepet öğesini oluştur
    const basketItems = [
      {
        id: lesson._id.toString(),
        name: lesson.title,
        category1: 'Eğitim',
        category2: 'Ders',
        itemType: 'VIRTUAL',
        price: lesson.price.toString()
      }
    ];

    // Ödeme isteği oluştur
    const request = {
      locale: 'tr',
      conversationId: `lesson_${lesson._id}_${Date.now()}`,
      price: lesson.price.toString(), // Ürünlerin toplam tutarı
      paidPrice: lesson.price.toString(), // Alıcının ödediği tutar
      currency: 'TRY',
      installment: '1', // Tek çekim
      basketId: `lesson_${lesson._id}`,
      paymentChannel: 'WEB',
      paymentGroup: 'PRODUCT',
      paymentCard: {
        cardHolderName: cardData.cardHolderName,
        cardNumber: cardData.cardNumber,
        expireMonth: cardData.expireMonth,
        expireYear: cardData.expireYear,
        cvc: cardData.cvc,
        registerCard: '0' // Kart bilgilerini kaydetme
      },
      buyer,
      shippingAddress,
      billingAddress,
      basketItems,
      callbackUrl
    };

    // Ödemeyi gerçekleştir
    return new Promise((resolve, reject) => {
      iyzipay.payment.create(request, (err: any, result: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  } catch (error: any) {
    throw new Error(`Ödeme işlemi başlatılırken bir hata oluştu: ${error.message}`);
  }
};

// 3D Secure ile ödeme oluşturma
export const create3DSecurePayment = async (
  user: any,
  lesson: any,
  cardData: any,
  callbackUrl: string
) => {
  if (IYZICO_DISABLED) throw new Error('Ödeme servisi devre dışı');
  try {
    // Buyer bilgilerini oluştur
    const buyer = {
      id: user._id.toString(),
      name: user.name.split(' ')[0] || 'İsim',
      surname: user.name.split(' ').slice(1).join(' ') || 'Soyisim',
      gsmNumber: user.phone || '+905555555555',
      email: user.email,
      identityNumber: '11111111111', // TC Kimlik no, test için sabit değer
      lastLoginDate: new Date().toISOString(),
      registrationDate: user.createdAt?.toISOString() || new Date().toISOString(),
      registrationAddress: 'Türkiye',
      ip: '85.34.78.112', // User IP adresi (örnek)
      city: 'İstanbul',
      country: 'Türkiye',
      zipCode: '34000'
    };

    // Adres bilgilerini oluştur
    const shippingAddress = {
      contactName: user.name,
      city: 'İstanbul',
      country: 'Türkiye',
      address: 'Türkiye',
      zipCode: '34000'
    };

    const billingAddress = {
      contactName: user.name,
      city: 'İstanbul',
      country: 'Türkiye',
      address: 'Türkiye',
      zipCode: '34000'
    };

    // Ders sepet öğesini oluştur
    const basketItems = [
      {
        id: lesson._id.toString(),
        name: lesson.title,
        category1: 'Eğitim',
        category2: 'Ders',
        itemType: 'VIRTUAL',
        price: lesson.price.toString()
      }
    ];

    // 3D ödeme isteği oluştur
    const request = {
      locale: 'tr',
      conversationId: `lesson_${lesson._id}_${Date.now()}`,
      price: lesson.price.toString(),
      paidPrice: lesson.price.toString(),
      currency: 'TRY',
      installment: '1',
      basketId: `lesson_${lesson._id}`,
      paymentChannel: 'WEB',
      paymentGroup: 'PRODUCT',
      paymentCard: {
        cardHolderName: cardData.cardHolderName,
        cardNumber: cardData.cardNumber,
        expireMonth: cardData.expireMonth,
        expireYear: cardData.expireYear,
        cvc: cardData.cvc,
        registerCard: '0'
      },
      buyer,
      shippingAddress,
      billingAddress,
      basketItems,
      callbackUrl
    };

    // 3D ödemeyi başlat
    return new Promise((resolve, reject) => {
      iyzipay.threedsInitialize.create(request, (err: any, result: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  } catch (error: any) {
    throw new Error(`3D Secure ödeme işlemi başlatılırken bir hata oluştu: ${error.message}`);
  }
};

// 3D doğrulama sonrası ödemeyi tamamla
export const complete3DSecurePayment = async (paymentId: string, conversationId: string) => {
  if (IYZICO_DISABLED) throw new Error('Ödeme servisi devre dışı');
  try {
    const request = {
      locale: 'tr',
      conversationId,
      paymentId
    };

    return new Promise((resolve, reject) => {
      iyzipay.threedsPayment.create(request, (err: any, result: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  } catch (error: any) {
    throw new Error(`3D Secure ödeme tamamlanırken bir hata oluştu: ${error.message}`);
  }
};

// Ödeme iptal işlemi
export const cancelPayment = async (paymentId: string) => {
  if (IYZICO_DISABLED) throw new Error('Ödeme servisi devre dışı');
  try {
    const request = {
      locale: 'tr',
      conversationId: `cancel_${paymentId}_${Date.now()}`,
      paymentId
    };

    return new Promise((resolve, reject) => {
      iyzipay.cancel.create(request, (err: any, result: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  } catch (error: any) {
    throw new Error(`Ödeme iptali sırasında bir hata oluştu: ${error.message}`);
  }
};

// Ödeme iade işlemi
export const refundPayment = async (paymentTransactionId: string, amount: number) => {
  if (IYZICO_DISABLED) throw new Error('Ödeme servisi devre dışı');
  try {
    const request = {
      locale: 'tr',
      conversationId: `refund_${paymentTransactionId}_${Date.now()}`,
      paymentTransactionId,
      price: amount.toString(),
      currency: 'TRY',
      ip: '85.34.78.112' // User IP adresi (örnek)
    };

    return new Promise((resolve, reject) => {
      iyzipay.refund.create(request, (err: any, result: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  } catch (error: any) {
    throw new Error(`Ödeme iadesi sırasında bir hata oluştu: ${error.message}`);
  }
};
