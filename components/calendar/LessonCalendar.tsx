'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/src/contexts/LanguageContext';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/tr';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useAuth } from 'src/context/AuthContext';
import { useRouter } from 'next/navigation';

// Moment yerelleştirmesi
// useLanguage ve localizer'ı fonksiyonun içine taşıyoruz.

// Takvim etkinlik tipi
interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  status: string;
  teacherId: string;
  teacherName?: string;
  studentId?: string;
  studentName?: string;
  price: number;
  allDay?: boolean;
}

interface LessonCalendarProps {
  onSelectEvent?: (event: CalendarEvent) => void;
}

const LessonCalendar: React.FC<LessonCalendarProps> = ({ onSelectEvent }) => {
  const { language, t } = useLanguage();
  moment.locale(language === 'tr' ? 'tr' : 'en');
  const localizer = momentLocalizer(moment);
  const { user } = useAuth();
  const router = useRouter();
  
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState(Views.MONTH);
  const [date, setDate] = useState(new Date());

  const fetchLessons = useCallback(async () => {
    setLoading(true);
    try {
      if (!user) return; // Guard: user is possibly null
      const endpoint = user.role === 'teacher' 
        ? `/api/lessons?teacherId=${user.id}` 
        : `/api/lessons?studentId=${user.id}`;
      
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Dersler getirilemedi');
      }

      const lessons = await response.json();
      
      // Dersleri takvim formatına dönüştür
      const calendarEvents: CalendarEvent[] = lessons.map((lesson: any) => {
        const startDate = new Date(lesson.scheduledAt || lesson.createdAt);
        
        // Eğer ders süresi yoksa varsayılan olarak 1 saat
        const endDate = lesson.scheduledAt
          ? new Date(new Date(lesson.scheduledAt).getTime() + (lesson.duration || 60) * 60000)
          : new Date(startDate.getTime() + 60 * 60000);
          
        return {
          id: lesson._id,
          title: lesson.title,
          start: startDate,
          end: endDate,
          status: lesson.status,
          teacherId: lesson.teacherId?._id || lesson.teacherId,
          teacherName: lesson.teacherId?.name || 'Bilinmeyen Öğretmen',
          studentId: lesson.studentId?._id || lesson.studentId,
          studentName: lesson.studentId?.name || 'Bilinmeyen Öğrenci',
          price: lesson.price || 0,
          allDay: false
        };
      });
      
      setEvents(calendarEvents);
    } catch (err) {
      console.error('Ders yükleme hatası:', err);
      setError('Dersler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    fetchLessons();
  }, [user, router, fetchLessons]);

  // Etkinliklerin renk ve stil belirlemesi
  const eventStyleGetter = (event: CalendarEvent) => {
    let backgroundColor = '#FFB996';
    let borderColor = '#FF8B5E';
    
    // Ders durumuna göre renk belirle
    switch (event.status) {
      case 'open':
        backgroundColor = '#FFE6C7';
        borderColor = '#FFB996';
        break;
      case 'scheduled':
        backgroundColor = '#FFB996';
        borderColor = '#FF8B5E';
        break;
      case 'completed':
        backgroundColor = '#4CAF50';
        borderColor = '#388E3C';
        break;
      case 'cancelled':
        backgroundColor = '#F44336';
        borderColor = '#D32F2F';
        break;
      default:
        backgroundColor = '#FFB996';
        borderColor = '#FF8B5E';
    }
    
    return {
      style: {
        backgroundColor,
        borderColor,
        borderWidth: '1px',
        borderStyle: 'solid',
        borderRadius: '4px',
        color: '#6B3416',
        display: 'block',
        padding: '2px 5px',
        fontWeight: 500,
      }
    };
  };

  // Etkinliğe tıklandığında
  const handleSelectEvent = (event: CalendarEvent) => {
    if (onSelectEvent) {
      onSelectEvent(event);
    } else {
      // Varsayılan olarak detay sayfasına yönlendir
      router.push(`/derslerim/${event.id}`);
    }
  };

  // Takvim içeriği
  const handleNavigate = (newDate: Date) => setDate(newDate);
  
  // Takvim görünümü değiştiğinde
  const handleViewChange = (newView: string) => setView(newView as any);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF8B5E]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 text-red-600 p-4 rounded-md">
        <p>{error}</p>
        <button
          onClick={fetchLessons}
          className="mt-2 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
        >
          Yeniden Dene
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 overflow-hidden">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '70vh' }}
        views={['month', 'week', 'day', 'agenda']}
        defaultView={Views.MONTH}
        view={view as any}
        onView={handleViewChange}
        date={date}
        onNavigate={handleNavigate}
        onSelectEvent={handleSelectEvent}
        eventPropGetter={eventStyleGetter}
        popup
        messages={{
          today: t('calendar.today'),
          previous: t('calendar.previous'),
          next: t('calendar.next'),
          month: t('calendar.month'),
          week: t('calendar.week'),
          day: t('calendar.day'),
          agenda: t('calendar.agenda'),
          date: t('calendar.date'),
          time: t('calendar.time'),
          event: t('calendar.event'),
          showMore: (total: number) => `${total > 0 ? '+' + total : ''} ${t('calendar.more')}`,
          noEventsInRange: t('calendar.noEventsInRange'),
        }}
        formats={{
          monthHeaderFormat: language === 'tr' ? 'MMMM YYYY' : 'MMMM YYYY',
          dayHeaderFormat: language === 'tr' ? 'DD MMMM YYYY, dddd' : 'dddd, MMMM DD, YYYY',
          dayRangeHeaderFormat: ({ start, end }: { start: Date, end: Date }) => 
            `${moment(start).format(language === 'tr' ? 'DD MMMM' : 'MMM DD')} - ${moment(end).format(language === 'tr' ? 'DD MMMM YYYY' : 'MMM DD, YYYY')}`,
          agendaDateFormat: language === 'tr' ? 'DD MMMM (ddd)' : 'ddd, MMM DD',
          agendaTimeFormat: 'HH:mm',
          agendaTimeRangeFormat: ({ start, end }: { start: Date, end: Date }) => 
            `${moment(start).format('HH:mm')} - ${moment(end).format('HH:mm')}`,
        }}
      />
    </div>
  );
};

export default LessonCalendar;
