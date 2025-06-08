"use client";
import React from "react";
import { useLanguage } from "../../src/contexts/LanguageContext";

export default function TermsOfUsePage() {
  const { t, language } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF6ED] to-[#FFE5D9] flex items-center justify-center pt-24 pb-8 px-2">
      <div className="w-full max-w-3xl rounded-3xl shadow-2xl bg-white/90 border border-[#FFD6BA] p-6 sm:p-10 relative overflow-hidden">
        <div className="flex items-center gap-3 mb-8">
          <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#FFB996] shadow-lg">
            <svg className="w-7 h-7 text-[#994D1C]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 20h9" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m0 0l-2-2m2 2l2-2" /></svg>
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#994D1C] tracking-tight drop-shadow-lg">
            {language === "tr" ? "Kullanım Koşulları" : "Terms of Use"}
          </h1>
        </div>
        <div className="prose prose-lg max-w-none text-[#6B3416]">
          {language === "tr" ? (
            <>
              <section className="mb-6">
                <div className="flex items-center gap-2 mb-1">
                  <svg className="w-6 h-6 text-[#FF8B5E]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  <h2 className="text-2xl font-semibold mb-0">1. Kabul</h2>
                </div>
                <p>Kullanıcı, bu platformu kullanarak ki&#351;isel verilerinin i&#351;lenmesine ili&#351;kin ayd&#305;nlama metnini okudu&#287;unu ve kabul etti&#287;ini beyan eder. Koşulları kabul etmiyorsanız, lütfen platformu kullanmayınız.</p>
              </section>
              <section className="mb-6">
                <div className="flex items-center gap-2 mb-1">
                  <svg className="w-6 h-6 text-[#FF8B5E]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  <h2 className="text-2xl font-semibold mb-0">2. Hizmet Tanımı</h2>
                </div>
                <p>Kavunla Eğitim Platformu, eğitmenlerle öğrencileri buluşturan bir çevrimiçi eğitim platformudur. Platformda sunulan içerik ve hizmetler bilgilendirme amaçlıdır.</p>
              </section>
              <section className="mb-6">
                <div className="flex items-center gap-2 mb-1">
                  <svg className="w-6 h-6 text-[#FF8B5E]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  <h2 className="text-2xl font-semibold mb-0">3. Kullanıcı Sorumlulukları</h2>
                </div>
                <ul className="list-none pl-0 space-y-1">
                  <li className="flex items-start gap-2"><span className="mt-1"><svg className="w-4 h-4 text-[#FFB996]" fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="10" r="10" /></svg></span>Platforma doğru ve güncel bilgilerle kayıt olmak.</li>
                  <li className="flex items-start gap-2"><span className="mt-1"><svg className="w-4 h-4 text-[#FFB996]" fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="10" r="10" /></svg></span>Başka bir kişinin kimliğine bürünmemek.</li>
                  <li className="flex items-start gap-2"><span className="mt-1"><svg className="w-4 h-4 text-[#FFB996]" fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="10" r="10" /></svg></span>Platformun işleyişini bozacak davranışlarda bulunmamak.</li>
                  <li className="flex items-start gap-2"><span className="mt-1"><svg className="w-4 h-4 text-[#FFB996]" fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="10" r="10" /></svg></span>Yasalara ve platform kurallarına uymak.</li>
                </ul>
              </section>
              <section className="mb-6">
                <div className="flex items-center gap-2 mb-1">
                  <svg className="w-6 h-6 text-[#FF8B5E]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  <h2 className="text-2xl font-semibold mb-0">4. Fikri Mülkiyet</h2>
                </div>
                <p>Platformda yer alan tüm içeriklerin telif hakkı Kavunla Eğitim Platformu'na aittir. İzinsiz kopyalama ve dağıtım yasaktır.</p>
              </section>
              <section className="mb-6">
                <div className="flex items-center gap-2 mb-1">
                  <svg className="w-6 h-6 text-[#FF8B5E]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  <h2 className="text-2xl font-semibold mb-0">5. Sorumluluğun Sınırlandırılması</h2>
                </div>
                <p>Platformda sunulan içeriklerin doğruluğu ve güncelliği konusunda azami özen gösterilmekle birlikte, oluşabilecek hatalardan dolayı sorumluluk kabul edilmez. Kullanıcının kişisel verilerinin işlenmesine ilişkin hakları, veri sorumlusuna başvurarak kullanılabilir, düzeltilmesini veya silinmesini talep edebilir ve kişisel verilerinin işlenmesine itiraz edebilir.</p>
              </section>
              <section className="mb-6">
                <div className="flex items-center gap-2 mb-1">
                  <svg className="w-6 h-6 text-[#FF8B5E]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  <h2 className="text-2xl font-semibold mb-0">6. Koşullarda Değişiklik</h2>
                </div>
                <p>Kavunla Eğitim Platformu, kullanım koşullarını önceden bildirmeksizin değiştirme hakkını saklı tutar. Güncel koşullar bu sayfada yayınlanacaktır.</p>
              </section>
              <section>
                <div className="flex items-center gap-2 mb-1">
                  <svg className="w-6 h-6 text-[#FF8B5E]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  <h2 className="text-2xl font-semibold mb-0">7. İletişim</h2>
                </div>
                <p>Her türlü soru ve öneriniz için <a href="mailto:info@kavunla.com" className="text-[#FF8B5E] underline">info@kavunla.com</a> adresinden bize ulaşabilirsiniz.</p>
              </section>
            </>
          ) : (
            <>
              <section className="mb-6">
                <div className="flex items-center gap-2 mb-1">
                  <svg className="w-6 h-6 text-[#FF8B5E]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  <h2 className="text-2xl font-semibold mb-0">1. Acceptance</h2>
                </div>
                <p>By using this platform, you agree to all the terms of use stated below. If you do not accept the terms, please do not use the platform.</p>
              </section>
              <section className="mb-6">
                <div className="flex items-center gap-2 mb-1">
                  <svg className="w-6 h-6 text-[#FF8B5E]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  <h2 className="text-2xl font-semibold mb-0">2. Description of Service</h2>
                </div>
                <p>Kavun Education Platform is an online platform that connects instructors and students. The content and services provided are for informational purposes only.</p>
              </section>
              <section className="mb-6">
                <div className="flex items-center gap-2 mb-1">
                  <svg className="w-6 h-6 text-[#FF8B5E]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  <h2 className="text-2xl font-semibold mb-0">3. User Responsibilities</h2>
                </div>
                <ul className="list-none pl-0 space-y-1">
                  <li className="flex items-start gap-2"><span className="mt-1"><svg className="w-4 h-4 text-[#FFB996]" fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="10" r="10" /></svg></span>Registering with accurate and up-to-date information.</li>
                  <li className="flex items-start gap-2"><span className="mt-1"><svg className="w-4 h-4 text-[#FFB996]" fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="10" r="10" /></svg></span>Not impersonating another person.</li>
                  <li className="flex items-start gap-2"><span className="mt-1"><svg className="w-4 h-4 text-[#FFB996]" fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="10" r="10" /></svg></span>Not engaging in activities that disrupt the platform's operation.</li>
                  <li className="flex items-start gap-2"><span className="mt-1"><svg className="w-4 h-4 text-[#FFB996]" fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="10" r="10" /></svg></span>Complying with laws and platform rules.</li>
                </ul>
              </section>
              <section className="mb-6">
                <div className="flex items-center gap-2 mb-1">
                  <svg className="w-6 h-6 text-[#FF8B5E]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  <h2 className="text-2xl font-semibold mb-0">4. Intellectual Property</h2>
                </div>
                <p>All content on the platform is copyrighted by Kavun Education Platform. Unauthorized copying and distribution are prohibited.</p>
              </section>
              <section className="mb-6">
                <div className="flex items-center gap-2 mb-1">
                  <svg className="w-6 h-6 text-[#FF8B5E]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  <h2 className="text-2xl font-semibold mb-0">5. Limitation of Liability</h2>
                </div>
                <p>While every effort is made to ensure the accuracy and timeliness of the content provided on the platform, no responsibility is accepted for any errors that may occur.</p>
              </section>
              <section className="mb-6">
                <div className="flex items-center gap-2 mb-1">
                  <svg className="w-6 h-6 text-[#FF8B5E]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  <h2 className="text-2xl font-semibold mb-0">6. Changes to Terms</h2>
                </div>
                <p>Kavun Education Platform reserves the right to change the terms of use without prior notice. The current terms will be published on this page.</p>
              </section>
              <section>
                <div className="flex items-center gap-2 mb-1">
                  <svg className="w-6 h-6 text-[#FF8B5E]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  <h2 className="text-2xl font-semibold mb-0">7. Contact</h2>
                </div>
                <p>For any questions or suggestions, you can contact us at <a href="mailto:info@kavunla.com" className="text-[#FF8B5E] underline">info@kavunla.com</a>.</p>
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

