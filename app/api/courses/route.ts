import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Course from '@/models/Course';

// Tüm kursları getir
export async function GET() {
  try {
    await connectDB();
    const courses = await Course.find({}).sort({ createdAt: -1 }); // En yeni kurslar önce
    return NextResponse.json(courses);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Kurslar alınamadı' },
      { status: 500 }
    );
  }
}

// Yeni kurs ekle
export async function POST(request: Request) {
  try {
    await connectDB();
    const data = await request.json();

    const course = await Course.create(data);
    return NextResponse.json(course, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Kurs eklenemedi' },
      { status: 500 }
    );
  }
} 