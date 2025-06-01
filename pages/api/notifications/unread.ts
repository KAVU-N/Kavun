import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/mongodb';
import Notification from '@/models/Notification';
import { getUserFromToken } from '@/lib/auth';

// DEBUG LOG KALDIRILDI '[API DEBUG] /api/notifications/unread endpoint çağrıldı');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // DEBUG LOG KALDIRILDI '[API DEBUG] handler fonksiyonu çalıştı');
  await connectDB();
  const authHeader = req.headers['authorization'] || req.headers['Authorization'] || req.headers.authorization || req.headers.Authorization;
  // DEBUG LOG KALDIRILDI '[API DEBUG] Authorization header (tüm varyasyonlar):', authHeader);
  // DEBUG LOG KALDIRILDI '[API DEBUG] Full headers:', req.headers);
  if (!authHeader) {
    // DEBUG LOG KALDIRILDI '[API DEBUG] Authorization header yok, 401 dönülüyor');
    return res.status(401).json({ count: 0 });
  }
  if (typeof authHeader === 'string') {
    const tokenPart = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7, 17)
      : authHeader.slice(0, 10);
    // DEBUG LOG KALDIRILDI '[API DEBUG] Token ilk 10:', tokenPart);
  }
  // Eğer authHeader bir array ise ilk elemanı al
  const user = await getUserFromToken(Array.isArray(authHeader) ? authHeader[0] : authHeader);
  // DEBUG LOG KALDIRILDI '[API DEBUG] getUserFromToken sonucu:', user);
  if (!user || !user.id) {
    // DEBUG LOG KALDIRILDI '[API DEBUG] Kullanıcı yok veya ID yok, 401 dönülüyor');
    return res.status(401).json({ count: 0 });
  }
  // Bildirimler sayfası ile aynı filtreleme uygulanmalı
  let filter: any = { read: false };
  if (user.role === 'student') {
    filter.$or = [ { userId: user.id }, { userId: 'all' }, { userId: 'student' } ];
  } else if (user.role === 'teacher' || user.role === 'instructor') {
    filter.$or = [ { userId: user.id }, { userId: 'all' }, { userId: 'teacher' }, { userId: 'instructor' } ];
  } else {
    filter.userId = user.id;
  }
  const count = await Notification.countDocuments(filter);
  res.status(200).json({ count });
}
