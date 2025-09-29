"use client";
import React from "react";
import { useLanguage } from "../../src/contexts/LanguageContext";

export default function PrivacyPolicyPage() {
  const { t, language } = useLanguage();

  return (
    <div className="relative min-h-screen overflow-hidden flex items-center justify-center pt-24 pb-8 px-2">
      <div className="w-full max-w-3xl rounded-3xl shadow-2xl bg-white/90 border border-[#FFD6BA] p-6 sm:p-10 relative overflow-hidden">
        <div className="flex items-center gap-3 mb-8">
          <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#FFB996] shadow-lg">
            <svg className="w-7 h-7 text-[#994D1C]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 20h9" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m0 0l-2-2m2 2l2-2" /></svg>
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#994D1C] tracking-tight drop-shadow-lg">
            {language === "tr" ? "Gizlilik Politikası" : "Privacy Policy"}
          </h1>
        </div>
        <div className="prose prose-lg max-w-none text-[#6B3416]">
          {language === "tr" ? (
            <>
              <section className="mb-6">
                <div className="flex items-center gap-2 mb-1">
                  <svg className="w-6 h-6 text-[#FF8B5E]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  <h2 className="text-2xl font-semibold mb-0">1. Genel Bilgiler</h2>
                </div>
                <p>Kavunla Eğitim Platformu olarak, kullanıcılarımızın gizliliğine önem veriyoruz. Bu gizlilik politikası, kişisel verilerinizin nasıl toplandığını, kullanıldığını ve korunduğunu açıklar.</p>
              </section>
              <section className="mb-6">
                <div className="flex items-center gap-2 mb-1">
                  <svg className="w-6 h-6 text-[#FF8B5E]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  <h2 className="text-2xl font-semibold mb-0">2. Toplanan Bilgiler</h2>
                </div>
                <ul className="list-none pl-0 space-y-1">
                  <li className="flex items-start gap-2"><span className="mt-1"><svg className="w-4 h-4 text-[#FFB996]" fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="10" r="10" /></svg></span>Ad, soyad ve iletişim bilgileri</li>
                  <li className="flex items-start gap-2"><span className="mt-1"><svg className="w-4 h-4 text-[#FFB996]" fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="10" r="10" /></svg></span>Kullanıcı adı ve şifre</li>
                  <li className="flex items-start gap-2"><span className="mt-1"><svg className="w-4 h-4 text-[#FFB996]" fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="10" r="10" /></svg></span>IP adresi ve cihaz bilgileri</li>
                  <li className="flex items-start gap-2"><span className="mt-1"><svg className="w-4 h-4 text-[#FFB996]" fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="10" r="10" /></svg></span>Kullanım istatistikleri ve çerez verileri</li>
                </ul>
              </section>
              <section className="mb-6">
                <div className="flex items-center gap-2 mb-1">
                  <svg className="w-6 h-6 text-[#FF8B5E]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  <h2 className="text-2xl font-semibold mb-0">3. Bilgilerin Kullanımı</h2>
                </div>
                <p>Toplanan bilgiler, platformun işleyişini sağlamak, kullanıcı deneyimini geliştirmek ve yasal yükümlülükleri yerine getirmek amacıyla kullanılır.</p>
              </section>
              <section className="mb-6">
                <div className="flex items-center gap-2 mb-1">
                  <svg className="w-6 h-6 text-[#FF8B5E]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  <h2 className="text-2xl font-semibold mb-0">4. Bilgilerin Paylaşımı</h2>
                </div>
                <p>Kişisel verileriniz, yasal zorunluluklar haricinde üçüncü kişilerle paylaşılmaz. Hizmet sağlayıcılarla paylaşılan bilgiler, gizlilik sözleşmeleri ile korunur.</p>
              </section>
              <section className="mb-6">
                <div className="flex items-center gap-2 mb-1">
                  <svg className="w-6 h-6 text-[#FF8B5E]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  <h2 className="text-2xl font-semibold mb-0">5. Güvenlik</h2>
                </div>
                <p>Kullanıcı bilgilerinizin güvenliği için teknik ve idari önlemler alınmaktadır. Ancak internet üzerinden iletilen verilerin tam güvenliği garanti edilemez.</p>
              </section>
              <section className="mb-6">
                <div className="flex items-center gap-2 mb-1">
                  <svg className="w-6 h-6 text-[#FF8B5E]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  <h2 className="text-2xl font-semibold mb-0">6. Çerezler (Cookies)</h2>
                </div>
                <p>Platformda kullanıcı deneyimini geliştirmek amacıyla çerezler kullanılmaktadır. Çerez ayarlarınızı tarayıcınızdan değiştirebilirsiniz.</p>
              </section>
              <section>
                <div className="flex items-center gap-2 mb-1">
                  <svg className="w-6 h-6 text-[#FF8B5E]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  <h2 className="text-2xl font-semibold mb-0">7. İletişim</h2>
                </div>
                <p>Gizlilik ile ilgili her türlü soru ve talepleriniz için <a href="mailto:info@kavunla.com" className="text-[#FF8B5E] underline">info@kavunla.com</a> adresinden bize ulaşabilirsiniz.</p>
              </section>
            </>
          ) : (
            <>
              <section className="mb-6">
                <div className="flex items-center gap-2 mb-1">
                  <svg className="w-6 h-6 text-[#FF8B5E]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  <h2 className="text-2xl font-semibold mb-0">1. General Information</h2>
                </div>
                <p>At Kavunla Education Platform, we value the privacy of our users. This privacy policy explains how your personal data is collected, used, and protected.</p>
              </section>
              <section className="mb-6">
                <div className="flex items-center gap-2 mb-1">
                  <svg className="w-6 h-6 text-[#FF8B5E]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  <h2 className="text-2xl font-semibold mb-0">2. Information Collected</h2>
                </div>
                <ul className="list-none pl-0 space-y-1">
                  <li className="flex items-start gap-2"><span className="mt-1"><svg className="w-4 h-4 text-[#FFB996]" fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="10" r="10" /></svg></span>Name, surname, and contact information</li>
                  <li className="flex items-start gap-2"><span className="mt-1"><svg className="w-4 h-4 text-[#FFB996]" fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="10" r="10" /></svg></span>Username and password</li>
                  <li className="flex items-start gap-2"><span className="mt-1"><svg className="w-4 h-4 text-[#FFB996]" fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="10" r="10" /></svg></span>IP address and device information</li>
                  <li className="flex items-start gap-2"><span className="mt-1"><svg className="w-4 h-4 text-[#FFB996]" fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="10" r="10" /></svg></span>Usage statistics and cookie data</li>
                </ul>
              </section>
              <section className="mb-6">
                <div className="flex items-center gap-2 mb-1">
                  <svg className="w-6 h-6 text-[#FF8B5E]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  <h2 className="text-2xl font-semibold mb-0">3. Use of Information</h2>
                </div>
                <p>The information collected is used to operate the platform, improve user experience, and fulfill legal obligations.</p>
              </section>
              <section className="mb-6">
                <div className="flex items-center gap-2 mb-1">
                  <svg className="w-6 h-6 text-[#FF8B5E]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  <h2 className="text-2xl font-semibold mb-0">4. Sharing of Information</h2>
                </div>
                <p>Your personal data will not be shared with third parties except as required by law. Information shared with service providers is protected by confidentiality agreements.</p>
              </section>
              <section className="mb-6">
                <div className="flex items-center gap-2 mb-1">
                  <svg className="w-6 h-6 text-[#FF8B5E]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  <h2 className="text-2xl font-semibold mb-0">5. Security</h2>
                </div>
                <p>Technical and administrative measures are taken to ensure the security of your information. However, the complete security of data transmitted over the internet cannot be guaranteed.</p>
              </section>
              <section className="mb-6">
                <div className="flex items-center gap-2 mb-1">
                  <svg className="w-6 h-6 text-[#FF8B5E]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  <h2 className="text-2xl font-semibold mb-0">6. Cookies</h2>
                </div>
                <p>Cookies are used on the platform to improve user experience. You can change your cookie settings from your browser.</p>
              </section>
              <section>
                <div className="flex items-center gap-2 mb-1">
                  <svg className="w-6 h-6 text-[#FF8B5E]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  <h2 className="text-2xl font-semibold mb-0">7. Contact</h2>
                </div>
                <p>For all your privacy-related questions and requests, you can contact us at <a href="mailto:info@kavunla.com" className="text-[#FF8B5E] underline">info@kavunla.com</a>.</p>
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
