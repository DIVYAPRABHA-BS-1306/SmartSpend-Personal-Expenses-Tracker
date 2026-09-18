import { useEffect, useState } from 'react';
import apiService from '../services/apiService.js';
import SectionTitle from '../components/SectionTitle.jsx';

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', monthlyIncome: '', monthlySavingsTarget: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchProfile = async () => {
    try {
      const res = await apiService.get('/auth/profile');
      setProfile(res.data);
      setForm({
        name: res.data.name,
        email: res.data.email,
        password: '',
        monthlyIncome: res.data.monthlyIncome ?? '',
        monthlySavingsTarget: res.data.monthlySavingsTarget ?? '',
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load profile');
    }
  };

  useEffect(() => { fetchProfile(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (!form.name.trim() || !form.email.trim()) throw new Error('Name and email are required');
      if (Number(form.monthlySavingsTarget || 0) > Number(form.monthlyIncome || 0)) {
        throw new Error('Savings target cannot be greater than monthly income');
      }
      if (form.password && form.password.length < 6) throw new Error('New password must have at least 6 characters');
      await apiService.put('/auth/profile', { ...form, monthlyIncome: Number(form.monthlyIncome || 0), monthlySavingsTarget: Number(form.monthlySavingsTarget || 0) });
      setMessage('Profile updated successfully.');
      setError('');
      await fetchProfile();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to update profile');
      setMessage('');
    } finally {
      setSaving(false);
    }
  };

  if (!profile) return <div className="center-screen">Loading profile...</div>;

  const savingTargetPercent = profile.monthlyIncome
    ? Math.round((profile.monthlySavingsTarget / profile.monthlyIncome) * 100)
    : 0;

  return (
    <div className="profile-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Profile</h1>
          <p className="subtitle">View and update your account details.</p>
        </div>
      </div>
      <div className="page-body">
        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-error">{error}</div>}
        <div className="profile-summary-card">
          <div className="profile-avatar">{profile.name.charAt(0).toUpperCase()}</div>
          <div>
            <p className="profile-kicker">Personal account</p>
            <h2>{profile.name}</h2>
            <p>{profile.email}</p>
          </div>
          <div className="profile-summary-stat"><span>Member since</span><strong>{new Date(profile.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</strong></div>
        </div>
        <div className="card form-card profile-form-card">
          <SectionTitle title="Account details" subtitle="Keep your identity and financial planning preferences up to date." />
          <form onSubmit={handleSubmit} className="profile-form">
            <div className="field">
              <label htmlFor="profile-name">Name</label>
              <input id="profile-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="field">
              <label htmlFor="profile-email">Email</label>
              <input id="profile-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div className="field">
              <label htmlFor="profile-income">Monthly income</label>
              <input
                id="profile-income"
                type="number"
                step="1"
                min="0"
                value={form.monthlyIncome}
                onChange={(e) => setForm({ ...form, monthlyIncome: e.target.value })}
                placeholder="Enter monthly income"
              />
            </div>
            <div className="field">
              <label htmlFor="profile-savings">Monthly savings target</label>
              <input
                id="profile-savings"
                type="number"
                step="1"
                min="0"
                value={form.monthlySavingsTarget}
                onChange={(e) => setForm({ ...form, monthlySavingsTarget: e.target.value })}
                placeholder="Enter monthly savings target"
              />
            </div>
            <div className="field profile-field-wide">
              <label htmlFor="profile-password">New password <span className="optional-label">Optional</span></label>
              <input id="profile-password" type="password" minLength="6" placeholder="Leave blank to keep your current password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            </div>
            <div className="profile-form-footer profile-field-wide">
              <p>Your savings target is used by dashboard insights and recommendations.</p>
              <button type="submit" className="btn" disabled={saving}>{saving ? 'Saving...' : 'Save changes'}</button>
            </div>
          </form>
        </div>
        <div className="card card-spaced">
            <SectionTitle title="Account information" subtitle="A quick view of your financial planning profile." />
          <div className="account-info-grid">
            <div className="info-card">
              <p className="info-label">Name</p>
              <p className="info-value">{profile.name}</p>
              <p className="info-meta">Primary account holder</p>
            </div>
            <div className="info-card">
              <p className="info-label">Email</p>
              <p className="info-value">{profile.email}</p>
              <p className="info-meta">Used for login and notifications</p>
            </div>
            <div className="info-card">
              <p className="info-label">Monthly Income</p>
              <p className="info-value">₹{profile.monthlyIncome?.toLocaleString() ?? 0}</p>
              <p className="info-meta">Your income budget for the month</p>
            </div>
            <div className="info-card">
              <p className="info-label">Monthly Savings Target</p>
              <p className="info-value">₹{profile.monthlySavingsTarget?.toLocaleString() ?? 0}</p>
              <p className="info-meta">{savingTargetPercent}% of income target</p>
              <div className="profile-progress-track"><span style={{ width: `${Math.min(savingTargetPercent, 100)}%` }} /></div>
            </div>
            <div className="info-card info-card-wide">
              <p className="info-label">Joined</p>
              <p className="info-value">{new Date(profile.createdAt).toLocaleDateString()}</p>
              <p className="info-meta">Account created date</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
