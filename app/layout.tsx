import { Inter } from 'next/font/google'
import type { Metadata, Viewport } from 'next'
import { Toaster } from 'react-hot-toast'
import './globals.css'
import { AuthProvider } from 'src/context/AuthContext'
import { LanguageProvider } from '@/src/contexts/LanguageContext'
import Footer from '@/src/components/Footer'
import CookieConsentBar from '@/src/components/CookieConsentBar'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import ClientOnly from '@/src/components/ClientOnly'
const Navbar = dynamic(() => import('@/src/components/Navbar'), { ssr: false })
const AnalyticsLoader = dynamic(() => import('@/src/components/AnalyticsLoader'), { ssr: false })
const RouteBackgroundHost = dynamic(() => import('@/src/components/RouteBackgroundHost'), { ssr: false })

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
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
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: 'var(--brand-bg)'
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" style={{ backgroundColor: 'var(--brand-bg) !important' }}>
      <head>
        <link rel="icon" href="/logo.ico" />
        <link rel="manifest" href="/manifest.json" />
        {/* theme-color artık viewport.themeColor ile yönetiliyor */}

        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Kavunla" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <style>{`
          html, body {
            background-color: var(--brand-bg) !important;
            background: var(--brand-bg) !important;
          }
        `}</style>
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <LanguageProvider>
            <div className="flex flex-col min-h-screen">
              <ClientOnly hideOnAdmin>
                <Navbar />
                <RouteBackgroundHost />
                <AnalyticsLoader />
              </ClientOnly>
              <div className="flex-grow">
                <Toaster 
                  position="top-right"
                  toastOptions={{
                    duration: 3000,
                    style: {
                      background: 'var(--brand-bg)',
                      color: 'var(--brand-brown)',
                      border: '1px solid var(--brand-border)',
                    },
                    success: {
                      iconTheme: {
                        primary: 'var(--brand-brown)',
                        secondary: 'var(--brand-accent-bg)',
                      },
                    },
                    error: {
                      iconTheme: {
                        primary: 'var(--brand-primary)',
                        secondary: 'var(--brand-accent-bg)',
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