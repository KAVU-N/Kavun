import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { Types } from 'mongoose';
import { connectDB } from '@/lib/db';
import Event from '@/models/Event';
import Club from '@/models/Club';
import {
  EVENT_ADMIN_COOKIE_NAME,
  isValidEventAdminToken,
} from '@/lib/eventAdminAuth';

const isObjectId = (value: string) => Types.ObjectId.isValid(value);

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);

    const q = searchParams.get('q')?.trim();
    const university = searchParams.get('university')?.trim();
    const clubId = searchParams.get('club')?.trim();
    const category = searchParams.get('category')?.trim();
    const startDate = searchParams.get('startDate')?.trim();
    const endDate = searchParams.get('endDate')?.trim();

    const filter: Record<string, any> = {};

    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
      ];
    }

    if (university) {
      filter.universities = university;
    }

    if (category) {
      filter.category = category;
    }

    if (clubId) {
      if (!isObjectId(clubId)) {
        return NextResponse.json({ error: 'Geçersiz kulüp kimliği' }, { status: 400 });
      }
      filter.clubs = new Types.ObjectId(clubId);
    }

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) {
        const parsedStart = new Date(startDate);
        if (Number.isNaN(parsedStart.getTime())) {
          return NextResponse.json({ error: 'Geçersiz başlangıç tarihi' }, { status: 400 });
        }
        filter.date.$gte = parsedStart;
      }
      if (endDate) {
        const parsedEnd = new Date(endDate);
        if (Number.isNaN(parsedEnd.getTime())) {
          return NextResponse.json({ error: 'Geçersiz bitiş tarihi' }, { status: 400 });
        }
        filter.date.$lte = parsedEnd;
      }
    }

    const events = await Event.find(filter)
      .sort({ date: 1 })
      .limit(200)
      .populate('clubs', 'name university category logoUrl');

    return NextResponse.json({ data: events }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Sunucu hatası', details: error?.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(EVENT_ADMIN_COOKIE_NAME)?.value;

    if (!isValidEventAdminToken(token)) {
      return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const {
      title,
      description,
      date,
      category,
      location,
      photoUrl,
      resources,
      clubIds,
    } = body || {};

    if (!title?.trim()) {
      return NextResponse.json({ error: 'Etkinlik başlığı zorunludur' }, { status: 400 });
    }

    if (!description?.trim()) {
      return NextResponse.json({ error: 'Etkinlik açıklaması zorunludur' }, { status: 400 });
    }

    if (!date) {
      return NextResponse.json({ error: 'Etkinlik tarihi zorunludur' }, { status: 400 });
    }

    const eventDate = new Date(date);
    if (Number.isNaN(eventDate.getTime())) {
      return NextResponse.json({ error: 'Geçersiz etkinlik tarihi' }, { status: 400 });
    }

    if (!Array.isArray(clubIds) || clubIds.length === 0) {
      return NextResponse.json({ error: 'En az bir kulüp seçilmelidir' }, { status: 400 });
    }

    const validClubIds = clubIds.filter((id: unknown) => typeof id === 'string' && isObjectId(id));
    if (validClubIds.length !== clubIds.length) {
      return NextResponse.json({ error: 'Geçersiz kulüp kimliği' }, { status: 400 });
    }

    const uniqueClubIds = [...new Set(validClubIds.map((id: string) => id))];

    const clubs = await Club.find({ _id: { $in: uniqueClubIds } }).select('_id university');
    if (clubs.length !== uniqueClubIds.length) {
      return NextResponse.json({ error: 'Bazı kulüpler bulunamadı' }, { status: 404 });
    }

    const universities = Array.from(
      new Set(clubs.map((club) => club.university).filter((value): value is string => Boolean(value)))
    );

    const sanitizedResources = Array.isArray(resources)
      ? (resources as unknown[])
          .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
          .map((item) => item.trim())
      : undefined;

    const created = await Event.create({
      title: title.trim(),
      description: description.trim(),
      date: eventDate,
      category: category?.trim() || undefined,
      location: location?.trim() || undefined,
      photoUrl: photoUrl?.trim() || undefined,
      resources: sanitizedResources,
      clubs: clubs.map((club) => club._id),
      universities,
    });

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Sunucu hatası', details: error?.message }, { status: 500 });
  }
}
