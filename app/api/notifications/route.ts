import connectDB from '@/lib/mongodb';
import Notification from '@/models/Notification';
import { NextResponse } from 'next/server';
import { getUserFromToken } from '@/lib/auth';
import User from '@/models/User';

export const metadata = {
  viewport: {
    themeColor: '#FF8B5E'
  }
};

// Bildirimleri getir
export async function GET(request: Request) {
  await connectDB();
  // Token'dan kullanıcıyı al
  const user = await getUserFromToken(request);
  if (!user || !user.id) {
    return NextResponse.json({ notifications: [] });
  }
  const userId = user.id;

  // Kullanıcının hoş geldin bildirimi silmiş mi kontrolü (User modelinde flag)
  const userDoc = await User.findById(userId);
  if (userDoc && userDoc.welcomeNotificationDeleted) {
    // Hoş geldin bildirimi silinmişse, asla yeni hoş geldin bildirimi oluşturma!
    const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });
    return NextResponse.json({ notifications });
  }

  // Hoş geldin bildirimi var mı kontrolü
  const welcomeQuery = { userId, type: 'info', title: { $regex: '^Merhaba .*! Kavun Eğitim Platformu Hakkında$', $options: 'i' } };
  let hasWelcome = await Notification.findOne(welcomeQuery);
  if (!hasWelcome) {
    hasWelcome = await Notification.create({
      userId,
      title: `Merhaba ${user.name}! Kavun Eğitim Platformu Hakkında`,
      message: `Kavun Eğitim Platformu'na hoş geldiniz! 🎉\n\nBu platformda ilanlar oluşturabilir, kaynak paylaşabilir, derslere katılabilir ve toplulukla etkileşimde bulunabilirsiniz.\n\nBaşlıca özellikler:\n- Kendi ilanlarınızı oluşturup yönetebilirsiniz.\n- Diğer kullanıcılarla mesajlaşabilir, bildirimler alabilirsiniz.\n- Kaynak paylaşım alanında dokümanlar, ders materyalleri ve notlar bulabilirsiniz.\n- Profilinizi düzenleyip, eğitim geçmişinizi ve başarılarınızı sergileyebilirsiniz.\n\nHer türlü soru ve öneriniz için bize iletişim bölümünden ulaşabilirsiniz.\n\nKavun ailesine katıldığınız için teşekkürler, başarılar dileriz! 🍈`,
      type: 'info',
      read: false,
      createdAt: new Date()
    });
  }

  // Kullanıcıya ait tüm bildirimleri getir, sadece en yeni hoş geldin bildirimi göster
  let notifications = await Notification.find({ userId }).sort({ createdAt: -1 });
  let welcomeFound = false;
  notifications = notifications.filter(n => {
    if (n.type === 'info' && /^Merhaba .*! Kavun Eğitim Platformu Hakkında$/i.test(n.title)) {
      if (!welcomeFound) {
        welcomeFound = true;
        return true;
      }
      return false;
    }
    return true;
  });

  return NextResponse.json({ notifications });
}

// Bildirimi okundu işaretle
export async function PUT(request: Request) {
  await connectDB();
  const { id } = await request.json();
  await Notification.findByIdAndUpdate(id, { read: true });
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
