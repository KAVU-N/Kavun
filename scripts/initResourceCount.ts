import connectDB from '../lib/mongodb';
import Counter from '../models/Counter';

async function main() {
  await connectDB();
  // Varsayılan olarak 41 olarak başlat
  await Counter.findOneAndUpdate(
    { key: 'resourceCount' },
    { $set: { value: 41 } },
    { upsert: true }
  );
  console.log('resourceCount 41 olarak ayarlandı!');
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
