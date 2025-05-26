import { NextResponse } from 'next/server';
import User from '@/models/User';
import connectDB from '@/lib/mongodb';

export async function POST(req: Request) {
  try {
    const { token, email, code } = await req.json();

    // Validate input
    if ((!token && (!email || !code)) || (token && (email || code))) {
      return NextResponse.json(
        { valid: false, error: 'Geçersiz istek parametreleri' },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    await connectDB();

    // Find user by token or email+code
    const query = token 
      ? { resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } }
      : { 
          email,
          resetPasswordCode: code,
          resetPasswordExpires: { $gt: Date.now() } 
        };

    const user = await User.findOne(query);

    if (!user) {
      return NextResponse.json(
        { valid: false, error: 'Geçersiz veya süresi dolmuş bağlantı' },
        { status: 400 }
      );
    }

    return NextResponse.json({ valid: true });

  } catch (error) {
    console.error('Token doğrulama hatası:', error);
    return NextResponse.json(
      { valid: false, error: 'Bir hata oluştu' },
      { status: 500 }
    );
  }
}
