const mongoose = require('mongoose');

const uri = process.env.MONGODB_URI;

const CountSchema = new mongoose.Schema({ total: { type: Number, required: true, default: 0 } });
const Count = mongoose.models.Count || mongoose.model('Count', CountSchema);

async function main() {
  await mongoose.connect(uri);
  await Count.deleteMany({}); // Temizle
  await Count.create({ total: 41 });
  console.log('Count koleksiyonunda total 41 olarak ayarlandı!');
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
