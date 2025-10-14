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

export async function GET(request: NextRequest) {
  const isAdmin = await checkAdminAuth();
  if (!isAdmin) {
    return NextResponse.json({ message: 'Yetkisiz' }, { status: 403 });
  }

  await connectDB();

  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search');
  const status = searchParams.get('status');
  const method = searchParams.get('method');

  const filters: Record<string, any> = {};
  if (status) {
    filters.status = status;
  }
  if (method) {
    filters.method = method;
  }
  if (search) {
    filters.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  const listings = await Ilan.find(filters).sort({ createdAt: -1 }).lean();

  const ownerIds = Array.from(new Set(listings.map((listing) => listing.userId).filter(Boolean)));
  const owners = ownerIds.length
    ? await User.find({ _id: { $in: ownerIds } })
        .select('name email university role')
        .lean()
    : [];

  const ownerMap = new Map<string, typeof owners[number]>();
  owners.forEach((owner) => {
    ownerMap.set(owner._id.toString(), owner);
  });

  const response = listings.map((listing) => ({
    ...listing,
    owner: ownerMap.get(listing.userId?.toString() || '') || null,
  }));

  return NextResponse.json(response);
}

export async function POST(request: NextRequest) {
  const isAdmin = await checkAdminAuth();
  if (!isAdmin) {
    return NextResponse.json({ message: 'Yetkisiz' }, { status: 403 });
  }

  await connectDB();

  const body = await request.json();
  const { title, description, price, method, frequency, status, ownerEmail } = body;

  if (!title || !description || price === undefined || !ownerEmail) {
    return NextResponse.json({ message: 'Gerekli alanlar eksik' }, { status: 400 });
  }

  const owner = await User.findOne({ email: ownerEmail.toLowerCase() }).select('_id');
  if (!owner) {
    return NextResponse.json({ message: 'Belirtilen e-posta ile kullanıcı bulunamadı' }, { status: 404 });
  }

  const newListing = await Ilan.create({
    title,
    description,
    price: Number(price),
    method: method || 'online',
    frequency: frequency || 'weekly',
    status: status || 'active',
    userId: owner._id.toString(),
  });

  return NextResponse.json(newListing, { status: 201 });
}
