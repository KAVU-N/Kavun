import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Resource from '@/models/Resource';
import User from '@/models/User';

// Tüm kaynakları getir (pagination, filtering, search, sort)
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);

    // Pagination
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '4', 10);
    const skip = (page - 1) * pageSize;

    // Filters
    const searchTerm = searchParams.get('searchTerm') || '';
    const category = searchParams.get('category');
    const format = searchParams.get('format');
    const university = searchParams.get('university');
    const academicLevel = searchParams.get('academicLevel');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 1 : -1;

    // Build query
    const query: any = {};
    if (searchTerm) {
      query.$or = [
        { title: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } },
      ];
    }
    if (category) query.category = category;
    if (format) query.format = format;
    if (university && university !== 'all') query.university = university;
    if (academicLevel && academicLevel !== 'Hepsi' && academicLevel !== 'All') query.academicLevel = academicLevel;

    // Get total count for pagination
    const total = await Resource.countDocuments(query);

    // Fetch paginated resources (only necessary fields)
    const resources = await Resource.find(query)
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(pageSize)
      .select('title description author category format university department academicLevel uploadDate createdAt downloadCount viewCount fileSize tags url fileName fileType');

    return NextResponse.json({ resources, total });
  } catch (error) {
    console.error('Kaynaklar getirilirken hata oluştu:', error);
    return NextResponse.json(
      { error: 'Kaynaklar getirilirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// Yeni kaynak ekle
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Gerekli alanları kontrol et
    if (!data.title || !data.description || !data.category || !data.format || !data.authorId) {
      return NextResponse.json(
        { error: 'Gerekli alanlar eksik' },
        { status: 400 }
      );
    }

    await connectDB();
    // Kaynak oluştur
    const newResource = await Resource.create({
      title: data.title,
      description: data.description,
      author: data.author || '',
      category: data.category,
      format: data.format,
      university: data.university || '',
      department: data.department || null,
      fileSize: data.fileSize || null,
      tags: data.tags || [],
      url: data.url || null,
      fileData: data.fileData || null,
      fileName: data.fileName || null,
      fileType: data.fileType || null,
      downloadCount: 0,
      viewCount: 0,
    });

    // Kullanıcının viewQuota'sını 3 artır
    if (data.authorId) {
      await User.findByIdAndUpdate(
        data.authorId,
        { $inc: { viewQuota: 3 } },
        { new: true }
      );
    }

    return NextResponse.json(newResource, { status: 201 });
  } catch (error) {
    console.error('Kaynak oluşturulurken hata oluştu:', error);
    return NextResponse.json(
      { error: 'Kaynak oluşturulurken bir hata oluştu' },
      { status: 500 }
    );
  }
}
