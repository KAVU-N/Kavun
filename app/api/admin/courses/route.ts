import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Course from '@/models/Course'
import User from '@/models/User'
import { cookies } from 'next/headers'
import { verify } from 'jsonwebtoken'
import { Types } from 'mongoose'

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
    const limit = 10 // Sayfa başına gösterilecek kurs sayısı
    const search = searchParams.get('search') || ''
    
    await connectDB()
    
    // Arama kriterlerini oluştur
    const searchCriteria = search 
      ? {
          $or: [
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
            { category: { $regex: search, $options: 'i' } }
          ]
        } 
      : {}
    
    // Toplam kurs sayısını al (sayfalama için)
    const totalCourses = await Course.countDocuments(searchCriteria)
    const totalPages = Math.ceil(totalCourses / limit)
    
    // Kursları getir
    const courses = await Course.find(searchCriteria)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
    
    // Eğitmen bilgilerini ekle
    const coursesWithInstructorData = await Promise.all(
      courses.map(async (course) => {
        let instructorName = '';
        if (course.instructor) {
          if (Types.ObjectId.isValid(course.instructor)) {
            const instructor = await User.findById(course.instructor).select('name');
            instructorName = instructor ? instructor.name : '';
          } else if (typeof course.instructor === 'string') {
            instructorName = course.instructor;
          }
        }
        
        const courseObj = course.toObject();
        return {
          ...courseObj,
          instructorName
        };
      })
    );
    
    return NextResponse.json({
      courses: coursesWithInstructorData,
      totalPages,
      currentPage: page
    })
  } catch (error) {
    console.error('Courses API error:', error)
    return NextResponse.json(
      { message: 'Kurslar alınırken bir hata oluştu' },
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
    
    const courseData = await request.json()
    
    await connectDB()
    
    // Yeni kurs oluştur
    const course = new Course(courseData)
    await course.save()
    
    return NextResponse.json(course, { status: 201 })
  } catch (error) {
    console.error('Course creation error:', error)
    return NextResponse.json(
      { message: 'Kurs oluşturulurken bir hata oluştu' },
      { status: 500 }
    )
  }
}
