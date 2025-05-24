export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verify } from 'jsonwebtoken'

export async function GET(request: NextRequest) {
  try {
    // Token'ı cookie'den al
    const token = cookies().get('admin-token')?.value

    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    // Token'ı doğrula
    try {
      const decoded = verify(token, process.env.JWT_SECRET || 'kavun-admin-secret') as {
        userId: string
        email: string
        role: string
      }

      // Admin rolünü kontrol et
      if (decoded.role !== 'admin') {
        return NextResponse.json({ authenticated: false }, { status: 403 })
      }

      return NextResponse.json({ authenticated: true })
    } catch (error) {
      // Token geçersiz veya süresi dolmuş
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }
  } catch (error) {
    console.error('Auth check error:', error)
    return NextResponse.json(
      { authenticated: false, message: 'Sunucu hatası' },
      { status: 500 }
    )
  }
}
