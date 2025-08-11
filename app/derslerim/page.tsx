'use client';

import React from 'react';
import { useLanguage } from '@/src/contexts/LanguageContext';
import Link from 'next/link';

// Preserved imports for future use
/* 
import Notification from './Notification';
import { useAuth } from 'src/context/AuthContext';
import { useRouter } from 'next/navigation';
import LessonCalendar from '@/components/calendar/LessonCalendar';
*/

// Ders detay modalı
interface EventDetailModalProps {
  event: any;
  onClose: () => void;
  onCompleteLesson?: () => void;
  onCancelLesson?: () => void;
  userRole: string;
}

const EventDetailModal: React.FC<EventDetailModalProps> = ({
  event,
  onClose,
  onCompleteLesson,
  onCancelLesson,
  userRole
}) => {
  const { t, language } = useLanguage();
  // This component already uses the t() function for translations
  // All text elements are properly set up for translation
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString(language === 'tr' ? 'tr-TR' : 'en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'open': return t('lessons.statusOpen');
      case 'scheduled': return t('lessons.statusScheduled');
      case 'completed': return t('lessons.statusCompleted');
      case 'cancelled': return t('lessons.statusCancelled');
      default: return status;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'open': return 'bg-yellow-100 text-yellow-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Ders iptal etme veya tamamlama butonları
  const renderActionButtons = () => {
    if (event.status === 'scheduled') {
      return (
        <div className="flex space-x-2 mt-4">
          {userRole === 'teacher' && (
            <button
              onClick={onCompleteLesson}
              className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
            >
              {t('lessons.completeLesson')}
            </button>
          )}
          {/* İptal butonu tamamen kaldırıldı */}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
        <div className="flex justify-between items-start">
          <h3 className="text-xl font-bold text-[#994D1C]">{event.title}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-600 font-medium">{t('lessons.status')}:</span>
            <span className={`px-3 py-1 rounded-full text-sm ${getStatusClass(event.status)}`}>
              {getStatusText(event.status)}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-gray-600 font-medium">{t('lessons.start')}:</span>
            <span>{formatDate(event.start)}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-gray-600 font-medium">{t('lessons.end')}:</span>
            <span>{formatDate(event.end)}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-gray-600 font-medium">
              {userRole === 'instructor' ? `${t('lessons.student')}:` : `${t('lessons.instructor')}:`}
            </span>
            <span className="font-medium">
              {userRole === 'instructor' ? event.studentName : event.teacherName}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-gray-600 font-medium">{t('lessons.price')}:</span>
            <span className="font-medium text-[#FF8B5E]">{event.price} TL</span>
          </div>
        </div>
        
        {renderActionButtons()}
        
        <div className="mt-4 pt-4 border-t border-gray-200">
          <Link 
            href={`/derslerim/${event.id}`}
            className="w-full block text-center bg-gradient-to-r from-[#FF8B5E] to-[#FFB996] text-white font-medium py-2 px-4 rounded-md hover:from-[#994D1C] hover:to-[#FF8B5E] transition-all duration-300"
          >
            {t('lessons.viewLessonDetails')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default function DerslerimPage() {
  const { t, language } = useLanguage();
  
  return (
    <div className="container mx-auto px-4 py-8 mt-16">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-[#994D1C]">
            {language === 'en' ? 'My Lessons' : 'Derslerim'}
          </h1>
          <div className="flex gap-3">
            <Link 
              href="/favorilerim"
              className="bg-yellow-500 text-white px-6 py-2 rounded-lg hover:bg-yellow-600 transition-colors flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
              </svg>
              {language === 'en' ? 'My Favorites' : 'Favorilerim'}
            </Link>
            <Link 
              href="/derslerim/olustur"
              className="bg-[#994D1C] text-white px-6 py-2 rounded-lg hover:bg-[#7a3d16] transition-colors"
            >
              {language === 'en' ? 'Create New Lesson' : 'Yeni Ders Oluştur'}
            </Link>
          </div>
        </div>

        {/* Lessons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Sample lesson cards - replace with actual data */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h3 className="text-xl font-semibold text-[#994D1C] mb-2">
              {language === 'en' ? 'Sample Lesson' : 'Örnek Ders'}
            </h3>
            <p className="text-gray-600 mb-4">
              {language === 'en' ? 'This is a sample lesson description.' : 'Bu örnek bir ders açıklamasıdır.'}
            </p>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">
                {language === 'en' ? 'Created: Today' : 'Oluşturulma: Bugün'}
              </span>
              <button className="text-[#994D1C] hover:text-[#7a3d16] font-medium">
                {language === 'en' ? 'View' : 'Görüntüle'}
              </button>
            </div>
          </div>

          {/* Empty state when no lessons */}
          <div className="col-span-full text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {language === 'en' ? 'No lessons yet' : 'Henüz ders yok'}
            </h3>
            <p className="text-gray-500 mb-6">
              {language === 'en' 
                ? 'Create your first lesson to get started with teaching.'
                : 'Öğretmeye başlamak için ilk dersinizi oluşturun.'}
            </p>
            <Link 
              href="/derslerim/olustur"
              className="inline-flex items-center px-4 py-2 bg-[#994D1C] text-white rounded-lg hover:bg-[#7a3d16] transition-colors"
            >
              {language === 'en' ? 'Create First Lesson' : 'İlk Dersi Oluştur'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
