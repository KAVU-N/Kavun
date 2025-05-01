import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Resource from '@/models/Resource';
import User from '@/models/User';

// Tüm kaynakları getir
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    // Sadece gerekli alanları getirerek optimize et
    const resources = await Resource.find({}, {
      title: 1,
      description: 1,
      author: 1,
      category: 1,
      format: 1,
      university: 1,
      department: 1,
      academicLevel: 1,
      uploadDate: 1,
      createdAt: 1,
      downloadCount: 1,
      viewCount: 1,
      fileSize: 1,
      tags: 1,
      url: 1,
      fileName: 1,
      fileType: 1,
    }).sort({ createdAt: -1 });
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
