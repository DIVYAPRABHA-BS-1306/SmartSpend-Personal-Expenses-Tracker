import Transaction from '../models/Transaction.js';
import Budget from '../models/Budget.js';
import SavingGoal from '../models/SavingGoal.js';
import User from '../models/User.js';

const getMonthRange = (date) => {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);
  return { start, end };
};

const formatCurrency = (value) => `₹${value.toFixed(0)}`;
const roundCurrency = (value) => Math.max(Math.round(value), 0);

const purchaseRecommendationService = async (userId, item) => {
  const now = new Date();
  const { start, end } = getMonthRange(now);
  const lookbackStart = new Date(now.getFullYear(), now.getMonth() - 2, 1);

  const [transactions, budgets, goals, user] = await Promise.all([
    Transaction.find({ userId }),
    Budget.find({ userId, month: now.getMonth() + 1, year: now.getFullYear() }),
    SavingGoal.find({ userId }),
    User.findById(userId).select('monthlyIncome'),
  ]);

  const recentTransactions = transactions.filter((transaction) => transaction.date >= lookbackStart && transaction.date <= end);
  const currentTransactions = recentTransactions.filter((transaction) => transaction.date >= start);
  const currentIncome = currentTransactions.filter((transaction) => transaction.type === 'Income').reduce((sum, transaction) => sum + transaction.amount, 0);
  const currentExpenses = currentTransactions.filter((transaction) => transaction.type === 'Expense').reduce((sum, transaction) => sum + transaction.amount, 0);
  const historicalIncome = recentTransactions.filter((transaction) => transaction.type === 'Income').reduce((sum, transaction) => sum + transaction.amount, 0);
  const historicalExpenses = recentTransactions.filter((transaction) => transaction.type === 'Expense').reduce((sum, transaction) => sum + transaction.amount, 0);
  const totalIncome = transactions.filter((transaction) => transaction.type === 'Income').reduce((sum, transaction) => sum + transaction.amount, 0);
  const totalExpenses = transactions.filter((transaction) => transaction.type === 'Expense').reduce((sum, transaction) => sum + transaction.amount, 0);
  const monthlyIncome = Math.max(historicalIncome / 3, user?.monthlyIncome || 0);
  const monthlyExpenses = historicalExpenses / 3;
  const currentBalance = Math.max(totalIncome - totalExpenses, 0);
  const monthlyBudget = budgets.reduce((sum, budget) => sum + budget.amount, 0);
  const monthlySurplus = Math.max(monthlyIncome - monthlyExpenses, 0);
  const activeGoalCommitment = goals.reduce((sum, goal) => sum + (goal.targetAmount - goal.currentAmount > 0 ? goal.targetAmount - goal.currentAmount : 0), 0);
  const reserve = Math.max(monthlyExpenses, item.price * 0.1);
  const safeToSpendNow = Math.max(currentBalance - reserve, 0);
  const amountRemaining = Math.max(item.price - safeToSpendNow, 0);
  const monthsRequired = monthlySurplus > 0 ? Math.ceil(amountRemaining / monthlySurplus) : null;
  const targetDate = item.targetDate ? new Date(item.targetDate) : null;
  const monthsUntilTarget = targetDate ? Math.max(0, Math.ceil((targetDate - now) / (1000 * 60 * 60 * 24 * 30))) : null;
  const targetAchievable = monthsRequired !== null && (monthsUntilTarget === null || monthsRequired <= monthsUntilTarget);
  const canBuyNow = item.price <= safeToSpendNow;

  let status = 'WAIT';
  if (canBuyNow) status = 'BUY_NOW';
  else if (monthlySurplus <= 0 || activeGoalCommitment > monthlySurplus * 6) status = 'NOT_RECOMMENDED';
  else if (targetAchievable) status = 'SAVE_MORE';

  const messages = {
    BUY_NOW: 'This purchase fits within your safe-to-spend amount while keeping a reserve.',
    SAVE_MORE: `You can reach this purchase in about ${monthsRequired} month${monthsRequired === 1 ? '' : 's'} with your current saving pace.`,
    WAIT: 'The target date is ambitious. Consider delaying the purchase or increasing the monthly saving amount.',
    NOT_RECOMMENDED: 'Your current saving pace is too tight for this purchase without putting essentials or goals at risk.',
  };

  const affordabilityScore = Math.min(100, Math.max(0, Math.round(
    (safeToSpendNow / Math.max(item.price, 1)) * 55
      + (monthlySurplus / Math.max(item.price, 1)) * 25
      + (targetAchievable ? 20 : 0),
  )));
  const monthlyPlan = monthsUntilTarget && monthsUntilTarget > 0
    ? Math.ceil(amountRemaining / monthsUntilTarget)
    : Math.ceil(amountRemaining / Math.max(monthsRequired || 1, 1));
  const action = status === 'BUY_NOW'
    ? 'Keep your reserve untouched after buying.'
    : status === 'NOT_RECOMMENDED'
      ? 'Protect essentials and active savings goals first.'
      : `Set aside ${formatCurrency(monthlyPlan)} per month toward this item.`;

  return {
    productName: item.productName,
    targetDate: item.targetDate,
    status,
    message: messages[status],
    details: `Safe to spend now: ${formatCurrency(safeToSpendNow)}. Estimated monthly surplus: ${formatCurrency(monthlySurplus)}.`,
    monthsRequired: canBuyNow ? 0 : monthsRequired,
    action,
    affordabilityScore,
    metrics: {
      price: roundCurrency(item.price),
      safeToSpendNow: roundCurrency(safeToSpendNow),
      monthlySurplus: roundCurrency(monthlySurplus),
      reserve: roundCurrency(reserve),
      amountRemaining: roundCurrency(amountRemaining),
      monthsUntilTarget,
      targetAchievable,
      budgetTotal: roundCurrency(monthlyBudget),
      activeGoalCommitment: roundCurrency(activeGoalCommitment),
      monthlyPlan: roundCurrency(monthlyPlan),
    },
  };
};

export default purchaseRecommendationService;
