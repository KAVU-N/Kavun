import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'

// Bu API endpoint'i mevcut bir kullanıcıyı admin rolüne yükseltmek için kullanılır
// Güvenlik nedeniyle bu API sadece geliştirme sürecinde kullanılmalıdır

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { message: 'E-posta adresi gereklidir' },
        { status: 400 }
      )
    }

    await connectDB()

    // Kullanıcıyı bul
    const user = await User.findOne({ email })

    if (!user) {
      return NextResponse.json(
        { message: `${email} e-posta adresine sahip kullanıcı bulunamadı` },
        { status: 404 }
      )
    }

    // Kullanıcı zaten admin mi?
    if (user.role === 'admin') {
      return NextResponse.json(
        { message: `${email} kullanıcısı zaten admin rolüne sahip` }
      )
    }

    // Kullanıcıyı admin yap
    user.role = 'admin'
    await user.save()

    return NextResponse.json({
      message: `${email} kullanıcısı başarıyla admin rolüne yükseltildi`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    })
  } catch (error) {
    console.error('Admin oluşturma hatası:', error)
    return NextResponse.json(
      { message: 'Admin oluşturulurken bir hata oluştu' },
      { status: 500 }
    )
  }
}
