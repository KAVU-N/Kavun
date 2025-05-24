import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Count from '@/models/Count';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    // Sadece toplamı döndür
    const countDoc = await Count.findOne();
    const count = countDoc ? countDoc.total : 0;
    return NextResponse.json({ count });
  } catch (error) {
    console.error('Kaynak sayısı alınırken hata oluştu:', error);
    return NextResponse.json(
      { error: 'Kaynak sayısı alınırken bir hata oluştu' },
      { status: 500 }
    );
  }
}
