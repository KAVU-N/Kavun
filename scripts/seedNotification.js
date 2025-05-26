const connectDB = require('../lib/mongodb').default;
const Notification = require('../models/Notification').default;

async function seed() {
  await connectDB();
  await Notification.deleteMany({ title: 'Hoş Geldin!' }); // Tekrarlı eklenmesin
  await Notification.create({
    userId: 'all',
    title: 'Hoş Geldin! Kavunla Eğitim Platformu Hakkında',
    message: `Kavunla Eğitim Platformu'na hoş geldiniz! 🎉\n\nBu platformda ilanlar oluşturabilir, kaynak paylaşabilir, derslere katılabilir ve toplulukla etkileşimde bulunabilirsiniz.\n\nBaşlıca özellikler:\n- Kendi ilanlarınızı oluşturup yönetebilirsiniz.\n- Diğer kullanıcılarla mesajlaşabilir, bildirimler alabilirsiniz.\n- Kaynak paylaşım alanında dokümanlar, ders materyalleri ve notlar bulabilirsiniz.\n- Profilinizi düzenleyip, eğitim geçmişinizi ve başarılarınızı sergileyebilirsiniz.\n\nHer türlü soru ve öneriniz için bize iletişim bölümünden ulaşabilirsiniz.\n\nKavunla ailesine katıldığınız için teşekkürler, başarılar dileriz! 🍈`,
    type: 'info',
    read: false,
    createdAt: new Date(),
    actionUrl: '/profil',
  });
  console.log('Hoşgeldin bildirimi başarıyla eklendi!');
  process.exit(0);
}

seed().catch(e => { console.error(e); process.exit(1); });
