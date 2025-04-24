import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Resource from '@/models/Resource';

// Tüm kaynakları getir
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const resources = await Resource.find({}).sort({ createdAt: -1 });
    return NextResponse.json(resources);
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
    if (!data.title || !data.description || !data.category || !data.format) {
      return NextResponse.json(
        { error: 'Gerekli alanlar eksik' },
        { status: 400 }
      );
    }

    await connectDB();
    const newResource = await Resource.create({
      title: data.title,
      description: data.description,
      author: data.author || '',
      category: data.category,
      format: data.format,
      level: data.level || null,
      university: data.university || null,
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
    return NextResponse.json(newResource, { status: 201 });
  } catch (error) {
    console.error('Kaynak oluşturulurken hata oluştu:', error);
    return NextResponse.json(
      { error: 'Kaynak oluşturulurken bir hata oluştu' },
      { status: 500 }
    );
  }
}
