import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import Lesson from '../models/Lesson';
import Payment from '../models/Payment';
import Notification from '../models/Notification';

async function main() {
  await mongoose.connect(process.env.MONGODB_URI!);

  const now = new Date();

  // Zamanı gelmiş, bildirimi gönderilmemiş, planlanmış ve ödemesi tamamlanmış dersleri bul
  const lessons = await Lesson.find({
    scheduledAt: { $lte: now },
    status: 'scheduled',
    notified: { $ne: true },
    studentId: { $ne: null }
  });

  for (const lesson of lessons) {
    // Ödeme gerçekten tamamlanmış mı kontrol et
    const payment = await Payment.findOne({
      lessonId: lesson._id,
      studentId: lesson.studentId,
      status: 'completed'
    });
    if (!payment) continue;

    // Bildirim oluştur
    await Notification.create({
      userId: lesson.studentId,
      title: 'Ders Zamanı Geldi',
      message: 'Planladığınız dersin zamanı geldi. Lütfen dersi başarıyla alıp almadığınızı kontrol edin.',
      type: 'lesson_reminder',
      actionUrl: `/derslerim`,
    });

    // Bildirim gönderildi olarak işaretle
    lesson.notified = true;
    await lesson.save();
  }

  await mongoose.disconnect();
}

main().then(() => {
  console.log('Randevu bildirimleri kontrol edildi.');
  process.exit(0);
}).catch(e => {
  console.error(e);
  process.exit(1);
});
