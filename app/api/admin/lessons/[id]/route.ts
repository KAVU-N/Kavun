import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Lesson from '@/models/Lesson'
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

// Ders id kontrolü
function isValidId(id: string) {
  return /^[0-9a-fA-F]{24}$/.test(id)
}

// Ders detayını getir
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
    
    const lessonId = params.id
    
    if (!isValidId(lessonId)) {
      return NextResponse.json(
        { message: 'Geçersiz ders ID' },
        { status: 400 }
      )
    }
    
    await connectDB()
    
    const lesson = await Lesson.findById(lessonId)
    
    if (!lesson) {
      return NextResponse.json(
        { message: 'Ders bulunamadı' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(lesson)
  } catch (error) {
    console.error('Lesson detail API error:', error)
    return NextResponse.json(
      { message: 'Ders detayları alınırken bir hata oluştu' },
      { status: 500 }
    )
  }
}

// Ders güncelle
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
    
    const lessonId = params.id
    
    if (!isValidId(lessonId)) {
      return NextResponse.json(
        { message: 'Geçersiz ders ID' },
        { status: 400 }
      )
    }
    
    const updateData = await request.json()
    
    await connectDB()
    
    // Dersi bul ve güncelle
    const lesson = await Lesson.findByIdAndUpdate(
      lessonId,
      { $set: updateData },
      { new: true, runValidators: true }
    )
    
    if (!lesson) {
      return NextResponse.json(
        { message: 'Ders bulunamadı' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(lesson)
  } catch (error) {
    console.error('Lesson update API error:', error)
    return NextResponse.json(
      { message: 'Ders güncellenirken bir hata oluştu' },
      { status: 500 }
    )
  }
}

// Ders sil
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
    
    const lessonId = params.id
    
    if (!isValidId(lessonId)) {
      return NextResponse.json(
        { message: 'Geçersiz ders ID' },
        { status: 400 }
      )
    }
    
    await connectDB()
    
    // Dersi bul ve sil
    const lesson = await Lesson.findByIdAndDelete(lessonId)
    
    if (!lesson) {
      return NextResponse.json(
        { message: 'Ders bulunamadı' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ message: 'Ders başarıyla silindi' })
  } catch (error) {
    console.error('Lesson delete API error:', error)
    return NextResponse.json(
      { message: 'Ders silinirken bir hata oluştu' },
      { status: 500 }
    )
  }
}
