import bcrypt from 'bcryptjs';
import connectDatabase from './config/db.js';
import User from './models/User.js';
import Budget from './models/Budget.js';

const USER_EMAIL = 'bs.divyaprabha13.06.2006@gmail.com';
const USER_PASSWORD = 'divya@2006';
const USER_NAME = 'Divya Prabha';

const monthlyBudgets = [
  { category: 'Food', amount: 5000 },
  { category: 'Transport', amount: 3000 },
  { category: 'Shopping', amount: 3000 },
  { category: 'Education', amount: 2000 },
  { category: 'Bills', amount: 3000 },
  { category: 'Entertainment', amount: 2000 },
  { category: 'Healthcare', amount: 2000 },
  { category: 'Other', amount: 5000 },
];

const run = async () => {
  await connectDatabase();

  let user = await User.findOne({ email: USER_EMAIL });
  if (!user) {
    const hashedPassword = await bcrypt.hash(USER_PASSWORD, 10);
    user = await User.create({ name: USER_NAME, email: USER_EMAIL, password: hashedPassword });
    console.log(`Created user ${USER_EMAIL}`);
  }

  const month = 8;
  const year = 2026;

  for (const budget of monthlyBudgets) {
    const existing = await Budget.findOne({ userId: user._id, category: budget.category, month, year });
    if (!existing) {
      await Budget.create({
        userId: user._id,
        category: budget.category,
        amount: budget.amount,
        month,
        year,
      });
      console.log(`Added budget ${budget.category} = ₹${budget.amount}`);
    } else {
      console.log(`Budget for ${budget.category} already exists, skipping.`);
    }
  }

  process.exit(0);
};

run().catch((error) => {
  console.error('Seed budget failed:', error);
  process.exit(1);
});