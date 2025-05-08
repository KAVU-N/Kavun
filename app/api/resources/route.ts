import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Resource from '@/models/Resource';
import User from '@/models/User';

// Tüm kaynakları getir
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);

    // Filtre parametrelerini oku
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const format = searchParams.get('format') || '';
    const university = searchParams.get('university') || '';
    const academicLevel = searchParams.get('academicLevel') || '';

    // Sorgu oluştur
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
    if (academicLevel) query.academicLevel = academicLevel;

    let resources;
    // Eğer arama veya filtreleme varsa tüm kaynakları getir, yoksa sadece ilk 9'u getir
    if (search || category || format || university || academicLevel) {
      resources = await Resource.find(query).sort({ createdAt: -1 });
    } else {
      resources = await Resource.find({}).sort({ createdAt: -1 }).limit(9);
    }
    return NextResponse.json({ resources });
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
