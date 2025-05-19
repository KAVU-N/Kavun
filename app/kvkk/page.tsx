"use client";
import React from "react";

export default function KvkkPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF6ED] to-[#FFE5D9] flex items-center justify-center pt-24 pb-8 px-2">
      <div className="w-full max-w-3xl rounded-3xl shadow-2xl bg-white/90 border border-[#FFD6BA] p-6 sm:p-10 relative overflow-hidden">
        <div className="flex items-center gap-3 mb-8">
          <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#FFB996] shadow-lg">
            <svg className="w-7 h-7 text-[#994D1C]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 20h9" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m0 0l-2-2m2 2l2-2" /></svg>
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#994D1C] tracking-tight drop-shadow-lg">
            KAVUNLA KİŞİSEL VERİLERİN KORUNMASI KANUNU (KVKK) AYDINLATMA METNİ
          </h1>
        </div>
        <div className="prose prose-lg max-w-none text-[#6B3416]">
          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-2">1. Veri Sorumlusu ve İletişim Bilgileri</h2>
            <p>6698 sayılı Kişisel Verilerin Korunması Kanunu (“KVKK”) uyarınca, kişisel verileriniz veri sorumlusu sıfatıyla aşağıda bilgileri yer alan Kavunla (“Şirket”) tarafından işlenmektedir.</p>
            <ul className="list-disc pl-6">
              <li><b>Şirket Unvanı:</b> Kavunla Teknoloji ve Eğitim Hizmetleri A.Ş.</li>
              <li><b>Adres:</b> [Şirket adresinizi buraya ekleyin]</li>
              <li><b>E-posta:</b> info@kavunla.com</li>
              <li><b>Telefon:</b> [Telefon numarası eklenebilir]</li>
            </ul>
          </section>
          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-2">2. İşlenen Kişisel Veriler</h2>
            <p>Kavunla olarak, kullanıcılarımızdan aşağıdaki kişisel verileri toplamaktayız:</p>
            <ul className="list-disc pl-6">
              <li>Ad, soyad</li>
              <li>E-posta adresi</li>
              <li>Telefon numarası</li>
              <li>IP adresi</li>
              <li>Kart bilgileri (ödeme işlemleri için, güvenli ödeme altyapısı üzerinden ve gerekli güvenlik önlemleri alınarak; kart bilgileriniz sistemlerimizde saklanmaz)</li>
              <li>Kullanıcı tarafından siteye eklenen kaynaklar ve içerikler (metin, görsel, dosya vb.)</li>
              <li>Çerez verileri ve işlem geçmişi</li>
            </ul>
          </section>
          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-2">3. Kişisel Verilerin İşlenme Amaçları</h2>
            <p>Toplanan kişisel verileriniz;</p>
            <ul className="list-disc pl-6">
              <li>Üyelik ve kullanıcı işlemlerinin yürütülmesi</li>
              <li>Ödeme işlemlerinin güvenli şekilde gerçekleştirilmesi</li>
              <li>Kullanıcıların eklediği kaynakların yönetilmesi ve yayınlanması</li>
              <li>Hizmetlerimizin sunulması, geliştirilmesi ve iyileştirilmesi</li>
              <li>Taleplerin ve şikayetlerin yönetilmesi</li>
              <li>Yasal yükümlülüklerin yerine getirilmesi</li>
            </ul>
            <p>amaçlarıyla işlenmektedir.</p>
          </section>
          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-2">4. Kişisel Verilerin Toplanma Yöntemi ve Hukuki Sebebi</h2>
            <p>Kişisel verileriniz; web sitemiz, mobil uygulamamız, e-posta, çerezler ve benzeri elektronik ortamlar aracılığıyla, KVKK’nın 5. ve 6. maddelerinde belirtilen hukuki sebeplerle toplanmaktadır.</p>
          </section>
          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-2">5. Kişisel Verilerin Aktarılması</h2>
            <p>Kişisel verileriniz;</p>
            <ul className="list-disc pl-6">
              <li>Yasal zorunluluklar kapsamında yetkili kamu kurum ve kuruluşları,</li>
              <li>Ödeme altyapısı sağlayıcıları ve hizmet aldığımız üçüncü kişiler (barındırma, e-posta, analiz, ödeme hizmetleri vb.),</li>
              <li>Yurt dışında sunucusu bulunan hizmet sağlayıcıları (ör. e-posta, bulut barındırma, analiz hizmetleri)</li>
            </ul>
            <p>ile, KVKK’nın 8. ve 9. maddelerine uygun olarak paylaşılabilir.</p>
          </section>
          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-2">6. Kişisel Verilerin Saklanma Süresi</h2>
            <p>Kişisel verileriniz, ilgili mevzuatta öngörülen süreler boyunca veya işleme amacının gerektirdiği süre boyunca saklanacaktır. Örneğin, üyelik sona erdikten sonra yasal saklama süresi kadar daha tutulabilir. Süre sonunda kişisel verileriniz silinir, yok edilir veya anonim hale getirilir.</p>
          </section>
          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-2">7. Kişisel Verilerin Güvenliği</h2>
            <p>Kavunla olarak, kişisel verilerinizin güvenliğini sağlamak amacıyla gerekli tüm teknik ve idari tedbirleri almaktayız. Özellikle kart bilgileriniz, uluslararası güvenlik standartlarına uygun ödeme altyapıları üzerinden ve şifrelenmiş olarak işlenmektedir. Kart bilgileriniz sistemlerimizde saklanmaz, sadece ödeme işlemi sırasında güvenli şekilde iletilir.</p>
          </section>
          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-2">8. İlgili Kişinin Hakları</h2>
            <p>KVKK’nın 11. maddesi kapsamında, kişisel verilerinizle ilgili olarak;</p>
            <ul className="list-disc pl-6">
              <li>Kişisel veri işlenip işlenmediğini öğrenme</li>
              <li>İşlenmişse bilgi talep etme</li>
              <li>Amacına uygun kullanılıp kullanılmadığını öğrenme</li>
              <li>Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme</li>
              <li>Eksik veya yanlış işlenmişse düzeltilmesini isteme</li>
              <li>Silinmesini veya yok edilmesini isteme</li>
              <li>Aktarıldığı üçüncü kişilere bildirilmesini isteme</li>
              <li>İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle aleyhinize bir sonucun ortaya çıkmasına itiraz etme</li>
              <li>Zarara uğramanız halinde zararın giderilmesini talep etme</li>
            </ul>
            <p>haklarına sahipsiniz. Başvurularınızı <a href="mailto:info@kavunla.com" className="text-[#FF8B5E] underline">info@kavunla.com</a> adresine iletebilirsiniz.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold mb-2">9. Değişiklikler</h2>
            <p>Bu Aydınlatma Metni’nde değişiklik yapma hakkımız saklıdır. Güncel metin web sitemizde yayımlanacaktır.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
