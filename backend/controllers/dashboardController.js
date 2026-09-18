import Transaction from '../models/Transaction.js';
import Budget from '../models/Budget.js';

const getMonthRange = (date) => {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);
  return { start, end };
};

const getWeekRange = (date) => {
  const dayOfWeek = (date.getDay() + 6) % 7; // Monday = 0, Sunday = 6
  const start = new Date(date);
  start.setDate(date.getDate() - dayOfWeek);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

const getYearRange = (date) => {
  const start = new Date(date.getFullYear(), 0, 1);
  const end = new Date(date.getFullYear(), 11, 31, 23, 59, 59, 999);
  return { start, end };
};

const getPeriodRange = (period, date = new Date()) => {
  if (period === 'week') return getWeekRange(date);
  if (period === 'year') return getYearRange(date);
  return getMonthRange(date);
};

const getAnalyticsPeriods = (period, date = new Date()) => {
  const periods = [];

  if (period === 'year') {
    for (let offset = 5; offset >= 0; offset -= 1) {
      const year = date.getFullYear() - offset;
      const start = new Date(year, 0, 1);
      const end = new Date(year, 11, 31, 23, 59, 59);
      periods.push({ start, end, label: year.toString() });
    }
    return periods;
  }

  if (period === 'week') {
    const baseDate = new Date(date);
    baseDate.setHours(0, 0, 0, 0);

    for (let offset = 7; offset >= 0; offset -= 1) {
      const rangeStart = getWeekRange(new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate() - offset * 7)).start;
      const start = new Date(rangeStart);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      const label = `${start.toLocaleString('default', { month: 'short' })} ${start.getDate()}`;
      periods.push({ start, end, label });
    }
    return periods;
  }

  for (let index = 5; index >= 0; index -= 1) {
    const monthDate = new Date(date.getFullYear(), date.getMonth() - index, 1);
    const start = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
    const end = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0, 23, 59, 59);
    const label = monthDate.toLocaleString('default', { month: 'short' });
    periods.push({ start, end, label });
  }

  return periods;
};

export const getDashboardSummary = async (req, res) => {
  const period = req.query.period || 'month';
  const { start, end } = getPeriodRange(period);

  const transactions = await Transaction.find({ userId: req.user._id, date: { $gte: start, $lte: end } });
  const budgets = period === 'month'
    ? await Budget.find({ userId: req.user._id, month: start.getMonth() + 1, year: start.getFullYear() })
    : [];

  const income = transactions.filter((t) => t.type === 'Income').reduce((sum, t) => sum + t.amount, 0);
  const expenses = transactions.filter((t) => t.type === 'Expense').reduce((sum, t) => sum + t.amount, 0);
  const monthlyBudget = budgets.reduce((sum, b) => sum + b.amount, 0);

  res.json({
    period,
    totalBalance: income - expenses,
    totalIncome: income,
    totalExpenses: expenses,
    monthlySavings: income - expenses,
    budgetRemaining: period === 'month' ? Math.max(monthlyBudget - expenses, 0) : 0,
    monthlyBudget,
  });
};

export const getDashboardAnalytics = async (req, res) => {
  const period = req.query.period || 'month';
  const now = new Date();
  const intervals = getAnalyticsPeriods(period, now);

  const analytics = [];
  for (const interval of intervals) {
    const records = await Transaction.find({ userId: req.user._id, date: { $gte: interval.start, $lte: interval.end } });
    const income = records.filter((t) => t.type === 'Income').reduce((sum, t) => sum + t.amount, 0);
    const expenses = records.filter((t) => t.type === 'Expense').reduce((sum, t) => sum + t.amount, 0);
    analytics.push({ period: interval.label, month: interval.label, income, expenses });
  }

  const categoryData = await Transaction.aggregate([
    { $match: { userId: req.user._id, type: 'Expense', date: { $gte: intervals[0].start, $lte: now } } },
    { $group: { _id: '$category', total: { $sum: '$amount' } } },
    { $project: { category: '$_id', total: 1, _id: 0 } },
  ]);

  res.json({ period, analytics, expenseByCategory: categoryData });
};
