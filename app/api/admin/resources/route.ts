import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Resource from '@/models/Resource';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';

// Admin yetkisi kontrolü
async function checkAdminAuth() {
  const token = cookies().get('admin-token')?.value;
  if (!token) return false;
  try {
    const decoded = verify(token, process.env.JWT_SECRET || 'kavun-admin-secret') as {
      role: string;
    };
    return decoded.role === 'admin';
  } catch {
    return false;
  }
}

export async function GET(req: NextRequest) {
  try {
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) return NextResponse.json({ message: 'Yetkisiz' }, { status: 403 });
    await connectDB();
    const resources = await Resource.find().sort({ createdAt: -1 });
    return NextResponse.json(resources);
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
    const resource = await Resource.create(data);
    return NextResponse.json(resource);
  } catch (e) {
    return NextResponse.json({ message: 'Hata', error: e }, { status: 500 });
  }
}
