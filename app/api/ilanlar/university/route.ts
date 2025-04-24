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

// GET - Belirli bir üniversitedeki aktif ilanları getir
export async function GET(request: Request) {
  try {
    await connectDB();
    
    // URL'den üniversite parametresini al
    const { searchParams } = new URL(request.url);
    const university = searchParams.get('university');
    const searchTerm = searchParams.get('search') || '';
    
    if (!university) {
      return NextResponse.json(
        { error: 'Üniversite parametresi gereklidir' },
        { status: 400 }
      );
    }
    
    // Önce belirtilen üniversitedeki eğitmenleri bul - case insensitive arama yap
    // Hem 'teacher' hem de 'instructor' rolüne sahip kullanıcıları getir
    const teachers = await User.find({
      university: { $regex: new RegExp('^' + university + '$', 'i') },
      role: { $in: ['teacher', 'instructor'] }
    }).select('_id');
    
    console.log('University API - Found teachers/instructors:', teachers.length);
    
    const teacherIds = teachers.map(teacher => teacher._id.toString());
    
    // Arama filtresi oluştur
    let query: any = {
      userId: { $in: teacherIds },
      status: 'active'
    };
    
    // Eğer arama terimi varsa başlık ve açıklamada ara
    if (searchTerm) {
      query.$or = [
        { title: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } }
      ];
    }
    
    // İlanları bul
    const ilanlar = await Ilan.find(query).sort({ createdAt: -1 });
    
    console.log('University API - Found listings:', ilanlar.length);
    
    // Her ilan için öğretmen bilgilerini ekle
    const ilanlarWithTeachers = await Promise.all(
      ilanlar.map(async (ilan) => {
        const teacher = await User.findOne({ _id: ilan.userId })
          .select('name email university expertise profilePhotoUrl');
        
        return {
          ...ilan.toObject(),
          teacher: teacher ? teacher.toObject() : null
        };
      })
    );
    
    return NextResponse.json(ilanlarWithTeachers);
  } catch (error: any) {
    console.error('Üniversite ilanları getirme hatası:', error);
    return NextResponse.json(
      { error: error.message || 'İlanlar getirilirken bir hata oluştu' },
      { status: 500 }
    );
  }
}
