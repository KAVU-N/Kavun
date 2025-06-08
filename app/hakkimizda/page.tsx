'use client';
import Image from 'next/image';
import { FaGraduationCap, FaUsers, FaHandshake, FaChalkboardTeacher } from 'react-icons/fa';

export default function AboutPage() {
  // Değerlerimiz
  const values = [
    {
      icon: FaGraduationCap,
      title: 'Kaliteli Eğitim',
      description: 'Her öğrencinin potansiyelini en üst düzeye çıkarmak için yüksek kaliteli eğitim deneyimi sunmayı taahhüt ediyoruz.'
    },
    {
      icon: FaUsers,
      title: 'Topluluk',
      description: 'Öğrenciler ve eğitmenler arasında güçlü bir topluluk bağı oluşturarak birlikte öğrenme ve gelişme fırsatları yaratıyoruz.'
    },
    {
      icon: FaHandshake,
      title: 'Güven ve Şeffaflık',
      description: 'Tüm hizmetlerimizde dürüstlük, güven ve şeffaflık ilkelerini benimsiyoruz.'
    },
    {
      icon: FaChalkboardTeacher,
      title: 'Kişiselleştirilmiş Öğrenme',
      description: 'Her öğrencinin benzersiz ihtiyaçlarına ve öğrenme stiline uygun kişiselleştirilmiş eğitim deneyimleri sunuyoruz.'
    }
  ];

  // Ekip üyeleri
  const teamMembers = [
    {
      name: 'Kurucu & CEO',
      role: 'Kurucu & CEO',
      image: '/team/placeholder.jpg',
      bio: 'Eğitim teknolojileri alanında 10 yılı aşkın deneyime sahip, KAVUNLA\'nın vizyonunu şekillendiren lider.'
    },
    {
      name: 'Eğitim Direktörü',
      role: 'Eğitim Direktörü',
      image: '/team/placeholder.jpg',
      bio: 'Eğitim psikolojisi alanında uzman, platformumuzun eğitim metodolojisini geliştiriyor.'
    },
    {
      name: 'Teknoloji Direktörü',
      role: 'Teknoloji Direktörü',
      image: '/team/placeholder.jpg',
      bio: 'Yazılım geliştirme konusunda uzman, platformumuzun teknik altyapısını yönetiyor.'
    },
    {
      name: 'Topluluk Yöneticisi',
      role: 'Topluluk Yöneticisi',
      image: '/team/placeholder.jpg',
      bio: 'İletişim alanında uzman, öğrenci ve eğitmen topluluğumuzu büyütmek ve güçlendirmek için çalışıyor.'
    }
  ];

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Başlık */}
        <h1 className="text-4xl font-bold text-[#994D1C] text-center mb-8">
          Hakkımızda
        </h1>

        {/* Hikayemiz */}
        <div className="bg-white rounded-lg shadow-xl p-8 mb-12">
          <h2 className="text-2xl font-semibold text-[#994D1C] mb-4">
            Hikayemiz
          </h2>
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="w-full md:w-1/2">
              <p className="text-[#6B3416] mb-4">
                KAVUNLA, 2023 yılında eğitim alanında yaşanan zorlukları çözmek ve öğrencilerin kaliteli eğitime erişimini kolaylaştırmak amacıyla kuruldu. Platformumuz, öğrencileri alanında uzman eğitmenlerle buluşturarak kişiselleştirilmiş öğrenme deneyimi sunmayı hedefliyor.
              </p>
              <p className="text-[#6B3416] mb-4">
                Kuruluşumuzdan bu yana, binlerce öğrencinin akademik hedeflerine ulaşmasına yardımcı olduk ve yüzlerce nitelikli eğitmeni platformumuza dahil ettik. Misyonumuz, eğitimde fırsat eşitliği yaratmak ve herkesin potansiyelini en üst düzeye çıkarmasına yardımcı olmaktır.
              </p>
              <p className="text-[#6B3416]">
                KAVUNLA olarak, teknoloji ve eğitimi bir araya getirerek yenilikçi öğrenme çözümleri sunmaya devam ediyoruz. Öğrencilerimizin başarıları ve eğitmenlerimizin memnuniyeti, bizim en büyük motivasyon kaynağımızdır.
              </p>
            </div>
            <div className="w-full md:w-1/2 flex justify-center">
              <div className="relative w-full h-64 md:h-80 rounded-lg overflow-hidden">
                <Image
                  src="/about-us.jpg"
                  alt="KAVUNLA Ekibi"
                  fill
                  className="object-cover rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Misyon ve Vizyon */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-lg shadow-xl p-8">
            <h2 className="text-2xl font-semibold text-[#994D1C] mb-4">
              Misyonumuz
            </h2>
            <p className="text-[#6B3416]">
              Öğrencileri alanında uzman eğitmenlerle buluşturarak kişiselleştirilmiş, erişilebilir ve kaliteli eğitim fırsatları sunmak. Teknoloji ve eğitimi harmanlayarak öğrenme deneyimini daha etkili ve verimli hale getirmek.
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-xl p-8">
            <h2 className="text-2xl font-semibold text-[#994D1C] mb-4">
              Vizyonumuz
            </h2>
            <p className="text-[#6B3416]">
              Türkiye&#39;nin en güvenilir ve yenilikçi eğitim platformu olmak. Eğitimde fırsat eşitliği yaratarak toplumun her kesiminden öğrencilerin potansiyellerini gerçekleştirmelerine katkıda bulunmak.
            </p>
          </div>
        </div>

        {/* Değerlerimiz */}
        <div className="bg-white rounded-lg shadow-xl p-8 mb-12">
          <h2 className="text-2xl font-semibold text-[#994D1C] mb-6 text-center">
            Değerlerimiz
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <div key={index} className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-50 transition-colors">
                <value.icon className="text-4xl text-[#FF8B5E] mb-4" />
                <h3 className="text-xl font-semibold text-[#994D1C] mb-2 text-center">{value.title}</h3>
                <p className="text-[#6B3416] text-center">{value.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Ekibimiz */}
        <div className="bg-white rounded-lg shadow-xl p-8 mb-12">
          <h2 className="text-2xl font-semibold text-[#994D1C] mb-6 text-center">
            Ekibimiz
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {teamMembers.map((member, index) => (
              <div key={index} className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="w-32 h-32 rounded-full overflow-hidden mb-4 relative">
                  <Image
                    src={member.image}
                    alt={member.name}
                    width={128}
                    height={128}
                    className="object-cover"
                  />
                </div>
                <h3 className="text-xl font-semibold text-[#994D1C] mb-2 text-center">{member.role}</h3>
                <p className="text-[#6B3416] text-center text-sm">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>

        {/* İstatistikler */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h2 className="text-2xl font-semibold text-[#994D1C] mb-6 text-center">
            Rakamlarla KAVUNLA
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex flex-col items-center p-4">
              <span className="text-4xl font-bold text-[#FF8B5E] mb-2">5000+</span>
              <p className="text-[#6B3416] text-center">Öğrenci</p>
            </div>
            <div className="flex flex-col items-center p-4">
              <span className="text-4xl font-bold text-[#FF8B5E] mb-2">500+</span>
              <p className="text-[#6B3416] text-center">Eğitmen</p>
            </div>
            <div className="flex flex-col items-center p-4">
              <span className="text-4xl font-bold text-[#FF8B5E] mb-2">10000+</span>
              <p className="text-[#6B3416] text-center">Tamamlanan Ders</p>
            </div>
            <div className="flex flex-col items-center p-4">
              <span className="text-4xl font-bold text-[#FF8B5E] mb-2">4.8/5</span>
              <p className="text-[#6B3416] text-center">Ortalama Değerlendirme</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
