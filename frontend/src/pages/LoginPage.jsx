import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login({ email, password });
      navigate('/dashboard');
    } catch (err) {
      const message = err.response?.data?.message
        || (err.request ? 'Unable to connect to backend. Start the backend server and try again.' : err.message)
        || 'Unable to login';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="center-screen auth-screen">
      <div className="auth-layout">
        <aside className="auth-aside">
          <Link to="/" className="auth-brand" aria-label="SmartSpend home">
            <span className="auth-brand-mark">S</span>
            <span>SmartSpend</span>
          </Link>
          <div className="auth-aside-copy">
            <p className="auth-eyebrow">Your money, made clearer</p>
            <h1>Make every month feel more intentional.</h1>
            <p>See where your money is going, stay close to your goals, and make confident decisions from one calm workspace.</p>
          </div>
          <div className="auth-aside-note">
            <span className="auth-note-mark">+</span>
            <p><strong>Small steps add up.</strong><br />Your financial picture starts here.</p>
          </div>
        </aside>

        <main className="auth-card">
        <div className="auth-card-heading">
          <p className="auth-mobile-brand">SmartSpend</p>
          <h2>Welcome back</h2>
          <p>Sign in to pick up where you left off.</p>
        </div>

        {error && <div className="alert alert-error" role="alert">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="login-email">Email address</label>
            <input id="login-email" value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="you@example.com" autoComplete="email" required />
          </div>
          <div className="field">
            <div className="field-label-row">
              <label htmlFor="login-password">Password</label>
              <button type="button" className="password-toggle" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            <input id="login-password" value={password} onChange={(e) => setPassword(e.target.value)} type={showPassword ? 'text' : 'password'} placeholder="Enter your password" autoComplete="current-password" required />
          </div>
          <button type="submit" className="btn" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="auth-footer-text">
          New to SmartSpend? <Link to="/register" className="auth-link">Create an account</Link>
        </p>
        </main>
      </div>
    </div>
  );
};

export default LoginPage;
