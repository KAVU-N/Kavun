'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from 'src/context/AuthContext';
import { useLanguage } from 'src/contexts/LanguageContext';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const { user } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  return (
    <footer className="bg-gradient-to-r from-[#FFCDB2] to-[#FFCDB2] border-t border-[#FFCDB2] mt-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-wrap justify-between gap-8">
          {/* ... (diğer grid sütunları burada) ... */}
        </div>

        <div className="flex flex-wrap justify-between gap-8">
          {/* Brand Column */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2 group">
              <Image
                src="/logo.png"
                alt="Kavunla Logo"
                width={40}
                height={40}
                className="mr-2"
              />
              <span className="text-2xl font-bold text-[#6B3416] group-hover:text-[#FF8B5E] transition-all duration-300">
                KAVUNLA
              </span>
            </Link>
            <p className="text-[#994D1C] max-w-xs">
              {t('footer.platformDescription')}
            </p>
            <div className="flex space-x-4 pt-2">
              {/* Instagram Icon */}
              <a href="https://instagram.com/kavunlacom" target="_blank" rel="noopener noreferrer" 
                className="w-10 h-10 rounded-full bg-[#FFE5D9] flex items-center justify-center text-[#994D1C] hover:bg-[#FFB996] transition-all duration-300 hover:scale-110">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-[#6B3416] mb-4">{t('footer.quickLinks')}</h3>
            <ul className="space-y-2">
              {user && (
                <li>
                  <Link href="/egitmenler" className="text-[#994D1C] hover:text-[#FF8B5E] transition-colors duration-300">
                    {t('nav.instructors')}
                  </Link>
                </li>
              )}
              <li>
                <Link href="/iletisim" className="text-[#994D1C] hover:text-[#FF8B5E] transition-colors duration-300">
                  {t('nav.contact')}
                </Link>
              </li>
              <li>
                <Link href="/sss" className="text-[#994D1C] hover:text-[#FF8B5E] transition-colors duration-300">
                  {t('nav.faq')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-lg font-semibold text-[#6B3416] mb-4">{t('footer.legal')}</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/kullanim-kosullari" className="text-[#994D1C] hover:text-[#FF8B5E] transition-colors duration-300">
                  {t('footer.termsOfUse')}
                </Link>
              </li>
              <li>
                <Link href="/gizlilik-politikasi" className="text-[#994D1C] hover:text-[#FF8B5E] transition-colors duration-300">
                  {t('footer.privacyPolicy')}
                </Link>
              </li>
              <li>
                <Link href="/cerez-politikasi" className="text-[#994D1C] hover:text-[#FF8B5E] transition-colors duration-300">
                  {t('footer.cookiePolicy')}
                </Link>
              </li>
              <li>
                <Link href="/kvkk" className="text-[#994D1C] hover:text-[#FF8B5E] transition-colors duration-300">
                  {t('footer.pdpl')}
                </Link>
              </li>
            </ul>

          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold text-[#6B3416] mb-4">{t('footer.contact')}</h3>
            <ul className="space-y-2">
              <li className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-[#FF8B5E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <a href="mailto:info@kavunla.com" className="text-[#994D1C] hover:text-[#FF8B5E] transition-colors duration-300">
                  info@kavunla.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright ve Dil Değiştirme Butonları aynı satırda */}
        <div className="flex flex-col md:flex-row items-center justify-between border-t border-[#FFCDB2] pt-4 mt-8 gap-2">
          <span className="text-[#994D1C] text-sm">© {currentYear} KAVUNLA. Tüm hakları saklıdır.</span>
          <div className="flex items-center space-x-2">
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
        </div>
      </div>
    </footer>
  );
}
