import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Announcement from '@/models/Announcement';
import Notification from '@/models/Notification';
import User from '@/models/User';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';

async function checkAdminAuth() {
  const token = cookies().get('admin-token')?.value;
  if (!token) return false;
  try {
    verify(token, process.env.JWT_SECRET || 'kavun-admin-secret');
    return true;
  } catch {
    return false;
  }
}

export async function GET(req: NextRequest) {
  try {
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) return NextResponse.json({ message: 'Yetkisiz' }, { status: 403 });
    await connectDB();
    const announcements = await Announcement.find().sort({ date: -1 });
    return NextResponse.json(announcements);
  } catch (e) {
    return NextResponse.json({ message: 'Hata', error: e }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) return NextResponse.json({ message: 'Yetkisiz' }, { status: 403 });
    const data = await req.json();
    await connectDB();
    // Duyuru oluşturulmadan önce zorunlu alanlar kontrolü
    if (!data.title || !data.content || !data.target) {
      return NextResponse.json({ message: 'Eksik alanlar var', data }, { status: 400 });
    }
    const announcement = await Announcement.create({
      title: data.title,
      content: data.content,
      target: data.target,
      date: new Date()
    });

    // Bildirimleri gönder
    if (data.target === 'student') {
      // userId: 'student' ile tek bir bildirim oluştur
      await Notification.create({
        userId: 'student',
        title: data.title,
        message: data.content,
        type: 'announcement',
        read: false,
        createdAt: new Date(),
        actionUrl: '/ilanlar'
      });
    } else if (data.target === 'teacher') {
      // userId: 'teacher' ile tek bir bildirim oluştur
      await Notification.create({
        userId: 'teacher',
        title: data.title,
        message: data.content,
        type: 'announcement',
        read: false,
        createdAt: new Date(),
        actionUrl: '/ilanlar'
      });
    } else if (data.target === 'all') {
      // userId: 'all' olarak tekil bildirim
      await Notification.create({
        userId: 'all',
        title: data.title,
        message: data.content,
        type: 'announcement',
        read: false,
        createdAt: new Date(),
        actionUrl: '/ilanlar'
      });
    }

    return NextResponse.json(announcement);
  } catch (e) {
    return NextResponse.json({ message: 'Hata', error: e }, { status: 500 });
  }
}
