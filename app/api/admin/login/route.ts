import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import { compare } from 'bcrypt'
import { sign } from 'jsonwebtoken'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email ve şifre gereklidir' },
        { status: 400 }
      )
    }

    await connectDB()

    // Admin rolündeki kullanıcıyı bul ve şifreyi de seç
    const user = await User.findOne({ email, role: 'admin' }).select('+password')

    if (!user) {
      return NextResponse.json(
        { message: 'Geçersiz e-posta veya şifre' },
        { status: 401 }
      )
    }

    // Şifre doğrulaması
    const isPasswordValid = await compare(password, user.password)

    if (!isPasswordValid) {
      return NextResponse.json(
        { message: 'Geçersiz e-posta veya şifre' },
        { status: 401 }
      )
    }

    // JWT token oluştur
    const token = sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET || 'kavun-admin-secret',
      { expiresIn: '8h' }
    )

    // Cookie olarak token'ı ayarla
    cookies().set({
      name: 'admin-token',
      value: token,
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 8 * 60 * 60, // 8 saat
      sameSite: 'strict',
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { message: 'Sunucu hatası oluştu' },
      { status: 500 }
    )
  }
}
