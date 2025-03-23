import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Instructor from '@/models/instructor';

export async function GET() {
  try {
    await connectDB();
    const instructors = await Instructor.find({}).sort({ rating: -1 });
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
    const instructor = await Instructor.create(data);
    return NextResponse.json(instructor, { status: 201 });
  } catch (error) {
    console.error('Eğitmen oluşturulamadı:', error);
    return NextResponse.json(
      { error: 'Eğitmen oluşturulamadı' },
      { status: 500 }
    );
  }
}
