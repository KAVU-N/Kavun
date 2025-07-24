import { NextResponse, NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Notification from '@/models/Notification';
import Announcement from '@/models/Announcement';
import { getUserFromToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET /api/notifications/unread
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Kullanıcıyı token'dan bul
    const user = await getUserFromToken(request);
    if (!user || !user.id) {
      return NextResponse.json({ count: 0 }, { status: 401 });
    }

    // Bildirim filtresi (okunmamış + role bazlı hedefleme)
    let filter: any = { read: false, type: { $ne: 'announcement' } };
    if (user.role === 'student') {
      filter.$or = [
        { userId: user.id },
        { userId: 'all' },
        { userId: 'student' },
      ];
    } else if (user.role === 'teacher' || user.role === 'instructor') {
      filter.$or = [
        { userId: user.id },
        { userId: 'all' },
        { userId: 'teacher' },
        { userId: 'instructor' },
      ];
    } else if (user.role === 'admin') {
      filter.$or = [
        { userId: user.id },
        { userId: 'all' },
        { userId: 'admin' }
      ];
    } else {
      filter.$or = [ { userId: user.id }, { userId: 'all' } ];
    }

    // Normal bildirim sayısı
    const notifCountPromise = Notification.countDocuments(filter);

    // Duyuruları da bildirim olarak say - read alanı olmadığı için hepsini okunmamış say
    let annFilter: any = { readBy: { $ne: user.id } };
    if (user.role === 'student') {
      annFilter.target = { $in: ['all', 'student'] };
    } else if (user.role === 'teacher' || user.role === 'instructor') {
      annFilter.target = { $in: ['all', 'teacher'] };
    } else if (user.role === 'admin') {
      annFilter.target = { $in: ['all', 'admin'] };
    }
    const annCountPromise = Announcement.countDocuments(annFilter);

    const [notifCount, annCount] = await Promise.all([notifCountPromise, annCountPromise]);

    return NextResponse.json({ count: notifCount + annCount });
  } catch (error) {
    console.error('[API] /api/notifications/unread error:', error);
    return NextResponse.json({ count: 0 }, { status: 500 });
  }
}
