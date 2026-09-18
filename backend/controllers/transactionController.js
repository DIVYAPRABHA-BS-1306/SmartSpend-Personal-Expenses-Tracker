import Transaction from '../models/Transaction.js';

export const getTransactions = async (req, res) => {
  const { search, type, category, from, to, sort, limit } = req.query;
  const query = { userId: req.user._id };

  if (search) {
    const regex = new RegExp(search, 'i');
    query.$or = [{ description: regex }, { category: regex }];
  }
  if (type) query.type = type;
  if (category) query.category = category;
  if (from || to) query.date = {};
  if (from) query.date.$gte = new Date(from);
  if (to) query.date.$lte = new Date(to);

  let queryBuilder = Transaction.find(query);

  if (sort === 'newest') {
    queryBuilder = queryBuilder.sort({ date: -1 });
  } else if (sort === 'oldest') {
    queryBuilder = queryBuilder.sort({ date: 1 });
  } else if (sort === 'highest') {
    queryBuilder = queryBuilder.sort({ amount: -1 });
  } else if (sort === 'lowest') {
    queryBuilder = queryBuilder.sort({ amount: 1 });
  } else {
    queryBuilder = queryBuilder.sort({ date: -1 });
  }

  if (limit) {
    queryBuilder = queryBuilder.limit(Number(limit));
  }

  const transactions = await queryBuilder;
  res.json(transactions);
};

export const createTransaction = async (req, res) => {
  const { type, amount, category, description, paymentMethod, date } = req.body;

  if (!type || !amount || !category || !paymentMethod || !date) {
    return res.status(400).json({ message: 'Missing required transaction fields' });
  }

  const transaction = await Transaction.create({
    userId: req.user._id,
    type,
    amount,
    category,
    description,
    paymentMethod,
    date: new Date(date),
  });
  res.status(201).json(transaction);
};

export const updateTransaction = async (req, res) => {
  const transaction = await Transaction.findOne({ _id: req.params.id, userId: req.user._id });
  if (!transaction) {
    return res.status(404).json({ message: 'Transaction not found' });
  }

  const { type, amount, category, description, paymentMethod, date } = req.body;
  transaction.type = type || transaction.type;
  transaction.amount = amount ?? transaction.amount;
  transaction.category = category || transaction.category;
  transaction.description = description ?? transaction.description;
  transaction.paymentMethod = paymentMethod || transaction.paymentMethod;
  transaction.date = date ? new Date(date) : transaction.date;

  await transaction.save();
  res.json(transaction);
};

export const deleteTransaction = async (req, res) => {
  const transaction = await Transaction.findOne({ _id: req.params.id, userId: req.user._id });
  if (!transaction) {
    return res.status(404).json({ message: 'Transaction not found' });
  }

  await transaction.deleteOne();
  res.json({ message: 'Transaction deleted' });
};
