import bcrypt from 'bcryptjs';
import connectDatabase from './config/db.js';
import User from './models/User.js';
import Transaction from './models/Transaction.js';
import Wishlist from './models/Wishlist.js';

const USER_EMAIL = 'bs.divyaprabha13.06.2006@gmail.com';
const USER_PASSWORD = 'divya@2006';
const USER_NAME = 'Divya Prabha';

const transactions = [
  { date: '2024-01-04', category: 'Food', description: 'Monthly groceries', amount: 2100, paymentMethod: 'UPI' },
  { date: '2024-01-12', category: 'Transport', description: 'Monthly bus pass', amount: 850, paymentMethod: 'UPI' },
  { date: '2024-01-20', category: 'Bills', description: 'Electricity bill', amount: 1320, paymentMethod: 'UPI' },
  { date: '2024-01-27', category: 'Shopping', description: 'Household essentials', amount: 1650, paymentMethod: 'Debit Card' },
  { date: '2024-02-05', category: 'Food', description: 'Grocery restock', amount: 2350, paymentMethod: 'UPI' },
  { date: '2024-02-14', category: 'Entertainment', description: 'Movie and dinner', amount: 1250, paymentMethod: 'UPI' },
  { date: '2024-02-22', category: 'Healthcare', description: 'Pharmacy refill', amount: 780, paymentMethod: 'Cash' },
  { date: '2024-03-03', category: 'Transport', description: 'Fuel refill', amount: 1450, paymentMethod: 'UPI' },
  { date: '2024-03-10', category: 'Education', description: 'Course materials', amount: 1800, paymentMethod: 'Debit Card' },
  { date: '2024-03-24', category: 'Food', description: 'Weekend groceries', amount: 1950, paymentMethod: 'UPI' },
  { date: '2024-04-06', category: 'Bills', description: 'Internet bill', amount: 699, paymentMethod: 'UPI' },
  { date: '2024-04-18', category: 'Shopping', description: 'Summer clothes', amount: 2750, paymentMethod: 'Debit Card' },
  { date: '2024-05-02', category: 'Food', description: 'Monthly groceries', amount: 2450, paymentMethod: 'UPI' },
  { date: '2024-05-16', category: 'Transport', description: 'Cab rides', amount: 920, paymentMethod: 'UPI' },
  { date: '2024-05-28', category: 'Entertainment', description: 'Streaming subscription', amount: 499, paymentMethod: 'UPI' },
  { date: '2024-06-08', category: 'Healthcare', description: 'Doctor consultation', amount: 1200, paymentMethod: 'UPI' },
  { date: '2024-06-19', category: 'Food', description: 'Restaurant dinner', amount: 1450, paymentMethod: 'Cash' },
  { date: '2024-07-04', category: 'Bills', description: 'Mobile bill', amount: 599, paymentMethod: 'UPI' },
  { date: '2024-07-15', category: 'Shopping', description: 'Footwear', amount: 2400, paymentMethod: 'Debit Card' },
  { date: '2024-08-05', category: 'Food', description: 'Fresh market shopping', amount: 2200, paymentMethod: 'UPI' },
  { date: '2024-09-12', category: 'Education', description: 'Online workshop', amount: 1600, paymentMethod: 'Bank Transfer' },
  { date: '2024-10-09', category: 'Transport', description: 'Fuel and parking', amount: 1350, paymentMethod: 'UPI' },
  { date: '2024-11-18', category: 'Shopping', description: 'Festival shopping', amount: 3900, paymentMethod: 'Credit Card' },
  { date: '2024-12-24', category: 'Food', description: 'Holiday groceries', amount: 3200, paymentMethod: 'UPI' },
  { date: '2025-01-06', category: 'Food', description: 'Monthly groceries', amount: 2400, paymentMethod: 'UPI' },
  { date: '2025-01-15', category: 'Transport', description: 'Fuel and parking', amount: 1150, paymentMethod: 'UPI' },
  { date: '2025-02-03', category: 'Bills', description: 'Rent contribution', amount: 8500, paymentMethod: 'Bank Transfer' },
  { date: '2025-02-17', category: 'Healthcare', description: 'Health checkup', amount: 1800, paymentMethod: 'UPI' },
  { date: '2025-03-06', category: 'Food', description: 'Grocery shopping', amount: 2550, paymentMethod: 'UPI' },
  { date: '2025-03-18', category: 'Shopping', description: 'Work bag', amount: 2800, paymentMethod: 'Debit Card' },
  { date: '2025-04-04', category: 'Bills', description: 'Electricity and water', amount: 1580, paymentMethod: 'UPI' },
  { date: '2025-04-21', category: 'Entertainment', description: 'Weekend outing', amount: 1350, paymentMethod: 'UPI' },
  { date: '2025-05-08', category: 'Education', description: 'Certification fee', amount: 3200, paymentMethod: 'Bank Transfer' },
  { date: '2025-05-20', category: 'Food', description: 'Family lunch', amount: 1750, paymentMethod: 'Cash' },
  { date: '2025-06-05', category: 'Transport', description: 'Train tickets', amount: 2100, paymentMethod: 'UPI' },
  { date: '2025-06-23', category: 'Shopping', description: 'Home accessories', amount: 1950, paymentMethod: 'Debit Card' },
  { date: '2025-07-07', category: 'Bills', description: 'Internet and mobile', amount: 1249, paymentMethod: 'UPI' },
  { date: '2025-07-22', category: 'Food', description: 'Restaurant dinner', amount: 1550, paymentMethod: 'UPI' },
  { date: '2025-08-09', category: 'Healthcare', description: 'Medicines', amount: 950, paymentMethod: 'Cash' },
  { date: '2025-08-21', category: 'Entertainment', description: 'Concert tickets', amount: 2400, paymentMethod: 'Credit Card' },
  { date: '2025-09-04', category: 'Food', description: 'Monthly groceries', amount: 2700, paymentMethod: 'UPI' },
  { date: '2025-09-19', category: 'Transport', description: 'Cab and metro', amount: 980, paymentMethod: 'UPI' },
  { date: '2025-10-05', category: 'Shopping', description: 'Winter clothes', amount: 3600, paymentMethod: 'Debit Card' },
  { date: '2025-10-17', category: 'Bills', description: 'Utility bills', amount: 1420, paymentMethod: 'UPI' },
  { date: '2025-11-06', category: 'Food', description: 'Grocery restock', amount: 2900, paymentMethod: 'UPI' },
  { date: '2025-11-22', category: 'Travel', description: 'Weekend trip', amount: 4600, paymentMethod: 'Credit Card' },
  { date: '2025-12-03', category: 'Shopping', description: 'Holiday gifts', amount: 4300, paymentMethod: 'Credit Card' },
  { date: '2025-12-20', category: 'Food', description: 'Festive dinner', amount: 2600, paymentMethod: 'UPI' },
  { date: '2025-01-03', category: 'Food', description: 'Grocery shopping', amount: 2300, paymentMethod: 'UPI' },
  { date: '2025-01-11', category: 'Transport', description: 'Bus & auto', amount: 700, paymentMethod: 'UPI' },
  { date: '2025-01-19', category: 'Bills', description: 'Electricity bill', amount: 1450, paymentMethod: 'UPI' },
  { date: '2025-01-28', category: 'Shopping', description: 'Clothes', amount: 2600, paymentMethod: 'Debit Card' },
  { date: '2025-02-05', category: 'Food', description: 'Restaurant', amount: 950, paymentMethod: 'UPI' },
  { date: '2025-02-14', category: 'Entertainment', description: 'Movie', amount: 550, paymentMethod: 'UPI' },
  { date: '2025-02-22', category: 'Education', description: 'Study materials', amount: 1350, paymentMethod: 'Cash' },
  { date: '2025-03-03', category: 'Transport', description: 'Fuel', amount: 1300, paymentMethod: 'UPI' },
  { date: '2025-03-12', category: 'Healthcare', description: 'Medicines', amount: 900, paymentMethod: 'UPI' },
  { date: '2025-03-21', category: 'Food', description: 'Snacks', amount: 450, paymentMethod: 'Cash' },
  { date: '2025-03-30', category: 'Shopping', description: 'Shoes', amount: 3200, paymentMethod: 'Debit Card' },
  { date: '2025-04-07', category: 'Bills', description: 'Internet bill', amount: 749, paymentMethod: 'UPI' },
  { date: '2025-04-16', category: 'Food', description: 'Restaurant', amount: 1100, paymentMethod: 'UPI' },
  { date: '2025-04-24', category: 'Transport', description: 'Cab', amount: 650, paymentMethod: 'UPI' },
  { date: '2025-05-05', category: 'Education', description: 'Online course', amount: 1800, paymentMethod: 'Debit Card' },
  { date: '2025-05-14', category: 'Entertainment', description: 'OTT subscription', amount: 599, paymentMethod: 'UPI' },
  { date: '2025-05-23', category: 'Shopping', description: 'Accessories', amount: 1450, paymentMethod: 'UPI' },
  { date: '2025-06-04', category: 'Food', description: 'Grocery shopping', amount: 2500, paymentMethod: 'UPI' },
  { date: '2025-06-15', category: 'Transport', description: 'Fuel', amount: 1400, paymentMethod: 'UPI' },
  { date: '2025-06-27', category: 'Bills', description: 'Mobile bill', amount: 649, paymentMethod: 'UPI' },
  { date: '2025-07-08', category: 'Food', description: 'Restaurant', amount: 1250, paymentMethod: 'UPI' },
  { date: '2025-07-17', category: 'Shopping', description: 'Electronics', amount: 3500, paymentMethod: 'Debit Card' },
  { date: '2025-07-26', category: 'Entertainment', description: 'Concert', amount: 1200, paymentMethod: 'UPI' },
  { date: '2025-08-05', category: 'Transport', description: 'Cab', amount: 750, paymentMethod: 'UPI' },
  { date: '2025-08-16', category: 'Healthcare', description: 'Doctor consultation', amount: 1000, paymentMethod: 'UPI' },
  { date: '2025-08-25', category: 'Food', description: 'Snacks', amount: 500, paymentMethod: 'Cash' },
  { date: '2026-01-01', type: 'Income', category: 'Salary', description: 'January salary', amount: 45000, paymentMethod: 'Bank Transfer' },
  { date: '2026-02-01', type: 'Income', category: 'Salary', description: 'February salary', amount: 45000, paymentMethod: 'Bank Transfer' },
  { date: '2026-03-01', type: 'Income', category: 'Salary', description: 'March salary', amount: 45000, paymentMethod: 'Bank Transfer' },
  { date: '2026-04-01', type: 'Income', category: 'Salary', description: 'April salary', amount: 45000, paymentMethod: 'Bank Transfer' },
  { date: '2026-05-01', type: 'Income', category: 'Salary', description: 'May salary', amount: 45000, paymentMethod: 'Bank Transfer' },
  { date: '2026-06-01', type: 'Income', category: 'Salary', description: 'June salary', amount: 45000, paymentMethod: 'Bank Transfer' },
  { date: '2026-07-01', type: 'Income', category: 'Salary', description: 'July salary', amount: 45000, paymentMethod: 'Bank Transfer' },
  { date: '2026-08-01', type: 'Income', category: 'Salary', description: 'August salary', amount: 45000, paymentMethod: 'Bank Transfer' },
  { date: '2026-09-01', type: 'Income', category: 'Salary', description: 'September salary', amount: 45000, paymentMethod: 'Bank Transfer' },
  { date: '2026-01-05', category: 'Food', description: 'January groceries', amount: 2800, paymentMethod: 'UPI' },
  { date: '2026-01-18', category: 'Bills', description: 'January utilities', amount: 1650, paymentMethod: 'UPI' },
  { date: '2026-02-04', category: 'Transport', description: 'February commute', amount: 1250, paymentMethod: 'UPI' },
  { date: '2026-02-16', category: 'Shopping', description: 'Home essentials', amount: 2300, paymentMethod: 'Debit Card' },
  { date: '2026-03-06', category: 'Food', description: 'March groceries', amount: 2650, paymentMethod: 'UPI' },
  { date: '2026-03-21', category: 'Entertainment', description: 'Weekend outing', amount: 1400, paymentMethod: 'UPI' },
  { date: '2026-04-03', category: 'Bills', description: 'Electricity and water', amount: 1780, paymentMethod: 'UPI' },
  { date: '2026-04-19', category: 'Healthcare', description: 'Pharmacy refill', amount: 950, paymentMethod: 'Cash' },
  { date: '2026-05-08', category: 'Food', description: 'May groceries', amount: 2950, paymentMethod: 'UPI' },
  { date: '2026-05-24', category: 'Education', description: 'Learning materials', amount: 2100, paymentMethod: 'Debit Card' },
  { date: '2026-06-07', category: 'Transport', description: 'Fuel and metro', amount: 1550, paymentMethod: 'UPI' },
  { date: '2026-06-22', category: 'Shopping', description: 'Household supplies', amount: 1850, paymentMethod: 'Debit Card' },
  { date: '2026-07-05', category: 'Bills', description: 'Internet and mobile', amount: 1350, paymentMethod: 'UPI' },
  { date: '2026-07-18', category: 'Food', description: 'Family dinner', amount: 1750, paymentMethod: 'Cash' },
  { date: '2026-08-02', category: 'Food', description: 'Grocery shopping', amount: 2200, paymentMethod: 'UPI' },
  { date: '2026-08-03', category: 'Transport', description: 'Bus & auto', amount: 650, paymentMethod: 'UPI' },
  { date: '2026-08-04', category: 'Entertainment', description: 'Movie', amount: 500, paymentMethod: 'UPI' },
  { date: '2026-08-06', category: 'Food', description: 'Restaurant', amount: 850, paymentMethod: 'UPI' },
  { date: '2026-08-07', category: 'Shopping', description: 'Clothes', amount: 1800, paymentMethod: 'Debit Card' },
  { date: '2026-08-08', category: 'Bills', description: 'Internet bill', amount: 799, paymentMethod: 'UPI' },
  { date: '2026-08-09', category: 'Transport', description: 'Fuel', amount: 1200, paymentMethod: 'UPI' },
  { date: '2026-08-10', category: 'Education', description: 'Online course', amount: 1500, paymentMethod: 'Debit Card' },
  { date: '2026-08-11', category: 'Food', description: 'Snacks', amount: 350, paymentMethod: 'Cash' },
  { date: '2026-08-12', category: 'Entertainment', description: 'OTT subscription', amount: 499, paymentMethod: 'UPI' },
  { date: '2026-08-13', category: 'Healthcare', description: 'Medicines', amount: 600, paymentMethod: 'UPI' },
  { date: '2026-08-14', category: 'Shopping', description: 'Accessories', amount: 950, paymentMethod: 'UPI' },
  { date: '2026-08-15', category: 'Food', description: 'Restaurant', amount: 900, paymentMethod: 'UPI' },
  { date: '2026-08-16', category: 'Transport', description: 'Cab', amount: 450, paymentMethod: 'UPI' },
  { date: '2026-08-17', category: 'Bills', description: 'Mobile bill', amount: 599, paymentMethod: 'UPI' },
  { date: '2026-08-18', category: 'Food', description: 'Weekend groceries', amount: 2400, paymentMethod: 'UPI' },
  { date: '2026-08-19', category: 'Shopping', description: 'Office supplies', amount: 2100, paymentMethod: 'Credit Card' },
  { date: '2026-08-20', category: 'Bills', description: 'Water bill', amount: 620, paymentMethod: 'UPI' },
  { date: '2026-08-21', category: 'Entertainment', description: 'Streaming bundle', amount: 430, paymentMethod: 'UPI' },
  { date: '2026-08-22', category: 'Transport', description: 'Train pass', amount: 980, paymentMethod: 'UPI' },
  { date: '2026-08-23', category: 'Healthcare', description: 'Pharmacy refill', amount: 760, paymentMethod: 'Cash' },
  { date: '2026-09-02', category: 'Food', description: 'Fresh market', amount: 2600, paymentMethod: 'UPI' },
  { date: '2026-09-05', category: 'Shopping', description: 'Home decor', amount: 3200, paymentMethod: 'Debit Card' },
  { date: '2026-09-08', category: 'Bills', description: 'Home rent', amount: 18000, paymentMethod: 'Bank Transfer' },
  { date: '2026-09-11', category: 'Transport', description: 'Uber rides', amount: 1100, paymentMethod: 'UPI' },
  { date: '2026-09-14', category: 'Food', description: 'Dinner out', amount: 1400, paymentMethod: 'UPI' },
  { date: '2026-09-18', category: 'Entertainment', description: 'Live event', amount: 2950, paymentMethod: 'Credit Card' },
  { date: '2026-09-20', category: 'Education', description: 'Workshop fee', amount: 2200, paymentMethod: 'Bank Transfer' },
  { date: '2026-09-25', category: 'Shopping', description: 'Gift purchase', amount: 1750, paymentMethod: 'UPI' },
  { date: '2026-09-27', category: 'Food', description: 'Grocery restock', amount: 2300, paymentMethod: 'UPI' },
  { date: '2026-09-30', category: 'Bills', description: 'Internet & electricity', amount: 1700, paymentMethod: 'UPI' },
  { date: '2026-10-02', category: 'Food', description: 'Meal prep', amount: 1250, paymentMethod: 'Cash' },
  { date: '2026-10-04', category: 'Transport', description: 'Fuel refill', amount: 1350, paymentMethod: 'UPI' },
  { date: '2026-10-06', category: 'Shopping', description: 'Stationery', amount: 890, paymentMethod: 'UPI' },
  { date: '2026-10-09', category: 'Health', description: 'Gym membership', amount: 1500, paymentMethod: 'Bank Transfer' },
  { date: '2026-10-12', category: 'Food', description: 'Family lunch', amount: 1700, paymentMethod: 'UPI' },
  { date: '2026-10-15', category: 'Bills', description: 'Phone bill', amount: 520, paymentMethod: 'UPI' },
  { date: '2026-10-18', category: 'Entertainment', description: 'Movie night', amount: 660, paymentMethod: 'UPI' },
  { date: '2026-10-20', category: 'Transport', description: 'Metro card top-up', amount: 850, paymentMethod: 'UPI' },
  { date: '2026-10-24', category: 'Food', description: 'Coffee and snacks', amount: 420, paymentMethod: 'Cash' },
  { date: '2026-10-26', category: 'Shopping', description: 'Essentials', amount: 1600, paymentMethod: 'UPI' },
  { date: '2026-10-28', category: 'Bills', description: 'Maintenance fee', amount: 980, paymentMethod: 'Bank Transfer' },
  { date: '2026-10-31', category: 'Food', description: 'Halloween dinner', amount: 1900, paymentMethod: 'UPI' },
  { date: '2026-11-03', category: 'Travel', description: 'Weekend getaway', amount: 5600, paymentMethod: 'Credit Card' },
  { date: '2026-11-08', category: 'Shopping', description: 'Winter jacket', amount: 4200, paymentMethod: 'Debit Card' },
  { date: '2026-11-11', category: 'Food', description: 'Groceries', amount: 2600, paymentMethod: 'UPI' },
  { date: '2026-11-15', category: 'Bills', description: 'Utilities', amount: 1490, paymentMethod: 'UPI' },
  { date: '2026-11-18', category: 'Entertainment', description: 'Concert tickets', amount: 3500, paymentMethod: 'Credit Card' },
  { date: '2026-11-21', category: 'Transport', description: 'Taxi rides', amount: 1200, paymentMethod: 'UPI' },
  { date: '2026-11-26', category: 'Food', description: 'Brunch', amount: 1100, paymentMethod: 'Cash' },
  { date: '2026-11-30', category: 'Bills', description: 'Internet + phone', amount: 1350, paymentMethod: 'UPI' },
  { date: '2026-12-02', category: 'Shopping', description: 'Holiday gifts', amount: 4900, paymentMethod: 'Credit Card' },
  { date: '2026-12-05', category: 'Food', description: 'Festive groceries', amount: 3000, paymentMethod: 'UPI' },
  { date: '2026-12-09', category: 'Travel', description: 'Flight booking', amount: 8400, paymentMethod: 'Bank Transfer' },
  { date: '2026-12-12', category: 'Entertainment', description: 'Movie marathon', amount: 980, paymentMethod: 'UPI' },
  { date: '2026-12-17', category: 'Bills', description: 'Insurance payment', amount: 2100, paymentMethod: 'Bank Transfer' },
  { date: '2026-12-21', category: 'Food', description: 'Holiday feast', amount: 3600, paymentMethod: 'UPI' },
  { date: '2026-12-28', category: 'Shopping', description: 'End of year sale', amount: 5200, paymentMethod: 'Credit Card' },
  { date: '2026-12-30', category: 'Bills', description: 'Utility settlement', amount: 1400, paymentMethod: 'UPI' },
  { date: '2026-12-31', category: 'Food', description: 'New year party', amount: 2400, paymentMethod: 'UPI' },
];

