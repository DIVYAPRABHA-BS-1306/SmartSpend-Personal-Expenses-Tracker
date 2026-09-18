import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import apiService from '../services/apiService.js';

const categories = ['Food', 'Transport', 'Shopping', 'Education', 'Bills', 'Healthcare', 'Entertainment', 'Travel', 'Rent', 'Subscriptions', 'Other'];
const createDefaultForm = (type) => ({ type, amount: '', category: type === 'Income' ? 'Other' : 'Food', description: '', paymentMethod: 'Cash', date: new Date().toISOString().slice(0, 10) });

const AddExpensePage = ({ defaultType = 'Expense' }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editingId = searchParams.get('edit');
  const [form, setForm] = useState(() => createDefaultForm(defaultType));
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(Boolean(editingId));
  const [saving, setSaving] = useState(false);
  const isIncome = form.type === 'Income';

  useEffect(() => {
    if (!editingId) return undefined;
    const loadTransaction = async () => {
      try {
        const res = await apiService.get('/transactions');
        const transaction = res.data.find((item) => item._id === editingId);
        if (!transaction) throw new Error('Transaction not found');
        setForm({
          type: transaction.type,
          amount: transaction.amount,
          category: transaction.category,
          description: transaction.description || '',
          paymentMethod: transaction.paymentMethod,
          date: new Date(transaction.date).toISOString().slice(0, 10),
        });
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Unable to load transaction');
      } finally {
        setLoading(false);
      }
    };
    loadTransaction();
    return undefined;
  }, [editingId]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSaving(true);
    try {
      if (!form.amount || Number(form.amount) <= 0 || !form.date || !form.description.trim()) {
        throw new Error('Description, a positive amount, and date are required');
      }
      if (editingId) {
        await apiService.put(`/transactions/${editingId}`, { ...form, amount: Number(form.amount) });
      } else {
        await apiService.post('/transactions', { ...form, amount: Number(form.amount) });
      }
      navigate('/dashboard/transactions');
    } catch (err) {
      setError(err.response?.data?.message || err.message || `Unable to save ${isIncome ? 'income' : 'expense'}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="center-screen">Loading expense...</div>;

  return (
    <div className="page-body expense-page">
      {error && <div className="alert alert-error">{error}</div>}
      <div className="expense-modal">
        <aside className="expense-sidebar">
          <div className="expense-kicker">{editingId ? `EDIT ${isIncome ? 'INCOME' : 'EXPENSE'}` : `NEW ${isIncome ? 'INCOME' : 'EXPENSE'}`}</div>
          <h2>{editingId ? 'Keep the details accurate.' : isIncome ? 'Record progress as it arrives.' : 'Log it once, stay in control.'}</h2>
          <p>{isIncome ? 'Capture your earnings and keep your cash-flow picture current.' : 'Capture your spending in a few seconds and keep your financial picture current.'}</p>
          <ul className="expense-checklist">
            <li>✓ Add a clear description.</li>
            <li>✓ Choose a familiar category.</li>
            <li>✓ Use the actual transaction date.</li>
          </ul>
        </aside>

        <div className="expense-panel">
          <div className="expense-panel-heading">
            <div>
              <h1>{editingId ? `Edit ${isIncome ? 'income' : 'expense'}` : `Add ${isIncome ? 'income' : 'expense'}`}</h1>
              <p className="expense-subtitle">Capture one detail for a sharper picture of your spending.</p>
            </div>
            <button type="button" className="btn btn-cancel" onClick={() => navigate('/dashboard/transactions')}>Back to transactions</button>
          </div>

          <form onSubmit={handleSubmit} className="expense-form">
            <div className="expense-grid two-col">
              <div className="field field-inline">
                <label htmlFor="expense-description">Description</label>
                <input id="expense-description" type="text" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="D-Mart groceries" required />
              </div>
              <div className="field field-inline">
                <label htmlFor="expense-amount">Amount</label>
                <input id="expense-amount" type="number" min="1" step="1" value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} placeholder="2499" required />
              </div>
            </div>
            <div className="expense-grid two-col">
              <div className="field field-inline">
                <label htmlFor="expense-category">Category</label>
                <select id="expense-category" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>
                  {categories.map((category) => <option key={category} value={category}>{category}</option>)}
                </select>
              </div>
              <div className="field field-inline">
                <label htmlFor="expense-payment">Payment method</label>
                <select id="expense-payment" value={form.paymentMethod} onChange={(event) => setForm({ ...form, paymentMethod: event.target.value })}>
                  <option>Cash</option>
                  <option>UPI</option>
                  <option>Debit Card</option>
                  <option>Credit Card</option>
                  <option>Bank Transfer</option>
                </select>
              </div>
            </div>
            <div className="field field-inline field-full">
              <label htmlFor="expense-date">Date</label>
              <input id="expense-date" type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} required />
            </div>
            <div className="expense-actions">
              <button type="button" className="btn btn-cancel" onClick={() => navigate('/dashboard/transactions')}>Cancel</button>
              <button type="submit" className="btn btn-save" disabled={saving}>{saving ? 'Saving...' : editingId ? `Update ${isIncome ? 'income' : 'expense'}` : `Save ${isIncome ? 'income' : 'expense'}`}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddExpensePage;
