import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    // Tüm kullanıcıları getir (şifre hariç)
    const users = await User.find().select('-password')
    
    // Kullanıcı yoksa
    if (users.length === 0) {
      return NextResponse.json({ 
        message: 'Sistemde kayıtlı kullanıcı bulunmamaktadır.',
        userCount: 0 
      })
    }
    
    return NextResponse.json({
      message: `Sistemde ${users.length} kullanıcı bulundu.`,
      userCount: users.length,
      users: users
    })
  } catch (error) {
    console.error('User list error:', error)
    return NextResponse.json(
      { message: 'Kullanıcılar listelenirken bir hata oluştu' },
      { status: 500 }
    )
  }
}
