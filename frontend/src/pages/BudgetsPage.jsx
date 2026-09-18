import { useEffect, useState } from 'react';
import apiService from '../services/apiService.js';
import SectionTitle from '../components/SectionTitle.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';

const BudgetsPage = () => {
  const [budgets, setBudgets] = useState([]);
  const [form, setForm] = useState({ category: 'Food', amount: '', month: new Date().getMonth() + 1, year: new Date().getFullYear() });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const monthName = new Date(2000, form.month - 1, 1).toLocaleString('default', { month: 'long' });

  const fetchBudgets = async () => {
    setLoading(true);
    try {
      const res = await apiService.get('/budgets');
      setBudgets(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load budgets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBudgets(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      if (!form.amount || Number(form.amount) <= 0) throw new Error('Enter a budget amount greater than zero');
      await apiService.post('/budgets', { ...form, amount: Number(form.amount) });
      setForm({ category: 'Food', amount: '', month: new Date().getMonth() + 1, year: new Date().getFullYear() });
      await fetchBudgets();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Unable to add budget');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this budget?')) return;
    await apiService.delete(`/budgets/${id}`);
    fetchBudgets();
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Budgets</h1>
          <p className="subtitle">Set monthly budget targets and monitor category usage.</p>
        </div>
      </div>
      <div className="page-body">
        {error && <div className="alert alert-error">{error}</div>}
        <div className="card form-card budget-form-card">
          <SectionTitle title="Set a spending limit" subtitle="Give each category a monthly guardrail and make your spending easier to steer." />
          <form onSubmit={handleSubmit} className="budget-form">
            <div className="field">
              <label htmlFor="budget-category">Category</label>
              <select id="budget-category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {['Food','Transport','Shopping','Education','Bills','Healthcare','Entertainment','Travel','Rent','Subscriptions','Other'].map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="budget-amount">Monthly limit</label>
              <div className="currency-input"><span aria-hidden="true">₹</span><input id="budget-amount" type="number" min="1" step="1" placeholder="10000" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required /></div>
            </div>
            <div className="field">
              <label htmlFor="budget-month">Budget month</label>
              <select id="budget-month" value={form.month} onChange={(e) => setForm({ ...form, month: Number(e.target.value) })}>
                {Array.from({ length: 12 }, (_, index) => <option key={index + 1} value={index + 1}>{new Date(2000, index, 1).toLocaleString('default', { month: 'long' })}</option>)}
              </select>
            </div>
            <div className="field">
              <label htmlFor="budget-year">Budget year</label>
              <input id="budget-year" type="number" value={form.year} min="2024" max="2100" onChange={(e) => setForm({ ...form, year: Number(e.target.value) })} required />
            </div>
            <div className="budget-form-footer">
              <p className="budget-preview">Tracking <strong>{form.category}</strong> with a <strong>₹{Number(form.amount || 0).toLocaleString()}</strong> limit for <strong>{monthName} {form.year}</strong>.</p>
              <button type="submit" className="btn" disabled={saving}>{saving ? 'Saving...' : 'Save budget'}</button>
            </div>
          </form>
        </div>

        <div className="card table-card card-spaced">
          <SectionTitle title="Budget Usage" />
          {loading ? <LoadingSpinner /> : (
            <table className="table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Amount</th>
                  <th>Month</th>
                  <th>Year</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {budgets.length === 0 ? (
                  <tr><td colSpan="5" className="empty-table-state">No budgets yet. Add a category limit above to start tracking.</td></tr>
                ) : budgets.map((budget) => (
                  <tr key={budget._id}>
                    <td>{budget.category}</td>
                    <td>₹{budget.amount}</td>
                    <td>{budget.month}</td>
                    <td>{budget.year}</td>
                    <td>
                      <button type="button" className="btn btn-danger" onClick={() => handleDelete(budget._id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default BudgetsPage;
