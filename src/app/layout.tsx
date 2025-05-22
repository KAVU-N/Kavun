'use client';

import CookieConsentBar from '../components/CookieConsentBar';
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "../components/Navbar";
import { AuthProvider } from "../../context/AuthContext";
import { usePathname } from 'next/navigation';
import Link from "next/link";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kavun - Eğitim Platformu",
  description: "Kavun ile öğrenciler ve eğitmenler arasında köprü kurun.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isAuthPage = pathname?.includes('/auth/');
  const currentYear = new Date().getFullYear();

  return (
    <html lang="tr" className="h-full">
      {/* Override global styles with important flags */}
      <style jsx global>{`
        body {
          background-color: white !important;
          color: #6B3416 !important;
        }
      `}</style>
      
      <body className={`${inter.className} min-h-screen`} style={{backgroundColor: 'white !important', color: '#6B3416 !important'}}>
        <AuthProvider>
          <div className="fixed w-full top-0 z-[100]">
            <Navbar />
          </div>
          <main className="pt-24 pb-20" style={{backgroundColor: 'white !important'}}>
            {children}
          </main>
          {/* Çerez Banner'ı */}
          <CookieConsentBar />
          
          {/* Inline Footer - Bu sadece görünmesi için */}
          <footer className="bg-gradient-to-r from-[#FFF5F0] to-white border-t border-[#FFE5D9] py-8" style={{backgroundColor: '#FFF5F0 !important', borderTopColor: '#FFE5D9 !important', color: '#6B3416 !important'}}>
            <div className="container mx-auto px-4">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <div className="mb-4 md:mb-0">
                  <div className="flex items-center space-x-2">
                    <div className="w-10 h-10 bg-[#FF8B5E] rounded-full flex items-center justify-center text-white font-bold" style={{backgroundColor: '#FF8B5E !important', color: 'white !important'}}>
                      K
                    </div>
                    <span className="text-2xl font-bold text-[#6B3416]" style={{color: '#6B3416 !important'}}>KAVUN</span>
                  </div>
                </div>
                <div className="flex flex-wrap justify-center gap-x-8 gap-y-2">
                  <Link href="/" className="text-[#994D1C] hover:text-[#FF8B5E]" style={{color: '#994D1C !important'}}>Ana Sayfa</Link>
                  <Link href="/egitmenler" className="text-[#994D1C] hover:text-[#FF8B5E]" style={{color: '#994D1C !important'}}>Eğitmenler</Link>
                  <Link href="/hakkimizda" className="text-[#994D1C] hover:text-[#FF8B5E]" style={{color: '#994D1C !important'}}>Hakkımızda</Link>
                  <Link href="/iletisim" className="text-[#994D1C] hover:text-[#FF8B5E]" style={{color: '#994D1C !important'}}>İletişim</Link>
                </div>
                <p className="text-[#994D1C] text-sm mt-4 md:mt-0" style={{color: '#994D1C !important'}}>
                  &copy; {currentYear} Kavun. Tüm hakları saklıdır.
                </p>
              </div>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
