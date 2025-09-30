import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Resource from '@/models/Resource';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);

    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const format = searchParams.get('format') || '';
    const university = searchParams.get('university') || '';
    const academicLevel = searchParams.get('academicLevel') || '';
    const department = searchParams.get('department') || '';
    const course = searchParams.get('course') || '';

    let query: any = {};
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
        { tags: { $elemMatch: { $regex: search, $options: 'i' } } }
      ];
    }
    if (category) query.category = category;
    if (format) query.format = format;
    if (university) query.university = university;
    if (academicLevel) query.level = academicLevel;
    if (department) query.department = { $regex: department, $options: 'i' };
    if (course) {
      const courseRegex = new RegExp(course, 'i');
      query.$and = [
        ...(query.$and || []),
        { $or: [ { course: courseRegex }, { tags: { $elemMatch: courseRegex } } ] }
      ];
    }

    const count = await Resource.countDocuments(query);
    return NextResponse.json({ count });
  } catch (error) {
    console.error('Kaynak sayısı alınırken hata oluştu:', error);
    return NextResponse.json(
      { error: 'Kaynak sayısı alınırken bir hata oluştu' },
      { status: 500 }
    );
  }
}
