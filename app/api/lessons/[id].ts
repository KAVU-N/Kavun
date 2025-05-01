import { NextRequest, NextResponse } from 'next/server';
import Lesson from '@/models/Lesson';
import { connectDB } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';

// Bağlantı
connectDB();

// PATCH: Öğrenci dersi onaylıyor
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Yetkilendirme hatası: Token bulunamadı' }, { status: 401 });
    }
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Yetkilendirme hatası: Geçersiz token' }, { status: 401 });
    }
    // Sadece öğrenci kendi dersini onaylayabilsin
    const lesson = await Lesson.findById(params.id);
    if (!lesson) {
      return NextResponse.json({ error: 'Ders bulunamadı' }, { status: 404 });
    }
    if (!lesson.studentId) {
      return NextResponse.json({ error: 'Bu dersin bir öğrencisi yok.' }, { status: 400 });
    }
    if (lesson.studentId.toString() !== decoded.id) {
      return NextResponse.json({ error: 'Bu dersi yalnızca ilgili öğrenci onaylayabilir' }, { status: 403 });
    }
    lesson.studentConfirmed = true;
    await lesson.save();
    return NextResponse.json({ message: 'Ders başarıyla onaylandı', lesson });
  } catch (err) {
    console.error('Ders onaylama hatası:', err);
    return NextResponse.json({ error: 'Ders onaylama sırasında sunucu hatası', details: err instanceof Error ? err.message : err }, { status: 500 });
  }
}
