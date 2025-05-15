'use client';

import React from 'react';
import { useLanguage } from '@/src/contexts/LanguageContext';
import Link from 'next/link';

// Preserved imports for future use
/* 
import Notification from './Notification';
import { useAuth } from '@/contexts/AuthContext';
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
  
  // Content based on language
  const content = {
    tr: {
      title: 'Çok Yakında',
      description: 'Bu özellik çok yakında hizmetinizde olacak. Bizi takip etmeye devam edin!'
    },
    en: {
      title: 'Coming Soon',
      description: 'This feature will be available very soon for you. Stay tuned for updates!'
    }
  };
  
  // Get content based on current language
  const currentContent = language === 'en' ? content.en : content.tr;
  
  return (
    <div className="container mx-auto px-4 py-8 mt-16 flex flex-col items-center justify-center min-h-[70vh]">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-[#994D1C] mb-6">{currentContent.title}</h1>
        <p className="text-xl text-gray-600 max-w-2xl">
          {currentContent.description}
        </p>
      </div>
    </div>
  );
}
