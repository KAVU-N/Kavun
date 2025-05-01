import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    // Admin rolüne sahip kullanıcıları bul
    const adminUsers = await User.find({ role: 'admin' }).select('-password')
    
    // Admin yoksa
    if (adminUsers.length === 0) {
      return NextResponse.json({ 
        message: 'Sistemde kayıtlı admin kullanıcısı bulunmamaktadır.',
        adminCount: 0 
      })
    }
    
    return NextResponse.json({
      message: `Sistemde ${adminUsers.length} admin kullanıcısı bulundu.`,
      adminCount: adminUsers.length,
      admins: adminUsers
    })
  } catch (error) {
    console.error('Admin check error:', error)
    return NextResponse.json(
      { message: 'Admin kullanıcıları kontrol edilirken bir hata oluştu' },
      { status: 500 }
    )
  }
}
