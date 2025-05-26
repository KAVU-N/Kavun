import nodemailer from 'nodemailer';

// E-posta göndermek için transporter oluştur
const createTransporter = () => {
  console.log('Email transporter oluşturuluyor...');
  
  const emailUser = process.env.EMAIL_USER;
  const emailPassword = process.env.EMAIL_PASSWORD;

  if (!emailUser || !emailPassword) {
    throw new Error('Email ayarları eksik. Lütfen .env dosyasında EMAIL_USER ve EMAIL_PASSWORD değerlerini kontrol edin.');
  }

  console.log('Email ayarları kontrol edildi:', { emailUser });

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: emailUser,
      pass: emailPassword
    },
    debug: true
  });

  return transporter;
};

// Doğrulama kodu oluştur
export const generateVerificationCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Doğrulama e-postası gönder
export const sendVerificationEmail = async (email: string, code: string) => {
  console.log('Doğrulama e-postası gönderme işlemi başladı:', email);
  
  try {
    const transporter = createTransporter();

    // Transporter bağlantısını test et
    console.log('SMTP bağlantısı test ediliyor...');
    try {
      const verifyResult = await transporter.verify();
      console.log('SMTP bağlantısı başarılı:', verifyResult);
    } catch (error) {
      console.error('SMTP bağlantı hatası:', error);
      throw new Error('SMTP sunucusuna bağlanılamadı. Lütfen email ayarlarınızı kontrol edin.');
    }

    const mailOptions = {
      from: {
        name: 'Kavunla',
        address: process.env.EMAIL_USER!
      },
      to: email,
      subject: 'E-posta Doğrulama Kodu - Kavunla',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; text-align: center;">Kavunla E-posta Doğrulama</h2>
          <p style="color: #666; font-size: 16px;">Merhaba,</p>
          <p style="color: #666; font-size: 16px;">Kavunla'ya hoş geldiniz. Lütfen aşağıdaki doğrulama kodunu kullanarak e-posta adresinizi doğrulayın:</p>
          <div style="background-color: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #333; letter-spacing: 5px; margin: 0;">${code}</h1>
          </div>
          <p style="color: #666; font-size: 14px;">Bu kod 10 dakika süreyle geçerlidir.</p>
          <p style="color: #666; font-size: 14px;">Eğer bu işlemi siz yapmadıysanız, lütfen bu e-postayı dikkate almayın.</p>
          <hr style="border: 1px solid #eee; margin: 20px 0;">
          <p style="color: #999; font-size: 12px; text-align: center;">Bu e-posta otomatik olarak gönderilmiştir, lütfen yanıtlamayınız.</p>
        </div>
      `
    };

    console.log('E-posta gönderiliyor...');
    const info = await transporter.sendMail(mailOptions);
    console.log('E-posta gönderildi:', {
      messageId: info.messageId,
      response: info.response,
      accepted: info.accepted,
      rejected: info.rejected
    });
    
    return true;
  } catch (error: any) {
    console.error('E-posta gönderme hatası:', {
      name: error.name,
      message: error.message,
      code: error.code,
      command: error.command,
      stack: error.stack
    });
    throw error;
  }
};

// Şifre sıfırlama e-postası gönder
export const sendPasswordResetEmail = async (email: string, code: string) => {
  console.log('Şifre sıfırlama e-postası gönderme işlemi başladı:', email);
  
  try {
    const transporter = createTransporter();

    // Transporter bağlantısını test et
    console.log('SMTP bağlantısı test ediliyor...');
    try {
      const verifyResult = await transporter.verify();
      console.log('SMTP bağlantısı başarılı:', verifyResult);
    } catch (error) {
      console.error('SMTP bağlantı hatası:', error);
      throw new Error('SMTP sunucusuna bağlanılamadı. Lütfen email ayarlarınızı kontrol edin.');
    }

    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?email=${encodeURIComponent(email)}&code=${code}`;

    const mailOptions = {
      from: {
        name: 'Kavunla',
        address: process.env.EMAIL_USER!
      },
      to: email,
      subject: 'Şifre Sıfırlama - Kavunla',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; text-align: center;">Kavunla Şifre Sıfırlama</h2>
          <p style="color: #666; font-size: 16px;">Merhaba,</p>
          <p style="color: #666; font-size: 16px;">Kavunla şifre sıfırlama isteğiniz alındı. Aşağıdaki kodu kullanarak şifrenizi sıfırlayabilirsiniz:</p>
          <div style="text-align: center; margin: 20px 0;">
            <a href="${resetLink}" style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Şifremi Sıfırla</a>
          </div>
          <p style="color: #666; font-size: 14px;">Ya da bu bağlantıyı tarayıcınıza yapıştırın:</p>
          <p style="color: #1a73e8; word-break: break-all; font-size: 14px;">${resetLink}</p>
          <p style="color: #666; font-size: 14px;">Bu bağlantı 10 dakika süreyle geçerlidir.</p>
          <p style="color: #666; font-size: 14px;">Eğer bu işlemi siz yapmadıysanız, lütfen bu e-postayı dikkate almayın ve hesabınızın güvenliği için şifrenizi değiştirin.</p>
          <hr style="border: 1px solid #eee; margin: 20px 0;">
          <p style="color: #999; font-size: 12px; text-align: center;">Bu e-posta otomatik olarak gönderilmiştir, lütfen yanıtlamayınız.</p>
        </div>
      `
    };

    console.log('E-posta gönderiliyor...');
    const info = await transporter.sendMail(mailOptions);
    console.log('E-posta gönderildi:', {
      messageId: info.messageId,
      response: info.response,
      accepted: info.accepted,
      rejected: info.rejected
    });
    
    return true;
  } catch (error: any) {
    console.error('E-posta gönderme hatası:', {
      name: error.name,
      message: error.message,
      code: error.code,
      command: error.command,
      stack: error.stack
    });
    throw error;
  }
};
