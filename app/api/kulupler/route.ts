import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Club from '@/models/Club';
import { getUserFromToken } from '@/lib/auth';
import User from '@/models/User';

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q')?.trim();
    const category = searchParams.get('category')?.trim();
    const university = searchParams.get('university')?.trim();
    const ownerId = searchParams.get('ownerId')?.trim();

    const filter: any = {};
    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
      ];
    }
    if (category) filter.category = category;
    if (university) filter.university = university;
    if (ownerId) filter.ownerId = ownerId;

    const clubs = await Club.find(filter).sort({ createdAt: -1 }).limit(100);
    return NextResponse.json({ data: clubs }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: 'Server error', details: err?.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    // DEBUG: Gelen headerları kontrol et
    const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
    const cookieHeader = req.headers.get('cookie');
    console.log('[DEBUG][POST /api/kulupler] Authorization:', authHeader ? `${authHeader.substring(0, 20)}...` : 'yok');
    console.log('[DEBUG][POST /api/kulupler] Cookie var mi:', !!cookieHeader, 'uzunluk:', cookieHeader?.length || 0);
    const me = await getUserFromToken(req);
    console.log('[DEBUG][POST /api/kulupler] me:', me);
    if (!me?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await User.findById(me.id).select('university');
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    if (!user.university) return NextResponse.json({ error: 'Profilinizde üniversite bilgisi yok' }, { status: 400 });

    const body = await req.json();
    const { name, category, description, logoUrl } = body || {};
    if (!name) return NextResponse.json({ error: 'name zorunludur' }, { status: 400 });

    // Kullanıcı başına tek kulüp
    const existing = await Club.findOne({ ownerId: me.id });
    if (existing) return NextResponse.json({ error: 'Bu kullanıcı zaten bir kulüp sahibi.' }, { status: 400 });

    const created = await Club.create({
      name,
      category,
      description,
      ownerId: me.id,
      university: user.university,
      logoUrl,
    });
    return NextResponse.json({ data: created }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: 'Server error', details: err?.message }, { status: 500 });
  }
}
