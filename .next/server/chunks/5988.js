"use strict";exports.id=5988,exports.ids=[5988],exports.modules={5988:(e,a,o)=>{o.d(a,{L:()=>s,generateVerificationCode:()=>l,sendVerificationEmail:()=>n});var r=o(68140);let t=()=>{console.log("Email transporter oluşturuluyor...");let e=process.env.EMAIL_USER,a=process.env.EMAIL_PASSWORD;if(!e||!a)throw Error("Email ayarları eksik. L\xfctfen .env dosyasında EMAIL_USER ve EMAIL_PASSWORD değerlerini kontrol edin.");return console.log("Email ayarları kontrol edildi:",{emailUser:e}),r.createTransport({host:"smtp.gmail.com",port:465,secure:!0,auth:{user:e,pass:a},debug:!0})},l=()=>Math.floor(1e5+9e5*Math.random()).toString(),n=async(e,a)=>{console.log("Doğrulama e-postası g\xf6nderme işlemi başladı:",e);try{let o=t();console.log("SMTP bağlantısı test ediliyor...");try{let e=await o.verify();console.log("SMTP bağlantısı başarılı:",e)}catch(e){throw console.error("SMTP bağlantı hatası:",e),Error("SMTP sunucusuna bağlanılamadı. L\xfctfen email ayarlarınızı kontrol edin.")}let r={from:{name:"Kavun App",address:process.env.EMAIL_USER},to:e,subject:"E-posta Doğrulama Kodu - Kavun App",html:`
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; text-align: center;">Kavun App E-posta Doğrulama</h2>
          <p style="color: #666; font-size: 16px;">Merhaba,</p>
          <p style="color: #666; font-size: 16px;">Kavun App'e hoş geldiniz. L\xfctfen aşağıdaki doğrulama kodunu kullanarak e-posta adresinizi doğrulayın:</p>
          <div style="background-color: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #333; letter-spacing: 5px; margin: 0;">${a}</h1>
          </div>
          <p style="color: #666; font-size: 14px;">Bu kod 10 dakika s\xfcreyle ge\xe7erlidir.</p>
          <p style="color: #666; font-size: 14px;">Eğer bu işlemi siz yapmadıysanız, l\xfctfen bu e-postayı dikkate almayın.</p>
          <hr style="border: 1px solid #eee; margin: 20px 0;">
          <p style="color: #999; font-size: 12px; text-align: center;">Bu e-posta otomatik olarak g\xf6nderilmiştir, l\xfctfen yanıtlamayınız.</p>
        </div>
      `};console.log("E-posta g\xf6nderiliyor...");let l=await o.sendMail(r);return console.log("E-posta g\xf6nderildi:",{messageId:l.messageId,response:l.response,accepted:l.accepted,rejected:l.rejected}),!0}catch(e){throw console.error("E-posta g\xf6nderme hatası:",{name:e.name,message:e.message,code:e.code,command:e.command,stack:e.stack}),e}},s=async(e,a)=>{console.log("Şifre sıfırlama e-postası g\xf6nderme işlemi başladı:",e);try{let o=t();console.log("SMTP bağlantısı test ediliyor...");try{let e=await o.verify();console.log("SMTP bağlantısı başarılı:",e)}catch(e){throw console.error("SMTP bağlantı hatası:",e),Error("SMTP sunucusuna bağlanılamadı. L\xfctfen email ayarlarınızı kontrol edin.")}let r={from:{name:"Kavun App",address:process.env.EMAIL_USER},to:e,subject:"Şifre Sıfırlama - Kavun App",html:`
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; text-align: center;">Kavun App Şifre Sıfırlama</h2>
          <p style="color: #666; font-size: 16px;">Merhaba,</p>
          <p style="color: #666; font-size: 16px;">Şifrenizi sıfırlamak i\xe7in talepte bulundunuz. L\xfctfen aşağıdaki kodu kullanarak şifrenizi sıfırlayın:</p>
          <div style="background-color: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #333; letter-spacing: 5px; margin: 0;">${a}</h1>
          </div>
          <p style="color: #666; font-size: 14px;">Bu kod 10 dakika s\xfcreyle ge\xe7erlidir.</p>
          <p style="color: #666; font-size: 14px;">Eğer bu işlemi siz yapmadıysanız, l\xfctfen bu e-postayı dikkate almayın ve hesabınızın g\xfcvenliği i\xe7in şifrenizi değiştirin.</p>
          <hr style="border: 1px solid #eee; margin: 20px 0;">
          <p style="color: #999; font-size: 12px; text-align: center;">Bu e-posta otomatik olarak g\xf6nderilmiştir, l\xfctfen yanıtlamayınız.</p>
        </div>
      `};console.log("E-posta g\xf6nderiliyor...");let l=await o.sendMail(r);return console.log("E-posta g\xf6nderildi:",{messageId:l.messageId,response:l.response,accepted:l.accepted,rejected:l.rejected}),!0}catch(e){throw console.error("E-posta g\xf6nderme hatası:",{name:e.name,message:e.message,code:e.code,command:e.command,stack:e.stack}),e}}}};