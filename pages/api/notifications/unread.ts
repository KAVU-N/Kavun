import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/mongodb';
import Notification from '@/models/Notification';
import { getUserFromToken } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ count: 0 });
  }
  const user = await getUserFromToken(authHeader);
  if (!user || !user.id) {
    return res.status(401).json({ count: 0 });
  }
  // Bildirimler sayfası ile aynı filtreleme uygulanmalı
  let filter: any = { read: false };
  if (user.role === 'student') {
    filter.$or = [ { userId: user.id }, { userId: 'all' }, { userId: 'student' } ];
  } else if (user.role === 'teacher') {
    filter.$or = [ { userId: user.id }, { userId: 'all' }, { userId: 'teacher' } ];
  } else {
    filter.userId = user.id;
  }
  const count = await Notification.countDocuments(filter);
  res.status(200).json({ count });
}
