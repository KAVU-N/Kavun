export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import Course from '@/models/Course'
import Lesson from '@/models/Lesson'
import Payment from '@/models/Payment'
import Resource from '@/models/Resource' // Added import statement for Resource model
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
    
    await connectDB()
    
    // İstatistikleri topla
    const userCount = await User.countDocuments()
    const courseCount = await Course.countDocuments()
    const lessonCount = await Lesson.countDocuments()
    const resourceCount = await Resource.countDocuments(); // Added line to count resources
    
    // Toplam ödeme miktarını hesapla
    const payments = await Payment.find()
    const paymentTotal = payments.reduce((total, payment) => total + (payment.amount || 0), 0)
    
    return NextResponse.json({
      userCount,
      courseCount,
      lessonCount,
      paymentTotal,
      resourceCount // Added resourceCount to the returned statistics
    })
  } catch (error) {
    console.error('Stats error:', error)
    return NextResponse.json(
      { message: 'İstatistikler alınırken bir hata oluştu' },
      { status: 500 }
    )
  }
}
