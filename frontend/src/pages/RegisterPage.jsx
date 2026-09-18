import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register({ name, email, password, confirmPassword });
      navigate('/dashboard');
    } catch (err) {
      const message = err.response?.data?.message
        || (err.request ? 'Unable to connect to backend. Start the backend server and try again.' : err.message)
        || 'Unable to register';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="center-screen">
      <div className="auth-card">
        <div className="auth-card-heading">
          <h2>Start tracking smarter</h2>
          <p>Create your account to control expenses, budgets, and savings with SmartSpend.</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Full name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} type="text" placeholder="Your full name" />
          </div>
          <div className="field">
            <label>Email address</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="you@example.com" />
          </div>
          <div className="field">
            <label>Password</label>
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Create a password" />
          </div>
          <div className="field">
            <label>Confirm password</label>
            <input value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} type="password" placeholder="Confirm your password" />
          </div>
          <button type="submit" className="btn" disabled={loading}>
            {loading ? 'Creating account...' : 'Get started'}
          </button>
        </form>

        <p className="auth-footer-text">
          Already have an account? <Link to="/login" className="auth-link">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
