export const dynamic = 'force-dynamic';
import connectDB from '@/lib/mongodb';
import Notification from '@/models/Notification';
import { NextResponse } from 'next/server';
import { getUserFromToken } from '@/lib/auth';
import User from '@/models/User';


// Bildirimleri getir
export async function GET(request: Request) {
  await connectDB();
  // Token'dan kullanıcıyı al
  let user = null as any;
  const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    user = await getUserFromToken(authHeader);
  }
  // Eğer header yoksa veya kullanıcı doğrulanamadıysa, cookie içindeki token'ı dene
  if (!user) {
    user = await getUserFromToken(request);
  }
  if (!user || !user.id) {
    return NextResponse.json({ notifications: [] });
  }
  const userId = user.id;

  // Kullanıcının hoş geldin bildirimi silmiş mi kontrolü (User modelinde flag)
  const userDoc = await User.findById(userId);
  if (userDoc && userDoc.welcomeNotificationDeleted) {
    // Hoş geldin bildirimi silinmişse, asla yeni hoş geldin bildirimi oluşturma!
    let filter: any = {};
    if (user.role === 'student') {
      filter = { $or: [ { userId: userId }, { userId: 'all' }, { userId: 'student' } ] };
    } else if (user.role === 'teacher' || user.role === 'instructor') {
      filter = { $or: [ { userId: userId }, { userId: 'all' }, { userId: 'teacher' }, { userId: 'instructor' } ] };
    } else {
      // admin ve diğer roller sadece kendi userId'si ile görebilir
      filter = { userId: userId };
    }
    const notifications = await Notification.find(filter).sort({ createdAt: -1 });
    return NextResponse.json({ notifications });
  }

  // Hoş geldin bildirimi var mı kontrolü
  const welcomeQuery = { userId, type: 'info', title: { $regex: '^Merhaba .*! Kavun Eğitim Platformu Hakkında$', $options: 'i' } };
  let hasWelcome = await Notification.findOne(welcomeQuery);
  if (!hasWelcome) {
    hasWelcome = await Notification.create({
      userId,
      title: `Merhaba ${user.name}! Kavun Eğitim Platformu Hakkında`,
      message: `Kavun Eğitim Platformu'na hoş geldiniz! \n\nBu platformda ilanlar oluşturabilir, kaynak paylaşabilir, derslere katılabilir ve toplulukla etkileşimde bulunabilirsiniz.\n\nBaşlıca özellikler:\n- Kendi ilanlarınızı oluşturup yönetebilirsiniz.\n- Diğer kullanıcılarla mesajlaşabilir, bildirimler alabilirsiniz.\n- Kaynak paylaşım alanında dokümanlar, ders materyalleri ve notlar bulabilirsiniz.\n- Profilinizi düzenleyip, eğitim geçmişinizi ve başarılarınızı sergileyebilirsiniz.\n\nHer türlü soru ve öneriniz için bize iletişim bölümünden ulaşabilirsiniz.\n\nKavun ailesine katıldığınız için teşekkürler, başarılar dileriz! `,
      type: 'info',
      read: false,
      createdAt: new Date()
    });
  }

  // Bildirimleri getirirken sadece hedef kitleye uygun olanları göster
  let filter: any = {};
  if (user.role === 'student') {
    filter = { $or: [ { userId: userId }, { userId: 'all' }, { userId: 'student' } ] };
  } else if (user.role === 'teacher' || user.role === 'instructor') {
    filter = { $or: [ { userId: userId }, { userId: 'all' }, { userId: 'teacher' }, { userId: 'instructor' } ] };
  } else {
    // admin ve diğer roller sadece kendi userId'si ile görebilir
    filter = { userId: userId };
  }
  const notifications = await Notification.find(filter).lean();
  // Ek: Announcement'ları da dahil et
  let annFilter: any = { target: 'all' };
  if (user.role === 'student') {
    annFilter = { target: { $in: ['all', 'student'] } };
  } else if (user.role === 'teacher' || user.role === 'instructor') {
    annFilter = { target: { $in: ['all', 'teacher'] } };
  }
  const announcements = await (await import('@/models/Announcement')).default.find(annFilter).lean();
  const annAsNotifications = announcements.map((ann: any) => ({
    _id: ann._id,
    userId: ann.target,
    title: ann.title,
    message: ann.content,
    type: 'announcement',
    read: ann.readBy?.includes(userId) || false,
    createdAt: ann.date,
    actionUrl: '/ilanlar'
  }));
  const combined = [...notifications, ...annAsNotifications].sort((a: any, b: any) => (b.createdAt as any) - (a.createdAt as any));
  return NextResponse.json({ notifications: combined });
}

// Bildirim oluştur
export async function POST(request: Request) {
  await connectDB();
  const data = await request.json();
  // Temel zorunlu alanlar kontrolü
  if (!data.userId || !data.title || !data.message || !data.type) {
    return NextResponse.json({ error: 'Zorunlu alanlar eksik (userId, title, message, type)' }, { status: 400 });
  }
  // Bildirimi oluştur
  const notification = await Notification.create({
    userId: data.userId,
    title: data.title,
    message: data.message,
    type: data.type,
    read: false,
    createdAt: new Date(),
    ...(data.actionUrl ? { actionUrl: data.actionUrl } : {})
  });
  return NextResponse.json({ notification, message: 'Bildirim başarıyla oluşturuldu' }, { status: 201 });
}

// Bildirimi okundu işaretle
export async function PUT(request: Request) {
  await connectDB();
  const { id } = await request.json();
  const updatedNotif = await Notification.findByIdAndUpdate(id, { read: true });
  if (!updatedNotif) {
    // Belki Announcement'dır
    const Announcement = (await import('@/models/Announcement')).default;
    const userInfo = await getUserFromToken(request);
    await Announcement.updateOne(
      { _id: id },
      userInfo?.id ? { $addToSet: { readBy: userInfo.id } } : {}
    );
  }
  return NextResponse.json({ success: true });
}

// Bildirimi sil
export async function DELETE(request: Request) {
  await connectDB();
  const { id } = await request.json();
  // Silinen bildirim hoş geldin ise kullanıcıya flag ata
  const notif = await Notification.findById(id);
  if (notif && notif.type === 'info' && /^Merhaba .*! Kavun Eğitim Platformu Hakkında$/i.test(notif.title)) {
    await Notification.findByIdAndDelete(id);
    await User.findByIdAndUpdate(notif.userId, { $set: { welcomeNotificationDeleted: true } });
    return NextResponse.json({ success: true });
  }
  await Notification.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}
