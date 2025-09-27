'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from 'src/context/AuthContext';
import { useLanguage } from '@/src/contexts/LanguageContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function NotificationsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { t } = useLanguage();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all'); // 'all', 'unread', 'read'


  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      if (!user) {
        setError(t('notifications.loginRequired'));
        setLoading(false);
        return;
      }

      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const response = await fetch('/api/notifications', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        credentials: 'include'
      });
      // DEBUG LOG KALDIRILDI [fetchNotifications] response status:', response.status);

      if (!response.ok) {
        const errText = await response.text();
        // DEBUG LOG KALDIRILDI [fetchNotifications] response error:', errText);
        throw new Error(t('notifications.error'));
      }

      const data = await response.json();
      // DEBUG LOG KALDIRILDI [fetchNotifications] response data:', data);
      if (!data.notifications || !Array.isArray(data.notifications)) {
        setNotifications([]);
      } else {
        setNotifications(data.notifications);
      }
      setLoading(false);
    } catch (error) {
      // DEBUG LOG KALDIRILDI Bildirimler getirme hatası:', error);
      setError(t('notifications.error'));
      setNotifications([]);
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    // user varsa bildirimleri getir
    if (user) fetchNotifications();
  }, [user, fetchNotifications]);

  const markAsRead = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      // API'ye PUT isteği gönder
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ id })
      });
      // State'i güncelle
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => 
          notification._id === id ? { ...notification, read: true } : notification
        )
      );
      window.dispatchEvent(new Event('notificationsRead'));
    } catch (error) {
      // DEBUG LOG KALDIRILDI Okundu işaretleme hatası:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Giriş yapmalısınız');
      }

      const response = await fetch('/api/notifications/read-all', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Tüm bildirimleri okundu işaretleme hatası');
      }

      // Update local state
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => ({ ...notification, read: true }))
      );
      // Navbar'a haber ver
      window.dispatchEvent(new Event('notificationsRead'));
    } catch (error) {
      // DEBUG LOG KALDIRILDI Tüm bildirimleri okundu işaretleme hatası:', error);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      await fetch('/api/notifications', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ id })
      });
      setNotifications(prevNotifications => 
        prevNotifications.filter(notification => notification._id !== id)
      );
    } catch (error) {
      // DEBUG LOG KALDIRILDI Bildirim silme hatası:', error);
    }
  };

  const getFilteredNotifications = () => {
    switch (filter) {
      case 'unread':
        return notifications.filter(notification => !notification.read);
      case 'read':
        return notifications.filter(notification => notification.read);
      default:
        return notifications;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / 60000);
    const diffHours = Math.round(diffMs / 3600000);
    const diffDays = Math.round(diffMs / 86400000);
    
    if (diffMins < 60) {
      return t('notifications.timeAgo.minutes', { count: diffMins });
    } else if (diffHours < 24) {
      return t('notifications.timeAgo.hours', { count: diffHours });
    } else {
      return t('notifications.timeAgo.days', { count: diffDays });
    }
  };

  const getNotificationIcon = (type: string) => {
    switch(type) {
      case 'lesson_request':
        return (
          <div className="bg-blue-100 p-3 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
        );
      case 'lesson_booking':
        return (
          <div className="bg-purple-100 p-3 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case 'appointment_reminder':
        return (
          <div className="bg-green-100 p-3 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case 'new_review':
        return (
          <div className="bg-yellow-100 p-3 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </div>
        );
      case 'payment_confirmation':
        return (
          <div className="bg-green-100 p-3 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case 'lesson_cancellation':
        return (
          <div className="bg-red-100 p-3 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case 'lesson_booking':
        return (
          <div className="bg-purple-100 p-3 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="bg-gray-100 p-3 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      }
  }

  // Hata kontrolü
  if (error) {
    return (
      <div className="pt-32 flex flex-col items-center">
        <span className="text-red-500 text-lg font-semibold mb-4">{error}</span>
      </div>
    );
  }

  // Kullanıcı kontrolü
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-[#FF8B5E] mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <h1 className="text-2xl font-bold text-[#994D1C] mb-4">{t('notifications.loginRequired')}</h1>
          <p className="text-gray-600 mb-6">{t('notifications.empty')}</p>
          <Link
            href="/auth/login"
            className="inline-block bg-gradient-to-r from-[#FFB996] to-[#FF8B5E] text-white font-medium py-3 px-6 rounded-md hover:shadow-lg hover:shadow-[#FFB996]/20 transition-all duration-300"
          >
            {t('notifications.goToLogin')}
          </Link>
        </div>
      </div>
    );
  }

  // DEBUG PANEL
  const debugToken = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
  return (
    <div className="pt-24 pb-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-[#994D1C] mb-8">{t('notifications.title')}</h1>
      
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Filters and Actions */}
        <div className="p-4 border-b border-gray-200 flex flex-wrap justify-between items-center gap-4">
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === 'all' 
                  ? 'bg-[#FF8B5E] text-white' 
                  : 'text-[#994D1C] hover:bg-[#FFF5F0]'
              }`}
            >
              {t('notifications.all')}
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === 'unread' 
                  ? 'bg-[#FF8B5E] text-white' 
                  : 'text-[#994D1C] hover:bg-[#FFF5F0]'
              }`}
            >
              {t('notifications.unread')}
              {notifications.filter(n => !n.read).length > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 inline-flex items-center justify-center">
                  {notifications.filter(n => !n.read).length}
                </span>
              )}
            </button>
            <button
              onClick={() => setFilter('read')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === 'read' 
                  ? 'bg-[#FF8B5E] text-white' 
                  : 'text-[#994D1C] hover:bg-[#FFF5F0]'
              }`}
            >
              {t('notifications.read')}
            </button>
          </div>
          
          <button
            onClick={markAllAsRead}
            className="text-[#994D1C] hover:text-[#FF8B5E] text-sm font-medium"
            disabled={!notifications.some(n => !n.read)}
          >
            {t('notifications.markAllAsRead')}
          </button>
        </div>
        
        {/* Notifications List */}
        {getFilteredNotifications().length === 0 ? (
          <div className="p-8 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <h2 className="text-xl font-medium text-gray-500 mb-2">{t('notifications.noNotifications')}</h2>
            <p className="text-gray-400">
              {filter === 'all' 
                ? t('notifications.empty') 
                : filter === 'unread' 
                  ? t('notifications.unread') + ' bildirim yok.' 
                  : t('notifications.read') + ' bildirim yok.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {getFilteredNotifications().map((notification) => (
              <div 
                key={notification._id} 
                className={`p-4 flex items-start hover:bg-gray-50 transition-colors ${!notification.read ? 'bg-[#FFF9F5]' : ''}`}
              >
                <div className="mr-4">
                  {getNotificationIcon(notification.type)}
                </div>
                
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className={`font-medium ${!notification.read ? 'text-[#994D1C]' : 'text-gray-700'}`}>
                      {notification.title}
                    </h3>
                    <span className="text-xs text-gray-500">{formatTimeAgo(notification.createdAt)}</span>
                  </div>
                  
                  <p className="text-gray-600 mb-3">{notification.message}</p>
                  
                  <div className="flex justify-between items-center">
                    {notification.actionUrl ? (
                      <Link
                        href={notification.actionUrl}
                        className="text-sm font-medium text-[#FF8B5E] hover:text-[#994D1C] transition-colors cursor-pointer"
                        onClick={e => {
                          markAsRead(notification._id);
                        }}
                        scroll={true}
                        shallow={false}
                      >
                        {t('notifications.viewDetails')}
                      </Link>
                    ) : <span />}
                    
                    <div className="flex space-x-2">
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification._id)}
                          className="text-sm text-gray-500 hover:text-[#994D1C] transition-colors"
                        >
                          {t('notifications.markAsRead')}
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification._id)}
                        className="text-sm text-gray-500 hover:text-red-500 transition-colors"
                      >
                        {t('notifications.delete')}
                      </button>
                    </div>
                  </div>
                </div>
                
                {!notification.read && (
                  <div className="ml-2 w-2 h-2 bg-[#FF8B5E] rounded-full mt-2"></div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
