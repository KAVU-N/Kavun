import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Announcement from '@/models/Announcement';
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

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) return NextResponse.json({ message: 'Yetkisiz' }, { status: 403 });
    await connectDB();
    const announcement = await Announcement.findById(params.id);
    if (!announcement) return NextResponse.json({ message: 'İlan bulunamadı' }, { status: 404 });
    return NextResponse.json(announcement);
  } catch (e) {
    return NextResponse.json({ message: 'Hata', error: e }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) return NextResponse.json({ message: 'Yetkisiz' }, { status: 403 });
    const data = await req.json();
    await connectDB();
    const announcement = await Announcement.findByIdAndUpdate(params.id, { $set: data }, { new: true, runValidators: true });
    if (!announcement) return NextResponse.json({ message: 'İlan bulunamadı' }, { status: 404 });
    return NextResponse.json(announcement);
  } catch (e) {
    return NextResponse.json({ message: 'Hata', error: e }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) return NextResponse.json({ message: 'Yetkisiz' }, { status: 403 });
    await connectDB();
    const announcement = await Announcement.findByIdAndDelete(params.id);
    if (!announcement) return NextResponse.json({ message: 'İlan bulunamadı' }, { status: 404 });
    return NextResponse.json({ message: 'İlan silindi' });
  } catch (e) {
    return NextResponse.json({ message: 'Hata', error: e }, { status: 500 });
  }
}
