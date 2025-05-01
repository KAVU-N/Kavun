import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Lesson from '@/models/Lesson'
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
    const limit = 10 // Sayfa başına gösterilecek ders sayısı
    const search = searchParams.get('search') || ''
    
    await connectDB()
    
    // Arama kriterlerini oluştur
    const searchCriteria = search 
      ? {
          $or: [
            { title: { $regex: search, $options: 'i' } },
            { content: { $regex: search, $options: 'i' } }
          ]
        } 
      : {}
    
    // Toplam ders sayısını al (sayfalama için)
    const totalLessons = await Lesson.countDocuments(searchCriteria)
    const totalPages = Math.ceil(totalLessons / limit)
    
    // Dersleri getir
    const lessons = await Lesson.find(searchCriteria)
      .sort({ courseId: 1, order: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
    
    // Kurs bilgilerini ekle
    const lessonsWithCourseData = await Promise.all(
      lessons.map(async (lesson) => {
        let courseName = '';
        if (lesson.courseId) {
          const course = await Course.findById(lesson.courseId).select('title');
          courseName = course ? course.title : '';
        }
        
        const lessonObj = lesson.toObject();
        return {
          ...lessonObj,
          courseName
        };
      })
    );
    
    return NextResponse.json({
      lessons: lessonsWithCourseData,
      totalPages,
      currentPage: page
    })
  } catch (error) {
    console.error('Lessons API error:', error)
    return NextResponse.json(
      { message: 'Dersler alınırken bir hata oluştu' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Admin yetkisi kontrolü
    const isAdmin = await checkAdminAuth()
    
    if (!isAdmin) {
      return NextResponse.json(
        { message: 'Bu işlem için yetkiniz bulunmamaktadır' },
        { status: 403 }
      )
    }
    
    const lessonData = await request.json()
    
    await connectDB()
    
    // Yeni ders oluştur
    const lesson = new Lesson(lessonData)
    await lesson.save()
    
    return NextResponse.json(lesson, { status: 201 })
  } catch (error) {
    console.error('Lesson creation error:', error)
    return NextResponse.json(
      { message: 'Ders oluşturulurken bir hata oluştu' },
      { status: 500 }
    )
  }
}
