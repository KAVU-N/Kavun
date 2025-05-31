import { Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import './globals.css'
import { AuthProvider } from '@/context/AuthContext'
import { LanguageProvider } from '@/src/contexts/LanguageContext'
import Navbar from '@/src/components/Navbar'
import Footer from '@/src/components/Footer'
import CookieConsentBar from '@/src/components/CookieConsentBar'
import AnalyticsLoader from '@/src/components/AnalyticsLoader'
import Link from 'next/link'
import ClientOnly from '@/src/components/ClientOnly'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Kavunla - Geleceğe Adım At',
  description: 'Kavunla resmi web sitesi',
  manifest: '/manifest.json',
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Kavunla'
  }
};

export const viewport = 'width=device-width, initial-scale=1, maximum-scale=1';
export const themeColor = '#ffffff';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" style={{backgroundColor: '#ffffff !important'}}>
      <head>
        <link rel="icon" href="/logo.ico" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#ffffff" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Kavunla" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <style>{`
          html, body {
            background-color: #ffffff !important;
            background: #ffffff !important;
          }
        `}</style>
      </head>
      <body className={inter.className} style={{backgroundColor: '#ffffff !important', background: '#ffffff !important'}}>
        <AuthProvider>
          <LanguageProvider>
            <div className="flex flex-col min-h-screen" style={{backgroundColor: '#ffffff !important', background: '#ffffff !important'}}>
              <ClientOnly hideOnAdmin>
                <Navbar />
                <AnalyticsLoader />
              </ClientOnly>
              <div className="flex-grow" style={{backgroundColor: '#ffffff !important', background: '#ffffff !important'}}>
                <Toaster 
                  position="top-right"
                  toastOptions={{
                    duration: 3000,
                    style: {
                      background: '#ffffff',
                      color: '#6B3416',
                      border: '1px solid #FFE5D9',
                    },
                    success: {
                      iconTheme: {
                        primary: '#6B3416',
                        secondary: '#FFF5F0',
                      },
                    },
                    error: {
                      iconTheme: {
                        primary: '#FF8B5E',
                        secondary: '#FFF5F0',
                      },
                    },
                  }}
                />
                {children}
              </div>
              <ClientOnly hideOnAdmin>
                <CookieConsentBar />
                <Footer />
              </ClientOnly>
            </div>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  )
}