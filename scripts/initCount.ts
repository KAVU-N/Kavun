import connectDB from '../lib/mongodb';
import Count from '../models/Count';

async function main() {
  await connectDB();
  // Sadece tek bir doküman, toplam kaynak sayısı olarak 41 ayarlanacak
  await Count.deleteMany({}); // Önce temizle, tek bir doküman kalsın
  await Count.create({ total: 41 });
  console.log('Count koleksiyonunda total 41 olarak ayarlandı!');
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
