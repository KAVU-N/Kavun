'use client';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { universities } from '@/data/universities';
import Link from 'next/link';
import { useLanguage } from '@/src/contexts/LanguageContext';
import { FiFolder, FiBookOpen, FiUsers } from 'react-icons/fi';
import { HiOutlineMegaphone } from 'react-icons/hi2';

export default function Home() {
  const router = useRouter();
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(true);
  const [localUniversities, setLocalUniversities] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [error, setError] = useState('');
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [parallaxY, setParallaxY] = useState(0);

  const handleRoleSelect = (role: 'student' | 'instructor') => {
    router.push(`/auth/register?role=${role}&university=${encodeURIComponent(searchTerm)}`);
  };

  const handleCloseDialog = () => {
    setShowRoleDialog(false);
  };

  const handleDialogKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleCloseDialog();
    }
  };

  const handleUniversitySelect = (uni: string) => {
    setSearchTerm(uni);
    setShowDropdown(false);
    setActiveIndex(-1);
    setError('');
    setShowRoleDialog(true);
  };

  const handleShowAllUniversities = () => {
    setSearchTerm('');
    setShowDropdown(true);
    setError('');
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setLocalUniversities(universities);
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Parallax: hero içeriklerini scroll'a göre çok hafif yukarı/aşağı kaydır
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY || 0;
      const clamped = Math.min(30, Math.max(0, y * 0.1));
      setParallaxY(clamped);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Scroll-reveal: görünür olan öğelere fade-up animasyonu uygula
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const els = document.querySelectorAll('[data-reveal]');
    if (prefersReduced) {
      els.forEach((el) => {
        (el as HTMLElement).classList.remove('opacity-0', 'translate-y-2');
      });
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          const target = e.target as HTMLElement;
          if (e.isIntersecting) {
            const delay = target.getAttribute('data-delay');
            if (delay) target.style.animationDelay = `${delay}ms`;
            target.classList.add('animate-fade-up');
            target.classList.remove('opacity-0', 'translate-y-2');
            io.unobserve(target);
          }
        });
      },
      { threshold: 0.15 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    setActiveIndex(-1);
    setError('');
  }, [searchTerm]);

  const filteredUniversities = searchTerm
    ? localUniversities
        .filter(uni => 
          uni.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .slice(0, 5)
    : localUniversities;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || loading) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex(prev => 
          prev < filteredUniversities.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex(prev => prev > 0 ? prev - 1 : prev);
        break;
      case 'Enter':
        if (activeIndex >= 0 && activeIndex < filteredUniversities.length) {
          handleUniversitySelect(filteredUniversities[activeIndex]);
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        setActiveIndex(-1);
        break;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#FFF5F0]">
          <main className="relative py-20 pt-40 flex-grow mb-0 pb-16 overflow-hidden" style={{ minHeight: '100vh' }}>
  {/* Background görsel ve overlay */}
  <div className="absolute inset-0 w-full h-full z-0">
    <Image 
      src="/images/homepage-students.jpg" 
      alt="Kütüphanede ders çalışan öğrenciler arka plan" 
      fill
      priority
      sizes="100vw"
      className="object-cover animate-slow-pan origin-center motion-reduce:animate-none" 
      style={{ objectPosition: 'center 40%', filter: 'brightness(0.55)', willChange: 'transform', transformOrigin: 'center', animation: 'slowpan 20s ease-in-out infinite' }}
    />
    <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/20 to-transparent" />
    <div className="absolute inset-0 bg-[#994D1C]/20 mix-blend-multiply" />
  </div>
  {/* İçerik */}
  <div className="relative z-10" style={{ transform: `translateY(${parallaxY * 0.6}px)`, willChange: 'transform' }}>
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center">
            <div className="w-full max-w-3xl text-center mb-12">
              <h1 className="text-4xl md:text-6xl font-bold text-[#FFE8D8] mb-8 leading-[1.15] drop-shadow-lg opacity-0" data-reveal data-delay="0">
                {t('home.mainTitle')}
              </h1>
              <div className="w-full max-w-xl mx-auto mb-8 relative opacity-0 translate-y-2" data-reveal data-delay="50">
                <div className="w-full relative">
                  <div 
                    className="absolute inset-y-0 right-3 flex items-center cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={handleShowAllUniversities}
                    role="button"
                    aria-label="Tüm üniversiteleri göster"
                  >
                    <svg 
                      className="w-5 h-5 text-[#FFB996]" 
                      xmlns="http://www.w3.org/2000/svg" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                      />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder={t('home.selectUniversity')}
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setShowDropdown(true);
                      setError('');
                    }}
                    onFocus={() => setShowDropdown(true)}
                    onBlur={() => {
                      setTimeout(() => setShowDropdown(false), 200);
                    }}
                    onKeyDown={handleKeyDown}
                    className={`w-full pl-4 pr-10 py-3 rounded-full outline-none transition-all duration-200 border
                      ${loading 
                        ? 'border-white/30 bg-white/10 backdrop-blur-md text-white placeholder-white/70 opacity-75 cursor-not-allowed animate-pulse' 
                        : error
                          ? 'border-white/40 bg-white/15 backdrop-blur-md text-white placeholder-white/70 focus:border-[#FF8B5E] focus:ring-2 focus:ring-[#FF8B5E]/30'
                          : 'border-white/30 bg-white/15 backdrop-blur-md text-white placeholder-white/70 hover:border-white/50 focus:border-white/70 focus:ring-2 focus:ring-white/20'
                      }`}
                    disabled={loading}
                    role="combobox"
                    aria-expanded={showDropdown}
                    aria-controls="university-listbox"
                    aria-activedescendant={activeIndex >= 0 ? `university-option-${activeIndex}` : undefined}
                    aria-label="Üniversite ara"
                    aria-busy={loading}
                    aria-invalid={!!error}
                  />
                  {error && (
                    <div className="absolute mt-1 text-sm text-[#FF8B5E] font-medium" role="alert">
                      {error}
                    </div>
                  )}
                  {loading && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2" aria-hidden="true">
                      <div className="animate-spin rounded-full h-5 w-5 border-[2.5px] border-[#FFB996]/30 border-t-[#FF8B5E] shadow-sm"></div>
                    </div>
                  )}
                </div>
                {showDropdown && (
                  <div 
                    ref={dropdownRef}
                    id="university-listbox"
                    role="listbox"
                    className="absolute w-full mt-1 rounded-lg shadow-xl z-10 max-h-60 overflow-y-auto bg-white/10 backdrop-blur-lg border border-white/20 text-white"
                    aria-label="Üniversite seçenekleri"
                  >
                    {loading ? (
                      <div className="px-4 py-3 text-[#994D1C] text-center" role="status">
                        <div className="inline-block animate-spin rounded-full h-4 w-4 border-[2.5px] border-[#FFB996]/30 border-t-[#FF8B5E] shadow-sm mr-2" aria-hidden="true"></div>
                        <span className="animate-pulse">{t('home.loadingUniversities')}</span>
                      </div>
                    ) : filteredUniversities.length > 0 ? (
                      <>
                        {!searchTerm && (
                          <div className="px-4 py-2 text-sm text-[#994D1C] bg-[#FFE5D9]/30">
                            {t('home.allUniversities')}
                          </div>
                        )}
                        {filteredUniversities.map((uni, index) => (
                          <div
                            key={index}
                            id={`university-option-${index}`}
                            role="option"
                            aria-selected={index === activeIndex}
                            className={`group px-4 py-3 hover:bg-gradient-to-r hover:from-[#FFE5D9] hover:to-[#FFF5F0] cursor-pointer transition-all duration-200
                              ${index === activeIndex ? 'bg-gradient-to-r from-[#FFE5D9] to-[#FFF5F0]' : ''}`}
                            onClick={() => handleUniversitySelect(uni)}
                          >
                            <div className={`transition-colors duration-200
                              ${index === activeIndex ? 'text-[#6B3416]' : 'text-[#994D1C] group-hover:text-[#6B3416]'}`}>
                              {uni}
                            </div>
                          </div>
                        ))}
                      </>
                    ) : (
                      <div className="px-4 py-3 text-[#994D1C] text-center" role="status">
                        {t('general.noResults')}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <p className="text-xl text-[#FFD6B2] mb-8 drop-shadow opacity-0 translate-y-2" data-reveal data-delay="100">
                {t('home.description')}
              </p>
              <div className="mx-auto max-w-3xl px-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <Link href="/ilanlar" className="group relative overflow-hidden flex items-center gap-3 rounded-xl bg-white/10 border border-white/15 backdrop-blur-md p-4 hover:bg-white/15 hover:-translate-y-0.5 hover:brightness-110 transition shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 opacity-0 translate-y-2" data-reveal data-delay="0">
                    <div className="shrink-0 h-10 w-10 rounded-full bg-white/15 border border-white/20 flex items-center justify-center text-white/90 group-hover:text-white transition group-hover:bg-white/20 group-hover:border-white/40 animate-float-slow motion-reduce:animate-none">
                      <HiOutlineMegaphone className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-white font-medium truncate">{t('nav.listings')}</div>
                      <div className="text-white/70 text-sm truncate">{t('home.cards.listings.subtitle')}</div>
                    </div>
                    <span className="pointer-events-none absolute inset-y-0 -skew-x-12 left-[-120%] w-1/3 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-70 will-change-transform group-hover:animate-shine" />
                  </Link>
                  <Link href="/projeler" className="group relative overflow-hidden flex items-center gap-3 rounded-xl bg-white/10 border border-white/15 backdrop-blur-md p-4 hover:bg-white/15 hover:-translate-y-0.5 hover:brightness-110 transition shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 opacity-0 translate-y-2" data-reveal data-delay="100">
                    <div className="shrink-0 h-10 w-10 rounded-full bg-white/15 border border-white/20 flex items-center justify-center text-white/90 group-hover:text-white transition group-hover:bg-white/20 group-hover:border-white/40 animate-float-slow motion-reduce:animate-none">
                      <FiFolder className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-white font-medium truncate">{t('home.cards.projects.title')}</div>
                      <div className="text-white/70 text-sm truncate">{t('home.cards.projects.subtitle')}</div>
                    </div>
                    <span className="pointer-events-none absolute inset-y-0 -skew-x-12 left-[-120%] w-1/3 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-70 will-change-transform group-hover:animate-shine" />
                  </Link>
                  <Link href="/kaynaklar" className="group relative overflow-hidden flex items-center gap-3 rounded-xl bg-white/10 border border-white/15 backdrop-blur-md p-4 hover:bg-white/15 hover:-translate-y-0.5 hover:brightness-110 transition shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 opacity-0 translate-y-2" data-reveal data-delay="200">
                    <div className="shrink-0 h-10 w-10 rounded-full bg-white/15 border border-white/20 flex items-center justify-center text-white/90 group-hover:text-white transition group-hover:bg-white/20 group-hover:border-white/40 animate-float-slow motion-reduce:animate-none">
                      <FiBookOpen className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-white font-medium truncate">{t('home.cards.resources.title')}</div>
                      <div className="text-white/70 text-sm truncate">{t('home.cards.resources.subtitle')}</div>
                    </div>
                    <span className="pointer-events-none absolute inset-y-0 -skew-x-12 left-[-120%] w-1/3 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-70 will-change-transform group-hover:animate-shine" />
                  </Link>
                  <Link href="/kulupler" className="group relative overflow-hidden flex items-center gap-3 rounded-xl bg-white/10 border border-white/15 backdrop-blur-md p-4 hover:bg-white/15 hover:-translate-y-0.5 hover:brightness-110 transition shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 opacity-0 translate-y-2" data-reveal data-delay="300">
                    <div className="shrink-0 h-10 w-10 rounded-full bg-white/15 border border-white/20 flex items-center justify-center text-white/90 group-hover:text-white transition group-hover:bg-white/20 group-hover:border-white/40 animate-float-slow motion-reduce:animate-none">
                      <FiUsers className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-white font-medium truncate">Kulüpler</div>
                      <div className="text-white/70 text-sm truncate">Üniversite kulüplerini keşfet</div>
                    </div>
                    <span className="pointer-events-none absolute inset-y-0 -skew-x-12 left-[-120%] w-1/3 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-70 will-change-transform group-hover:animate-shine" />
                  </Link>
                </div>
              </div>
              
            </div>
          </div>
        </div>
      </div>
      {/* Özellik Tanıtım Bölümü */}
      <section className="relative z-20 mt-24 py-16">
        <div className="max-w-6xl mx-auto px-4 grid gap-8 md:grid-cols-4">
          {/* İlanlar Card (sol) */}
          <Link href="/ilanlar" className="group relative rounded-2xl overflow-hidden shadow-lg transition duration-300 hover:-translate-y-1 hover:shadow-2xl opacity-0 translate-y-2" data-reveal data-delay="0">
            <div className="relative h-60 w-full overflow-hidden">
              <Image src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=60" alt="Duyuru panosu" fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition-transform duration-300 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent transition-opacity" />
            </div>
            <div className="absolute inset-x-0 bottom-0 p-4">
              <h3 className="text-white text-lg font-semibold">{t('home.cards.listings.title')}</h3>
              <p className="text-gray-200 text-sm">{t('home.cards.listings.subtitle')}</p>
            </div>
          </Link>
          {/* Projeler (orta) */}
          <Link href="/projeler" className="group relative rounded-2xl overflow-hidden shadow-lg transition duration-300 hover:-translate-y-1 hover:shadow-2xl opacity-0 translate-y-2" data-reveal data-delay="100">
            <div className="relative h-60 w-full overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=60"
                alt="Projeler"
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent transition-opacity" />
            </div>
            <div className="absolute inset-x-0 bottom-0 p-4">
              <h3 className="text-white text-lg font-semibold">{t('home.cards.projects.title')}</h3>
              <p className="text-gray-200 text-sm">{t('home.cards.projects.subtitle')}</p>
            </div>
          </Link>

          {/* Kaynaklar */}
          <Link href="/kaynaklar" className="group relative rounded-2xl overflow-hidden shadow-lg transition duration-300 hover:-translate-y-1 hover:shadow-2xl opacity-0 translate-y-2" data-reveal data-delay="200">
            <div className="relative h-60 w-full overflow-hidden">
              <Image src="/images/kaynaklar.jpg" alt="Kaynaklar" fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition-transform duration-300 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent transition-opacity" />
            </div>
            <div className="absolute inset-x-0 bottom-0 p-4">
              <h3 className="text-white text-lg font-semibold">{t('home.cards.resources.title')}</h3>
              <p className="text-gray-200 text-sm">{t('home.cards.resources.subtitle')}</p>
            </div>
          </Link>
          {/* Kulüpler */}
          <Link href="/kulupler" className="group relative rounded-2xl overflow-hidden shadow-lg transition duration-300 hover:-translate-y-1 hover:shadow-2xl opacity-0 translate-y-2" data-reveal data-delay="300">
            <div className="relative h-60 w-full overflow-hidden">
              <Image src="https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=800&q=60" alt="Kulüpler" fill sizes="(max-width: 768px) 100vw, 25vw" className="object-cover transition-transform duration-300 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent transition-opacity" />
            </div>
            <div className="absolute inset-x-0 bottom-0 p-4">
              <h3 className="text-white text-lg font-semibold">Kulüpler</h3>
              <p className="text-gray-200 text-sm">Üniversite kulüplerini keşfet</p>
            </div>
          </Link>


          </div>
      </section>

      </main>

      {showRoleDialog && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={handleCloseDialog}
        >
          <div 
            className="bg-white rounded-lg p-6 max-w-sm w-full"
            onClick={e => e.stopPropagation()}
            onKeyDown={handleDialogKeyDown}
            role="dialog"
            aria-modal="true"
            aria-labelledby="role-dialog-title"
          >
            <h2 
              id="role-dialog-title" 
              className="text-2xl font-bold text-[#6B3416] mb-4 text-center"
            >
              {t('home.howToContinue')}
            </h2>
            <div className="flex flex-col gap-4">
              <button
                onClick={() => handleRoleSelect('student')}
                className="w-full px-8 py-3 bg-[#FFB996] text-[#994D1C] font-semibold rounded-full hover:bg-[#FF8B5E] hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                aria-label={t('home.continueAsStudent')}
              >
                {t('home.continueAsStudent')}
              </button>
              <button
                onClick={() => handleRoleSelect('instructor')}
                className="w-full px-8 py-3 bg-[#FFE5D9] text-[#994D1C] font-semibold rounded-full hover:bg-[#FFB996] hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                aria-label={t('home.continueAsInstructor')}
              >
                {t('home.continueAsInstructor')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}