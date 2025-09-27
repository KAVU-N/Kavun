require('dotenv').config();
const mongoose = require('mongoose');

(async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.error('MONGODB_URI çevre değişkeni bulunamadı. .env dosyanızı kontrol edin.');
      process.exit(1);
    }
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

    const res = await mongoose.connection.collection('clubs').deleteMany({});
    console.log(`clubs koleksiyonu temizlendi. Silinen belge sayısı: ${res.deletedCount}`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Silme sırasında hata:', err);
    try { await mongoose.disconnect(); } catch {}
    process.exit(1);
  }
})();
