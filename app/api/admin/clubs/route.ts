export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
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

export async function GET(request: NextRequest) {
  try {
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q')?.trim();
    const category = searchParams.get('category')?.trim();
    const university = searchParams.get('university')?.trim();
    const limitParam = searchParams.get('limit');
    const limit = Math.min(Math.max(Number(limitParam) || 200, 1), 500);

    const filter: Record<string, any> = {};

    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
      ];
    }

    if (category) {
      filter.category = category;
    }

    if (university) {
      filter.university = university;
    }

    const clubs = await Club.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit);

    return NextResponse.json({ data: clubs }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Sunucu hatası', details: error?.message },
      { status: 500 }
    );
  }
}
