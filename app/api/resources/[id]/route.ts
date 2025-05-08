import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Resource from '@/models/Resource';
import ResourceActivity from '@/models/ResourceActivity';
import User from '@/models/User';
import mongoose from 'mongoose';

// Belirli bir kaynağı getir
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const id = params.id;
    const resource = await Resource.findById(id);
    if (!resource) {
      return NextResponse.json({ error: 'Kaynak bulunamadı' }, { status: 404 });
    }
    return NextResponse.json(resource);
  } catch (error) {
    console.error('Kaynak getirilirken hata oluştu:', error);
    return NextResponse.json(
      { error: 'Kaynak getirilirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// Kaynağı güncelle (indirme veya görüntülenme sayısını artır)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const id = params.id;
    const data = await request.json();
    
    // İstemci bilgilerini al
    const userAgent = request.headers.get('user-agent') || 'unknown';
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';
    
    // Kullanıcı kimliği (varsa)
    const userId = data.userId || null;

    // --- İZLEME/İNDİRME HAK KONTROLÜ ---
    if (['download', 'view', 'preview'].includes(data.action) && userId) {
      const user = await User.findById(userId);
      if (!user) {
        return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });
      }
      if ((user.viewQuota ?? 0) <= 0) {
        return NextResponse.json({ error: 'Yeterli izleme hakkınız yok', code: 'NO_QUOTA' }, { status: 403 });
      }
    }
    
    // İşlem türüne göre güncelleme yap
    if (data.action === 'download') {
      // MongoDB session başlat
      const session = await mongoose.startSession();
      session.startTransaction();
      
      try {
        // Kullanıcının hakkını 1 azalt
        if (userId) {
          await User.findByIdAndUpdate(userId, { $inc: { viewQuota: -1 } }, { session });
        }
        // İndirme sayısını artır
        const resource = await Resource.findByIdAndUpdate(
          id,
          { $inc: { downloadCount: 1 } },
          { new: true, session }
        );
        
        if (!resource) {
          await session.abortTransaction();
          session.endSession();
          return NextResponse.json({ error: 'Kaynak bulunamadı' }, { status: 404 });
        }
        
        // İndirme aktivitesini kaydet
        await ResourceActivity.create([{
          resourceId: id,
          activityType: 'download',
          userId: userId,
          userAgent: userAgent,
          ipAddress: ip,
          timestamp: new Date()
        }], { session });
        
        // İşlemi tamamla
        await session.commitTransaction();
        session.endSession();
        
        return NextResponse.json(resource);
      } catch (error) {
        // Hata durumunda işlemi geri al
        await session.abortTransaction();
        session.endSession();
        throw error;
      }
    } else if (data.action === 'view' || data.action === 'preview') {
      // MongoDB session başlat
      const session = await mongoose.startSession();
      session.startTransaction();
      
      try {
        // Kullanıcının hakkını 1 azalt
        if (userId) {
          await User.findByIdAndUpdate(userId, { $inc: { viewQuota: -1 } }, { session });
        }
        // Görüntülenme sayısını artır
        const resource = await Resource.findByIdAndUpdate(
          id,
          { $inc: { viewCount: 1 } },
          { new: true, session }
        );
        
        if (!resource) {
          await session.abortTransaction();
          session.endSession();
          return NextResponse.json({ error: 'Kaynak bulunamadı' }, { status: 404 });
        }
        
        // Görüntüleme aktivitesini kaydet
        await ResourceActivity.create([{
          resourceId: id,
          activityType: data.action === 'preview' ? 'preview' : 'view',
          userId: userId,
          userAgent: userAgent,
          ipAddress: ip,
          timestamp: new Date()
        }], { session });
        
        // İşlemi tamamla
        await session.commitTransaction();
        session.endSession();
        
        return NextResponse.json(resource);
      } catch (error) {
        // Hata durumunda işlemi geri al
        await session.abortTransaction();
        session.endSession();
        throw error;
      }
    }
    
    return NextResponse.json({ error: 'Geçersiz istek' }, { status: 400 });
  } catch (error) {
    console.error('Kaynak güncellenirken hata oluştu:', error);
    return NextResponse.json(
      { error: 'Kaynak güncellenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}
