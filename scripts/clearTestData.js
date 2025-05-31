require('dotenv').config();
const mongoose = require('mongoose');

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    await mongoose.connection.collection('users').deleteMany({});
    await mongoose.connection.collection('resources').deleteMany({});
    await mongoose.connection.collection('lessons').deleteMany({});
    console.log('users, resources, lessons koleksiyonları temizlendi');
    process.exit(0);
  } catch (err) {
    console.error('Silme sırasında hata:', err);
    process.exit(1);
  }
})();
