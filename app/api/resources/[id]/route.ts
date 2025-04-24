import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Resource from '@/models/Resource';

// Belirli bir kaynağı getir
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const id = params.id;
    const resource = await Resource.findById(id);
    if (!resource) {
      return NextResponse.json({ error: 'Kaynak bulunamadı' }, { status: 404 });
    }
    return NextResponse.json(resource);
  } catch (error) {
    console.error('Kaynak getirilirken hata oluştu:', error);
    return NextResponse.json(
      { error: 'Kaynak getirilirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// Kaynağı güncelle (indirme sayısını artır)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const id = params.id;
    const data = await request.json();
    if (data.action === 'download') {
      const resource = await Resource.findByIdAndUpdate(
        id,
        { $inc: { downloadCount: 1 } },
        { new: true }
      );
      if (!resource) {
        return NextResponse.json({ error: 'Kaynak bulunamadı' }, { status: 404 });
      }
      return NextResponse.json(resource);
    }
    return NextResponse.json({ error: 'Geçersiz istek' }, { status: 400 });
  } catch (error) {
    console.error('Kaynak güncellenirken hata oluştu:', error);
    return NextResponse.json(
      { error: 'Kaynak güncellenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}
