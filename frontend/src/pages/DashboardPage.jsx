import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import apiService from '../services/apiService.js';
import Card from '../components/Card.jsx';
import SectionTitle from '../components/SectionTitle.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';

const PERIODS = [
  { value: 'week', label: 'Weekly' },
  { value: 'month', label: 'Monthly' },
  { value: 'year', label: 'Yearly' },
];

const COLORS = ['#2e6ce4', '#16a34a', '#f59e0b', '#e11d48', '#8b5cf6', '#0ea5e9', '#f97316', '#10b981', '#64748b'];

const DashboardPage = () => {
  const [summary, setSummary] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [suggestions, setSuggestions] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState('');
  const [period, setPeriod] = useState('month');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryRes, analyticsRes, suggestionsRes, transRes] = await Promise.all([
          apiService.get(`/dashboard/summary?period=${period}`),
          apiService.get(`/dashboard/analytics?period=${period}`),
          apiService.get('/suggestions'),
          apiService.get('/transactions?sort=newest&limit=5'),
        ]);
        setSummary(summaryRes.data);
        setAnalytics(analyticsRes.data);
        setSuggestions(suggestionsRes.data);
        setTransactions(transRes.data.slice(0, 5));
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load dashboard');
      }
    };
    fetchData();
  }, [period]);

  if (!summary || !analytics || !suggestions) return <LoadingSpinner />;

  const savingsPercent = summary.totalIncome ? Math.round((summary.monthlySavings / summary.totalIncome) * 100) : 0;
  const sortedCategories = [...analytics.expenseByCategory].sort((a, b) => b.total - a.total);
  const topCategory = sortedCategories[0]?.category || 'General';
  const topCategoryTotal = sortedCategories[0]?.total || 0;
  const categoryTotal = sortedCategories.reduce((sum, entry) => sum + entry.total, 0);
  const averageDailySpend = Math.round(summary.totalExpenses / 30);
  const categoryCount = analytics.expenseByCategory.length;
  const trendSeries = analytics.analytics || [];
  const currentTrend = trendSeries[trendSeries.length - 1] || { income: 0, expenses: 0 };
  const previousTrend = trendSeries[trendSeries.length - 2] || { income: 0, expenses: 0 };
  const currentNet = currentTrend.income - currentTrend.expenses;
  const previousNet = previousTrend.income - previousTrend.expenses;
  const netWorthDelta = currentNet - previousNet;
  const netWorthDeltaPercent = previousNet === 0 ? 0 : Math.round((netWorthDelta / Math.abs(previousNet)) * 100);
  const budgetHealth = summary.monthlyBudget ? Math.round((summary.budgetRemaining / summary.monthlyBudget) * 100) : 0;

  return (
    <div>
      <div className="page-header dashboard-header">
        <div>
          <p className="eyebrow">Financial intelligence</p>
          <h1 className="page-title">Dashboard</h1>
          <p className="subtitle">A crisp, professional view of your cash flow, goals, and saving opportunities.</p>
        </div>
        <div className="period-select-wrapper">
          <label htmlFor="dashboard-period" className="eyebrow period-label">Period</label>
          <select id="dashboard-period" value={period} onChange={(e) => setPeriod(e.target.value)} className="period-select">
            {PERIODS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="page-body">
        {error && <div className="alert alert-error">{error}</div>}

        <div className="quick-actions" aria-label="Quick actions">
          <Link to="/dashboard/add-expense" className="quick-action quick-action-expense"><span className="quick-action-icon">+</span><span><strong>Add Expense</strong><small>Log spending</small></span></Link>
          <Link to="/dashboard/add-income" className="quick-action quick-action-income"><span className="quick-action-icon">↗</span><span><strong>Add Income</strong><small>Record earnings</small></span></Link>
          <Link to="/dashboard/goals" className="quick-action quick-action-goal"><span className="quick-action-icon">◎</span><span><strong>Create Goal</strong><small>Plan a milestone</small></span></Link>
          <Link to="/dashboard/wishlist" className="quick-action quick-action-wishlist"><span className="quick-action-icon">☆</span><span><strong>Add Wishlist Item</strong><small>Plan a purchase</small></span></Link>
        </div>

        <div className="dashboard-hero">
          <Card className="hero-card">
            <div className="hero-card-content">
              <span className="eyebrow">Net worth</span>
              <div className="net-worth-header">
                <h2>₹{summary.totalBalance.toLocaleString()}</h2>
                <span className={`trend-badge ${netWorthDelta >= 0 ? 'trend-up' : 'trend-down'}`}>
                  {netWorthDelta >= 0 ? '▲' : '▼'} {netWorthDelta >= 0 ? '+' : '-'}₹{Math.abs(netWorthDelta).toLocaleString()}
                </span>
              </div>
              <p className="hero-copy">
                {netWorthDelta >= 0 ? 'Your financial position improved' : 'Your financial position dipped'} by {Math.abs(netWorthDeltaPercent)}% compared with the previous period.
              </p>
              <div className="net-worth-grid">
                <div className="net-worth-item">
                  <span>Income</span>
                  <strong>₹{summary.totalIncome.toLocaleString()}</strong>
                </div>
                <div className="net-worth-item">
                  <span>Expenses</span>
                  <strong>₹{summary.totalExpenses.toLocaleString()}</strong>
                </div>
                <div className="net-worth-item">
                  <span>Budget left</span>
                  <strong>₹{summary.budgetRemaining.toLocaleString()}</strong>
                </div>
              </div>
              <div className="hero-pill-row">
                <span className="pill pill-success">Income ₹{summary.totalIncome.toLocaleString()}</span>
                <span className="pill pill-warning">Savings {savingsPercent}%</span>
                <span className="pill pill-neutral">Budget health {budgetHealth}%</span>
              </div>
            </div>
            <div className="hero-decor" />
          </Card>
          <div className="dashboard-spotlight">
            <Card className="stat-card">
              <h4>Top spend category</h4>
              <p className="stat-value">{topCategory}</p>
              <span className="badge-pill badge-high">₹{topCategoryTotal.toLocaleString()}</span>
            </Card>
            <Card className="stat-card">
              <h4>Daily spending</h4>
              <p className="stat-value">₹{averageDailySpend.toLocaleString()}</p>
              <span className="badge-pill badge-medium">Average</span>
            </Card>
            <Card className="stat-card">
              <h4>Tracked categories</h4>
              <p className="stat-value">{categoryCount}</p>
              <span className="badge-pill badge-low">Stable</span>
            </Card>
          </div>
        </div>

        <div className="card-grid">
          <Card title="Balance" value={`₹${summary.totalBalance.toLocaleString()}`} />
          <Card title="Income" value={`₹${summary.totalIncome.toLocaleString()}`} />
          <Card title="Expenses" value={`₹${summary.totalExpenses.toLocaleString()}`} />
          <Card title="Savings" value={`₹${summary.monthlySavings.toLocaleString()}`} />
        </div>

        <div className="dashboard-charts">
          <div className="dashboard-chart-panel expense-panel">
            <SectionTitle title="Expense by Category" subtitle="Where your money flowed this period" />
            <div className="category-chart-content">
              <div className="chart-body donut-chart-body">
                {sortedCategories.length > 0 ? (
                  <ResponsiveContainer width="100%" height={320}>
                    <PieChart>
                      <Pie
                        data={sortedCategories}
                        dataKey="total"
                        nameKey="category"
                        innerRadius={68}
                        outerRadius={118}
                        paddingAngle={3}
                        stroke="rgba(255,255,255,0.9)"
                        strokeWidth={3}
                      >
                        {sortedCategories.map((entry, index) => (
                          <Cell key={`cell-${entry.category}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Spent']} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="empty-chart-message">No expenses recorded for this period.</p>
                )}
              </div>
              {sortedCategories.length > 0 && (
                <div className="category-breakdown" aria-label="Expense category breakdown">
                  {sortedCategories.map((entry, index) => {
                    const percentage = categoryTotal ? Math.round((entry.total / categoryTotal) * 100) : 0;
                    return (
                      <div className="category-breakdown-row" key={entry.category}>
                        <span className="category-breakdown-name">
                          <span className="category-color-swatch" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                          {entry.category}
                        </span>
                        <span className="category-breakdown-value">
                          <strong>₹{entry.total.toLocaleString()}</strong>
                          <small>{percentage}%</small>
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="dashboard-chart-panel trends-panel">
            <SectionTitle title="Monthly Trends" subtitle="Income versus expenses over time" />
            <div className="chart-legend-row">
              <span className="chart-legend-item"><span className="chart-dot blue"></span>Income</span>
              <span className="chart-legend-item"><span className="chart-dot amber"></span>Expenses</span>
            </div>
            <div className="chart-body">
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={analytics.analytics} margin={{ top: 12, right: 20, left: 8, bottom: 0 }}>
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    width={50}
                    domain={['auto', 'auto']}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 16,
                      border: '1px solid rgba(148,163,184,0.25)',
                      boxShadow: '0 16px 32px rgba(15, 23, 42, 0.10)',
                    }}
                  />
                  <Line type="monotone" dataKey="income" stroke="#3056ff" strokeWidth={4} dot={{ r: 4, fill: '#3056ff', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="expenses" stroke="#f59e0b" strokeWidth={4} dot={{ r: 4, fill: '#f59e0b', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="dashboard-chart-panel momentum-panel">
            <SectionTitle title="Savings Momentum" subtitle={`${savingsPercent}% of income`} />
            <div className="chart-body">
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={analytics.analytics}>
                  <XAxis dataKey="month" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="expenses" stroke="#f59e0b" strokeWidth={4} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="dashboard-chart-panel score-panel">
            <SectionTitle title="Smart Saving Score" subtitle={suggestions.scoreLabel} />
            <div className="score-card-inner">
              <p className="score-value">{suggestions.score}</p>
              <p className="score-copy">This score reflects your ability to keep spending under control, protect savings, and stay on track.</p>
              <div className="hero-pill-row">
                <span className="pill pill-success">Healthy habits</span>
                <span className="pill pill-warning">Review budget</span>
              </div>
            </div>
          </div>
        </div>

        <div className="card card-spaced">
          <SectionTitle title="Smart Saving Suggestions" subtitle="Personalized advice to improve your financial routine." />
          {suggestions.suggestions.length === 0 ? (
            <p>No suggestions yet. Keep tracking your spending to receive insights.</p>
          ) : (
            <ul className="suggestions-list">
              {suggestions.suggestions.map((suggestion, index) => (
                <li key={index} className="suggestion-item">
                  <div className="suggestion-header">
                    <span className={`suggestion-priority badge-pill badge-${suggestion.priority.toLowerCase()}`}>{suggestion.priority} Priority</span>
                  </div>
                  <p className="suggestion-copy">{suggestion.message}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card table-card">
          <SectionTitle title="Recent Transactions" subtitle="Latest activity from your account." />
          <table className="table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Category</th>
                <th>Date</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx._id}>
                  <td>{tx.description || tx.category}</td>
                  <td>{tx.category}</td>
                  <td>{new Date(tx.date).toLocaleDateString()}</td>
                  <td>
                    <span className={`badge-pill ${tx.type === 'Income' ? 'badge-success' : 'badge-danger'}`}>
                      {tx.type === 'Income' ? '+' : '-'}₹{tx.amount}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
