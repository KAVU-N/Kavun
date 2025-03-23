'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    setIsProfileOpen(false);
    logout();
  };

  const navLinks = [
    { href: '/egitmenler', label: 'Eğitmenler', icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    )},
    { href: '/iletisim', label: 'İletişim', icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    )}
  ];

  return (
    <nav className={`fixed w-full z-50 transition-all duration-500 ${
      isScrolled ? 'bg-white/90 backdrop-blur-md shadow-lg py-2' : 'bg-transparent py-4'
    }`}>
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo - LEFT */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center space-x-2 group">
              <Image
                src="/logo.png"
                alt="Kavun Logo"
                width={40}
                height={40}
                className="mr-2"
              />
              <span className={`text-2xl font-bold transition-all duration-300 ${
                isScrolled ? 'text-[#6B3416]' : 'text-[#994D1C]'
              } group-hover:text-[#FF8B5E]`}>
                KAVUN
              </span>
            </Link>
          </div>

          {/* Desktop Navigation - CENTER */}
          <div className="hidden md:flex items-center justify-center">
            <div className="flex items-center space-x-1">
              {navLinks
                .filter(link => link.label !== 'Eğitmenler' || user)
                .map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                      pathname === link.href
                        ? 'text-[#6B3416] font-medium bg-[#FFF5F0] shadow-sm'
                        : 'text-[#994D1C] hover:text-[#6B3416] hover:bg-[#FFF5F0] hover:scale-105'
                    }`}
                  >
                    {link.icon}
                    <span>{link.label}</span>
                  </Link>
                ))}
            </div>
          </div>

          {/* Profile/Auth Section - RIGHT */}
          <div className="hidden md:flex items-center justify-end space-x-4">
            {!user && (
              <div className="flex items-center space-x-4">
                <Link
                  href="/auth/login"
                  className="px-6 py-2 rounded-xl text-[#994D1C] hover:text-[#6B3416] font-medium transition-all duration-300 hover:bg-[#FFF5F0] hover:scale-105"
                >
                  Giriş Yap
                </Link>
                <Link
                  href="/auth/register"
                  className="px-6 py-2 rounded-xl bg-gradient-to-r from-[#FFB996] to-[#FF8B5E] text-white font-medium 
                    transition-all duration-300 hover:shadow-lg hover:shadow-[#FFB996]/20 hover:scale-105 active:scale-[0.98]"
                >
                  Kayıt Ol
                </Link>
              </div>
            )}
            
            {user && (
              <div className="flex" ref={profileRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                    isProfileOpen ? 'bg-[#FFF5F0] text-[#6B3416] shadow-sm' : 'text-[#994D1C] hover:text-[#6B3416] hover:bg-[#FFF5F0] hover:scale-105'
                  }`}
                >
                  <div className="relative w-8 h-8 rounded-xl bg-gradient-to-r from-[#FFB996] to-[#FF8B5E] flex items-center justify-center transform transition-all duration-300 hover:rotate-6">
                    <span className="text-white font-medium">{user.name.charAt(0).toUpperCase()}</span>
                  </div>
                  <span className="font-medium">{user.name}</span>
                  <svg
                    className={`w-4 h-4 transition-transform duration-300 ${isProfileOpen ? 'transform rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg py-2 z-10 border border-[#FFE5D9]">
                    <div className="px-4 py-3 border-b border-[#FFE5D9]">
                      <p className="text-sm font-medium text-[#6B3416]">{user.name}</p>
                      <p className="text-xs text-[#994D1C] truncate">{user.email}</p>
                      <p className="text-xs text-[#994D1C] truncate">{user.university}</p>
                    </div>
                    <div className="py-2">
                      <Link
                        href="/profil"
                        className="block px-4 py-2 text-sm text-[#994D1C] hover:bg-[#FFF5F0] hover:text-[#6B3416] transition-colors duration-300"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        Profil
                      </Link>
                      <Link
                        href="/ayarlar"
                        className="block px-4 py-2 text-sm text-[#994D1C] hover:bg-[#FFF5F0] hover:text-[#6B3416] transition-colors duration-300"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        Ayarlar
                      </Link>

                      <button
                        onClick={logout}
                        className="w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-[#994D1C] hover:text-[#6B3416] hover:bg-[#FFF5F0] transition-all duration-300"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span>Çıkış Yap</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
         

          {/* Mobile Menu Button */}
          <div className="flex" ref={profileRef}>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 rounded-xl transition-all duration-300 md:hidden"
          >
            <svg className="w-6 h-6 text-[#994D1C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
          </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden mt-4 pb-4 border-t border-[#FFE5D9]">
          <div className="pt-4 pb-3 space-y-2">
            {navLinks
              .filter(link => link.label !== 'Eğitmenler' || user)
              .map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center space-x-3 px-4 py-2.5 rounded-xl transition-all duration-300 ${
                    pathname === link.href
                      ? 'text-[#6B3416] font-medium bg-[#FFF5F0] shadow-sm'
                      : 'text-[#994D1C] hover:text-[#6B3416] hover:bg-[#FFF5F0]'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.icon}
                  <span>{link.label}</span>
                </Link>
              ))}
          </div>

          {user ? (
            <div className="pt-4 mt-4 border-t border-[#FFE5D9]">
              <div className="px-4 mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-[#FFB996] to-[#FF8B5E] flex items-center justify-center">
                    <span className="text-white font-medium text-lg">{user.name.charAt(0).toUpperCase()}</span>
                  </div>
                  <div>
                    <p className="text-sm text-[#6B3416] font-medium">{user.name}</p>
                    <p className="text-xs text-[#994D1C]">{user.email}</p>
                    <p className="text-xs text-[#994D1C]">{user.university}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Link
                  href="/profil"
                  className="flex items-center px-4 py-2.5 text-sm text-[#994D1C] hover:bg-[#FFF5F0] hover:text-[#6B3416] transition-colors duration-300"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Profil
                </Link>
                <Link
                  href="/ayarlar"
                  className="flex items-center px-4 py-2.5 text-sm text-[#994D1C] hover:bg-[#FFF5F0] hover:text-[#6B3416] transition-colors duration-300"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Ayarlar
                </Link>
                <button
                  onClick={logout}
                  className="w-full flex items-center px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors duration-300"
                >
                  <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Çıkış Yap
                </button>
              </div>
            </div>
          ) : (
            <div className="pt-4 mt-4 border-t border-[#FFE5D9] space-y-2">
              <Link
                href="/auth/login"
                className="block px-4 py-2.5 rounded-xl text-[#994D1C] hover:text-[#6B3416] font-medium transition-all duration-300 hover:bg-[#FFF5F0]"
                onClick={() => setIsMenuOpen(false)}
              >
                Giriş Yap
              </Link>
              <Link
                href="/auth/register"
                className="block px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#FFB996] to-[#FF8B5E] text-white font-medium text-center
                  transition-all duration-300 hover:shadow-lg hover:shadow-[#FFB996]/20 hover:scale-105 active:scale-[0.98]"
                onClick={() => setIsMenuOpen(false)}
              >
                Kayıt Ol
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}