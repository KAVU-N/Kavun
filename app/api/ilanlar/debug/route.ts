export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';

// Kullanıcı modeli
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  role: String,
  university: String,
  expertise: String,
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

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

const Ilan = mongoose.models.Ilan || mongoose.model('Ilan', ilanSchema);

// GET - Debug endpoint to check university listings
export async function GET(request: Request) {
  try {
    await connectDB();
    
    // URL'den üniversite parametresini al
    const { searchParams } = new URL(request.url);
    const university = searchParams.get('university');
    
    // Tüm üniversiteleri getir
    const allUniversities = await User.distinct('university');
    
    // Tüm öğretmenleri getir
    const allTeachers = await User.find({ role: 'teacher' }).select('name email university');
    
    // Tüm ilanları getir
    const allListings = await Ilan.find({ status: 'active' });
    
    // Eğer belirli bir üniversite belirtilmişse, o üniversitedeki öğretmenleri bul
    let universityTeachers = [];
    let universityListings = [];
    
    if (university) {
      // Case-insensitive arama yap
      universityTeachers = await User.find({
        university: { $regex: new RegExp('^' + university + '$', 'i') },
        role: 'teacher'
      });
      
      const teacherIds = universityTeachers.map(teacher => teacher._id.toString());
      
      universityListings = await Ilan.find({
        userId: { $in: teacherIds },
        status: 'active'
      });
    }
    
    return NextResponse.json({
      allUniversities,
      totalUniversities: allUniversities.length,
      totalTeachers: allTeachers.length,
      totalListings: allListings.length,
      universityInfo: university ? {
        searchedUniversity: university,
        teachersFound: universityTeachers.length,
        listingsFound: universityListings.length,
        teachers: universityTeachers,
        listings: universityListings
      } : null
    });
  } catch (error: any) {
    console.error('Debug bilgisi getirme hatası:', error);
    return NextResponse.json(
      { error: error.message || 'Debug bilgisi getirilirken bir hata oluştu' },
      { status: 500 }
    );
  }
}
