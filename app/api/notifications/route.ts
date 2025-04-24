import connectDB from '@/lib/mongodb';
import Notification from '@/models/Notification';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const metadata = {
  viewport: {
    themeColor: '#FF8B5E'
  }
};

// Bildirimleri getir
export async function GET(request: Request) {
  await connectDB();
  // Demo: userId paramı yok, tüm bildirimleri getir
  const notifications = await Notification.find().sort({ createdAt: -1 });
  return NextResponse.json({ notifications });
}

// Bildirimi okundu işaretle
export async function PUT(request: Request) {
  await connectDB();
  const { id } = await request.json();
  await Notification.findByIdAndUpdate(id, { read: true });
  return NextResponse.json({ success: true });
}

// Bildirimi sil
export async function DELETE(request: Request) {
  await connectDB();
  const { id } = await request.json();
  await Notification.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}
