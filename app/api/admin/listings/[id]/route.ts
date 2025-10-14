export const dynamic = "force-dynamic";
export const fetchCache = 'force-no-store';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import Ilan from '@/models/Ilan';
import User from '@/models/User';

type DecodedToken = {
  userId: string;
  email: string;
  role?: string;
};

async function checkAdminAuth() {
  const token = cookies().get('admin-token')?.value;
  if (!token) {
    return false;
  }
  try {
    const decoded = verify(token, process.env.JWT_SECRET || 'kavun-admin-secret') as DecodedToken;
    return decoded?.role === 'admin';
  } catch {
    return false;
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const isAdmin = await checkAdminAuth();
  if (!isAdmin) {
    return NextResponse.json({ message: 'Yetkisiz' }, { status: 403 });
  }

  await connectDB();

  const body = await request.json();
  const { title, description, price, method, frequency, status, ownerEmail } = body;

  const updateData: Record<string, any> = {};
  if (title !== undefined) updateData.title = title;
  if (description !== undefined) updateData.description = description;
  if (price !== undefined) updateData.price = Number(price);
  if (method !== undefined) updateData.method = method;
  if (frequency !== undefined) updateData.frequency = frequency;
  if (status !== undefined) updateData.status = status;

  if (ownerEmail) {
    const owner = await User.findOne({ email: ownerEmail.toLowerCase() }).select('_id');
    if (!owner) {
      return NextResponse.json({ message: 'Belirtilen e-posta ile kullanıcı bulunamadı' }, { status: 404 });
    }
    updateData.userId = owner._id.toString();
  }

  const updated = await Ilan.findByIdAndUpdate(params.id, { $set: updateData }, { new: true, runValidators: true });

  if (!updated) {
    return NextResponse.json({ message: 'İlan bulunamadı' }, { status: 404 });
  }

  return NextResponse.json(updated);
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const isAdmin = await checkAdminAuth();
  if (!isAdmin) {
    return NextResponse.json({ message: 'Yetkisiz' }, { status: 403 });
  }

  await connectDB();

  const deleted = await Ilan.findByIdAndDelete(params.id);

  if (!deleted) {
    return NextResponse.json({ message: 'İlan bulunamadı' }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
