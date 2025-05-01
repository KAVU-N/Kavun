import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Course from '@/models/Course'
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

// Kurs id kontrolü
function isValidId(id: string) {
  return /^[0-9a-fA-F]{24}$/.test(id)
}

// Kurs detayını getir
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
    
    const courseId = params.id
    
    if (!isValidId(courseId)) {
      return NextResponse.json(
        { message: 'Geçersiz kurs ID' },
        { status: 400 }
      )
    }
    
    await connectDB()
    
    const course = await Course.findById(courseId)
    
    if (!course) {
      return NextResponse.json(
        { message: 'Kurs bulunamadı' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(course)
  } catch (error) {
    console.error('Course detail API error:', error)
    return NextResponse.json(
      { message: 'Kurs detayları alınırken bir hata oluştu' },
      { status: 500 }
    )
  }
}

// Kurs güncelle
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
    
    const courseId = params.id
    
    if (!isValidId(courseId)) {
      return NextResponse.json(
        { message: 'Geçersiz kurs ID' },
        { status: 400 }
      )
    }
    
    const updateData = await request.json()
    
    await connectDB()
    
    // Kursu bul ve güncelle
    const course = await Course.findByIdAndUpdate(
      courseId,
      { $set: updateData },
      { new: true, runValidators: true }
    )
    
    if (!course) {
      return NextResponse.json(
        { message: 'Kurs bulunamadı' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(course)
  } catch (error) {
    console.error('Course update API error:', error)
    return NextResponse.json(
      { message: 'Kurs güncellenirken bir hata oluştu' },
      { status: 500 }
    )
  }
}

// Kurs sil
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
    
    const courseId = params.id
    
    if (!isValidId(courseId)) {
      return NextResponse.json(
        { message: 'Geçersiz kurs ID' },
        { status: 400 }
      )
    }
    
    await connectDB()
    
    // Kursu bul ve sil
    const course = await Course.findByIdAndDelete(courseId)
    
    if (!course) {
      return NextResponse.json(
        { message: 'Kurs bulunamadı' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ message: 'Kurs başarıyla silindi' })
  } catch (error) {
    console.error('Course delete API error:', error)
    return NextResponse.json(
      { message: 'Kurs silinirken bir hata oluştu' },
      { status: 500 }
    )
  }
}
