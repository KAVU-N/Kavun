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
  const [mounted, setMounted] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const profileRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  // İstemci tarafında olduğumuzu işaretleyen effect
  useEffect(() => {
    setMounted(true);
    
    // Scroll olayını dinle
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    
    // Okunmamış mesajları kontrol et
    if (user) {
      checkUnreadMessages();
    }
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [user]);

  // Scroll ve mesaj kontrolü için effect
  useEffect(() => {
    if (!mounted) return;
    
    // Okunmamış mesajları sadece client tarafında kontrol et
    if (user) {
      checkUnreadMessages();
    }
    
    const interval = setInterval(() => {
      if (user) {
        checkUnreadMessages();
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

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
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

  // Navigasyon linkleri
  const navLinks = [
    { href: '/ilanlar', label: 'İlanlar', icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    )}
  ];

  // İstemci tarafında render edilecek içerik
  const renderClientContent = () => {
    // Eğer kullanıcı öğretmen rolüne sahipse ve rol tanımlıysa "İlan Ver" butonunu göster
    const showTeacherButton = user && typeof user.role === 'string' && user.role === 'teacher';
    
    return (
      <nav className={`w-full transition-all duration-500 ${
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
            <div className="hidden md:flex items-center justify-center flex-1">
              <div className="flex items-center space-x-1">
                {navLinks
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
                
                {showTeacherButton && (
                  <Link
                    href="/ilan-ver"
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                      pathname === '/ilan-ver'
                        ? 'text-[#6B3416] font-medium bg-[#FFF5F0] shadow-sm'
                        : 'bg-gradient-to-r from-[#FFB996] to-[#FF8B5E] text-white hover:shadow-lg hover:shadow-[#FFB996]/20 hover:scale-105'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span>İlan Ver</span>
                  </Link>
                )}
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
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                      isProfileOpen ? 'bg-[#FFF5F0] text-[#6B3416] shadow-sm' : 'text-[#994D1C] hover:text-[#6B3416] hover:bg-[#FFF5F0] hover:scale-105'
                    }`}
                  >
                    <div className="relative w-8 h-8 rounded-xl bg-gradient-to-r from-[#FFB996] to-[#FF8B5E] flex items-center justify-center transform transition-all duration-300 hover:rotate-6">
                      <span className="text-white font-medium">{user.name.charAt(0).toUpperCase()}</span>
                      {unreadMessages > 0 && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-xs text-white font-bold">
                          {unreadMessages > 9 ? '9+' : unreadMessages}
                        </div>
                      )}
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
                  
                  {/* Profile Dropdown */}
                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg py-2 z-50 border border-[#FFE5D9]">
                      <Link
                        href="/profil"
                        className="block px-4 py-2 text-[#994D1C] hover:bg-[#FFF5F0] hover:text-[#6B3416] transition-colors duration-300"
                      >
                        <div className="flex items-center space-x-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span>Profilim</span>
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
                          <span>Mesajlarım</span>
                        </div>
                      </Link>
                      {user.role === 'teacher' && (
                        <Link
                          href="/ilanlarim"
                          className="block px-4 py-2 text-[#994D1C] hover:bg-[#FFF5F0] hover:text-[#6B3416] transition-colors duration-300"
                        >
                          <div className="flex items-center space-x-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            <span>İlanlarım</span>
                          </div>
                        </Link>
                      )}
                      <button
                        onClick={logout}
                        className="w-full text-left px-4 py-2 text-[#994D1C] hover:bg-[#FFF5F0] hover:text-[#6B3416] transition-colors duration-300"
                      >
                        <div className="flex items-center space-x-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          <span>Çıkış Yap</span>
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="flex md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-xl transition-all duration-300"
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

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white shadow-lg rounded-b-xl overflow-hidden">
            <div className="px-4 py-3 space-y-1">
              {navLinks
                .map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 ${
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
              
              {user && user.role === 'teacher' && (
                <Link
                  href="/ilan-ver"
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                    pathname === '/ilan-ver'
                      ? 'text-[#6B3416] font-medium bg-[#FFF5F0] shadow-sm'
                      : 'bg-gradient-to-r from-[#FFB996] to-[#FF8B5E] text-white'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>İlan Ver</span>
                </Link>
              )}
              
              {!user ? (
                <div className="flex flex-col space-y-2 mt-4">
                  <Link
                    href="/auth/login"
                    className="px-6 py-2 rounded-xl text-[#994D1C] hover:text-[#6B3416] font-medium transition-all duration-300 hover:bg-[#FFF5F0] text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Giriş Yap
                  </Link>
                  <Link
                    href="/auth/register"
                    className="px-6 py-2 rounded-xl bg-gradient-to-r from-[#FFB996] to-[#FF8B5E] text-white font-medium 
                      transition-all duration-300 hover:shadow-lg hover:shadow-[#FFB996]/20 text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Kayıt Ol
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
                  {user.role === 'teacher' && (
                    <Link
                      href="/ilanlarim"
                      className="flex items-center space-x-2 px-4 py-2 rounded-xl text-[#994D1C] hover:text-[#6B3416] transition-all duration-300 hover:bg-[#FFF5F0]"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <span>İlanlarım</span>
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center space-x-2 px-4 py-2 rounded-xl text-[#994D1C] hover:text-[#6B3416] transition-all duration-300 hover:bg-[#FFF5F0] text-left"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>Çıkış Yap</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    );
  };

  // Sunucu ve istemci tarafı render arasındaki farkı gidermek için
  return (
    <div className="fixed w-full z-50">
      {!mounted ? (
        <div className="w-full py-4">
          <div className="mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex-shrink-0">
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 mr-2"></div>
                  <span className="text-2xl font-bold text-[#994D1C]">KAVUN</span>
                </div>
              </div>
              <div className="hidden md:flex items-center justify-center flex-1">
                <div className="flex items-center space-x-1"></div>
              </div>
              <div className="hidden md:flex items-center justify-end space-x-4">
                <div className="flex items-center space-x-4"></div>
              </div>
              <div className="flex md:hidden">
                <button className="p-2 rounded-xl"></button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        renderClientContent()
      )}
    </div>
  );
}