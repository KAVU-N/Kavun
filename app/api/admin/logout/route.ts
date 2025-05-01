import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    // Admin token cookie'sini sil
    cookies().delete('admin-token')
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { message: 'Çıkış yapılırken bir hata oluştu' },
      { status: 500 }
    )
  }
}
