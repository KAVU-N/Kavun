import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Lesson from '@/models/Lesson';
import User from '@/models/User';
import { verifyToken } from '@/lib/jwt';
import mongoose from 'mongoose';

// Veritabanı bağlantısı
connectDB();

// Belirli bir dersi getir
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    // ID formatını doğrula
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ error: 'Geçersiz ders ID formatı' }, { status: 400 });
    }

    // Dersi getir
    const lesson = await Lesson.findById(id)
      .populate('teacherId', 'name email university expertise')
      .populate('studentId', 'name email university');

    if (!lesson) {
      return NextResponse.json({ error: 'Ders bulunamadı' }, { status: 404 });
    }

    return NextResponse.json(lesson);

  } catch (error) {
    console.error('Ders getirme hatası:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

// Ders güncelleme
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    // JWT doğrulama
    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Yetkilendirme hatası: Token bulunamadı' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Yetkilendirme hatası: Geçersiz token' }, { status: 401 });
    }

    // ID formatını doğrula
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ error: 'Geçersiz ders ID formatı' }, { status: 400 });
    }

    // Dersi bul
    const lesson = await Lesson.findById(id);
    if (!lesson) {
      return NextResponse.json({ error: 'Ders bulunamadı' }, { status: 404 });
    }

    // Yetki kontrolü
    const user = await User.findById(decoded.id);
    if (!user) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });
    }

    // Yalnızca dersin öğretmeni güncelleyebilir
    const userIdStr = user._id ? user._id.toString() : '';
    const teacherIdStr = lesson.teacherId ? lesson.teacherId.toString() : '';
    
    if (teacherIdStr !== userIdStr && user.role !== 'teacher') {
      return NextResponse.json({ error: 'Bu dersi güncelleme yetkiniz yok' }, { status: 403 });
    }

    // İstek gövdesinden veri al
    const data = await request.json();
    
    // Güncelleme verileri
    const updateData: any = {};
    
    // Sadece izin verilen alanları güncelle
    if (data.title) updateData.title = data.title;
    if (data.description) updateData.description = data.description;
    if (data.price) updateData.price = data.price;
    if (data.duration) updateData.duration = data.duration;
    
    // Öğretmen ders durumunu değiştirebilir
    if (data.status) {
      // Yalnızca belirli durum geçişlerine izin ver
      if (lesson.status === 'open' && data.status === 'cancelled') {
        updateData.status = 'cancelled';
      } else if (lesson.status === 'scheduled' && data.status === 'completed') {
        updateData.status = 'completed';
        updateData.completedAt = new Date();
      } else if (lesson.status === 'scheduled' && data.status === 'cancelled') {
        updateData.status = 'cancelled';
      }
    }

    // Dersi güncelle
    const updatedLesson = await Lesson.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    return NextResponse.json({ 
      message: 'Ders başarıyla güncellendi', 
      lesson: updatedLesson 
    });

  } catch (error) {
    console.error('Ders güncelleme hatası:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

// Ders silme
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    // JWT doğrulama
    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Yetkilendirme hatası: Token bulunamadı' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Yetkilendirme hatası: Geçersiz token' }, { status: 401 });
    }

    // ID formatını doğrula
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ error: 'Geçersiz ders ID formatı' }, { status: 400 });
    }

    // Dersi bul
    const lesson = await Lesson.findById(id);
    if (!lesson) {
      return NextResponse.json({ error: 'Ders bulunamadı' }, { status: 404 });
    }

    // Yetki kontrolü
    const user = await User.findById(decoded.id);
    if (!user) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });
    }

    // Yalnızca dersin öğretmeni silebilir
    if (lesson.teacherId.toString() !== user._id.toString() && user.role !== 'admin') {
      return NextResponse.json({ error: 'Bu dersi silme yetkiniz yok' }, { status: 403 });
    }

    // Yalnızca açık durumdaki dersler silinebilir
    if (lesson.status !== 'open') {
      return NextResponse.json({ 
        error: 'Yalnızca açık durumdaki dersler silinebilir. Planlanmış veya tamamlanmış dersler silinemez.' 
      }, { status: 400 });
    }

    // Dersi sil
    await Lesson.findByIdAndDelete(id);

    return NextResponse.json({ 
      message: 'Ders başarıyla silindi'
    });

  } catch (error) {
    console.error('Ders silme hatası:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
