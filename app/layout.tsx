import { Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import Navbar from '@/src/components/Navbar'
import Footer from '@/src/components/Footer'
import Link from 'next/link'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Kavun - Geleceğe Adım At',
  description: 'Kavun resmi web sitesi',
  manifest: '/manifest.json',
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Kavun'
  },
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  themeColor: '#ffffff'
}

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
        <meta name="apple-mobile-web-app-title" content="Kavun" />
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
          <div className="flex flex-col min-h-screen" style={{backgroundColor: '#ffffff !important', background: '#ffffff !important'}}>
            <Navbar />
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
            
            {/* Kullandığımız Footer bileşeni zaten 'use client' direktifine sahip */}
            <Footer />
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}