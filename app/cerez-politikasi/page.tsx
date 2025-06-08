"use client";
import React from "react";
import { useLanguage } from "../../src/contexts/LanguageContext";

export default function CookiePolicyPage() {
  const { t, language } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF6ED] to-[#FFE5D9] flex items-center justify-center pt-24 pb-8 px-2">
      <div className="w-full max-w-3xl rounded-3xl shadow-2xl bg-white/90 border border-[#FFD6BA] p-6 sm:p-10 relative overflow-hidden">
        <div className="flex items-center gap-3 mb-8">
          <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#FFB996] shadow-lg">
            <svg className="w-7 h-7 text-[#994D1C]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 20h9" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m0 0l-2-2m2 2l2-2" /></svg>
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#994D1C] tracking-tight drop-shadow-lg">
            {language === "tr" ? "Çerez Politikası" : "Cookie Policy"}
          </h1>
        </div>
        <div className="prose prose-lg max-w-none text-[#6B3416]">
          {language === "tr" ? (
            <>
              <section className="mb-6">
                <div className="flex items-center gap-2 mb-1">
                  <svg className="w-6 h-6 text-[#FF8B5E]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  <h2 className="text-2xl font-semibold mb-0">1. Çerez Nedir?</h2>
                </div>
                <p>Çerezler, web sitelerini ziyaret ettiğinizde tarayıcınız tarafından cihazınıza kaydedilen küçük metin dosyalarıdır. Çerezler, site deneyiminizi iyileştirmek ve bazı bilgileri hatırlamak amacıyla kullanılır.</p>
              </section>
              <section className="mb-6">
                <div className="flex items-center gap-2 mb-1">
                  <svg className="w-6 h-6 text-[#FF8B5E]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  <h2 className="text-2xl font-semibold mb-0">2. Çerez Türleri</h2>
                </div>
                <ul className="list-none pl-0 space-y-1">
                  <li className="flex items-start gap-2"><span className="mt-1"><svg className="w-4 h-4 text-[#FFB996]" fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="10" r="10" /></svg></span>Oturum çerezleri (Session cookies)</li>
                  <li className="flex items-start gap-2"><span className="mt-1"><svg className="w-4 h-4 text-[#FFB996]" fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="10" r="10" /></svg></span>Kalıcı çerezler (Persistent cookies)</li>
                  <li className="flex items-start gap-2"><span className="mt-1"><svg className="w-4 h-4 text-[#FFB996]" fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="10" r="10" /></svg></span>Üçüncü taraf çerezleri (Third-party cookies)</li>
                </ul>
              </section>
              <section className="mb-6">
                <div className="flex items-center gap-2 mb-1">
                  <svg className="w-6 h-6 text-[#FF8B5E]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  <h2 className="text-2xl font-semibold mb-0">3. Çerezlerin Kullanım Amaçları</h2>
                </div>
                <p>Çerezler, site işlevselliğini sağlamak, kullanıcı tercihlerini hatırlamak, analiz ve performans ölçümü yapmak için kullanılır.</p>
                <p>
                  Google Analytics ve benzeri araçlarda <b>Geliştirilmiş Ölçüm</b> özelliği açık olarak kullanılmaktadır. Bu özellik; sayfa görüntüleme, tıklama, video izleme gibi ek site etkileşimlerini anonim olarak ölçer. Kimliği tanımlayabilecek hiçbir bilginin Google'a gönderilmediğinden emin olunur. Geliştirilmiş ölçüm hakkında detaylı bilgi için <a href="https://support.google.com/analytics/answer/9216061?hl=tr" target="_blank" rel="noopener" className="text-[#FF8B5E] underline">Google Analytics Yardım</a> sayfasını inceleyebilirsiniz.
                </p>
                <p>
                  Bu analizler, yalnızca çerez izni verdiğinizde başlatılır.
                </p>
              </section>
              <section className="mb-6">
                <div className="flex items-center gap-2 mb-1">
                  <svg className="w-6 h-6 text-[#FF8B5E]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  <h2 className="text-2xl font-semibold mb-0">4. Çerez Yönetimi</h2>
                </div>
                <p>Çerezleri tarayıcı ayarlarınızdan silebilir veya engelleyebilirsiniz. Ancak çerezleri devre dışı bırakmak, bazı site işlevlerinin çalışmamasına neden olabilir.</p>
              </section>
              <section className="mb-6">
                <div className="flex items-center gap-2 mb-1">
                  <svg className="w-6 h-6 text-[#FF8B5E]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  <h2 className="text-2xl font-semibold mb-0">5. Değişiklikler</h2>
                </div>
                <p>Çerez politikamızda değişiklik yapıldığında, güncel politika bu sayfada yayınlanacaktır.</p>
              </section>
              <section>
                <div className="flex items-center gap-2 mb-1">
                  <svg className="w-6 h-6 text-[#FF8B5E]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  <h2 className="text-2xl font-semibold mb-0">6. İletişim</h2>
                </div>
                <p>Çerez politikası ile ilgili sorularınız için <a href="mailto:info@kavunla.com" className="text-[#FF8B5E] underline">info@kavunla.com</a> adresinden bize ulaşabilirsiniz.</p>
              </section>
            </>
          ) : (
            <>
              <section className="mb-6">
                <div className="flex items-center gap-2 mb-1">
                  <svg className="w-6 h-6 text-[#FF8B5E]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  <h2 className="text-2xl font-semibold mb-0">1. What is a Cookie?</h2>
                </div>
                <p>Cookies are small text files stored on your device by your browser when you visit websites. Cookies are used to improve your site experience and to remember certain information.</p>
              </section>
              <section className="mb-6">
                <div className="flex items-center gap-2 mb-1">
                  <svg className="w-6 h-6 text-[#FF8B5E]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  <h2 className="text-2xl font-semibold mb-0">2. Types of Cookies</h2>
                </div>
                <ul className="list-none pl-0 space-y-1">
                  <li className="flex items-start gap-2"><span className="mt-1"><svg className="w-4 h-4 text-[#FFB996]" fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="10" r="10" /></svg></span>Session cookies</li>
                  <li className="flex items-start gap-2"><span className="mt-1"><svg className="w-4 h-4 text-[#FFB996]" fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="10" r="10" /></svg></span>Persistent cookies</li>
                  <li className="flex items-start gap-2"><span className="mt-1"><svg className="w-4 h-4 text-[#FFB996]" fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="10" r="10" /></svg></span>Third-party cookies</li>
                </ul>
              </section>
              <section className="mb-6">
                <div className="flex items-center gap-2 mb-1">
                  <svg className="w-6 h-6 text-[#FF8B5E]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  <h2 className="text-2xl font-semibold mb-0">3. Purposes of Cookie Usage</h2>
                </div>
                <p>Cookies are used to ensure site functionality, remember user preferences, and perform analytics and performance measurement.</p>
              </section>
              <section className="mb-6">
                <div className="flex items-center gap-2 mb-1">
                  <svg className="w-6 h-6 text-[#FF8B5E]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  <h2 className="text-2xl font-semibold mb-0">4. Cookie Management</h2>
                </div>
                <p>You can delete or block cookies from your browser settings. However, disabling cookies may prevent some site functions from working properly.</p>
              </section>
              <section className="mb-6">
                <div className="flex items-center gap-2 mb-1">
                  <svg className="w-6 h-6 text-[#FF8B5E]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  <h2 className="text-2xl font-semibold mb-0">5. Changes</h2>
                </div>
                <p>When our cookie policy is updated, the current policy will be published on this page.</p>
              </section>
              <section>
                <div className="flex items-center gap-2 mb-1">
                  <svg className="w-6 h-6 text-[#FF8B5E]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  <h2 className="text-2xl font-semibold mb-0">6. Contact</h2>
                </div>
                <p>If you have any questions about the cookie policy, you can contact us at <a href="mailto:info@kavunla.com" className="text-[#FF8B5E] underline">info@kavunla.com</a>.</p>
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
