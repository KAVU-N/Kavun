'use client'

import React, { useEffect, useState } from 'react'
import { useLanguage } from '@/src/contexts/LanguageContext'

interface Stats {
  userCount: number
  courseCount: number
  lessonCount: number
  paymentTotal: number
  resourceCount: number
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<Stats>({
    userCount: 0,
    courseCount: 0,
    lessonCount: 0,
    paymentTotal: 0,
    resourceCount: 0
  })
  const [loading, setLoading] = useState(true)
  const { t } = useLanguage()

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/admin/stats')
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        } else {
          console.error('Failed to fetch stats')
        }
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{t('dashboard') || 'Dashboard'}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Users Card */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-sm text-gray-500">{t('totalUsers') || 'Toplam Kullanıcılar'}</div>
          <div className="text-3xl font-bold mt-2">{stats.userCount}</div>
          <div className="mt-4">
            <a href="/admin/users" className="text-blue-600 text-sm hover:underline">
              {t('viewAll') || 'Tümünü Görüntüle'} →
            </a>
          </div>
        </div>
        
        {/* Courses Card */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-sm text-gray-500">{t('totalResources') || 'Toplam Kaynaklar'}</div>
          <div className="text-3xl font-bold mt-2">{stats.resourceCount}</div>
          <div className="mt-4 flex gap-2">
            <a href="/admin/resources" className="text-blue-600 text-sm hover:underline">
              {t('viewResources') || 'Kaynakları Görüntüle'} →
            </a>
          </div>
        </div>
        
        {/* Lessons Card */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-sm text-gray-500">{t('totalLessons') || 'Toplam Dersler'}</div>
          <div className="text-3xl font-bold mt-2">{stats.lessonCount}</div>
          <div className="mt-4">
            <a href="/admin/lessons" className="text-blue-600 text-sm hover:underline">
              {t('viewAll') || 'Tümünü Görüntüle'} →
            </a>
          </div>
        </div>
        
        {/* Revenue Card */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-sm text-gray-500">{t('totalRevenue') || 'Toplam Gelir'}</div>
          <div className="text-3xl font-bold mt-2">₺{stats.paymentTotal.toLocaleString()}</div>
          <div className="mt-4">
            <a href="/admin/payments" className="text-blue-600 text-sm hover:underline">
              {t('viewDetails') || 'Detayları Görüntüle'} →
            </a>
          </div>
        </div>
      </div>
      
      {/* Recent Activity Section */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">{t('recentActivity') || 'Son Aktiviteler'}</h2>
        <div className="bg-white rounded-lg shadow-md">
          {/* Activity would be loaded here dynamically */}
          <div className="p-4 text-center text-gray-500">
            {t('comingSoon') || 'Yakında Eklenecek'}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
