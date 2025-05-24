export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Payment from '@/models/Payment'
import User from '@/models/User'
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
    const limit = 10 // Sayfa başına gösterilecek ödeme sayısı
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    
    await connectDB()
    
    // Arama ve filtreleme kriterlerini oluştur
    let searchCriteria: any = {}
    
    // Durum filtresi
    if (status) {
      searchCriteria.status = status
    }
    
    // Arama terimi
    if (search) {
      // Kullanıcı ID'lerini bul (isim veya e-posta ile)
      const userIds = await User.find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      }).distinct('_id')
      
      // Kurs ID'lerini bul (başlık ile)
      const courseIds = await Course.find({
        title: { $regex: search, $options: 'i' }
      }).distinct('_id')
      
      // Tüm arama kriterlerini birleştir
      searchCriteria = {
        ...searchCriteria,
        $or: [
          { transactionId: { $regex: search, $options: 'i' } },
          { userId: { $in: userIds } },
          { courseId: { $in: courseIds } }
        ]
      }
    }
    
    // Toplam ödeme sayısını al (sayfalama için)
    const totalPayments = await Payment.countDocuments(searchCriteria)
    const totalPages = Math.ceil(totalPayments / limit)
    
    // Ödemeleri getir
    const payments = await Payment.find(searchCriteria)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
    
    // Kullanıcı ve kurs bilgilerini ekle
    const paymentsWithDetails = await Promise.all(
      payments.map(async (payment) => {
        let userName = '';
        let userEmail = '';
        let courseName = '';
        
        // Kullanıcı bilgilerini ekle
        if (payment.userId) {
          const user = await User.findById(payment.userId).select('name email');
          if (user) {
            userName = user.name;
            userEmail = user.email;
          }
        }
        
        // Kurs bilgilerini ekle
        if (payment.courseId) {
          const course = await Course.findById(payment.courseId).select('title');
          courseName = course ? course.title : '';
        }
        
        const paymentObj = payment.toObject();
        return {
          ...paymentObj,
          userName,
          userEmail,
          courseName
        };
      })
    );
    
    return NextResponse.json({
      payments: paymentsWithDetails,
      totalPages,
      currentPage: page
    })
  } catch (error) {
    console.error('Payments API error:', error)
    return NextResponse.json(
      { message: 'Ödemeler alınırken bir hata oluştu' },
      { status: 500 }
    )
  }
}
