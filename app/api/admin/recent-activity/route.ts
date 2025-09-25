import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Activity from '@/models/Activity';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';

// Admin yetkisi kontrolü
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
    const activities = await Activity.find().sort({ createdAt: -1 }).limit(20);
    return NextResponse.json(activities);
  } catch (e) {
    return NextResponse.json({ message: 'Hata', error: e }, { status: 500 });
  }
}
