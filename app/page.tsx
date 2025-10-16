'use client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { universities } from '@/data/universities';
import { useLanguage } from '@/src/contexts/LanguageContext';

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
    router.push(`/auth/register?role=${encodeURIComponent(role)}&university=${encodeURIComponent(searchTerm)}`);
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

  // Parallax
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

  // Reveal animations
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
    ? localUniversities.filter(uni => uni.toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 5)
    : localUniversities;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || loading) return;
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex(prev => (prev < filteredUniversities.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex(prev => (prev > 0 ? prev - 1 : prev));
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
        {/* Background */}
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
        {/* Content */}
        <div className="relative z-10" style={{ transform: `translateY(${parallaxY * 0.6}px)`, willChange: 'transform' }}>
          <div className="container mx-auto px-4">
            <div className="flex flex-col items-center">
              <div className="w-full max-w-6xl text-center mb-12">
                {/* Glass wrapper start */}
                <div className="mx-auto w-full rounded-3xl border-0 bg-transparent backdrop-blur-0 shadow-none p-0 sm:p-0 md:p-0 overflow-visible">
                  <h1 className="text-4xl md:text-6xl font-bold text-[#FFE8D8] mb-8 leading-[1.15] drop-shadow-lg opacity-0" data-reveal data-delay="0">
                    {t('home.mainTitle')}
                  </h1>
                  <div className="w-full max-w-3xl mx-auto mb-8 relative opacity-0 translate-y-2" data-reveal data-delay="50">
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
                  
                </div>
                {/* removed glass wrapper end */}
                {/* Glass wrapper end */}
              </div>
            </div>
          </div>
        </div>

        {/* Highlights */}
        <section className="relative z-20 mt-24">
          <div className="max-w-6xl mx-auto px-4">
            <div className="bg-white/80 backdrop-blur-sm border border-[#FFE5D9] rounded-3xl shadow-xl p-8 md:p-12">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-[#994D1C]">{t('home.highlights.title')}</h2>
                  <p className="text-[#6B3416]/80 mt-2 md:max-w-xl">{t('home.highlights.subtitle')}</p>
                </div>
                <Link
                  href="/kaynaklar"
                  className="self-start md:self-auto inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-[#FFB996] to-[#FF8B5E] text-white text-sm font-semibold shadow hover:shadow-lg transition"
                >
                  {t('home.cta.exploreResources')}
                </Link>
              </div>
              <div className="grid gap-6 md:grid-cols-3">
                <div className="group rounded-2xl border border-[#FFE5D9] bg-white/90 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                  <div className="w-12 h-12 rounded-full bg-[#FFE5D9] text-[#994D1C] flex items-center justify-center font-semibold mb-4">1</div>
                  <h3 className="text-lg font-semibold text-[#6B3416] mb-2">{t('home.highlights.items.resources.title')}</h3>
                  <p className="text-sm text-[#6B3416]/80">{t('home.highlights.items.resources.desc')}</p>
                </div>
                <div className="group rounded-2xl border border-[#FFE5D9] bg-white/90 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                  <div className="w-12 h-12 rounded-full bg-[#FFE5D9] text-[#994D1C] flex items-center justify-center font-semibold mb-4">2</div>
                  <h3 className="text-lg font-semibold text-[#6B3416] mb-2">{t('home.highlights.items.ai.title')}</h3>
                  <p className="text-sm text-[#6B3416]/80">{t('home.highlights.items.ai.desc')}</p>
                </div>
                <div className="group rounded-2xl border border-[#FFE5D9] bg-white/90 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                  <div className="w-12 h-12 rounded-full bg-[#FFE5D9] text-[#994D1C] flex items-center justify-center font-semibold mb-4">3</div>
                  <h3 className="text-lg font-semibold text-[#6B3416] mb-2">{t('home.highlights.items.projects.title')}</h3>
                  <p className="text-sm text-[#6B3416]/80">{t('home.highlights.items.projects.desc')}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Tools */}
        <section className="relative z-20 mt-16">
          <div className="max-w-6xl mx-auto px-4">
            <div className="mb-8 text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-[#994D1C]">{t('home.tools.title')}</h2>
              <p className="text-[#6B3416]/80 mt-2">{t('home.tools.subtitle')}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Link
                href="/not-cikar"
                className="group rounded-2xl border border-[#FFE5D9] bg-white/90 p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-[#6B3416]">{t('home.tools.aiNotes')}</h3>
                    <p className="text-sm text-[#6B3416]/70 mt-2">{t('home.highlights.items.ai.desc')}</p>
                  </div>
                  <span className="w-10 h-10 rounded-full bg-[#FFE5D9] text-[#994D1C] flex items-center justify-center font-semibold">AI</span>
                </div>
              </Link>
              <Link
                href="/soru-hazirlat"
                className="group rounded-2xl border border-[#FFE5D9] bg-white/90 p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-[#6B3416]">{t('home.tools.aiQuestions')}</h3>
                    <p className="text-sm text-[#6B3416]/70 mt-2">{t('home.highlights.items.ai.desc')}</p>
                  </div>
                  <span className="w-10 h-10 rounded-full bg-[#FFE5D9] text-[#994D1C] flex items-center justify-center font-semibold">Q</span>
                </div>
              </Link>
              <Link
                href="/kaynaklar"
                className="group rounded-2xl border border-[#FFE5D9] bg-white/90 p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-[#6B3416]">{t('home.tools.resources')}</h3>
                    <p className="text-sm text-[#6B3416]/70 mt-2">{t('home.highlights.items.resources.desc')}</p>
                  </div>
                  <span className="w-10 h-10 rounded-full bg-[#FFE5D9] text-[#994D1C] flex items-center justify-center font-semibold">📚</span>
                </div>
              </Link>
              <Link
                href="/projeler"
                className="group rounded-2xl border border-[#FFE5D9] bg-white/90 p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-[#6B3416]">{t('home.tools.projects')}</h3>
                    <p className="text-sm text-[#6B3416]/70 mt-2">{t('home.highlights.items.projects.desc')}</p>
                  </div>
                  <span className="w-10 h-10 rounded-full bg-[#FFE5D9] text-[#994D1C] flex items-center justify-center font-semibold">🤝</span>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* Featured Events */}
        <FeaturedEvents />

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


function FeaturedEvents() {
  const { t } = useLanguage();
  const [events, setEvents] = useState<any[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const fetchEvents = async () => {
      try {
        const response = await fetch('/api/events?limit=4');
        if (!response.ok) throw new Error('Failed to fetch events');
        const data = await response.json();
        if (!cancelled) {
          const list = Array.isArray(data?.data) ? data.data.slice(0, 4) : [];
          setEvents(list);
        }
      } catch (_) {
        if (!cancelled) setEvents([]);
      } finally {
        if (!cancelled) setLoadingEvents(false);
      }
    };
    fetchEvents();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="relative z-20 mt-16 mb-10">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-[#994D1C]">{t('home.featuredEvents.title')}</h2>
            <p className="text-[#6B3416]/80 mt-2">{t('home.featuredEvents.subtitle')}</p>
          </div>
          <Link
            href="/etkinlikler"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-[#FFE5D9] text-[#994D1C] font-semibold hover:bg-[#FFE5D9]/60 transition"
          >
            {t('home.featuredEvents.cta')}
          </Link>
        </div>

        {loadingEvents ? (
          <div className="flex justify-center py-12">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#FFB996]/40 border-t-[#FF8B5E]" />
          </div>
        ) : events.length === 0 ? (
          <div className="rounded-2xl border border-[#FFE5D9] bg-white/90 p-6 text-center text-[#6B3416]/80">
            {t('home.featuredEvents.empty')}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {events.map((event) => {
              const date = event?.date ? new Date(event.date) : null;
              const month = date ? date.toLocaleString(t('general.locale') === 'tr' ? 'tr-TR' : 'en-US', { month: 'short' }) : '';
              const day = date ? date.getDate() : '';
              return (
                <div key={event._id} className="group rounded-2xl border border-[#FFE5D9] bg-white/95 shadow-sm overflow-hidden transition hover:-translate-y-1 hover:shadow-lg">
                  <div className="relative h-40 w-full overflow-hidden">
                    <Image
                      src={event.photoUrl || '/images/default-event.jpg'}
                      alt={event.title || 'Event'}
                      fill
                      sizes="(max-width: 768px) 100vw, 25vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-4 left-4 bg-white/90 rounded-lg px-3 py-2 text-center text-[#994D1C]">
                      <div className="text-xs font-semibold uppercase">{month}</div>
                      <div className="text-lg font-bold leading-none">{day}</div>
                    </div>
                  </div>
                  <div className="p-5 space-y-3">
                    <div className="text-xs uppercase tracking-wide text-[#FF8B5E] font-semibold">{event.category || 'Etkinlik'}</div>
                    <h3 className="text-lg font-semibold text-[#6B3416] line-clamp-2">{event.title}</h3>
                    <p className="text-sm text-[#6B3416]/70 line-clamp-3">{event.description}</p>
                    <div className="text-xs text-[#6B3416]/60">
                      {event.location || 'Lokasyon paylaşılmadı'}
                    </div>
                    <Link
                      href={`/etkinlikler/${event._id}`}
                      className="inline-flex items-center gap-2 text-sm font-semibold text-[#994D1C] hover:text-[#FF8B5E]"
                    >
                      {t('home.featuredEvents.view')}
                      <span aria-hidden="true">→</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
