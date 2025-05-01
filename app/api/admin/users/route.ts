import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import { cookies } from 'next/headers'
import { verify } from 'jsonwebtoken'

// Admin yetkisi kontrolü için yardımcı fonksiyon
async function checkAdminAuth() {
  const token = cookies().get('admin-token')?.value
  
  if (!token) {
    return false
  }
  
  try {
    const decoded = verify(token, process.env.JWT_SECRET || 'kavun-admin-secret') as {
      userId: string
      email: string
      role: string
    }
    
    return decoded.role === 'admin'
  } catch (error) {
    return false
  }
}

export async function GET(request: NextRequest) {
  try {
    // Admin yetkisi kontrolü
    const isAdmin = await checkAdminAuth()
    
    if (!isAdmin) {
      return NextResponse.json(
        { message: 'Bu işlem için yetkiniz bulunmamaktadır' },
        { status: 403 }
      )
    }
    
    // Query parametrelerini al
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = 10 // Sayfa başına gösterilecek kullanıcı sayısı
    const search = searchParams.get('search') || ''
    
    await connectDB()
    
    // Arama kriterlerini oluştur
    const searchCriteria = search 
      ? {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
            { university: { $regex: search, $options: 'i' } }
          ]
        } 
      : {}
    
    // Toplam kullanıcı sayısını al (sayfalama için)
    const totalUsers = await User.countDocuments(searchCriteria)
    const totalPages = Math.ceil(totalUsers / limit)
    
    // Kullanıcıları getir
    const users = await User.find(searchCriteria)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select('-password') // Şifreleri çıkar
    
    return NextResponse.json({
      users,
      totalPages,
      currentPage: page
    })
  } catch (error) {
    console.error('Users API error:', error)
    return NextResponse.json(
      { message: 'Kullanıcılar alınırken bir hata oluştu' },
      { status: 500 }
    )
  }
}
