import 'dotenv/config';
import connectDatabase from './config/db.js';
import Transaction from './models/Transaction.js';

const normalizeTransactionDates = async () => {
  await connectDatabase();

  const cursor = Transaction.collection.find({ date: { $type: 'string' } }, { projection: { date: 1 } });
  let scanned = 0;
  let updated = 0;
  let skipped = 0;

  for await (const transaction of cursor) {
    scanned += 1;
    const normalizedDate = new Date(transaction.date);

    if (Number.isNaN(normalizedDate.getTime())) {
      skipped += 1;
      console.warn(`Skipped invalid transaction date for ${transaction._id}: ${transaction.date}`);
      continue;
    }

    await Transaction.collection.updateOne(
      { _id: transaction._id },
      { $set: { date: normalizedDate } },
    );
    updated += 1;
  }

  const remainingStringDates = await Transaction.collection.countDocuments({ date: { $type: 'string' } });
  console.log(`Scanned ${scanned} string transaction dates.`);
  console.log(`Normalized ${updated} transaction dates.`);
  console.log(`Skipped ${skipped} invalid dates.`);
  console.log(`Remaining string dates: ${remainingStringDates}`);

  await Transaction.db.close();
  process.exit(remainingStringDates === 0 && skipped === 0 ? 0 : 1);
};

normalizeTransactionDates().catch(async (error) => {
  console.error('Transaction date normalization failed:', error);
  await Transaction.db.close();
  process.exit(1);
});
