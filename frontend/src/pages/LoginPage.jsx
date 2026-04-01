import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './LoginPage.css';

const getRoleRedirectPath = (role) => {
  if (role === 'admin') {
    return '/admin-dashboard';
  }

  if (role === 'donor') {
    return '/donor-dashboard';
  }

  return '/';
};

const LoginPage = () => {
  const navigate = useNavigate();
  const { user, login, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && user) {
      navigate(getRoleRedirectPath(user.role), { replace: true });
    }
  }, [loading, user, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!email || !password) {
      setError('Email and password are required.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const result = await login({ email, password });
      navigate(getRoleRedirectPath(result.user.role), { replace: true });
    } catch (submitError) {
      setError(submitError.response?.data?.error || 'Login failed. Please verify credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-card">
        <h1>Sign In</h1>
        <p>Use seeded or bootstrapped credentials to jump directly into your dashboard.</p>

        <form onSubmit={handleSubmit} className="login-form">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="admin@example.com"
            autoComplete="email"
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Password123"
            autoComplete="current-password"
          />

          {error ? <p className="login-error">{error}</p> : null}

          <button type="submit" disabled={submitting}>
            {submitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="login-hints">
          <p>Quick test users:</p>
          <p>Admin: admin@example.com (bootstrap command)</p>
          <p>Donor: donor@example.com (seed command)</p>
        </div>
      </section>
    </main>
  );
};

export default LoginPage;
