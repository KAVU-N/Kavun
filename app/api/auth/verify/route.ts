import { NextResponse } from 'next/server';
import User from '@/models/User';
import connectDB from '@/lib/mongodb';

export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true',
    }
  });
}

export async function POST(req: Request) {
  try {
    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json(
        { error: 'Email ve doğrulama kodu gereklidir' },
        { 
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': 'true'
          }
        }
      );
    }

    await connectDB();

    const user = await User.findOne({
      email,
      verificationCode: code,
      verificationCodeExpires: { $gt: new Date() },
      isVerified: false
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Geçersiz veya süresi dolmuş doğrulama kodu' },
        { 
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': 'true'
          }
        }
      );
    }

    // Kullanıcıyı doğrulanmış olarak işaretle
    user.isVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;
    await user.save();

    return NextResponse.json(
      { 
        message: 'Email başarıyla doğrulandı',
        redirectUrl: '/auth/login'
      },
      { 
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': 'true'
        }
      }
    );
  } catch (error) {
    console.error('Verify error:', error);
    return NextResponse.json(
      { error: 'Email doğrulama sırasında bir hata oluştu' },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': 'true'
        }
      }
    );
  }
}