const wishlistItem = {
  productName: 'Laptop',
  price: 70000,
  category: 'Electronics',
  priority: 'High',
  targetDate: '2027-03-31',
  notes: 'Target purchase before end of Q1 2027',
};

const run = async () => {
  await connectDatabase();

  let user = await User.findOne({ email: USER_EMAIL });

  const hashedPassword = await bcrypt.hash(USER_PASSWORD, 10);
  if (!user) {
    user = await User.create({ name: USER_NAME, email: USER_EMAIL, password: hashedPassword });
    console.log(`Created user ${USER_EMAIL}`);
  } else {
    user.name = USER_NAME;
    user.password = hashedPassword;
    await user.save();
    console.log(`Updated existing user ${USER_EMAIL}`);
  }

  const existingTransactions = await Transaction.find({ userId: user._id }).lean();
  const existingKeys = new Set(
    existingTransactions.map((tx) => `${tx.date.toISOString().slice(0, 10)}|${tx.description}|${tx.amount}|${tx.category}`)
  );

  const docs = transactions
    .filter((tx) => !existingKeys.has(`${new Date(tx.date).toISOString().slice(0, 10)}|${tx.description}|${tx.amount}|${tx.category}`))
    .map((tx) => ({
      userId: user._id,
      type: tx.type || 'Expense',
      amount: tx.amount,
      category: tx.category,
      description: tx.description,
      paymentMethod: tx.paymentMethod,
      date: new Date(tx.date),
    }));

  if (docs.length > 0) {
    await Transaction.insertMany(docs);
    console.log(`Added ${docs.length} transactions for ${USER_EMAIL}`);
  } else {
    console.log(`No new transactions to add for ${USER_EMAIL}.`);
  }

  const existingWishlist = await Wishlist.findOne({ userId: user._id, productName: wishlistItem.productName });
  if (!existingWishlist) {
    await Wishlist.create({
      userId: user._id,
      productName: wishlistItem.productName,
      price: wishlistItem.price,
      category: wishlistItem.category,
      priority: wishlistItem.priority,
      targetDate: new Date(wishlistItem.targetDate),
      notes: wishlistItem.notes,
    });
    console.log(`Added wishlist item for ${USER_EMAIL}`);
  } else {
    console.log(`Wishlist item already exists for ${USER_EMAIL}, skipping insert.`);
  }

  process.exit(0);
};

run().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
