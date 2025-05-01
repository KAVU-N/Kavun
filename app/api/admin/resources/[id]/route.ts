import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Resource from '@/models/Resource';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';

async function checkAdminAuth() {
  const token = cookies().get('admin-token')?.value;
  if (!token) return false;
  try {
    const decoded = verify(token, process.env.JWT_SECRET || 'kavun-admin-secret') as { role: string };
    return decoded.role === 'admin';
  } catch {
    return false;
  }
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) return NextResponse.json({ message: 'Yetkisiz' }, { status: 403 });
    await connectDB();
    const resource = await Resource.findById(params.id);
    if (!resource) return NextResponse.json({ message: 'Kaynak bulunamadı' }, { status: 404 });
    return NextResponse.json(resource);
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
    const resource = await Resource.findByIdAndUpdate(params.id, { $set: data }, { new: true, runValidators: true });
    if (!resource) return NextResponse.json({ message: 'Kaynak bulunamadı' }, { status: 404 });
    return NextResponse.json(resource);
  } catch (e) {
    return NextResponse.json({ message: 'Hata', error: e }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) return NextResponse.json({ message: 'Yetkisiz' }, { status: 403 });
    await connectDB();
    const resource = await Resource.findByIdAndDelete(params.id);
    if (!resource) return NextResponse.json({ message: 'Kaynak bulunamadı' }, { status: 404 });
    return NextResponse.json({ message: 'Kaynak silindi' });
  } catch (e) {
    return NextResponse.json({ message: 'Hata', error: e }, { status: 500 });
  }
}
