export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import User, { IUser } from '@/models/User';
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

export async function PUT(req: Request) {
  try {
    // Request body'i parse et
    const { id, currentPassword, newPassword } = await req.json();

    // MongoDB bağlantısı
    await connectDB();

    // Kullanıcıyı bul
    const user = await User.findById(id).select('+password') as IUser | null;
    if (!user) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { 
          status: 404,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': 'true'
          }
        }
      );
    }

    // Şifre kontrolü
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { error: 'Mevcut şifre hatalı' },
        { 
          status: 401,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': 'true'
          }
        }
      );
    }

    // Yeni şifreyi hashle
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Kullanıcıyı güncelle
    user.password = hashedPassword;
    await user.save();

    return NextResponse.json(
      { message: 'Şifre başarıyla güncellendi' },
      { 
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': 'true'
        }
      }
    );

  } catch (error) {
    console.error('Update error:', error);
    return NextResponse.json(
      { error: 'Şifre güncellenirken bir hata oluştu' },
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
