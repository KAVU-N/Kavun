'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { useAuth } from '@/context/AuthContext';
import type { User } from '../types/User';
import { useLanguage } from '../contexts/LanguageContext';
import Image from 'next/image';

// Custom hook for media query
function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);

  return matches;
}

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [mounted, setMounted] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const profileRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const { user, logout } = useAuth();
const typedUser = user as User | null;
  const { language, setLanguage, t } = useLanguage();

  // İstemci tarafında olduğumuzu işaretleyen effect
  useEffect(() => {
    setMounted(true);
    
    // Scroll olayını dinle
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    if (typeof window !== "undefined") {
      window.addEventListener('scroll', handleScroll);
    }
    
    // Okunmamış mesajları kontrol et
    if (typeof window !== "undefined" && mounted && user) {
      checkUnreadMessages();
    }
    
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener('scroll', handleScroll);
      }
    };
  }, [user]);

  // Scroll ve mesaj kontrolü için effect
  useEffect(() => {
    if (!mounted) return;
    
    // Okunmamış mesajları ve bildirimleri sadece client tarafında kontrol et
    if (user) {
      checkUnreadMessages();
      checkUnreadNotifications();
    }
    
    const interval = setInterval(() => {
      if (user) {
        checkUnreadMessages();
        checkUnreadNotifications();
      }
    }, 60000); // Her dakika kontrol et
    
    return () => clearInterval(interval);
  }, [mounted, user]);

  // Profil menüsü dışında bir yere tıklandığında menüyü kapat
  useEffect(() => {
    if (!mounted) return;
    
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };

    if (typeof window !== "undefined") {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      if (typeof window !== "undefined") {
        document.removeEventListener('mousedown', handleClickOutside);
      }
    };
  }, [mounted]);

  // Okunmamış mesajları kontrol et
  const checkUnreadMessages = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/messages/unread', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUnreadMessages(data.count || 0);
      }
    } catch (error) {
      console.error('Okunmamış mesajlar kontrol edilirken hata oluştu:', error);
    }
  };

  // Okunmamış bildirimleri kontrol et
  const checkUnreadNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      // Gerçek API'den okunmamış bildirim sayısını çek
      const response = await fetch('/api/notifications/unread', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUnreadNotifications(data.count || 0);
      } else {
        setUnreadNotifications(0);
      }
    } catch (error) {
      console.error('Okunmamış bildirimler kontrol edilirken hata oluştu:', error);
      setUnreadNotifications(0);
    }
  };

  // Navigasyon linkleri
  const navLinks = [
    { href: '/ilanlar', label: t('nav.listings'), icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    )},
    { href: '/kaynaklar', label: t('nav.resources'), icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    )}
  ];

  // İstemci tarafında render edilecek içerik
  const renderClientContent = () => {
    
    return (
      <nav className={`w-full transition-all duration-500 ${
        isScrolled ? 'bg-white/90 backdrop-blur-md shadow-lg py-2' : 'bg-transparent py-4'
      }`} suppressHydrationWarning>
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo - LEFT ve mobilde navLinks */}
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center space-x-2 group">
                <Image
                  src="/logo.png"
                  alt="Kavunla Logo"
                  width={40}
                  height={40}
                  className="mr-2"
                />
                <span className={`text-2xl font-bold transition-all duration-300 ${
                  pathname === '/'
                    ? (isScrolled
                        ? 'text-[#994D1C]'
                        : 'text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.20)]')
                    : (isScrolled ? 'text-[#6B3416]' : 'text-[#994D1C]')
                } group-hover:text-[#FF8B5E]`}>
                  KAVUNLA
                </span>
              </Link>
              {/* Mobilde hamburger menüsü kapalıyken navLinks */}
              {!isMenuOpen && isMobile && (
                <div className="flex items-center space-x-1 ml-2">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`group flex items-center space-x-2 px-3 py-2 rounded-xl font-semibold transition-all duration-300 ${
                        pathname === '/' ? (isScrolled ? 'text-[#994D1C] hover:text-[#FF8B5E]' : 'text-white hover:text-[#FF8B5E]') : 'text-[#994D1C]'
                      } hover:bg-[#FFE5D9]`}
                    >
                      <span className="transition-all duration-500 group-hover:rotate-12 group-hover:scale-110">{link.icon}</span>
                      <span>{link.label}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Mobile Menu Button - Only visible when menu is closed */}
            {!isMenuOpen && (
              <div className="flex md:hidden">
                {isMobile && (
                  <button
                    onClick={() => setIsMenuOpen(true)}
                    className="p-2 rounded-xl transition-all duration-300"
                  >
                    <svg className="w-6 h-6 text-[#994D1C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 12h16M4 18h16"
                      />
                    </svg>
                  </button>
                )}
              </div>
            )}

            {/* Desktop Navigation - CENTER */}
            <div className="hidden md:flex items-center justify-center flex-1">
              <div className="flex items-center space-x-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`group flex items-center space-x-2 px-4 py-2 rounded-xl transform transition-all duration-500 ${
                      pathname === '/' && isScrolled
                        ? 'text-[#994D1C] font-semibold hover:text-[#FF8B5E]'
                        : pathname === link.href
                          ? (pathname === '/' ? 'text-white font-semibold bg-[#994D1C]/80 shadow-md' : 'text-[#FFD6B2] font-semibold bg-[#994D1C]/80 shadow-md')
                          : (pathname === '/' ? 'text-white/90 font-semibold hover:text-[#FFD6B2] hover:bg-[#994D1C]/80 hover:-translate-y-1 hover:shadow-lg' : (link.href === '/ilanlar' || link.href === '/kaynaklar')
                            ? 'text-[#994D1C] font-semibold hover:text-white hover:bg-gradient-to-r hover:from-[#FF8B5E] hover:to-[#994D1C] hover:-translate-y-1 hover:shadow-lg'
                            : 'text-[#FFD6B2] hover:text-white hover:bg-gradient-to-r hover:from-[#FF8B5E] hover:to-[#994D1C] hover:-translate-y-1 hover:shadow-lg')
                    }`}
                  >
                    <div className="transition-all duration-500 group-hover:rotate-12 group-hover:scale-110">
                      {link.icon}
                    </div>
                    <span className="relative transition-all duration-300 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-white after:transition-all after:duration-500 group-hover:after:w-full">{link.label}</span>
                  </Link>
                ))}
                {/* Eğitmen ise İlan Ver butonu */}
                {mounted && user && (typedUser?.role === 'instructor' || typedUser?.role === 'teacher') && (
                  <Link
                    href="/ilan-ver"
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#FFB996] to-[#FF8B5E] text-white font-semibold shadow-md ml-2 hover:scale-105 transition-transform`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span>{t('nav.createListing')}</span>
                  </Link>
                )}
              </div>
            </div>

            {/* Profile/Auth Section - RIGHT */}
            <div className="hidden md:flex items-center justify-end space-x-4">
              {/* Dil Değiştirme Butonu */}
              <div className="flex items-center space-x-1 mr-2">
                <button
                  onClick={() => setLanguage('tr')}
                  className={`px-2 py-1 rounded-md text-sm font-medium transition-all duration-300 ${language === 'tr' ? 'bg-[#FF8B5E] text-white' : 'text-[#994D1C] hover:bg-[#FFE5D9]'}`}
                >
                  TR
                </button>
                <span className="text-gray-400">|</span>
                <button
                  onClick={() => setLanguage('en')}
                  className={`px-2 py-1 rounded-md text-sm font-medium transition-all duration-300 ${language === 'en' ? 'bg-[#FF8B5E] text-white' : 'text-[#994D1C] hover:bg-[#FFE5D9]'}`}
                >
                  EN
                </button>
              </div>
              
              {!user && (
                <div className="flex items-center space-x-4">
                  <Link
                    href="/auth/login"
                    className={`px-6 py-2 rounded-xl font-semibold transition-all duration-300 hover:bg-[#994D1C]/80 hover:scale-105 ${pathname === '/' ? 'text-white hover:text-[#FFD6B2]' : 'text-[#FFD6B2] hover:text-[#FFE8D8]'}`}
                  >
                    {t('nav.login')}
                  </Link>
                  <Link
                    href="/auth/register"
                    className="px-6 py-2 rounded-xl bg-gradient-to-r from-[#FFB996] to-[#FF8B5E] text-white font-medium 
                      transition-all duration-300 hover:shadow-lg hover:shadow-[#FFB996]/20 hover:scale-105 active:scale-[0.98]"
                  >
                    {t('nav.register')}
                  </Link>
                </div>
              )}
              
              {user && (
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className={
                      `flex items-center p-0 rounded-full transition-all duration-300 border-2 border-[#e4e2f5] shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#FFB996]`
                    }
                  >
                    <div className={`relative w-12 h-12 rounded-full flex items-center justify-center overflow-hidden bg-gradient-to-r from-[#FFB996] to-[#FF8B5E]`}>
  {typedUser?.profilePhotoUrl ? (
    <Image
      src={typedUser?.profilePhotoUrl ?? '/default-profile.png'}
      alt={typedUser?.name ?? 'Profil'}
      width={48}
      height={48}
      className="object-cover w-full h-full rounded-full"
    />
  ) : (
    <span className="text-white font-semibold text-lg select-none">
      {(typedUser?.name?.charAt(0)?.toUpperCase() ?? '?')}
    </span>
  )}
</div>
                  </button>
                  
                  {/* Profile Dropdown */}
                  {isProfileOpen && (
                    <div className="fixed right-2 top-20 mt-2 w-64 max-w-xs bg-white rounded-xl shadow-lg py-2 z-50 border border-[#FFE5D9]" style={{minWidth: '12rem', maxWidth: '95vw', right: 'min(0.5rem, calc(100vw - 270px))'}}>
                      <Link
                        href="/bildirimler"
                        className="block px-4 py-2 text-[#994D1C] hover:bg-[#FFF5F0] hover:text-[#6B3416] transition-colors duration-300"
                      >
                        <div className="flex items-center space-x-2">
                          <div className="relative">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                              />
                            </svg>
                            {unreadNotifications > 0 && (
                              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
                            )}
                          </div>
                          <span>{t('nav.notifications')}</span>
                          {unreadNotifications > 0 && (
                            <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                              {unreadNotifications > 9 ? '9+' : unreadNotifications}
                            </span>
                          )}
                        </div>
                      </Link>
                      <Link
                        href="/mesajlarim"
                        className="block px-4 py-2 text-[#994D1C] hover:bg-[#FFF5F0] hover:text-[#6B3416] transition-colors duration-300"
                      >
                        <div className="flex items-center space-x-2">
                          <div className="relative">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                            </svg>
                            {unreadMessages > 0 && (
                              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
                            )}
                          </div>
                          <span>{t('nav.messages')}</span>
                        </div>
                      </Link>
                      <Link
                        href="/derslerim"
                        className="block px-4 py-2 text-[#994D1C] hover:bg-[#FFF5F0] hover:text-[#6B3416] transition-colors duration-300"
                      >
                        <div className="flex items-center space-x-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>{t('nav.myLessons')}</span>
                        </div>
                      </Link>
                      {user && (typedUser?.role === 'instructor' || typedUser?.role === 'teacher') && (
                        <>
                          <Link
                            href="/ilanlarim"
                            className="block px-4 py-2 text-[#994D1C] hover:bg-[#FFF5F0] hover:text-[#6B3416] transition-colors duration-300"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            <span>{t('nav.myListings')}</span>
                          </Link>

                        </>
                      )}
                      <button
                        onClick={logout}
                        className="w-full text-left px-4 py-2 text-[#994D1C] hover:bg-[#FFF5F0] hover:text-[#6B3416] transition-colors duration-300"
                      >
                        <div className="flex items-center space-x-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          <span>{t('nav.logout')}</span>
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Eski hamburger menü düğmesi kaldırıldı */}
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white shadow-lg rounded-b-xl overflow-hidden">
            {/* navLinks hamburger menüde YOK, sadece navbar'da! */}
            {/* Mobile Language Switcher */}
            <div className="flex items-center justify-center space-x-2 py-2">
              <button
                onClick={() => setLanguage('tr')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-all duration-300 ${language === 'tr' ? 'bg-[#FF8B5E] text-white' : 'text-[#994D1C] hover:bg-[#FFE5D9]'}`}
              >
                TR
              </button>
              <span className="text-gray-400">|</span>
              <button
                onClick={() => setLanguage('en')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-all duration-300 ${language === 'en' ? 'bg-[#FF8B5E] text-white' : 'text-[#994D1C] hover:bg-[#FFE5D9]'}`}
              >
                EN
              </button>
            </div>
            <div className="flex justify-end px-4 pt-2">
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 rounded-xl transition-all duration-300"
              >
                <svg className="w-6 h-6 text-[#994D1C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="px-4 py-3 space-y-1">
              {/* Mobilde navLinks artık hamburger menüde gösterilmeyecek */}
              
              {!user ? (
                <div className="flex flex-col space-y-2 mt-4">
                  <Link
                    href="/auth/login"
                    className="px-6 py-2 rounded-xl text-[#994D1C] hover:text-[#6B3416] font-medium transition-all duration-300 hover:bg-[#FFF5F0] text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t('nav.login')}
                  </Link>
                  <Link
                    href="/auth/register"
                    className="px-6 py-2 rounded-xl bg-gradient-to-r from-[#FFB996] to-[#FF8B5E] text-white font-medium 
                      transition-all duration-300 hover:shadow-lg hover:shadow-[#FFB996]/20 hover:scale-105 active:scale-[0.98]"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t('nav.register')}
                  </Link>
                </div>
              ) : (
                <div className="space-y-2 mt-4 border-t border-[#FFE5D9] pt-4">
                  <Link
                    href="/profil"
                    className="flex items-center space-x-2 px-4 py-2 rounded-xl text-[#994D1C] hover:text-[#6B3416] transition-all duration-300 hover:bg-[#FFF5F0]"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>Profilim</span>
                  </Link>
                  <Link
                    href="/bildirimler"
                    className="flex items-center space-x-2 px-4 py-2 rounded-xl text-[#994D1C] hover:text-[#6B3416] transition-all duration-300 hover:bg-[#FFF5F0]"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div className="relative">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                        />
                      </svg>
                      {unreadNotifications > 0 && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
                      )}
                    </div>
                    <span>{t('nav.notifications')}</span>
                    {unreadNotifications > 0 && (
                      <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                        {unreadNotifications > 9 ? '9+' : unreadNotifications}
                      </span>
                    )}
                  </Link>
                  <Link
                    href="/mesajlarim"
                    className="flex items-center space-x-2 px-4 py-2 rounded-xl text-[#994D1C] hover:text-[#6B3416] transition-all duration-300 hover:bg-[#FFF5F0]"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div className="relative">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                      </svg>
                      {unreadMessages > 0 && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
                      )}
                    </div>
                    <span>Mesajlarım</span>
                  </Link>
                  <Link
                    href="/derslerim"
                    className="flex items-center space-x-2 px-4 py-2 rounded-xl text-[#994D1C] hover:text-[#6B3416] transition-all duration-300 hover:bg-[#FFF5F0]"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>Derslerim</span>
                  </Link>
                  {user && (typedUser?.role === 'teacher' || typedUser?.role === 'instructor') && (
                    <>
                      <Link
                        href="/ilanlarim"
                        className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                        pathname === '/' && isScrolled ? 'text-[#994D1C]' : 'text-[#994D1C]'
                      } hover:text-[#6B3416] hover:bg-[#FFF5F0]`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        <span>İlanlarım</span>
                      </Link>
                      
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    );
  };

  // Sunucu ve istemci tarafı render arasındaki farkı gidermek için
  // useEffect içinde mounted state'ini güncellediğimiz için, bu component ilk render edildiğinde
  // mounted false olacak ve sadece sunucu tarafında render edilebilecek içeriği göstereceğiz
  if (!mounted) {
    // Sunucu tarafında, client ile aynı ana DOM hiyerarşisini döndür (nav yapısı dahil)
    return (
      <div className="fixed w-full z-50">
        <nav className="w-full">
          <div className="mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between h-16">
              <div className="flex-shrink-0">
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 mr-2 bg-gray-200 rounded-full"></div>
                  <span className="text-2xl font-bold text-[#994D1C]">KAVUN</span>
                </div>
              </div>
              <div className="hidden md:flex items-center justify-center flex-1">
                <div className="flex items-center space-x-1">
                  {/* SSR'da boş bırak */}
                </div>
              </div>
              <div className="hidden md:flex items-center justify-end space-x-4">
                <div className="flex items-center space-x-4">
                  {/* SSR'da boş bırak */}
                </div>
              </div>
            </div>
          </div>
        </nav>
      </div>
    );
  }
  
  // İstemci tarafında (mounted true olduğunda) tam içeriği render et
  return (
    <div className="fixed w-full z-50">
      {renderClientContent()}
    </div>
  );
}