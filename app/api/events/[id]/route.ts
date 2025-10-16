import { NextResponse } from 'next/server';
import { Types } from 'mongoose';
import { cookies } from 'next/headers';
import { connectDB } from '@/lib/db';
import Event from '@/models/Event';
import { EVENT_ADMIN_COOKIE_NAME, isValidEventAdminToken } from '@/lib/eventAdminAuth';

const isObjectId = (value: string) => Types.ObjectId.isValid(value);

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(EVENT_ADMIN_COOKIE_NAME)?.value;

    if (!isValidEventAdminToken(token)) {
      return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
    }

    const eventId = params?.id;

    if (!eventId || !isObjectId(eventId)) {
      return NextResponse.json({ error: 'Geçersiz etkinlik kimliği' }, { status: 400 });
    }

    await connectDB();

    const body = await request.json();

    const update: Record<string, any> = {};

    if (typeof body?.title === 'string') {
      if (body.title.trim().length === 0) {
        return NextResponse.json({ error: 'Etkinlik başlığı boş olamaz' }, { status: 400 });
      }
      update.title = body.title.trim();
    }

    if (typeof body?.description === 'string') {
      if (body.description.trim().length === 0) {
        return NextResponse.json({ error: 'Etkinlik açıklaması boş olamaz' }, { status: 400 });
      }
      update.description = body.description.trim();
    }

    if (typeof body?.date === 'string') {
      const eventDate = new Date(body.date);
      if (Number.isNaN(eventDate.getTime())) {
        return NextResponse.json({ error: 'Geçersiz etkinlik tarihi' }, { status: 400 });
      }
      update.date = eventDate;
    }

    if (typeof body?.category === 'string') {
      update.category = body.category.trim() || undefined;
    }

    if (typeof body?.location === 'string') {
      update.location = body.location.trim() || undefined;
    }

    if (typeof body?.photoUrl === 'string') {
      update.photoUrl = body.photoUrl.trim() || undefined;
    }

    if (Array.isArray(body?.resources)) {
      const sanitizedResources = (body.resources as unknown[])
        .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
        .map((item) => item.trim());
      update.resources = sanitizedResources;
    }

    if (typeof body?.clubName === 'string') {
      update.clubName = body.clubName.trim() || undefined;
    }

    if (!Object.keys(update).length) {
      return NextResponse.json({ error: 'Güncellenecek veri bulunamadı' }, { status: 400 });
    }

    const updated = await Event.findByIdAndUpdate(eventId, update, { new: true });

    if (!updated) {
      return NextResponse.json({ error: 'Etkinlik bulunamadı' }, { status: 404 });
    }

    return NextResponse.json({ data: updated }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Sunucu hatası', details: error?.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(EVENT_ADMIN_COOKIE_NAME)?.value;

    if (!isValidEventAdminToken(token)) {
      return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
    }

    const eventId = params?.id;

    if (!eventId || !isObjectId(eventId)) {
      return NextResponse.json({ error: 'Geçersiz etkinlik kimliği' }, { status: 400 });
    }

    await connectDB();

    const deleted = await Event.findByIdAndDelete(eventId);

    if (!deleted) {
      return NextResponse.json({ error: 'Etkinlik bulunamadı' }, { status: 404 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Sunucu hatası', details: error?.message }, { status: 500 });
  }
}
