import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Course from '@/models/Course';
import Project from '@/models/Project';
import User from '@/models/User';

export async function GET() {
  try {
    await connectDB();

    // Tüm kurs, proje ve kullanıcı sayılarını getir
    const [courses, projects, users] = await Promise.all([
      Course.countDocuments(),
      Project.countDocuments(),
      User.countDocuments()
    ]);

    return NextResponse.json({
      courses,
      projects,
      users
    });
  } catch (error: any) {
    console.error('Stats error:', error);
    return NextResponse.json(
      { error: error.message || 'İstatistikler alınamadı' },
      { status: 500 }
    );
  }
} 