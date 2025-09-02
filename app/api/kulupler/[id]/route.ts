import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Club from '@/models/Club';
import User from '@/models/User';
import { getUserFromToken } from '@/lib/auth';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const club = await Club.findById(params.id);
    if (!club) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    // owner contact minimal info
    let owner: { _id: string; name: string; email: string } | null = null;
    try {
      const u = await User.findById(club.ownerId).select('_id name email');
      if (u) {
        const uu = u as any;
        owner = { _id: String(uu._id), name: uu.name, email: uu.email } as any;
      }
    } catch {}
    return NextResponse.json({ data: club, owner }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: 'Server error', details: err?.message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    // Auth: sadece sahibi güncelleyebilir
    const me = await getUserFromToken(req);
    if (!me?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const existing = await Club.findById(params.id);
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (existing.ownerId?.toString() !== me.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const allowed = ['name', 'university', 'category', 'description', 'isApproved'] as const;
    const update: any = {};
    for (const key of allowed) {
      if (key in (body || {})) update[key] = (body as any)[key];
    }
    update.updatedAt = new Date();
    const club = await Club.findByIdAndUpdate(params.id, update, { new: true });
    if (!club) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ data: club }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: 'Server error', details: err?.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const me = await getUserFromToken(req);
    if (!me?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const existing = await Club.findById(params.id);
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (existing.ownerId?.toString() !== me.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await Club.findByIdAndDelete(params.id);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: 'Server error', details: err?.message }, { status: 500 });
  }
}

