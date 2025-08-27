export const dynamic = "force-dynamic";
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
    // Bazı kayıtlarda ObjectId, bazılarında String olabilir
    type: mongoose.Schema.Types.Mixed,
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
  profilePhotoUrl: String,
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
    console.log('[University API] university param:', university, ' search:', searchTerm);
    
    if (!university) {
      return NextResponse.json(
        { error: 'Üniversite parametresi gereklidir' },
        { status: 400 }
      );
    }
    
    // Önce belirtilen üniversitedeki eğitmenleri bul - case insensitive arama yap
    // Hem 'teacher' hem de 'instructor' rolüne sahip kullanıcıları getir
    // Üniversiteyi normalize ederek toleranslı bir regex oluştur (fazla boşlukları yoksay, case-insensitive)
    const uniInput = (university || '').trim();
    const uniPattern = new RegExp(
      uniInput
        .replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // regex kaçış
        .replace(/\s+/g, '\\s*'), // birden fazla boşluğu toleranslı yap
      'i'
    );
    console.log('[University API] normalized pattern:', uniPattern);

    const teachers = await User.find({
      university: { $regex: uniPattern },
      role: { $in: ['teacher', 'instructor', 'admin'] }
    }).select('_id');
    
    console.log('[University API] Found teachers/instructors:', teachers.length);
    
    const teacherIds = teachers.map(teacher => teacher._id);
    // Hem ObjectId hem String olarak listeler oluştur
    const teacherIdsStr = teacherIds.map((id: any) => id.toString());
    console.log('[University API] teacherIdsStr length:', teacherIdsStr.length);
    // Arama filtresi oluştur
    // Varsayılan olarak tüm ilanları getir. İstenirse URL parametresi ile status=active gönderilirse filtre uygula
    // userId bazı kayıtlarda ObjectId, bazılarında String olabilir; ikisini de dene
    let query: any = {
      userId: { $in: [...teacherIds, ...teacherIdsStr] as any[] }
    };
    console.log('[University API] query base:', { inCount: [...teacherIds, ...teacherIdsStr].length, hasSearch: !!searchTerm });
    const statusParam = searchParams.get('status');
    if (statusParam) {
      query.status = statusParam;
    }
    
    // Eğer arama terimi varsa başlık ve açıklamada ara
    if (searchTerm) {
      query.$or = [
        { title: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } }
      ];
    }
    
    // İlanları bul
    const ilanlar = await Ilan.find(query).sort({ createdAt: -1 });
    console.log('[University API] Found listings:', ilanlar.length);
    
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
