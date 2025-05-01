import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Payment from '@/models/Payment'
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

// Ödeme id kontrolü
function isValidId(id: string) {
  return /^[0-9a-fA-F]{24}$/.test(id)
}

// Ödeme detayını getir
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
    
    const paymentId = params.id
    
    if (!isValidId(paymentId)) {
      return NextResponse.json(
        { message: 'Geçersiz ödeme ID' },
        { status: 400 }
      )
    }
    
    await connectDB()
    
    const payment = await Payment.findById(paymentId)
    
    if (!payment) {
      return NextResponse.json(
        { message: 'Ödeme bulunamadı' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(payment)
  } catch (error) {
    console.error('Payment detail API error:', error)
    return NextResponse.json(
      { message: 'Ödeme detayları alınırken bir hata oluştu' },
      { status: 500 }
    )
  }
}

// Ödeme güncelle (sadece durumu güncellemek için)
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
    
    const paymentId = params.id
    
    if (!isValidId(paymentId)) {
      return NextResponse.json(
        { message: 'Geçersiz ödeme ID' },
        { status: 400 }
      )
    }
    
    const { status } = await request.json()
    
    // Geçerli durumları kontrol et
    if (!['pending', 'completed', 'failed', 'refunded'].includes(status)) {
      return NextResponse.json(
        { message: 'Geçersiz ödeme durumu' },
        { status: 400 }
      )
    }
    
    await connectDB()
    
    // Ödemeyi bul ve güncelle
    const payment = await Payment.findByIdAndUpdate(
      paymentId,
      { $set: { status } },
      { new: true, runValidators: true }
    )
    
    if (!payment) {
      return NextResponse.json(
        { message: 'Ödeme bulunamadı' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(payment)
  } catch (error) {
    console.error('Payment update API error:', error)
    return NextResponse.json(
      { message: 'Ödeme güncellenirken bir hata oluştu' },
      { status: 500 }
    )
  }
}
