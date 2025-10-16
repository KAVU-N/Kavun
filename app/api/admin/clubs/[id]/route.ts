export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import { Types } from 'mongoose';
import connectDB from '@/lib/mongodb';
import Club from '@/models/Club';

type DecodedToken = {
  userId: string;
  email: string;
  role: string;
};

async function checkAdminAuth(): Promise<boolean> {
  const token = cookies().get('admin-token')?.value;
  if (!token) return false;
  try {
    const decoded = verify(token, process.env.JWT_SECRET || 'kavun-admin-secret') as DecodedToken;
    return decoded.role === 'admin';
  } catch (error) {
    return false;
  }
}

function isValidObjectId(value: string): boolean {
  return Types.ObjectId.isValid(value);
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 });
    }

    const { id } = params;
    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: 'Geçersiz kulüp kimliği' }, { status: 400 });
    }

    await connectDB();

    const club = await Club.findById(id);
    if (!club) {
      return NextResponse.json({ error: 'Kulüp bulunamadı' }, { status: 404 });
    }

    return NextResponse.json({ data: club }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Sunucu hatası', details: error?.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 });
    }

    const { id } = params;
    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: 'Geçersiz kulüp kimliği' }, { status: 400 });
    }

    const body = await request.json();
    const allowedKeys = ['name', 'university', 'category', 'description', 'logoUrl', 'isApproved'] as const;
    const bodyData = (body ?? {}) as Record<string, unknown>;
    const update: Record<string, unknown> = {};

    for (const key of allowedKeys) {
      if (!(key in bodyData)) continue;
      const value = bodyData[key];
      if (key === 'isApproved') {
        update.isApproved = Boolean(value);
      } else if (typeof value === 'string') {
        update[key] = value.trim();
      } else {
        update[key] = value;
      }
    }
    update.updatedAt = new Date();

    await connectDB();

    const updated = await Club.findByIdAndUpdate(id, { $set: update }, { new: true, runValidators: true });
    if (!updated) {
      return NextResponse.json({ error: 'Kulüp bulunamadı' }, { status: 404 });
    }

    return NextResponse.json({ data: updated }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Sunucu hatası', details: error?.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 });
    }

    const { id } = params;
    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: 'Geçersiz kulüp kimliği' }, { status: 400 });
    }

    await connectDB();

    const deleted = await Club.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Kulüp bulunamadı' }, { status: 404 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Sunucu hatası', details: error?.message }, { status: 500 });
  }
}
