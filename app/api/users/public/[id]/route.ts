import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const user = await User.findById(params.id).select('name email role university profilePhotoUrl expertise');
    if (!user) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });
    }

    return NextResponse.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      university: user.university,
      expertise: user.expertise,
      profilePhotoUrl: user.profilePhotoUrl,
    });
  } catch (error) {
    console.error('Public user route error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
