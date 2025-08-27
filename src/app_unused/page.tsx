import Image from "next/image";
import Link from "next/link";
import { FaRocket, FaGraduationCap, FaCode, FaUsers, FaCertificate, FaLaptop } from "react-icons/fa";
import { useEffect } from "react";
import { useLanguage } from '../contexts/LanguageContext';

export default function Home() {
  const { t } = useLanguage();

  useEffect(() => {
    // Sayfanın arka plan rengini ve metin rengini doğrudan JavaScript ile ayarla
    document.body.style.backgroundColor = "white";
    document.body.style.color = "#6B3416";
    
    // Footer'ı zorunlu olarak göster - CSS kurallarını doğrudan ezme
    const displayFooter = () => {
      const footer = document.querySelector('footer');
      if (footer) {
        footer.style.backgroundColor = "white";
        footer.style.borderTopColor = "#FFE5D9";
        footer.style.color = "#6B3416";
        footer.style.display = "";
        footer.style.position = "relative";
        footer.style.zIndex = "999";
        footer.style.opacity = "1";
        footer.style.padding = "2rem 0";
      }
    };
    
    // Sayfa yüklenir yüklenmez ve 1 saniye sonra tekrar kontrol edelim
    displayFooter();
    setTimeout(displayFooter, 1000);
    
    return () => {
      // Component unmount olduğunda
    };
  }, []);

  return (
    <div className="min-h-screen bg-white" style={{backgroundColor: 'white !important', color: '#6B3416 !important'}}>
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 md:pt-24 md:pb-24 bg-white" style={{backgroundColor: 'white !important'}}>
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col lg:flex-row items-center">
            <div className="lg:w-1/2 lg:pr-12 mb-10 lg:mb-0">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-[#6B3416]" style={{color: '#6B3416 !important'}}>
                {t('home.mainTitle')}
              </h1>
              <p className="text-xl text-[#994D1C] mb-8 max-w-xl" style={{color: '#994D1C !important'}}>
                {t('home.description')}
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/egitmenler"
                  className="px-8 py-3 rounded-full bg-gradient-to-r from-[#FFB996] to-[#FF8B5E] text-white font-medium 
                    transition-all duration-300 hover:shadow-lg hover:shadow-[#FFB996]/20 hover:scale-105 active:scale-[0.98]"
                  style={{backgroundColor: '#FFB996 !important', color: 'white !important'}}
                >
                  {t('home.exploreInstructors')}
                </Link>
                <Link
                  href="/auth/register"
                  className="px-8 py-3 rounded-full bg-[#FFE5D9] text-[#994D1C] font-medium 
                    transition-all duration-300 hover:bg-[#FFB996] hover:scale-105 active:scale-[0.98]"
                  style={{backgroundColor: '#FFE5D9 !important', color: '#994D1C !important'}}
                >
                  {t('home.registerNow')}
                </Link>
              </div>
            </div>
            <div className="lg:w-1/2">
              <div className="relative">
                <div className="relative z-10 rounded-2xl shadow-xl overflow-hidden bg-white h-[350px] flex items-center justify-center" style={{backgroundColor: 'white !important'}}>
                  <div className="text-[#994D1C] text-xl">Resim burada görünecek</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white" style={{backgroundColor: 'white !important'}}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#6B3416] mb-4" style={{color: '#6B3416 !important'}}>{t('home.whyKavun')}</h2>
            <p className="text-[#994D1C] max-w-2xl mx-auto" style={{color: '#994D1C !important'}}>
              {t('home.featuresDescription')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: FaUsers,
                title: t('home.featureExpertInstructors'),
                description: t('home.featureOneOnOne')
              },
              {
                icon: FaCertificate,
                title: t('home.featureCertified'),
                description: t('home.featureCertificatePrograms')
              },
              {
                icon: FaLaptop,
                title: t('home.featureFlexibleLearning'),
                description: t('home.featureFlexibleLearningDescription')
              },
              {
                icon: FaGraduationCap,
                title: t('home.featurePersonalized'),
                description: t('home.featurePersonalizedDescription')
              },
              {
                icon: FaRocket,
                title: t('home.featureCareerOpportunities'),
                description: t('home.featureCareerOpportunitiesDescription')
              },
              {
                icon: FaCode,
                title: t('home.featureUpToDateContent'),
                description: t('home.featureUpToDateContentDescription')
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="p-6 rounded-xl bg-white border border-[#FFE5D9] shadow-sm hover:shadow-md hover:border-[#FFB996] transition-all duration-300"
                style={{backgroundColor: 'white !important', borderColor: '#FFE5D9 !important'}}
              >
                <div className="w-12 h-12 rounded-full bg-[#FFE5D9] flex items-center justify-center mb-4" style={{backgroundColor: '#FFE5D9 !important'}}>
                  <feature.icon className="text-xl text-[#FF8B5E]" style={{color: '#FF8B5E !important'}} />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-[#6B3416]" style={{color: '#6B3416 !important'}}>{feature.title}</h3>
                <p className="text-[#994D1C]" style={{color: '#994D1C !important'}}>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-white" style={{backgroundColor: 'white !important'}}>
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-2xl p-8 md:p-12 shadow-lg" style={{backgroundColor: 'white !important'}}>
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="mb-6 md:mb-0 md:mr-8">
                <h2 className="text-2xl md:text-3xl font-bold text-[#6B3416] mb-3" style={{color: '#6B3416 !important'}}>
                  {t('home.startLearning')}
                </h2>
                <p className="text-[#994D1C] max-w-lg" style={{color: '#994D1C !important'}}>
                  {t('home.startLearningDescription')}
                </p>
              </div>
              <Link
                href="/auth/register"
                className="whitespace-nowrap px-8 py-3 rounded-full bg-[#FFB996] text-white font-medium 
                  transition-all duration-300 hover:shadow-lg hover:scale-105 active:scale-[0.98]"
                style={{backgroundColor: '#FFB996 !important', color: 'white !important'}}
              >
                {t('home.registerFree')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Özel Footer - Direkt buraya yerleştirildi */}
      <footer className="bg-white border-t border-[#FFE5D9] py-8 relative z-50" 
        style={{
          backgroundColor: 'white !important', 
          borderTopColor: '#FFE5D9 !important', 
          color: '#6B3416 !important',
          position: 'relative',
          zIndex: 999,
          display: 'block',
          opacity: 1
        }}>
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-[#FF8B5E] rounded-full flex items-center justify-center text-white font-bold" 
                  style={{backgroundColor: '#FF8B5E !important', color: 'white !important'}}>
                  K
                </div>
                <span className="text-2xl font-bold text-[#6B3416]" style={{color: '#6B3416 !important'}}>KAVUN</span>
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-x-8 gap-y-2">
              <Link href="/" className="text-[#994D1C] hover:text-[#FF8B5E]" style={{color: '#994D1C !important'}}>{t('nav.home')}</Link>
              <Link href="/egitmenler" className="text-[#994D1C] hover:text-[#FF8B5E]" style={{color: '#994D1C !important'}}>{t('nav.instructors')}</Link>
              <Link href="/hakkimizda" className="text-[#994D1C] hover:text-[#FF8B5E]" style={{color: '#994D1C !important'}}>{t('nav.about')}</Link>
              <Link href="/iletisim" className="text-[#994D1C] hover:text-[#FF8B5E]" style={{color: '#994D1C !important'}}>{t('nav.contact')}</Link>
            </div>
            <p className="text-[#994D1C] text-sm mt-4 md:mt-0" style={{color: '#994D1C !important'}}>
              &copy; {new Date().getFullYear()} Kavunla. {t('footer.allRightsReserved')}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
