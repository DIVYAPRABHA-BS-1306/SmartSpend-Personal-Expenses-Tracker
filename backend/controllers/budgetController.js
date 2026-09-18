import Budget from '../models/Budget.js';

export const getBudgets = async (req, res) => {
  const budgets = await Budget.find({ userId: req.user._id }).sort({ year: -1, month: -1, category: 1 });
  res.json(budgets);
};

export const createBudget = async (req, res) => {
  const { category, amount, month, year } = req.body;
  if (!category || amount == null || !month || !year) {
    return res.status(400).json({ message: 'Missing required budget fields' });
  }

  const budget = await Budget.create({
    userId: req.user._id,
    category,
    amount,
    month,
    year,
  });
  res.status(201).json(budget);
};

export const updateBudget = async (req, res) => {
  const budget = await Budget.findOne({ _id: req.params.id, userId: req.user._id });
  if (!budget) {
    return res.status(404).json({ message: 'Budget not found' });
  }

  const { category, amount, month, year } = req.body;
  budget.category = category || budget.category;
  budget.amount = amount ?? budget.amount;
  budget.month = month || budget.month;
  budget.year = year || budget.year;

  await budget.save();
  res.json(budget);
};

export const deleteBudget = async (req, res) => {
  const budget = await Budget.findOne({ _id: req.params.id, userId: req.user._id });
  if (!budget) {
    return res.status(404).json({ message: 'Budget not found' });
  }

  await budget.deleteOne();
  res.json({ message: 'Budget deleted' });
};
