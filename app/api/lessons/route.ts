import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Lesson from '@/models/Lesson';
import User from '@/models/User';
import { verifyToken } from '@/lib/jwt';
import mongoose from 'mongoose';

connectDB();

export async function POST(request: NextRequest) {
  try {
    const tokenHeader = request.headers.get('Authorization');
    const token = tokenHeader?.split(' ')[1];

    if (!token) {
      return NextResponse.json({ error: 'Yetkilendirme hatası: Token bulunamadı' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Yetkilendirme hatası: Geçersiz token' }, { status: 401 });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });
    }

    const data = await request.json();
    const {
      teacherId,
      title,
      description,
      price,
      duration,
      scheduledAt,
      lessonType,
      groupSize
    } = data;

    const isBooking = teacherId && String(teacherId) !== String(user._id);

    if (isBooking) {
      if (!title || !description || !price || !duration || !scheduledAt) {
        return NextResponse.json({ error: 'Lütfen tüm gerekli alanları doldurun' }, { status: 400 });
      }

      try {
        const teacherObjectId = new mongoose.Types.ObjectId(teacherId);
        const newLesson = await Lesson.create({
          teacherId: teacherObjectId,
          studentId: user._id,
          title,
          description,
          price,
          duration,
          status: 'scheduled',
          scheduledAt,
          lessonType: lessonType || 'individual',
          groupSize: groupSize || undefined
        });

        return NextResponse.json({
          message: 'Ders rezervasyonu başarılı',
          lesson: newLesson
        }, { status: 201 });
      } catch (error) {
        console.error('Ders rezervasyonunda hata:', error);
        return NextResponse.json({ error: 'Ders rezervasyonunda bir hata oluştu' }, { status: 500 });
      }
    }

    if (!title || !description || !price || !duration) {
      return NextResponse.json({ error: 'Lütfen tüm gerekli alanları doldurun' }, { status: 400 });
    }

    const newLesson = await Lesson.create({
      teacherId: user._id,
      title,
      description,
      price,
      duration,
      status: 'open',
      scheduledAt: scheduledAt || null,
      lessonType: lessonType || 'individual',
      groupSize: groupSize || undefined
    });

    return NextResponse.json({
      message: 'Ders başarıyla oluşturuldu',
      lesson: newLesson
    }, { status: 201 });
  } catch (error) {
    console.error('Ders oluşturma hatası:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const status = searchParams.get('status');
    const teacherId = searchParams.get('teacherId');
    const studentId = searchParams.get('studentId');
    const userId = searchParams.get('userId');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');

    const filter: Record<string, any> = {};

    if (userId) {
      const userObjectId = new mongoose.Types.ObjectId(userId);
      filter.$or = [
        { teacherId: userObjectId },
        { studentId: userObjectId }
      ];
    } else {
      if (teacherId) {
        filter.teacherId = teacherId;
      }
      if (studentId) {
        filter.studentId = studentId;
      }
      if (status) {
        filter.status = status;
      }
    }

    if (minPrice) {
      filter.price = { ...(filter.price || {}), $gte: parseFloat(minPrice) };
    }
    if (maxPrice) {
      filter.price = { ...(filter.price || {}), $lte: parseFloat(maxPrice) };
    }

    if (!status && !teacherId && !studentId && !userId) {
      filter.status = 'open';
    }

    const lessons = await Lesson.find(filter)
      .populate('teacherId', 'name email university expertise')
      .populate('studentId', 'name email university')
      .sort({ createdAt: -1 })
      .limit(50);

    return NextResponse.json(lessons);
  } catch (error) {
    console.error('Dersleri getirme hatası:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
