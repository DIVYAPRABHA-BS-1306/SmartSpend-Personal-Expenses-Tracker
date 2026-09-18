import { useEffect, useState } from 'react';
import apiService from '../services/apiService.js';
import SectionTitle from '../components/SectionTitle.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';

const GoalsPage = () => {
  const [goals, setGoals] = useState([]);
  const [form, setForm] = useState({ name: '', targetAmount: '', currentAmount: '', targetDate: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const remainingAmount = Math.max(Number(form.targetAmount || 0) - Number(form.currentAmount || 0), 0);
  const monthsToTarget = form.targetDate
    ? Math.max(1, Math.ceil((new Date(`${form.targetDate}T00:00:00`) - new Date()) / (1000 * 60 * 60 * 24 * 30)))
    : 1;
  const monthlyContribution = Math.ceil(remainingAmount / monthsToTarget);

  const fetchGoals = async () => {
    setLoading(true);
    try {
      const res = await apiService.get('/goals');
      setGoals(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load saving goals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchGoals(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      if (!form.name.trim() || !form.targetAmount || Number(form.targetAmount) <= 0 || Number(form.currentAmount || 0) < 0) {
        throw new Error('Add a goal name and valid amounts greater than zero');
      }
      if (Number(form.currentAmount || 0) > Number(form.targetAmount)) {
        throw new Error('Current savings cannot be greater than the target amount');
      }
      if (!form.targetDate || new Date(`${form.targetDate}T00:00:00`) <= new Date()) {
        throw new Error('Choose a future target date');
      }
      await apiService.post('/goals', {
        name: form.name,
        targetAmount: Number(form.targetAmount),
        currentAmount: Number(form.currentAmount),
        targetDate: form.targetDate,
      });
      setForm({ name: '', targetAmount: '', currentAmount: '', targetDate: '' });
      await fetchGoals();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Unable to save goal');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this goal?')) return;
    await apiService.delete(`/goals/${id}`);
    fetchGoals();
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Saving Goals</h1>
          <p className="subtitle">Track progress toward your savings targets.</p>
        </div>
      </div>
      <div className="page-body">
        {error && <div className="alert alert-error">{error}</div>}
        <div className="card form-card goal-form-card">
          <SectionTitle title="Create a savings goal" subtitle="Turn a future plan into a clear monthly target." />
          <form onSubmit={handleSubmit} className="goal-form">
            <div className="field goal-field-wide">
              <label htmlFor="goal-name">Goal name</label>
              <input id="goal-name" placeholder="e.g. Emergency fund or new laptop" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required maxLength={80} />
            </div>
            <div className="field">
              <label htmlFor="goal-target">Target amount</label>
              <div className="currency-input"><span>₹</span><input id="goal-target" type="number" min="1" step="1" placeholder="50000" value={form.targetAmount} onChange={(e) => setForm({ ...form, targetAmount: e.target.value })} required /></div>
            </div>
            <div className="field">
              <label htmlFor="goal-current">Already saved <span className="optional-label">Optional</span></label>
              <div className="currency-input"><span>₹</span><input id="goal-current" type="number" min="0" step="1" placeholder="0" value={form.currentAmount} onChange={(e) => setForm({ ...form, currentAmount: e.target.value })} /></div>
            </div>
            <div className="field">
              <label htmlFor="goal-date">Target date</label>
              <input id="goal-date" type="date" min={new Date().toISOString().split('T')[0]} value={form.targetDate} onChange={(e) => setForm({ ...form, targetDate: e.target.value })} required />
            </div>
            <div className="goal-form-footer goal-field-wide">
              <p className="goal-preview">Save about <strong>₹{monthlyContribution.toLocaleString()}</strong> per month to reach this goal in time.</p>
              <button type="submit" className="btn" disabled={saving}>{saving ? 'Saving...' : 'Create goal'}</button>
            </div>
          </form>
        </div>

        <div className="card table-card card-spaced">
          <SectionTitle title="Your Saving Goals" />
          {loading ? <LoadingSpinner /> : (
            <table className="table">
              <thead>
                <tr>
                  <th>Goal</th>
                  <th>Target</th>
                  <th>Saved</th>
                  <th>Remaining</th>
                  <th>Target Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {goals.length === 0 ? (
                  <tr><td colSpan="6" className="empty-table-state">No goals yet. Create your first savings target above.</td></tr>
                ) : goals.map((goal) => {
                  const remain = Math.max(goal.targetAmount - goal.currentAmount, 0);
                  const percent = goal.targetAmount ? Math.round((goal.currentAmount / goal.targetAmount) * 100) : 0;
                  return (
                    <tr key={goal._id}>
                      <td>{goal.name}</td>
                      <td>₹{goal.targetAmount}</td>
                      <td>₹{goal.currentAmount}</td>
                      <td>₹{remain}</td>
                      <td>{new Date(goal.targetDate).toLocaleDateString()}</td>
                      <td>
                        <span className="goal-progress">{percent}%</span>
                        <button type="button" className="btn btn-danger btn-split" onClick={() => handleDelete(goal._id)}>Delete</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default GoalsPage;
