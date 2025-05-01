'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useLanguage } from '@/src/contexts/LanguageContext'
import Link from 'next/link'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const router = useRouter()
  const pathname = usePathname()
  const { t } = useLanguage()
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/admin/check-auth')
        const data = await response.json()
        
        setIsAuthenticated(data.authenticated)
        
        // Login sayfasında değilse ve yetkili değilse, login sayfasına yönlendir
        if (!data.authenticated && pathname !== '/admin/login') {
          router.push('/admin/login')
        }
      } catch (error) {
        console.error('Auth check error:', error)
        setIsAuthenticated(false)
        if (pathname !== '/admin/login') {
          router.push('/admin/login')
        }
      }
    }
    
    checkAuth()
  }, [pathname, router])

  // Login sayfasındaysa veya yetkilendirme kontrolü henüz yapılmadıysa
  if (pathname === '/admin/login' || isAuthenticated === null) {
    return <>{children}</>
  }

  // Yetkili değilse (login dışındaki sayfalarda)
  if (!isAuthenticated) {
    return null // Router login'e yönlendirirken boş sayfa göster
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-blue-800 text-white shadow flex flex-col">
        <div className="p-4 text-xl font-bold border-b border-blue-900">
          {t('adminPanel') || 'Kavun Admin'}
        </div>
        <nav className="flex-1 mt-8">
          <ul>
            <li>
              <Link href="/admin/dashboard"
                className={`block px-4 py-2 hover:bg-blue-700 transition ${pathname === '/admin/dashboard' ? 'bg-blue-700' : ''}`}>{t('dashboard') || 'Dashboard'}</Link>
            </li>
            <li>
              <Link href="/admin/users"
                className={`block px-4 py-2 hover:bg-blue-700 transition ${pathname?.startsWith('/admin/users') ? 'bg-blue-700' : ''}`}>{t('users') || 'Kullanıcılar'}</Link>
            </li>
            <li>
              <Link href="/admin/lessons"
                className={`block px-4 py-2 hover:bg-blue-700 transition ${pathname?.startsWith('/admin/lessons') ? 'bg-blue-700' : ''}`}>{t('lessons') || 'Dersler'}</Link>
            </li>
            <li>
              <Link href="/admin/payments"
                className={`block px-4 py-2 hover:bg-blue-700 transition ${pathname?.startsWith('/admin/payments') ? 'bg-blue-700' : ''}`}>{t('payments') || 'Ödemeler'}</Link>
            </li>
            <li>
              <Link href="/admin/resources"
                className={`block px-4 py-2 hover:bg-blue-700 transition ${pathname?.startsWith('/admin/resources') ? 'bg-blue-700' : ''}`}>{t('resources') || 'Kaynaklar'}</Link>
            </li>
            <li>
              <Link href="/admin/announcements"
                className={`block px-4 py-2 hover:bg-blue-700 transition ${pathname?.startsWith('/admin/announcements') ? 'bg-blue-700' : ''}`}>{t('announcements') || 'İlanlar'}</Link>
            </li>
            <li>
              <button
                onClick={async () => {
                  await fetch('/api/admin/logout', { method: 'POST' })
                  router.push('/admin/login')
                }}
                className="w-full text-left px-4 py-2 hover:bg-blue-700 text-red-300 transition"
              >
                {t('logout') || 'Çıkış Yap'}
              </button>
            </li>
          </ul>
        </nav>
      </div>
      {/* Main content */}
      <main className="flex-1 flex flex-col">
        <div className="flex-1 p-6 bg-white rounded-lg m-6 shadow overflow-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
