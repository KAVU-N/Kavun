import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';

// İlan şeması (app/api/ilanlar/route.ts ile aynı)
const ilanSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Başlık zorunludur'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Açıklama zorunludur'],
    trim: true,
  },
  price: {
    type: Number,
    required: [true, 'Ücret zorunludur'],
  },
  method: {
    type: String,
    enum: ['online', 'yüzyüze', 'hibrit'],
    default: 'online',
  },
  duration: {
    type: Number,
    required: [true, 'Süre zorunludur'],
  },
  frequency: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'flexible'],
    default: 'weekly',
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  },
  userId: {
    type: String,
    required: true,
  },
}, { timestamps: true });

// Model oluştur veya varsa kullan
const Ilan = mongoose.models.Ilan || mongoose.model('Ilan', ilanSchema);

// Kullanıcı modeli
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  role: String,
  university: String,
  expertise: String,
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

// GET - Belirli bir ilanın detaylarını getir
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    if (!params.id) {
      return NextResponse.json(
        { error: 'İlan ID parametresi gereklidir' },
        { status: 400 }
      );
    }
    
    // İlanı bul
    const ilan = await Ilan.findById(params.id);
    
    if (!ilan) {
      return NextResponse.json(
        { error: 'İlan bulunamadı' },
        { status: 404 }
      );
    }
    
    // İlanı veren öğretmenin bilgilerini getir
    const teacher = await User.findOne({ _id: ilan.userId })
      .select('name email university expertise');
    
    // İlan ve öğretmen bilgilerini birleştir
    const ilanWithTeacher = {
      ...ilan.toObject(),
      teacher: teacher ? teacher.toObject() : null
    };
    
    return NextResponse.json(ilanWithTeacher);
  } catch (error: any) {
    console.error('İlan detayları getirme hatası:', error);
    return NextResponse.json(
      { error: error.message || 'İlan detayları getirilirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// PUT - İlanı güncelle (sadece ilan sahibi yapabilir)
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    if (!params.id) {
      return NextResponse.json(
        { error: 'İlan ID parametresi gereklidir' },
        { status: 400 }
      );
    }
    
    const data = await request.json();
    const { userId } = data;
    
    // İlanı bul
    const ilan = await Ilan.findById(params.id);
    
    if (!ilan) {
      return NextResponse.json(
        { error: 'İlan bulunamadı' },
        { status: 404 }
      );
    }
    
    // Kullanıcı kontrolü - sadece ilan sahibi güncelleyebilir
    if (ilan.userId.toString() !== userId) {
      return NextResponse.json(
        { error: 'Bu işlem için yetkiniz bulunmamaktadır' },
        { status: 403 }
      );
    }
    
    // İlanı güncelle
    const updatedIlan = await Ilan.findByIdAndUpdate(
      params.id,
      { $set: data },
      { new: true, runValidators: true }
    );
    
    return NextResponse.json(updatedIlan);
  } catch (error: any) {
    console.error('İlan güncelleme hatası:', error);
    return NextResponse.json(
      { error: error.message || 'İlan güncellenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// DELETE - İlanı sil (sadece ilan sahibi yapabilir)
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    if (!params.id) {
      return NextResponse.json(
        { error: 'İlan ID parametresi gereklidir' },
        { status: 400 }
      );
    }
    
    // URL'den kullanıcı kimliğini al
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Kullanıcı kimliği gereklidir' },
        { status: 400 }
      );
    }
    
    // İlanı bul
    const ilan = await Ilan.findById(params.id);
    
    if (!ilan) {
      return NextResponse.json(
        { error: 'İlan bulunamadı' },
        { status: 404 }
      );
    }
    
    // Kullanıcı kontrolü - sadece ilan sahibi silebilir
    if (ilan.userId.toString() !== userId) {
      return NextResponse.json(
        { error: 'Bu işlem için yetkiniz bulunmamaktadır' },
        { status: 403 }
      );
    }
    
    // İlanı sil
    await Ilan.findByIdAndDelete(params.id);
    
    return NextResponse.json({ message: 'İlan başarıyla silindi' });
  } catch (error: any) {
    console.error('İlan silme hatası:', error);
    return NextResponse.json(
      { error: error.message || 'İlan silinirken bir hata oluştu' },
      { status: 500 }
    );
  }
}
