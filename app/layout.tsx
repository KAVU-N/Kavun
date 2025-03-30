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
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" style={{backgroundColor: '#FFF5F0 !important'}}>
      <head>
        <link rel="icon" href="/logo.ico" />
        <style>{`
          html, body {
            background-color: #FFF5F0 !important;
            background: #FFF5F0 !important;
          }
        `}</style>
      </head>
      <body className={inter.className} style={{backgroundColor: '#FFF5F0 !important', background: '#FFF5F0 !important'}}>
        <AuthProvider>
          <div className="flex flex-col min-h-screen" style={{backgroundColor: '#FFF5F0 !important', background: '#FFF5F0 !important'}}>
            <Navbar />
            <div className="flex-grow" style={{backgroundColor: '#FFF5F0 !important', background: '#FFF5F0 !important'}}>
              <Toaster 
                position="top-right"
                toastOptions={{
                  duration: 3000,
                  style: {
                    background: '#FFF5F0',
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