import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Notification from '@/models/Notification';
import { getUserFromToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// PUT /api/notifications/read-all  → tüm bildirimleri okundu işaretler
export async function PUT(request: NextRequest) {
  try {
    await connectDB();

    // Kullanıcı doğrulaması
    const user = await getUserFromToken(request);
    if (!user || !user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Hangi bildirimlerin okundu sayılacağına dair filtre – role tabanlı aynı mantık
    let filter: any = { read: false };
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

    // Announcement filtre
    let annFilter: any = { readBy: { $ne: user.id } };
    if (user.role === 'student') {
      annFilter.target = { $in: ['all', 'student'] };
    } else if (user.role === 'teacher' || user.role === 'instructor') {
      annFilter.target = { $in: ['all', 'teacher'] };
    } else if (user.role === 'admin') {
      annFilter.target = { $in: ['all', 'admin'] };
    }

    await Notification.updateMany(filter, { $set: { read: true } });
    // Announcement'ların readBy listesine kullanıcıyı ekle
    const Announcement = (await import('@/models/Announcement')).default;
    await Announcement.updateMany(annFilter, { $addToSet: { readBy: user.id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API] notifications/read-all PUT error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
