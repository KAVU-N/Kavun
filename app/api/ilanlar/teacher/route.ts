import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';

// İlan şeması
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

// GET - Belirli bir öğretmenin tüm aktif ilanlarını getir
export async function GET(request: Request) {
  try {
    await connectDB();
    
    // URL'den öğretmen ID parametresini al
    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get('teacherId');
    
    if (!teacherId) {
      return NextResponse.json(
        { error: 'Öğretmen ID parametresi gereklidir' },
        { status: 400 }
      );
    }
    
    // Öğretmenin bilgilerini kontrol et
    const teacher = await User.findOne({ 
      _id: teacherId,
      role: 'teacher'
    });
    
    if (!teacher) {
      return NextResponse.json(
        { error: 'Öğretmen bulunamadı' },
        { status: 404 }
      );
    }
    
    // Öğretmenin aktif ilanlarını bul
    const ilanlar = await Ilan.find({
      userId: teacherId,
      status: 'active'
    }).sort({ createdAt: -1 });
    
    // Öğretmen bilgilerini her ilana ekle
    const ilanlarWithTeacher = ilanlar.map(ilan => ({
      ...ilan.toObject(),
      teacher: {
        _id: teacher._id,
        name: teacher.name,
        email: teacher.email,
        university: teacher.university,
        expertise: teacher.expertise
      }
    }));
    
    return NextResponse.json(ilanlarWithTeacher);
  } catch (error: any) {
    console.error('Öğretmen ilanları getirme hatası:', error);
    return NextResponse.json(
      { error: error.message || 'İlanlar getirilirken bir hata oluştu' },
      { status: 500 }
    );
  }
}
