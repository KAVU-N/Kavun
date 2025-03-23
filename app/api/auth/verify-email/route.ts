import { NextResponse } from 'next/server';
import User from '@/models/User';
import connectDB from '@/lib/mongodb';

export async function POST(req: Request) {
  try {
    await connectDB();

    const { email, code } = await req.json();

    // Kullanıcıyı bul
    const user = await User.findOne({ 
      email,
      verificationCode: code,
      verificationCodeExpires: { $gt: new Date() }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Geçersiz veya süresi dolmuş doğrulama kodu' },
        { status: 400 }
      );
    }

    // Kullanıcıyı doğrulanmış olarak işaretle
    user.isVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;
    await user.save();

    return NextResponse.json({
      message: 'E-posta adresi başarıyla doğrulandı'
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Bir hata oluştu' },
      { status: 500 }
    );
  }
}
