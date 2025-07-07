'use client'

import React, { useEffect, useState } from 'react'
import { useLanguage } from '@/src/contexts/LanguageContext'

// --- RecentActivity Bileşeni ---
interface Activity {
  _id: string;
  type: string;
  action: string;
  userId?: string;
  userName?: string;
  description: string;
  createdAt: string;
}

const activityIcons: Record<string, JSX.Element> = {
  user: <span role="img" aria-label="User">👤</span>,
  resource: <span role="img" aria-label="Resource">📚</span>,
  payment: <span role="img" aria-label="Payment">💳</span>,
  lesson: <span role="img" aria-label="Lesson">📖</span>,
  default: <span role="img" aria-label="Activity">📝</span>,
};

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' });
}

const RecentActivity = ({ t }: { t: any }) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/admin/recent-activity');
        if (!res.ok) throw new Error('Aktiviteler alınamadı');
        const data = await res.json();
        setActivities(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchActivities();
  }, []);

  if (loading) {
    return <div className="p-4 text-center text-gray-400 animate-pulse">{t('loading') || 'Yükleniyor...'}</div>;
  }
  if (error) {
    return <div className="p-4 text-center text-red-500">{t('error') || 'Bir hata oluştu'}: {error}</div>;
  }
  if (!activities.length) {
    return <div className="p-4 text-center text-gray-500">{t('noActivity') || 'Son aktivite bulunamadı.'}</div>;
  }
  return (
    <ul className="divide-y">
      {activities.map((act) => (
        <li key={act._id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition">
          <span className="text-xl">
            {activityIcons[act.type] || activityIcons.default}
          </span>
          <div className="flex-1">
            <div className="text-sm text-gray-800">{act.description}</div>
            <div className="text-xs text-gray-500">
              {act.userName && <span className="font-medium">{act.userName}</span>}
              {act.userName && ' · '}
              {formatDate(act.createdAt)}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
};
// --- RecentActivity Sonu ---

interface Stats {
  userCount: number
  courseCount: number
  lessonCount: number
  paymentTotal: number
  resourceCount: number
  projectCount: number
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<Stats>({
    userCount: 0,
    courseCount: 0,
    lessonCount: 0,
    paymentTotal: 0,
    resourceCount: 0,
     projectCount: 0
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
        
        {/* Projects Card */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-sm text-gray-500">Toplam Projeler</div>
          <div className="text-3xl font-bold mt-2">{stats.projectCount}</div>
          <div className="mt-4 flex gap-2">
            <a href="/admin/projects" className="text-blue-600 text-sm hover:underline">
              Projeleri Görüntüle →
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
          <RecentActivity t={t} />
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
