import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Count from '@/models/Count';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const countDoc = await Count.findOne();
    const count = countDoc ? countDoc.total : 0;
    return NextResponse.json({ count });
  } catch (error) {
    console.error('Toplam kaynak sayısı alınırken hata oluştu:', error);
    return NextResponse.json(
      { error: 'Toplam kaynak sayısı alınırken bir hata oluştu' },
      { status: 500 }
    );
  }
}
