import Transaction from '../models/Transaction.js';
import Budget from '../models/Budget.js';

const getMonthRange = (date) => {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);
  return { start, end };
};

const formatCurrency = (value) => `₹${value.toFixed(0)}`;

const buildSuggestion = (message, priority) => ({ message, priority });

const getCategoryTotals = (transactions) => {
  return transactions.reduce((totals, transaction) => {
    if (transaction.type === 'Expense') {
      totals[transaction.category] = (totals[transaction.category] || 0) + transaction.amount;
    }
    return totals;
  }, {});
};

const getBudgetUsage = (budgets, categoryTotals) => {
  return budgets.map((budget) => {
    const spent = categoryTotals[budget.category] || 0;
    const percent = budget.amount ? (spent / budget.amount) * 100 : 0;
    return { ...budget._doc, spent, percent: Math.round(percent) };
  });
};

const getSavingsRate = (income, expenses) => {
  if (income === 0) return 0;
  return Math.round(((income - expenses) / income) * 100);
};

const getExpenseGrowth = (thisMonth, lastMonth) => {
  if (lastMonth === 0) return thisMonth === 0 ? 0 : 100;
  return Math.round(((thisMonth - lastMonth) / lastMonth) * 100);
};

const getSmartSavingScore = (income, expenses, budgets, goals) => {
  const savingsRate = income ? (income - expenses) / income : 0;
  const budgetScore = budgets.length
    ? budgets.reduce((score, budget) => score + Math.max(0, 100 - ((budget.spent / budget.amount) * 100 || 100)), 0) / budgets.length
    : 100;
  const goalProgress = goals.length
    ? goals.reduce((score, goal) => score + Math.min(1, goal.currentAmount / goal.targetAmount), 0) / goals.length
    : 1;
  let score = Math.round((savingsRate * 50) + (budgetScore * 0.3) + (goalProgress * 20));
  score = Math.max(0, Math.min(100, score));
  return score;
};

const savingSuggestionService = async (userId) => {
  const now = new Date();
  const { start: currentStart, end: currentEnd } = getMonthRange(now);
  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const { start: lastStart, end: lastEnd } = getMonthRange(lastMonthDate);

  const [currentTransactions, lastTransactions, budgets] = await Promise.all([
    Transaction.find({ userId, date: { $gte: currentStart, $lte: currentEnd } }),
    Transaction.find({ userId, date: { $gte: lastStart, $lte: lastEnd } }),
    Budget.find({ userId, month: now.getMonth() + 1, year: now.getFullYear() }),
  ]);

  const currentIncome = currentTransactions.filter((t) => t.type === 'Income').reduce((sum, t) => sum + t.amount, 0);
  const currentExpenses = currentTransactions.filter((t) => t.type === 'Expense').reduce((sum, t) => sum + t.amount, 0);
  const lastExpenses = lastTransactions.filter((t) => t.type === 'Expense').reduce((sum, t) => sum + t.amount, 0);
  const categoryTotals = getCategoryTotals(currentTransactions);
  const budgetUsage = getBudgetUsage(budgets, categoryTotals);

  const suggestions = [];
  const savingsRate = getSavingsRate(currentIncome, currentExpenses);

  if (currentIncome > 0 && savingsRate >= 20) {
    suggestions.push(buildSuggestion(`Great job! You saved ${savingsRate}% of your income this month. Try maintaining this saving rate.`, 'Low'));
  }

  if (currentIncome > 0 && savingsRate < 10) {
    suggestions.push(buildSuggestion(`Your current savings rate is only ${savingsRate}%. Try reducing non-essential expenses to increase your monthly savings.`, 'High'));
  }

  Object.entries(categoryTotals).forEach(([category, amount]) => {
    if (amount > 0 && amount / currentExpenses >= 0.25) {
      suggestions.push(buildSuggestion(`You spent ${formatCurrency(amount)} on ${category.toLowerCase()} this month. Reducing ${category.toLowerCase()} expenses by 10% could save approximately ${formatCurrency(amount * 0.1)}.`, 'Medium'));
    }
  });

  if (lastExpenses > 0) {
    const growth = getExpenseGrowth(currentExpenses, lastExpenses);
    if (growth > 15) {
      suggestions.push(buildSuggestion(`Your expenses increased by ${growth}% compared with last month. Consider reducing non-essential spending this month.`, 'High'));
    } else if (growth < -10) {
      suggestions.push(buildSuggestion(`Great progress! Your expenses decreased by ${Math.abs(growth)}% compared with last month. Keep it up.`, 'Low'));
    }
  }

  budgetUsage.forEach((budget) => {
    if (budget.percent >= 100) {
      suggestions.push(buildSuggestion(`You have exceeded your ${budget.category} budget. Avoid additional ${budget.category.toLowerCase()} spending until the next month.`, 'High'));
    } else if (budget.percent >= 90) {
      suggestions.push(buildSuggestion(`You have already used ${budget.percent}% of your ${budget.category} budget. Consider avoiding unnecessary purchases until the next month.`, 'High'));
    } else if (budget.percent >= 80) {
      suggestions.push(buildSuggestion(`You have already used ${budget.percent}% of your ${budget.category} budget. Keep an eye on ${budget.category.toLowerCase()} spending.`, 'Medium'));
    }
  });

  if (categoryTotals.Subscriptions && categoryTotals.Subscriptions / currentExpenses >= 0.1) {
    suggestions.push(buildSuggestion(`You spent ${formatCurrency(categoryTotals.Subscriptions)} on subscriptions this month. Review unused subscriptions to potentially save money.`, 'Medium'));
  }

  const priorities = { High: 3, Medium: 2, Low: 1 };
  suggestions.sort((a, b) => priorities[b.priority] - priorities[a.priority]);

  return {
    score: getSmartSavingScore(currentIncome, currentExpenses, budgetUsage, []),
    scoreLabel: savingsRate >= 20 ? 'Good' : savingsRate >= 10 ? 'Fair' : 'Needs improvement',
    suggestions,
  };
};

export default savingSuggestionService;
