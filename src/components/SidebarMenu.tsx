'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

export default function SidebarMenu() {
  const { user, logout } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  if (!mounted || !user) {
    return null;
  }

  const primaryLinks = [
    { href: '/ilanlar', label: t('nav.listings'), isComingSoon: true },
    { href: '/projeler', label: t('nav.projects') },
    { href: '/kaynaklar', label: t('nav.resources') },
    { href: '/etkinlikler', label: t('nav.events') },
    { href: '/kulupler', label: t('nav.clubs') },
    { href: '/soru-hazirlat', label: t('nav.aiAssistant') },
    { href: '/not-cikar', label: t('nav.aiNotes') },
  ];

  const secondaryLinks = [
    { href: '/profil', label: t('nav.profile') },
    { href: '/bildirimler', label: t('nav.notifications') },
    { href: '/mesajlarim', label: t('nav.messages') },
    { href: '/ilanlarim', label: t('nav.myListings') },
    { href: '/projelerim', label: t('nav.myProjects') },
  ];

  const linkBaseClass = 'flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 text-sm font-medium';
  const activeClass = 'bg-[#FFE5D9] text-[#994D1C] shadow-md';
  const inactiveClass = 'text-[#6B3416] hover:bg-[#FFF5F0] hover:text-[#994D1C]';

  return (
    <>
      <div className="fixed top-4 right-4 z-[65] hidden md:flex items-center space-x-2 bg-white border border-[#FFE5D9] rounded-full shadow-lg px-3 py-2">
        <button
          type="button"
          onClick={() => setLanguage('tr')}
          className={`px-2 py-1 rounded-md text-xs font-semibold transition-colors duration-300 ${language === 'tr' ? 'bg-[#FF8B5E] text-white' : 'text-[#994D1C] hover:bg-[#FFE5D9]'}`}
        >
          TR
        </button>
        <span className="text-[#D6B298]">|</span>
        <button
          type="button"
          onClick={() => setLanguage('en')}
          className={`px-2 py-1 rounded-md text-xs font-semibold transition-colors duration-300 ${language === 'en' ? 'bg-[#FF8B5E] text-white' : 'text-[#994D1C] hover:bg-[#FFE5D9]'}`}
        >
          EN
        </button>
      </div>

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`fixed top-4 left-4 z-[65] rounded-full bg-white shadow-lg border border-[#FFE5D9] p-3 text-[#994D1C] transition-transform duration-300 ${open ? 'scale-95' : 'hover:scale-105'}`}
        aria-label={open ? t('nav.closeMenu') : t('nav.openMenu')}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {open ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-[55]"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-72 max-w-[85vw] bg-white z-[60] shadow-xl border-r border-[#FFE5D9] transition-transform duration-300 ease-in-out flex flex-col ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="h-16" />
        <div className="px-4 py-4 border-b border-[#FFE5D9]">
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-full bg-gradient-to-r from-[#FFB996] to-[#FF8B5E] flex items-center justify-center text-white font-semibold">
              {user.profilePhotoUrl ? (
                <Image
                  src={user.profilePhotoUrl}
                  alt={user.name ?? 'Profil'}
                  width={48}
                  height={48}
                  className="object-cover w-full h-full rounded-full"
                />
              ) : (
                <span className="text-lg">{user.name?.charAt(0)?.toUpperCase() ?? '?'}</span>
              )}
            </div>
            <div>
              <div className="text-sm font-semibold text-[#994D1C]">{user.name ?? 'Kullanıcı'}</div>
              <div className="text-xs text-[#6B3416] opacity-80 truncate max-w-[140px]">{user.email ?? ''}</div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          <nav className="space-y-2">
            <div className="text-xs font-semibold uppercase text-[#6B3416] opacity-70 px-2">{t('nav.mainMenu')}</div>
            {primaryLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`${linkBaseClass} ${pathname === link.href ? activeClass : inactiveClass}`}
              >
                <span className="flex items-center gap-2">
                  {link.label}
                  {link.isComingSoon && (
                    <span className="text-[10px] font-semibold text-[#FF8B5E] bg-[#FFE5D9] rounded-full px-2 py-0.5 uppercase tracking-wider">
                      {t('nav.comingSoon')}
                    </span>
                  )}
                </span>
                {pathname === link.href && (
                  <svg className="w-4 h-4 text-[#FF8B5E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </Link>
            ))}
          </nav>

          <nav className="space-y-2">
            <div className="text-xs font-semibold uppercase text-[#6B3416] opacity-70 px-2">{t('nav.account')}</div>
            {secondaryLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`${linkBaseClass} ${pathname === link.href ? activeClass : inactiveClass}`}
              >
                <span>{link.label}</span>
                {pathname === link.href && (
                  <svg className="w-4 h-4 text-[#FF8B5E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </Link>
            ))}
          </nav>
        </div>

        <div className="px-4 py-4 border-t border-[#FFE5D9]">
          <button
            type="button"
            onClick={() => {
              logout();
              setOpen(false);
            }}
            className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-[#FF8B5E] to-[#FFB996] text-white font-semibold transition-transform duration-300 hover:scale-[1.02] active:scale-[0.98]"
          >
            {t('nav.logout')}
          </button>
        </div>
      </aside>
    </>
  );
}
