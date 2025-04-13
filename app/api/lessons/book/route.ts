import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Lesson from '@/models/Lesson';
import User from '@/models/User';
import { verifyJwt } from '@/lib/jwt';
import mongoose from 'mongoose';

// Veritabanı bağlantısı
connectDB();

// Ders rezervasyonu oluşturma
export async function POST(request: NextRequest) {
  try {
    // JWT doğrulama
    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Yetkilendirme hatası: Token bulunamadı' }, { status: 401 });
    }

    const decoded = await verifyJwt(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Yetkilendirme hatası: Geçersiz token' }, { status: 401 });
    }

    // Kullanıcıyı bul
    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });
    }

    // Öğrenci kontrolü
    if (user.role !== 'student') {
      return NextResponse.json({ error: 'Bu işlem için öğrenci hesabı gereklidir' }, { status: 403 });
    }

    // İstek verilerini al
    const data = await request.json();
    const { lessonId, scheduledAt } = data;

    // Gerekli verileri kontrol et
    if (!lessonId || !scheduledAt) {
      return NextResponse.json({ error: 'Ders ID ve tarih bilgisi gereklidir' }, { status: 400 });
    }

    // Geçerli bir ID mi kontrol et
    if (!mongoose.isValidObjectId(lessonId)) {
      return NextResponse.json({ error: 'Geçersiz ders ID formatı' }, { status: 400 });
    }

    // Dersi bul
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return NextResponse.json({ error: 'Ders bulunamadı' }, { status: 404 });
    }

    // Ders durumunu kontrol et
    if (lesson.status !== 'open') {
      return NextResponse.json({ error: 'Bu ders rezervasyona uygun değil' }, { status: 400 });
    }

    // Öğretmen kontrolü (öğrenci kendi dersini rezerve edemez)
    if (lesson.teacherId.toString() === user._id.toString()) {
      return NextResponse.json({ error: 'Kendi dersinizi rezerve edemezsiniz' }, { status: 400 });
    }

    // Tarih kontrolü (geçmiş bir tarih mi)
    const scheduleDate = new Date(scheduledAt);
    if (scheduleDate <= new Date()) {
      return NextResponse.json({ error: 'Geçmiş bir tarih için rezervasyon yapamazsınız' }, { status: 400 });
    }

    // Rezervasyon yap
    const updatedLesson = await Lesson.findByIdAndUpdate(
      lessonId,
      {
        $set: {
          studentId: user._id,
          status: 'scheduled',
          scheduledAt: scheduleDate
        }
      },
      { new: true, runValidators: true }
    );

    // Öğretmen bilgilerini getir
    const teacher = await User.findById(lesson.teacherId, 'name email');

    return NextResponse.json({
      message: 'Ders başarıyla rezerve edildi',
      lesson: updatedLesson,
      teacher
    }, { status: 200 });

  } catch (error) {
    console.error('Ders rezervasyon hatası:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
