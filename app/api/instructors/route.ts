import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function GET(request: Request) {
  try {
    await connectDB();
    
    // URL'den arama parametrelerini al
    const { searchParams } = new URL(request.url);
    const searchTerm = searchParams.get('search') || '';
    const university = searchParams.get('university') || '';
    
    // Eğitmen rolüne sahip kullanıcıları getir
    const query: any = {
      role: 'teacher',
      isVerified: true
    };
    
    // Eğer üniversite parametresi varsa, sadece o üniversitedeki eğitmenleri getir
    if (university) {
      query.university = university;
    }
    
    // Eğer arama terimi varsa, sadece isim üzerinden ara
    if (searchTerm) {
      query.name = { $regex: searchTerm, $options: 'i' };
    }
    
    const instructors = await User.find(query)
      .select('name email university role createdAt')
      .sort({ createdAt: -1 });
      
    return NextResponse.json(instructors);
  } catch (error) {
    console.error('Eğitmenler getirilemedi:', error);
    return NextResponse.json(
      { error: 'Eğitmenler getirilemedi' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const data = await request.json();
    const instructor = await User.create(data);
    return NextResponse.json(instructor, { status: 201 });
  } catch (error) {
    console.error('Eğitmen oluşturulamadı:', error);
    return NextResponse.json(
      { error: 'Eğitmen oluşturulamadı' },
      { status: 500 }
    );
  }
}
