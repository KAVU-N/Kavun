import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import { cookies } from 'next/headers'
import { verify } from 'jsonwebtoken'
import bcrypt from 'bcrypt'

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

// Kullanıcı id kontrolü
function isValidId(id: string) {
  return /^[0-9a-fA-F]{24}$/.test(id)
}

// Kullanıcı detayını getir
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Admin yetkisi kontrolü
    const isAdmin = await checkAdminAuth()
    
    if (!isAdmin) {
      return NextResponse.json(
        { message: 'Bu işlem için yetkiniz bulunmamaktadır' },
        { status: 403 }
      )
    }
    
    const userId = params.id
    
    if (!isValidId(userId)) {
      return NextResponse.json(
        { message: 'Geçersiz kullanıcı ID' },
        { status: 400 }
      )
    }
    
    await connectDB()
    
    const user = await User.findById(userId).select('-password')
    
    if (!user) {
      return NextResponse.json(
        { message: 'Kullanıcı bulunamadı' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(user)
  } catch (error) {
    console.error('User detail API error:', error)
    return NextResponse.json(
      { message: 'Kullanıcı detayları alınırken bir hata oluştu' },
      { status: 500 }
    )
  }
}

// Kullanıcı güncelle
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Admin yetkisi kontrolü
    const isAdmin = await checkAdminAuth()
    
    if (!isAdmin) {
      return NextResponse.json(
        { message: 'Bu işlem için yetkiniz bulunmamaktadır' },
        { status: 403 }
      )
    }
    
    const userId = params.id
    
    if (!isValidId(userId)) {
      return NextResponse.json(
        { message: 'Geçersiz kullanıcı ID' },
        { status: 400 }
      )
    }
    
    const updateData = await request.json()

    // Şifre güncelleme desteği
    let passwordUpdate = {}
    if (updateData.newPassword && updateData.newPassword.length >= 6) {
      const hashed = await bcrypt.hash(updateData.newPassword, 10)
      passwordUpdate = { password: hashed }
    }
    delete updateData.password
    delete updateData.newPassword
    
    await connectDB()
    
    // Kullanıcıyı bul ve güncelle
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { ...updateData, ...passwordUpdate } },
      { new: true, runValidators: true }
    ).select('-password')
    
    if (!user) {
      return NextResponse.json(
        { message: 'Kullanıcı bulunamadı' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(user)
  } catch (error) {
    console.error('User update API error:', error)
    return NextResponse.json(
      { message: 'Kullanıcı güncellenirken bir hata oluştu' },
      { status: 500 }
    )
  }
}

// Kullanıcı sil
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Admin yetkisi kontrolü
    const isAdmin = await checkAdminAuth()
    
    if (!isAdmin) {
      return NextResponse.json(
        { message: 'Bu işlem için yetkiniz bulunmamaktadır' },
        { status: 403 }
      )
    }
    
    const userId = params.id
    
    if (!isValidId(userId)) {
      return NextResponse.json(
        { message: 'Geçersiz kullanıcı ID' },
        { status: 400 }
      )
    }
    
    await connectDB()
    
    // Kullanıcıyı bul ve sil
    const user = await User.findByIdAndDelete(userId)
    
    if (!user) {
      return NextResponse.json(
        { message: 'Kullanıcı bulunamadı' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ message: 'Kullanıcı başarıyla silindi' })
  } catch (error) {
    console.error('User delete API error:', error)
    return NextResponse.json(
      { message: 'Kullanıcı silinirken bir hata oluştu' },
      { status: 500 }
    )
  }
}
