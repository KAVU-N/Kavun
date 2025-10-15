import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { Types } from 'mongoose';
import { connectDB } from '@/lib/db';
import Event from '@/models/Event';
import Club from '@/models/Club';
import { EVENT_ADMIN_COOKIE_NAME, isValidEventAdminToken } from '@/lib/eventAdminAuth';

const isObjectId = (value: string) => Types.ObjectId.isValid(value);
const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);

    const q = searchParams.get('q')?.trim();
    const locationParam = searchParams.get('location')?.trim();
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

    if (locationParam) {
      filter.location = { $regex: new RegExp(escapeRegex(locationParam), 'i') };
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

    const query = Event.find(filter)
      .sort({ date: 1 })
      .limit(200)
      .populate('clubs', 'name university category logoUrl');

    const events = await query;

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
      clubName,
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

    const receivedClubIds = Array.isArray(clubIds)
      ? clubIds
      : typeof clubIds === 'string' && clubIds.trim().length > 0
      ? [clubIds]
      : [];

    const trimmedClubIds = receivedClubIds
      .map((id) => (typeof id === 'string' ? id.trim() : ''))
      .filter((id) => id.length > 0);

    if (!trimmedClubIds.every((id) => isObjectId(id))) {
      return NextResponse.json({ error: 'Geçersiz kulüp kimliği' }, { status: 400 });
    }

    let clubs: { _id: Types.ObjectId; university?: string }[] = [];
    let universities: string[] | undefined;

    if (trimmedClubIds.length > 0) {
      const uniqueClubIds = [...new Set(trimmedClubIds)];
      clubs = await Club.find({ _id: { $in: uniqueClubIds } }).select('_id university');
      if (clubs.length !== uniqueClubIds.length) {
        return NextResponse.json({ error: 'Bazı kulüpler bulunamadı' }, { status: 404 });
      }

      const uniSet = new Set(
        clubs
          .map((club) => club.university)
          .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
      );
      if (uniSet.size > 0) {
        universities = Array.from(uniSet);
      }
    }

    const sanitizedResources = Array.isArray(resources)
      ? (resources as unknown[])
          .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
          .map((item) => item.trim())
      : undefined;

    const sanitizedClubName = typeof clubName === 'string' && clubName.trim().length > 0 ? clubName.trim() : undefined;

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
      clubName: sanitizedClubName,
    });

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Sunucu hatası', details: error?.message }, { status: 500 });
  }
}
