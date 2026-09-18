import { useEffect, useState } from 'react';
import apiService from '../services/apiService.js';
import SectionTitle from '../components/SectionTitle.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';

const WishlistPage = () => {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ productName: '', price: '', category: 'Other', priority: 'Medium', targetDate: '', notes: '' });
  const [recommendation, setRecommendation] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchWishlist = async () => {
    setLoading(true);
    try {
      const res = await apiService.get('/wishlist');
      setItems(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchWishlist(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await apiService.post('/wishlist', { ...form, price: Number(form.price) });
      setForm({ productName: '', price: '', category: 'Other', priority: 'Medium', targetDate: '', notes: '' });
      await fetchWishlist();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to add wishlist item');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this wishlist item?')) return;
    await apiService.delete(`/wishlist/${id}`);
    fetchWishlist();
  };

  const loadRecommendation = async (id) => {
    try {
      const res = await apiService.get(`/wishlist/${id}/recommendation`);
      setRecommendation(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load recommendation');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Wishlist</h1>
          <p className="subtitle">Track desired purchases and receive affordability suggestions.</p>
        </div>
      </div>
      <div className="page-body">
        {error && <div className="alert alert-error">{error}</div>}
        <div className="card form-card wishlist-form-card">
          <SectionTitle title="Plan a purchase" subtitle="Add an item and we will help you decide when it fits your finances." />
          <form onSubmit={handleSubmit} className="wishlist-form">
            <div className="field wishlist-field-wide">
              <label htmlFor="wishlist-product">Product name</label>
              <input id="wishlist-product" placeholder="e.g. Noise-cancelling headphones" value={form.productName} onChange={(e) => setForm({ ...form, productName: e.target.value })} required maxLength={80} />
            </div>
            <div className="field">
              <label htmlFor="wishlist-price">Price</label>
              <div className="currency-input"><span>₹</span><input id="wishlist-price" type="number" min="1" step="1" placeholder="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required /></div>
            </div>
            <div className="field">
              <label htmlFor="wishlist-category">Category</label>
              <select id="wishlist-category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                <option>Other</option>
                <option>Electronics</option>
                <option>Home</option>
                <option>Travel</option>
                <option>Education</option>
                <option>Health</option>
                <option>Shopping</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="wishlist-priority">Priority</label>
              <select id="wishlist-priority" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="wishlist-date">Target purchase date</label>
              <input id="wishlist-date" type="date" min={new Date().toISOString().split('T')[0]} value={form.targetDate} onChange={(e) => setForm({ ...form, targetDate: e.target.value })} required />
            </div>
            <div className="field wishlist-field-wide">
              <label htmlFor="wishlist-notes">Notes <span className="optional-label">Optional</span></label>
              <textarea id="wishlist-notes" placeholder="Add a link, preferred model, or reason for this purchase" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} maxLength={240} />
            </div>
            <div className="wishlist-form-footer wishlist-field-wide">
              <p>We will compare the price with your safe-to-spend amount and savings pace.</p>
              <button type="submit" className="btn" disabled={saving}>{saving ? 'Saving...' : 'Add to wishlist'}</button>
            </div>
          </form>
        </div>

        <div className="card table-card card-spaced">
          <SectionTitle title="Wishlist Items" />
          {loading ? <LoadingSpinner /> : (
            <table className="table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Price</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Target Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item._id}>
                    <td>{item.productName}</td>
                    <td>₹{item.price}</td>
                    <td>{item.category}</td>
                    <td>{item.priority}</td>
                    <td>{new Date(item.targetDate).toLocaleDateString()}</td>
                    <td>
                      <button type="button" className="btn btn-secondary btn-split" onClick={() => loadRecommendation(item._id)}>Recommend</button>
                      <button type="button" className="btn btn-danger" onClick={() => handleDelete(item._id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {recommendation && (
          <div className="card card-spaced recommendation-card">
            <div className="recommendation-heading">
              <SectionTitle title={`Should you buy ${recommendation.productName}?`} subtitle="A practical decision based on your cash flow, reserve, goals, and target date." />
              <span className={`recommendation-status recommendation-${recommendation.status.toLowerCase()}`}>
                {recommendation.status.replace('_', ' ')}
              </span>
            </div>
            <div className="recommendation-verdict">
              <div>
                <span className="recommendation-kicker">Recommendation</span>
                <p className="recommendation-message">{recommendation.message}</p>
              </div>
              <div className="recommendation-score"><strong>{recommendation.affordabilityScore}</strong><span>/ 100<br />fit score</span></div>
            </div>
            <div className="recommendation-action"><span>Next best move</span><strong>{recommendation.action}</strong></div>
            <div className="recommendation-metrics">
              <div><span>Item price</span><strong>₹{recommendation.metrics.price.toLocaleString()}</strong></div>
              <div><span>Safe to spend</span><strong>₹{recommendation.metrics.safeToSpendNow.toLocaleString()}</strong></div>
              <div><span>Monthly surplus</span><strong>₹{recommendation.metrics.monthlySurplus.toLocaleString()}</strong></div>
              <div><span>Reserve protected</span><strong>₹{recommendation.metrics.reserve.toLocaleString()}</strong></div>
              <div><span>Monthly plan</span><strong>₹{recommendation.metrics.monthlyPlan.toLocaleString()}</strong></div>
            </div>
            <div className="recommendation-progress">
              <div className="recommendation-progress-label"><span>Affordability progress</span><strong>{recommendation.affordabilityScore}%</strong></div>
              <div className="recommendation-progress-track"><span style={{ width: `${recommendation.affordabilityScore}%` }} /></div>
            </div>
            <p className="recommendation-details">{recommendation.details}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;
